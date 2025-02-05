"use server";

import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { index } from "@/lib/pinecone";
import { db } from "@/configs/db";
import { eq, and } from "drizzle-orm";

export async function embeddings(data) {
  console.log(data)
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

    const dataText = data.tables.map(t => ({
      tableName: t.tableName,
      sampleData: t.data.slice(0, 5) 
    }));


    const schemaEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(schemaText)
    });

    const dataEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(dataText)
    });


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
      {
        id: `data-${String(data.id)}`,
        values: dataEmbedding.data[0].embedding,
        metadata: {
          type: 'data',
          connectionId: String(data.id),
          connectionName: data.connectionName,
          timestamp: new Date().toISOString(),
          data: JSON.stringify(dataText)
        },
      }
    ]);

    console.log("Pinecone upsert successful for both schema and data");
    return true;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}