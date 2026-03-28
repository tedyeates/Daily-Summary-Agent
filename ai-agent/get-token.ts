/**
 * One-time script to generate a Google OAuth refresh token.
 *
 * Run once locally:
 *   npx tsx --env-file=.env get-token.ts
 *
 * Then store the printed refresh token as GOOGLE_REFRESH_TOKEN in your env.
 * You should not need to run this again unless the token is revoked.
 */

import { google } from 'googleapis';
import * as readline from 'readline';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob',
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // forces refresh token to be issued even if previously authorised
});

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste the authorisation code here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\nSuccess! Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (err) {
    console.error('Failed to exchange code for tokens:', err);
    process.exit(1);
  }
});