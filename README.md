# AI Agent

A personal daily briefing agent that runs on a cron schedule. Fetches emails and calendar events, summarises them with an LLM, and delivers via Telegram.

---

## Project structure

```
ai-agent/
├── context/
│   ├── agent.md          # LLM system prompt — edit to change tone/format
│   └── user.md           # Your preferences — edit to personalise the brief
├── connections/
│   ├── gmail.ts          # Fetches recent emails via Gmail API
│   ├── calendar.ts       # Fetches today + week events via Calendar API
│   └── index.ts          # Barrel export — add new connections here
├── tools/
│   ├── telegram.ts       # Delivers the brief via Telegram Bot API
│   └── index.ts          # Barrel export — add new tools here
├── lib/
│   ├── auth.ts           # Shared Google OAuth client
│   └── llm.ts            # LLM abstraction — swap models here
├── agent.ts              # Entry point — orchestrates everything
└── get-token.ts          # One-time script to generate Google refresh token
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Google Cloud — OAuth credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable **Gmail API** and **Google Calendar API**
   - APIs & Services → Library → search each → Enable
4. Create OAuth credentials
   - APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Desktop app**
   - Download the credentials or copy the Client ID and Client Secret
5. Configure the OAuth consent screen
   - APIs & Services → OAuth consent screen
   - User type: External
   - Add your own Gmail address as a **test user**

### 3. Generate your Google refresh token

Copy `.env.example` to `.env` and fill in your Client ID and Secret:

```bash
cp .env.example .env
```

Then run the one-time auth script:

```bash
npm run get-token
```

It will print a URL — open it, approve access, paste the code back. Copy the printed refresh token into your `.env` as `GOOGLE_REFRESH_TOKEN`.

### 4. Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → Create API key
3. Add to `.env` as `GEMINI_API_KEY`

### 5. Telegram bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the token it gives you → add to `.env` as `TELEGRAM_BOT_TOKEN`
4. Start a conversation with your new bot (search for it by the username you chose)
5. Find your chat ID:
   - Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in your browser
   - Send a message to your bot first if the response is empty
   - Look for `"chat":{"id": 123456789}` — that number is your chat ID
6. Add to `.env` as `TELEGRAM_CHAT_ID`

### 6. Test a run locally

```bash
npm run start
```

You should receive a Telegram message within ~15 seconds.

---

## Deploying to Railway

### First deploy

1. Push the project to a GitHub repository
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select your repository
4. Railway will detect the project — **do not set a start command yet**

### Set environment variables

In Railway → your service → Variables, add all values from your `.env`:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
GEMINI_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

### Configure as a cron job

In Railway → your service → Settings → Deploy:

- **Start command:** `npx tsx agent.ts`
- Scroll down to **Cron Schedule**
- Enable cron and set your schedule, e.g.:

```
0 7 * * *
```

This runs at 7:00 AM UTC daily. Adjust for your timezone — for London (GMT+1 in summer): `0 6 * * *`

### Verify

After saving, Railway will show the next scheduled run. You can also trigger a manual run from the Railway dashboard to confirm everything works end-to-end.

---

## Customising the brief

### Change the tone or output format

Edit `context/agent.md`. This is the system prompt — changes here take effect on the next run with no code changes needed.

### Add personal preferences

Edit `context/user.md`. Add names to prioritise, events to skip, or any other context about yourself.

### Add a new data source

1. Create `connections/myservice.ts` — export a `fetch*` function and a `format*ForPrompt` function
2. Add the export to `connections/index.ts`
3. Import and call it in `agent.ts` inside `buildPrompt()`

### Add a new delivery tool

1. Create `tools/myservice.ts` — export a `send*` function
2. Add the export to `tools/index.ts`
3. Call it in `agent.ts` after `runPrompt()`

### Switch LLM provider

Edit `lib/llm.ts` only. The rest of the codebase is unaffected. See comments in that file for switching to Claude or GPT-4o.

---

## Environment variables reference

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from Google Cloud Console |
| `GOOGLE_REFRESH_TOKEN` | Long-lived token from `npm run get-token` |
| `GEMINI_API_KEY` | API key from Google AI Studio |
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather |
| `TELEGRAM_CHAT_ID` | Your personal Telegram chat ID |