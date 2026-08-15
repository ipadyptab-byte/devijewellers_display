const fs = require('fs');
let code = fs.readFileSync('src/components/SaleStatus.tsx', 'utf-8');

code = code.replace(
  /if \(show24k\) displayItems\.push\({ label: '24K GOLD RATE', sub: '10gm', val: formatINR\(rates\.gold24k\) }\);/g,
  "if (show24k) displayItems.push({ label: '24K GOLD RATE', sub: '10gm', val: formatINR(rates.gold24k), exchangeVal: formatINR(rates.gold24kExchange || 0) });"
);

fs.writeFileSync('src/components/SaleStatus.tsx', code);
console.log("Patched SaleStatus.tsx");
