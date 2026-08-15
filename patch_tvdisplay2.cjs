const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  /exchangeValue: rates\.gold24kExchange,/g,
  "exchangeValue: rates.gold24kExchange || (rates.gold24k ? rates.gold24k - 50 : 0),"
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay2.tsx");
