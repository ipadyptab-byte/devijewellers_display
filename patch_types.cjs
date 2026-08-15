const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  /gold24kPurchase\?: number;/g,
  "gold24kExchange?: number;\n  gold24kPurchase?: number;"
);

fs.writeFileSync('src/types.ts', code);
console.log("Patched types");
