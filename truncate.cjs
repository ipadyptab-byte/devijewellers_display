const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:devijewellers1981@db.klxfgwhpqnxaodurntii.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('TRUNCATE TABLE global_state;');
  console.log("Truncated global_state");
  await client.end();
}
run().catch(console.error);
