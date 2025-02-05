import OpenAI from 'openai';

export async function researcher(messages) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an AI research assistant that provides detailed analysis and insights based on database schema and data.

Your role is to analyze the provided database context and return a JSON object with the following structure:
{
  "type": string,         // "analysis" | "visualization" | "calculation"
  "content": {
    "summary": string,    // Brief overview of findings
    "details": string[],  // Detailed bullet points of insights
    "metrics": {          // Key numerical findings (if applicable)
      [key: string]: number | string
    }
  },
  "visualization": {      // Only included if visualization is needed
    "chartType": string,  // "bar" | "line" | "pie" | "scatter"
    "data": array,        // Sample data structure for visualization
    "xAxis": string,      // X-axis label
    "yAxis": string       // Y-axis label
  }
}

Consider the provided database schema and sample data when analyzing:
- Reference only columns and tables that exist in the schema
- Use sample data to provide meaningful insights
- Structure response based on available data`
      },
      ...messages
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  return JSON.parse(response.choices[0].message.content);
}
