import { fetchRecentEmails } from "./connections/gmail.js";

(async () => {
  try {
    const data = await fetchRecentEmails();
    console.log("Gmail Data:", data);
  } catch (err) {
    console.error("Error running Gmail component:", err);
  }
})();
