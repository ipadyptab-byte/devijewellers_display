const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "syncIntervalMinutes: integer('sync_interval_minutes').notNull().default(5),",
  "syncIntervalMinutes: integer('sync_interval_minutes').notNull().default(5),\n  pageReloadIntervalMinutes: integer('page_reload_interval_minutes').notNull().default(60),"
);

fs.writeFileSync('src/db/schema.ts', code);
