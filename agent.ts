/**
 * Daily briefing agent
 *
 * Entrypoint for the cron job. Fetches data from all connections,
 * builds a prompt, runs it through the LLM, and delivers via tools.
 *
 * Run:  npx tsx --env-file=.env agent.ts
 * Cron: 0 7 * * *  (7am UTC daily)
 */

import {
  fetchRecentEmails,
  formatEmailsForPrompt,
  fetchTodayEvents,
  fetchWeekEvents,
  formatEventsForPrompt,
} from './connections/index.js';

import { runPrompt } from './lib/llm.js';
import { sendLongTelegramMessage } from './tools/index.js';

async function buildPrompt(): Promise<string> {
  console.log('[agent] Fetching data from connections...');

  const [emails, todayEvents, weekEvents] = await Promise.all([
    fetchRecentEmails(),
    fetchTodayEvents(),
    fetchWeekEvents(),
  ]);

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/London',
  });

  return `
Today is ${now}.

## Emails (last 24 hours)
${formatEmailsForPrompt(emails)}

## Today's calendar
${formatEventsForPrompt(todayEvents)}

## This week's upcoming events
${formatEventsForPrompt(weekEvents)}

Please produce the daily brief now.
`.trim();
}

async function run(): Promise<void> {
  try {
    const prompt = await buildPrompt();

    console.log('[agent] Running prompt through LLM...');
    const brief = await runPrompt(prompt);

    console.log('[agent] Delivering via Telegram...');
    await sendLongTelegramMessage(brief);

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