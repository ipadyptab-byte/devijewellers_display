const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /gold24k: received\.gold24kSale,\n(.*)gold24kPurchase: received\.gold24kPurchase,/g,
  "gold24k: received.gold24kSale,\n$1gold24kExchange: received.gold24kExchange || (received.gold24kSale - 50),\n$1gold24kPurchase: received.gold24kPurchase,"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx Mapper");
