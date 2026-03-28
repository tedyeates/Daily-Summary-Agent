import { buildPrompt } from "./lib/prompt.js";

(async () => {
  try {
    const data = await buildPrompt();
    console.log("Built Prompt:", data);
  } catch (err) {
    console.error("Error running Build Prompt component:", err);
  }
})();
