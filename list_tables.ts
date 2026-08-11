import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';
import { rates } from './src/db/schema.js';
import { desc } from 'drizzle-orm';

async function checkDb() {
  try {
    const res = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("--- TABLES IN DATABASE ---");
    res.rows.forEach(r => console.log("- " + r.table_name));
    
    // Check rates table
    const latestRates = await db.select().from(rates).orderBy(desc(rates.updatedAt)).limit(1);
    console.log("\n--- LATEST ROW IN 'rates' TABLE ---");
    console.log(JSON.stringify(latestRates[0], null, 2));

  } catch(e) {
    console.error("Error querying database:", e);
  } finally {
    process.exit(0);
  }
}

checkDb();
