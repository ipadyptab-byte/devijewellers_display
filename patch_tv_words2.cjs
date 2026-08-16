const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  /SALE RATE/g,
  'SALE'
);

code = code.replace(
  /PURCHASE RATE/g,
  'PURCHASE'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay words 2!");
