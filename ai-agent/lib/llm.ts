import { readFileSync } from 'fs';
import { join } from 'path';

// --- Active provider: Gemini ---
// To switch providers, comment out this import and uncomment the one you want.
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Alternative: Anthropic Claude ---
// npm install @anthropic-ai/sdk
// import Anthropic from '@anthropic-ai/sdk';

// --- Alternative: OpenAI ---
// npm install openai
// import OpenAI from 'openai';

function loadContext(filename: string): string {
  const filePath = join(process.cwd(), 'ai-agent', 'context', filename);
  return readFileSync(filePath, 'utf-8');
}

/**
 * Sends a prompt to the LLM with the agent and user context loaded from
 * the context/ markdown files. Returns the plain text response.
 *
 * To swap providers: replace the implementation block below.
 * The function signature stays the same — the rest of the harness never changes.
 */
export async function runPrompt(userPrompt: string): Promise<string> {
  const agentContext = loadContext('agent.md');
  const userContext = loadContext('user.md');
  const systemPrompt = `${agentContext}\n\n---\n\n${userContext}`;

  // -------------------------------------------------------------------------
  // Gemini (active)
  // Model options: gemini-2.0-flash | gemini-1.5-pro | gemini-1.5-flash
  // -------------------------------------------------------------------------
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();

  // -------------------------------------------------------------------------
  // Claude (swap in by replacing the block above with this)
  // npm install @anthropic-ai/sdk
  // Model options: claude-haiku-4-5-20251001 | claude-sonnet-4-6
  // -------------------------------------------------------------------------
  // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const message = await client.messages.create({
  //   model: 'claude-haiku-4-5-20251001',
  //   max_tokens: 1024,
  //   system: systemPrompt,
  //   messages: [{ role: 'user', content: userPrompt }],
  // });
  // const block = message.content[0];
  // return block.type === 'text' ? block.text : '';

  // -------------------------------------------------------------------------
  // OpenAI (swap in by replacing the block above with this)
  // npm install openai
  // Model options: gpt-4o-mini | gpt-4o
  // -------------------------------------------------------------------------
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const chat = await openai.chat.completions.create({
  //   model: 'gpt-4o-mini',
  //   messages: [
  //     { role: 'system', content: systemPrompt },
  //     { role: 'user', content: userPrompt },
  //   ],
  // });
  // return chat.choices[0].message.content ?? '';
}