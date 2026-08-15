const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  /value: rates\.gold24k,\n      purchaseValue: rates\.gold24kPurchase,/g,
  "value: rates.gold24k,\n      exchangeValue: rates.gold24kExchange,\n      purchaseValue: rates.gold24kPurchase,"
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay.tsx");
