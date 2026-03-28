import { fetchTodayEvents, fetchWeekEvents } from "./connections/calendar.js";

(async () => {
  try {
    const todayEvents = await fetchTodayEvents();
    console.log("Today's Calendar Events:", todayEvents);

    const weekEvents = await fetchWeekEvents();
    console.log("This Week's Calendar Events:", weekEvents);
  } catch (err) {
    console.error("Error running Calendar component:", err);
  }
})();
