'use server'

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request) {
  const { prompt } = await request.json();
  
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [{ role: "user", content:  prompt}],
    });

    return new Response(
      JSON.stringify({ message: completion.choices[0].message.content }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate recipe' }),
      { status: 500 }
    );
  }
}