const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

code = code.replace(
  /gold24kSale: received\.gold24k,\n      gold24kPurchase: received\.gold24kPurchase \|\| \(received\.gold24k - 200\),/g,
  "gold24kSale: received.gold24k,\n      gold24kExchange: received.gold24kExchange || (received.gold24k - 50),\n      gold24kPurchase: received.gold24kPurchase || (received.gold24k - 200),"
);

fs.writeFileSync('src/api.ts', code);
console.log("Patched api.ts");
