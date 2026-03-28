import { sendLongTelegramMessage } from "./tools/telegram.js";

(async () => {
  try {
    const result = await sendLongTelegramMessage("<b>test</b>", {parseMode: 'HTML'});
    console.log("Telegram message sent:", result);
  } catch (err) {
    console.error("Error running Telegram component:", err);
  }
})();
