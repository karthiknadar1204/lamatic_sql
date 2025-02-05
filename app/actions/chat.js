"use server";

import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { index } from "@/lib/pinecone";
import { db } from "@/configs/db";
import { eq, and } from "drizzle-orm";
import { chats, dbConnections } from "@/configs/schema";

const CHUNK_SIZE = 4000; // Safe size under the 8192 token limit

function chunkData(data) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const table of data) {
    const tableString = JSON.stringify(table);
    const tableSize = tableString.length;

    if (currentSize + tableSize > CHUNK_SIZE) {
      chunks.push(currentChunk);
      currentChunk = [table];
      currentSize = tableSize;
    } else {
      currentChunk.push(table);
      currentSize += tableSize;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function embeddings(data) {
  console.log(data);
  const user = await currentUser();
  if (!user) return null;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const schemaText = data.tables.map(t => ({
      tableName: t.tableName,
      columns: t.columns.map(c => `${c.column_name} (${c.data_type})`).join(', ')
    }));

    const dataChunks = chunkData(data.tables.map(t => ({
      tableName: t.tableName,
      sampleData: t.data
    })));

    // Generate schema embedding
    const schemaEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(schemaText)
    });

    // Generate embeddings for each data chunk
    const dataEmbeddings = await Promise.all(
      dataChunks.map(async (chunk, index) => {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: JSON.stringify(chunk)
        });
        return {
          id: `data-${String(data.id)}-${index}`,
          values: embedding.data[0].embedding,
          metadata: {
            type: 'data',
            connectionId: String(data.id),
            connectionName: data.connectionName,
            timestamp: new Date().toISOString(),
            data: JSON.stringify(chunk)
          }
        };
      })
    );

    // Upsert all embeddings to Pinecone
    await index.upsert([
      {
        id: `schema-${String(data.id)}`,
        values: schemaEmbedding.data[0].embedding,
        metadata: {
          type: 'schema',
          connectionId: String(data.id),
          connectionName: data.connectionName,
          timestamp: new Date().toISOString(),
          schema: JSON.stringify(schemaText)
        },
      },
      ...dataEmbeddings
    ]);

    console.log("Pinecone upsert successful for schema and all data chunks");
    return true;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

export async function getDbData(id) {
  const data = await db.select().from(dbConnections).where(eq(dbConnections.id, id));
  return data;
}

export async function getQueryEmbeddings(message, connectionId) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message
    });

    const queryResult = await index.query({
      vector: questionEmbedding.data[0].embedding,
      topK: 10,
      filter: {
        connectionId: { $eq: String(connectionId) }
      },
      includeMetadata: true,
      includeValues: true
    });

    const schemaInfo = queryResult.matches.find(m => m.metadata.type === 'schema')?.metadata?.schema || "[]";
    const dataInfo = queryResult.matches.find(m => m.metadata.type === 'data')?.metadata?.data || "[]";

    return {
      schema: JSON.parse(schemaInfo || "[]"),
      sampleData: JSON.parse(dataInfo || "[]").map(table => ({
        tableName: table.tableName,
        sampleData: table.sampleData
      }))
    };
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

export async function getChatHistory(connectionId) {
  const chatHistory = await db.select().from(chats).where(eq(chats.connectionId, connectionId));
  return chatHistory;
}