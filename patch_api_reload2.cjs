const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

code = code.replace(
  "sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS enable_auto_sync BOOLEAN NOT NULL DEFAULT true;`,",
  "sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS enable_auto_sync BOOLEAN NOT NULL DEFAULT true;`,\n              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS page_reload_interval_minutes INTEGER NOT NULL DEFAULT 60;`,"
);

fs.writeFileSync('src/api.ts', code);
