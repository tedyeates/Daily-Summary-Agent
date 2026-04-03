import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import * as url from 'url';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/callback'
);

const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
});

console.log('Open this URL in your browser:\n', authUrl);

// Spin up a temporary local server to catch the callback
const server = http.createServer(async (req, res) => {
  const code = new url.URL(req.url!, 'http://localhost:3000').searchParams.get('code');
  if (!code) return;

  res.end('Auth complete! You can close this tab.');
  server.close();

  const { tokens } = await client.getToken(code);
  console.log('\nAdd this to your .env and GitHub Secrets:');
  console.log('GOOGLE_REFRESH_TOKEN=', tokens.refresh_token);
});

server.listen(3000);