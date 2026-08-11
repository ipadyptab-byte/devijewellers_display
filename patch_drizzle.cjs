const fs = require('fs');

let config = fs.readFileSync('src/db/drizzle.config.ts', 'utf-8');

config = `import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  // Fallback to legacy env variables if no url is provided
  const sqlHost = process.env.SQL_HOST;
  const sqlDbName = process.env.SQL_DB_NAME;
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;

  if (!sqlHost || !sqlDbName || !user || !password) {
    throw new Error("DATABASE_URL or SQL credentials must be set in environment variables.");
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: connectionString ? {
    url: connectionString
  } : {
    host: process.env.SQL_HOST,
    user: process.env.SQL_ADMIN_USER,
    password: process.env.SQL_ADMIN_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: false,
  },
  verbose: true,
});
`;

fs.writeFileSync('src/db/drizzle.config.ts', config);
console.log("Patched drizzle config");
