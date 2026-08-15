const fs = require('fs');
let code = fs.readFileSync('src/components/SaleStatus.tsx', 'utf-8');

code = code.replace(
  /exchangeVal: formatINR\(rates\.gold24kExchange \|\| 0\)/g,
  "exchangeVal: formatINR(rates.gold24kExchange || (rates.gold24k ? rates.gold24k - 50 : 0))"
);

fs.writeFileSync('src/components/SaleStatus.tsx', code);
console.log("Patched SaleStatus2.tsx");
