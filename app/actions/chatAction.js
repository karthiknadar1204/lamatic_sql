'use server';

import { researcher, taskManager, querySuggestor, inquire } from '@/lib/agents';
import { db } from '@/configs/db';
import { chats } from '@/configs/schema';
import { getQueryEmbeddings } from './chat';
import { and, eq, desc } from 'drizzle-orm';
import { currentUser } from "@clerk/nextjs/server";
import { evaluateResponse } from '@/lib/utils/evaluation';
import { runInBackground } from '@/lib/utils/backgroundTask';

function formatDatabaseContext(embeddingsData) {
  return `Current database context:
Schema Information:
${embeddingsData.schema.map(table => 
  `Table: ${table.tableName}
   Columns: ${table.columns}`
).join('\n')}

Sample Data:
${embeddingsData.sampleData.map(table => 
  `Table: ${table.tableName}
   Data: ${JSON.stringify(table.sampleData, null, 2)}`
).join('\n\n')}`;
}

async function saveChat(message, response, connectionId) {
  const user = await currentUser();
  if (!user) return null;

  await db.insert(chats).values({
    userId: user.id,
    connectionId: connectionId,
    message: message,
    response: JSON.stringify(response),
  });
}

async function getPreviousChats(connectionId, limit = 5) {
  const user = await currentUser();
  if (!user) return [];

  const previousChats = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.connectionId, connectionId),
        eq(chats.userId, user.id)
      )
    )
    .orderBy(desc(chats.createdAt))
    .limit(limit);
  
  return previousChats.reverse().map(chat => ({
    role: 'user',
    content: chat.message,
    response: JSON.parse(chat.response),
    timestamp: new Date(chat.createdAt * 1000) 
  }));
}

export async function submitChat(formData) {
  const userInput = formData?.get('input');
  const connectionId = formData?.get('connectionId');
  
  if (!userInput || !connectionId) {
    return { error: 'No input or connection ID provided' };
  }

  try {
    // Run all initial data fetching in parallel
    const [previousChats, embeddingsData, taskAction] = await Promise.all([
      getPreviousChats(connectionId),
      getQueryEmbeddings(userInput, connectionId),
      taskManager([
        { 
          role: 'system', 
          content: 'Initial context. Direct questions about counts, totals, or current state should be analyzed directly.' 
        },
        { role: 'user', content: userInput }
      ])
    ]);

    const chatHistory = previousChats.map(chat => [
      { role: 'user', content: chat.content },
      { role: 'assistant', content: JSON.stringify(chat.response) }
    ]).flat();

    const databaseContext = formatDatabaseContext(embeddingsData);
    
    let response;
    // Check if the question is a direct query that doesn't need clarification
    const isDirectQuery = userInput.toLowerCase().match(/^(how many|what|who|tell me|show|list|count|get|find)/i);
    
    if (taskAction.next === 'inquire' && isDirectQuery) {
      // Override to analyze for direct questions
      const researchResult = await researcher([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);

      response = { 
        type: 'analysis',
        data: researchResult 
      };
    } else if (taskAction.next === 'inquire') {
      response = await inquire([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);
    } else {
      const isVisualization = taskAction.next === 'visualize';
      const researchResult = await researcher([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);

      response = { 
        type: isVisualization ? 'visualization' : 'analysis',
        data: researchResult 
      };
    }

    // Run background tasks without awaiting
    runInBackground(async () => {
      await Promise.all([
        evaluateResponse({
          userInput,
          aiResponse: response,
          expectedFormat: taskAction.next === 'visualize' ? 'Visualization JSON format' : 'Analysis JSON format',
          context: databaseContext
        }),
        saveChat(userInput, response, connectionId)
      ]);
    });

    return {
      id: Date.now(),
      message: userInput,
      response,
      connectionId
    };
  } catch (error) {
    console.error('Error in submitChat:', error);
    throw error;
  }
}
