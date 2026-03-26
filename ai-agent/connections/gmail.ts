import { google } from 'googleapis';
import { getGoogleAuthClient } from '../lib/auth.js';

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread: boolean;
}

/**
 * Fetches emails from the last 24 hours.
 * Returns a structured list of EmailSummary objects — the agent prompt
 * builder decides how to format them for the LLM.
 */
export async function fetchRecentEmails(
  maxResults = 20,
): Promise<EmailSummary[]> {
  const auth = getGoogleAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'newer_than:1d',
    maxResults,
  });

  const messages = listRes.data.messages ?? [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = full.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name === name)?.value ?? '';

      const labelIds = full.data.labelIds ?? [];

      return {
        id: msg.id!,
        from: get('From'),
        subject: get('Subject'),
        snippet: full.data.snippet ?? '',
        date: get('Date'),
        isUnread: labelIds.includes('UNREAD'),
      };
    }),
  );

  return emails;
}

/**
 * Formats email summaries into a plain-text block for the LLM prompt.
 */
export function formatEmailsForPrompt(emails: EmailSummary[]): string {
  if (emails.length === 0) return 'No emails in the last 24 hours.';

  return emails
    .map(
      (e) =>
        `- [${e.isUnread ? 'UNREAD' : 'read'}] From: ${e.from}\n  Subject: ${e.subject}\n  Preview: ${e.snippet}`,
    )
    .join('\n\n');
}