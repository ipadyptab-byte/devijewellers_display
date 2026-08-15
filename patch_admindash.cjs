const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /{ key: 'gold24k', label: '24K Gold', value: rates\.gold24k, sub: '99\.9% Hallmark' },/g,
  "{ key: 'gold24k', label: '24K Gold', value: rates.gold24k, exchangeValue: rates.gold24kExchange, sub: '99.9% Hallmark' },"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
