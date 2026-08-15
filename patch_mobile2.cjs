const fs = require('fs');
let code = fs.readFileSync('src/components/MobileControl.tsx', 'utf-8');

code = code.replace(
  /value=\{editRates\.gold24kExchange \|\| ''\}/g,
  "value={editRates.gold24kExchange || (editRates.gold24k ? editRates.gold24k - 50 : '')}"
);

fs.writeFileSync('src/components/MobileControl.tsx', code);
console.log("Patched MobileControl2.tsx");
