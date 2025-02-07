'use server';

import { researcher, taskManager, querySuggestor, inquire } from '@/lib/agents';
import { db } from '@/configs/db';
import { chats } from '@/configs/schema';
import { getQueryEmbeddings } from './chat';
import { and, eq, desc } from 'drizzle-orm';
import { currentUser } from "@clerk/nextjs/server";

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
  let response = null;

  if (!userInput || !connectionId) {
    return { error: 'No input or connection ID provided' };
  }

  try {
    console.log('Starting chat submission...', { userInput, connectionId });
    
    const previousChats = await getPreviousChats(connectionId);
    const chatHistory = previousChats.map(chat => [
      { role: 'user', content: chat.content },
      { role: 'assistant', content: JSON.stringify(chat.response) }
    ]).flat();

    const embeddingsData = await getQueryEmbeddings(userInput, connectionId);
    const databaseContext = formatDatabaseContext(embeddingsData);
    
    const action = await taskManager([
      {
        role: 'system',
        content: databaseContext
      },
      ...chatHistory,
      { 
        role: 'user', 
        content: userInput
      }
    ]);

    console.log('Task manager response:', action);

    if (action.next === 'inquire') {
      const inquiry = await inquire([
        {
          role: 'system',
          content: databaseContext
        },
        ...chatHistory,
        { 
          role: 'user', 
          content: userInput
        }
      ]);
      response = inquiry;
    } else {
      const isVisualization = action.next === 'visualize';
      const researchResult = await researcher([
        {
          role: 'system',
          content: databaseContext
        },
        ...chatHistory,
        {
          role: 'user',
          content: userInput
        }
      ]);
      response = { 
        type: isVisualization ? 'visualization' : 'analysis', 
        data: researchResult 
      };
    }
    console.log('Generated response:', response);

    try {
      await saveChat(userInput, response, parseInt(connectionId));
      console.log('Chat saved successfully');
    } catch (saveError) {
      console.error('Error saving chat:', saveError);
    }

    return {
      id: Date.now(),
      connectionId: parseInt(connectionId),
      response
    };

  } catch (error) {
    console.error('Error processing chat:', error);
    return {
      error: 'Failed to process request'
    };
  }
}
