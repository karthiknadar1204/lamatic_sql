'use server';

import { researcher, taskManager, querySuggestor, inquire } from '@/lib/agents';
import { db } from '@/configs/db';
import { chats } from '@/configs/schema';
import { getQueryEmbeddings } from './chat';

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

export async function submitChat(formData) {
  const userInput = formData?.get('input');
  const connectionId = formData?.get('connectionId');
  let response = null;

  if (!userInput) {
    return { error: 'No input provided' };
  }

  try {

    console.log('Connection ID:', connectionId);
    const embeddingsData = await getQueryEmbeddings(userInput, connectionId);
    const databaseContext = formatDatabaseContext(embeddingsData);
    console.log('Embeddings data:', embeddingsData);
    

    const action = await taskManager([
      {
        role: 'system',
        content: databaseContext
      },
      { 
        role: 'user', 
        content: userInput
      }
    ]);

    console.log('Action:', action);
    
    if (action.next === 'inquire') {
      const inquiry = await inquire([
        {
          role: 'system',
          content: databaseContext
        },
        { 
          role: 'user', 
          content: userInput
        }
      ]);
      response = inquiry;
    } else {
      const isVisualization = action.next === 'visualize';

      if (isVisualization) {
        const researchResult = await researcher([
          {
            role: 'system',
            content: databaseContext
          },
          {
            role: 'user',
            content: userInput
          }
        ]);
        response = { type: 'visualization', data: researchResult };
      } else {
        const researchResult = await researcher([
          {
            role: 'system',
            content: databaseContext
          },
          {
            role: 'user',
            content: userInput
          }
        ]);
        response = { type: 'analysis', data: researchResult };
      }
    }

    return {
      id: Date.now(),
      response
    };

  } catch (error) {
    console.error('Error processing chat:', error);
    return {
      error: 'Failed to process request'
    };
  }
}
