const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf-8');

// Add to rates
code = code.replace(
  /gold24kPurchase: integer\('gold_24k_purchase'\)\.notNull\(\),/g,
  "gold24kExchange: integer('gold_24k_exchange').notNull().default(0),\n  gold24kPurchase: integer('gold_24k_purchase').notNull(),"
);

// Add to calculation_settings
code = code.replace(
  /gold24kPurMult: doublePrecision\('gold24k_pur_mult'\)\.notNull\(\)\.default\(0\.985\),/g,
  "gold24kExcMult: doublePrecision('gold24k_exc_mult').notNull().default(0.990),\n  gold24kPurMult: doublePrecision('gold24k_pur_mult').notNull().default(0.985),"
);

fs.writeFileSync('src/db/schema.ts', code);
console.log("Patched schema");
