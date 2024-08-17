import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate recipe', details: error.message },
      { status: 500 }
    );
  }
}
