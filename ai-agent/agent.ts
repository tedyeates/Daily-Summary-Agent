/**
 * Daily briefing agent
 *
 * Entrypoint for the cron job. Fetches data from all connections,
 * builds a prompt, runs it through the LLM, and delivers via tools.
 *
 * Run:  npx tsx --env-file=.env agent.ts
 * Cron: 0 7 * * *  (7am UTC daily)
 */

import { buildPrompt } from './lib/prompt.js';
import { runPrompt } from './lib/llm.js';
import { sendLongTelegramMessage } from './tools/index.js';

async function run(): Promise<void> {
  try {
    const prompt = await buildPrompt();

    console.log('[agent] Running prompt through LLM...');
    const brief = await runPrompt(prompt);

    console.log('[agent] Delivering via Telegram...');
    await sendLongTelegramMessage(brief, {parseMode: 'HTML'});

    console.log('[agent] Done.');
  } catch (err) {
    console.error('[agent] Fatal error:', err);
    // Attempt to notify via Telegram even on failure
    try {
      await sendLongTelegramMessage(
        `Agent error at ${new Date().toISOString()}:\n${String(err)}`,
      );
    } catch {
      // Telegram itself failed — nothing more we can do
    }
    process.exit(1);
  }
}

run();