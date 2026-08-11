import { db } from './src/db/index.js';
import { calculationSettings } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function updateInterval() {
  await db.update(calculationSettings).set({ syncIntervalMinutes: 5 });
  console.log("Updated to 5 min in database");
  process.exit(0);
}
updateInterval();
