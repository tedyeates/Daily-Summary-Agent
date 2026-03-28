# 🦹 The Minion — Daily Briefing Agent

> Your loyal, tireless, and frankly quite clever intelligence operative. It asks no questions. It demands no glory. It just delivers.

You are the villain. The Minion is your agent. It wakes at the hour you decree, crawls the depths of your inbox and calendar, distils the intelligence into a sharp briefing, and delivers it directly to your lair via Telegram. You need only read it and plot.

---

## Lair file structure

```
ai-agent/
├── .github/
│   └── workflows/
│       └── daily-briefing.yml  # The Minion's activation schedule
├── context/
│   ├── agent.md          # The Minion's orders — edit to adjust its tone and loyalty
│   └── user.md           # Intelligence about you, the Overlord — your preferences, your enemies
├── connections/
│   ├── gmail.ts          # Infiltrates your inbox via Gmail API
│   ├── calendar.ts       # Surveys your schedule — today's schemes and the week ahead
│   └── index.ts          # Barrel export — register new intelligence sources here
├── tools/
│   ├── telegram.ts       # Dispatches reports to your Telegram command channel
│   └── index.ts          # Barrel export — register new delivery channels here
├── lib/
│   ├── auth.ts           # Google OAuth client — the Minion's credentials
│   └── llm.ts            # The Minion's brain — swap for a smarter one here
├── agent.ts              # The Minion's core — this is where it all happens
└── get-token.ts          # One-time identity establishment script
```

---

## Initialising the Minion

### 1. Arm it with dependencies

```bash
npm install
```

### 2. Establish Google credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or commandeer an existing one)
3. Enable **Gmail API** and **Google Calendar API** — the Minion needs access to your intelligence feeds
   - `APIs & Services → Library → search each → Enable`
4. Create OAuth credentials
   - `APIs & Services → Credentials → Create Credentials → OAuth Client ID`
   - Application type: **Desktop app**. Capture the Client ID and Secret — keep them secret, obviously.
5. Configure the OAuth consent screen
   - `APIs & Services → OAuth consent screen`
   - User type: External. Add your Gmail address as a test user — the Minion serves only you.

### 3. Issue the Minion its identity papers

```bash
cp .env.example .env
```

Populate `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then run:

```bash
npm run get-token
```

Open the URL it prints. Grant access. Paste the code back. The Minion will print a refresh token — add it to `.env` as `GOOGLE_REFRESH_TOKEN`. This is its long-term authorisation. Guard it accordingly.

### 4. Equip it with an LLM brain

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → Create API key
3. Add to `.env` as `GEMINI_API_KEY`

### 5. Open your command channel via Telegram

1. Message **@BotFather** in Telegram
2. Send `/newbot` and follow its instructions
3. Copy the token → add to `.env` as `TELEGRAM_BOT_TOKEN`
4. Send a message to your new bot (it won't respond — it only reports to you)
5. Find your chat ID: visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Look for `"chat":{"id": 123456789}` — that is your command channel ID
6. Add to `.env` as `TELEGRAM_CHAT_ID`

### 6. Conduct a test run locally

```bash
npm run start
```

Within 15 seconds, an intelligence report should arrive in your Telegram. If it does not, the Minion has failed and must be debugged.

---

## Deploying the Minion via GitHub Actions

The Minion is activated on a schedule by GitHub Actions — a free, serverless outpost that requires no infrastructure of your own. It wakes, runs, and vanishes without a trace.

### 1. Place the workflow file

The activation schedule lives at exactly this path in your repo:

```
.github/workflows/daily-briefing.yml
```

GitHub will detect it automatically and the Minion will be ready for deployment.

### 2. Supply the Minion with classified credentials

Go to your repo on GitHub → **Settings → Secrets and variables → Actions → New repository secret**. Add one secret for each of the following:

| Secret name | What it is |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | The Minion's long-lived credentials — from `npm run get-token` |
| `GEMINI_API_KEY` | The Minion's brain — from Google AI Studio |
| `TELEGRAM_BOT_TOKEN` | Command channel access — from @BotFather |
| `TELEGRAM_CHAT_ID` | Your personal command channel ID |

### 4. Trigger a test activation

Don't wait until 7 AM to find out the Minion is broken. Go to your repo → **Actions → Daily Briefing → Run workflow** to dispatch it immediately. Inspect the logs. Confirm the report arrives in your Telegram command channel.

> ⚠️ **BST note** — GitHub Actions cron runs in UTC only, with no timezone support. The workflow is set to `0 6 * * *`, which is 7am BST. This will have to be updated when moving to GMT.

---

## Customising the Minion's behaviour

### Change the briefing tone or format

Edit `context/agent.md`. This is the Minion's instruction set — changes here take effect on the next activation with no code changes required.

### Brief the Minion on you, the Overlord

Edit `context/user.md`. Add names to watch, events to ignore, schemes in progress, rivals to monitor. The more it knows about your operation, the more useful its reports become.

### Recruit a new intelligence source

1. Create `connections/myservice.ts` — export a `fetch*` function and a `format*ForPrompt` function
2. Register it in `connections/index.ts`
3. Import and call it in `agent.ts` inside `buildPrompt()`

### Add a new delivery channel

1. Create `tools/myservice.ts` — export a `send*` function
2. Register it in `tools/index.ts`
3. Call it in `agent.ts` after `runPrompt()`

### Transplant a smarter brain

Edit `lib/llm.ts` only. The rest of the Minion is unaffected — see comments in that file for switching to Claude or GPT-4o. Choose wisely. Smarter brain, sharper briefs.

---

## Classified variables reference

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from Google Cloud Console |
| `GOOGLE_REFRESH_TOKEN` | The Minion's long-lived credentials — from `npm run get-token` |
| `GEMINI_API_KEY` | The Minion's brain — from Google AI Studio |
| `TELEGRAM_BOT_TOKEN` | Command channel access — from @BotFather |
| `TELEGRAM_CHAT_ID` | Your personal command channel ID |