import { google } from 'googleapis';
import { getGoogleAuthClient } from '../lib/auth.js';

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

/**
 * Fetches emails from the last 24 hours from the inbox only.
 * Excludes sent, spam, drafts, and trash via `in:inbox`.
 * Starred and important status are derived from each message's labelIds.
 */
export async function fetchRecentEmails(
  maxResults = 20,
): Promise<EmailSummary[]> {
  const auth = getGoogleAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'in:inbox newer_than:1d',
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

      const headers  = full.data.payload?.headers ?? [];
      const labelIds = full.data.labelIds ?? [];
      const get      = (name: string) =>
        headers.find((h) => h.name === name)?.value ?? '';

      return {
        id:          msg.id!,
        from:        get('From'),
        subject:     get('Subject'),
        snippet:     full.data.snippet ?? '',
        date:        get('Date'),
        isUnread:    labelIds.includes('UNREAD'),
        isStarred:   labelIds.includes('STARRED'),
        isImportant: labelIds.includes('IMPORTANT'),
      };
    }),
  );

  return emails;
}

/**
 * Formats email summaries into a plain-text block for the LLM prompt.
 * Starred and important flags are surfaced as inline tags so the model
 * can weight them appropriately in its summary.
 */
export function formatEmailsForPrompt(emails: EmailSummary[]): string {
  if (emails.length === 0) return 'No emails in the last 24 hours.';

  return emails
    .map((e) => {
      const tags: string[] = [];
      if (e.isUnread)    tags.push('UNREAD');
      if (e.isStarred)   tags.push('STARRED');
      if (e.isImportant) tags.push('IMPORTANT');
      const tagStr = tags.length > 0 ? `[${tags.join(' · ')}] ` : '[read] ';

      return (
        `- ${tagStr}From: ${e.from}\n` +
        `  Subject: ${e.subject}\n` +
        `  Preview: ${e.snippet}`
      );
    })
    .join('\n\n');
}