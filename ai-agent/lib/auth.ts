import { google } from 'googleapis';

/**
 * Returns an authenticated OAuth2 client using the stored refresh token.
 * All connections that need Google APIs use this.
 */
export function getGoogleAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  // Persist any newly issued refresh tokens automatically
  client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.warn(
        '[auth] Google issued a new refresh token — update GOOGLE_REFRESH_TOKEN in your env:',
        tokens.refresh_token,
      );
    }
  });

  return client;
}