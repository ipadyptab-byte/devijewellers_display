const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:devijewellers1981@db.klxfgwhpqnxaodurntii.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Add columns to rates
    await client.query(`ALTER TABLE "rates" ADD COLUMN IF NOT EXISTS "gold_24k_exchange" integer DEFAULT 0 NOT NULL;`).catch(e => console.error("Error rates:", e.message));
    
    // Add columns to rate_history_logs
    await client.query(`ALTER TABLE "rate_history_logs" ADD COLUMN IF NOT EXISTS "gold_24k_exchange" integer DEFAULT 0 NOT NULL;`).catch(e => console.error("Error history:", e.message));
    
    // Add columns to calculation_settings
    await client.query(`ALTER TABLE "calculation_settings" ADD COLUMN IF NOT EXISTS "gold24k_exc_mult" double precision DEFAULT 0.99 NOT NULL;`).catch(e => console.error("Error calc settings 1:", e.message));
    await client.query(`ALTER TABLE "calculation_settings" ADD COLUMN IF NOT EXISTS "gold24k_pur_mult" double precision DEFAULT 0.985 NOT NULL;`).catch(e => console.error("Error calc settings 2:", e.message));

    console.log("Database schema updated directly.");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

run();
