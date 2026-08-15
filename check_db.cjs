const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:devijewellers1981@db.klxfgwhpqnxaodurntii.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'rates'`);
    console.log(res.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

run();
