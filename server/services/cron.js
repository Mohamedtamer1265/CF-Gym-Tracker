// server/cronJob.js
import cron from "node-cron";
import { refreshGymsNow } from "./cacheGyms.js";

cron.schedule("0 */3 * * *", async () => {
  try {
    await refreshGymsNow();
  } catch (err) {
    console.error("Cron refresh failed:", err.message);
  }
});
