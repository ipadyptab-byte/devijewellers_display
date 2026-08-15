const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

code = code.replace(
  /sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0\.985;`,/g,
  "sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_exc_mult DOUBLE PRECISION NOT NULL DEFAULT 0.990;`,\n            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.985;`,"
);

code = code.replace(
  /sql`ALTER TABLE rates ADD COLUMN IF NOT EXISTS gold_18k_exchange INTEGER NOT NULL DEFAULT 0;`,/g,
  "sql`ALTER TABLE rates ADD COLUMN IF NOT EXISTS gold_18k_exchange INTEGER NOT NULL DEFAULT 0;`,\n            sql`ALTER TABLE rates ADD COLUMN IF NOT EXISTS gold_24k_exchange INTEGER NOT NULL DEFAULT 0;`,"
);

fs.writeFileSync('src/api.ts', code);
console.log("Patched api.ts again");
