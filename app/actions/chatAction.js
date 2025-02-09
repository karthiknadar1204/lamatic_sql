'use server';

import { researcher, taskManager, querySuggestor, inquire } from '@/lib/agents';
import { db } from '@/configs/db';
import { chats } from '@/configs/schema';
import { getQueryEmbeddings } from './chat';
import { and, eq, desc } from 'drizzle-orm';
import { currentUser } from "@clerk/nextjs/server";
import { getMutableAIState } from '@/lib/state-manager';
import { streamUI } from '@/lib/stream';


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

  const history = getMutableAIState();

  try {
    // Update history with user message
    history.update([
      ...history.get(),
      {
        role: 'user',
        content: userInput
      }
    ]);

    const embeddingsData = await getQueryEmbeddings(userInput, connectionId);
    const databaseContext = formatDatabaseContext(embeddingsData);

    // Get next action using task manager
    const action = await taskManager([
      {
        role: 'system',
        content: databaseContext
      },
      ...history.get()
    ]);

    // Stream the response based on action type
    const response = await streamUI({
      messages: history.get(),
      action,
      tools: {
        inquire,
        researcher,
        querySuggestor
      },
      connectionId
    });

    // Save chat after streaming completes
    await saveChat(userInput, response, parseInt(connectionId));

    return {
      id: Date.now(),
      connectionId: parseInt(connectionId),
      response
    };

  } catch (error) {
    console.error('Error processing chat:', error);
    return { error: 'Failed to process request' };
  }
}
