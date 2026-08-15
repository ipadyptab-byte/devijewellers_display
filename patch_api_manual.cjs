const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf-8');

code = code.replace(
  /const newDbRow = \{\n\s*gold24kSale: received\.gold24k,\n\s*gold24kExchange: received\.gold24kExchange \|\| \(received\.gold24k - 50\),\n\s*gold24kPurchase: received\.gold24kPurchase \|\| \(received\.gold24k - 200\),\n\s*gold22kSale: received\.gold22k,\n\s*gold22kExchange: received\.gold22kExchange \|\| \(received\.gold22k - 50\),\n\s*gold22kPurchase: received\.gold22kPurchase \|\| \(received\.gold22k - 200\),\n\s*gold18kSale: received\.gold18k,\n\s*gold18kExchange: received\.gold18kExchange \|\| \(received\.gold18k - 50\),\n\s*gold18kPurchase: received\.gold18kPurchase \|\| \(received\.gold18k - 200\),\n\s*silverSale: received\.silver,\n\s*silverPurchase: received\.silverPurchase \|\| \(received\.silver - 2000\),\n\s*platinumSale: received\.platinum,\n\s*platinumPurchase: received\.platinumPurchase \|\| \(received\.platinum - 4000\),\n\s*\};/g,
  `const roundTo10 = (val) => Math.round(val / 10) * 10;
    const newDbRow = {
      gold24kSale: roundTo10(received.gold24k),
      gold24kExchange: roundTo10(received.gold24kExchange || (received.gold24k - 50)),
      gold24kPurchase: roundTo10(received.gold24kPurchase || (received.gold24k - 200)),
      gold22kSale: roundTo10(received.gold22k),
      gold22kExchange: roundTo10(received.gold22kExchange || (received.gold22k - 50)),
      gold22kPurchase: roundTo10(received.gold22kPurchase || (received.gold22k - 200)),
      gold18kSale: roundTo10(received.gold18k),
      gold18kExchange: roundTo10(received.gold18kExchange || (received.gold18k - 50)),
      gold18kPurchase: roundTo10(received.gold18kPurchase || (received.gold18k - 200)),
      silverSale: roundTo10(received.silver),
      silverPurchase: roundTo10(received.silverPurchase || (received.silver - 2000)),
      platinumSale: roundTo10(received.platinum),
      platinumPurchase: roundTo10(received.platinumPurchase || (received.platinum - 4000)),
    };`
);

fs.writeFileSync('src/api.ts', code);
console.log("Patched api.ts manual push");
