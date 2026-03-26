/**
 * Telegram tool
 *
 * Setup:
 * 1. Message @BotFather on Telegram → /newbot → follow prompts → copy the token
 * 2. Start a chat with your new bot, then visit:
 *    https://api.telegram.org/bot<TOKEN>/getUpdates
 *    to find your chat_id in the response
 * 3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your env
 */

const TELEGRAM_API = 'https://api.telegram.org';

export interface TelegramSendOptions {
  /** Use 'HTML' or 'MarkdownV2' if you want formatted messages */
  parseMode?: 'HTML' | 'MarkdownV2';
  /** Silently deliver without a notification sound */
  disableNotification?: boolean;
}

/**
 * Sends a message to the configured Telegram chat.
 * This is the primary delivery tool — the agent calls this after
 * generating the brief.
 */
export async function sendTelegramMessage(
  text: string,
  options: TelegramSendOptions = {},
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in your environment',
    );
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (options.parseMode) body.parse_mode = options.parseMode;
  if (options.disableNotification) body.disable_notification = true;

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${error}`);
  }
}

/**
 * Splits a long message into chunks and sends them sequentially.
 * Telegram has a 4096 character limit per message.
 */
export async function sendLongTelegramMessage(
  text: string,
  options: TelegramSendOptions = {},
): Promise<void> {
  const LIMIT = 4000;

  if (text.length <= LIMIT) {
    return sendTelegramMessage(text, options);
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= LIMIT) {
      chunks.push(remaining);
      break;
    }
    // Break at a newline near the limit to avoid mid-sentence splits
    const breakAt = remaining.lastIndexOf('\n', LIMIT);
    const splitAt = breakAt > LIMIT / 2 ? breakAt : LIMIT;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  for (const chunk of chunks) {
    await sendTelegramMessage(chunk, options);
  }
}