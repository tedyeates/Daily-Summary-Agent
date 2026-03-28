import {
  fetchRecentEmails,
  formatEmailsForPrompt,
  fetchTodayEvents,
  fetchWeekEvents,
  formatEventsForPrompt,
} from '../connections/index.js';

export async function buildPrompt(): Promise<string> {
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
${formatEventsForPrompt(todayEvents, true)}

## This week's upcoming events
${formatEventsForPrompt(weekEvents)}

Please produce the daily brief now.
`.trim();
}