const fs = require('fs');
let code = fs.readFileSync('src/components/RateSync.tsx', 'utf-8');

code = code.replace(
  /gold24kExcMult: 0\.990,\n      gold24kExcMult: 0\.990,/g,
  "gold24kExcMult: 0.990,"
);

fs.writeFileSync('src/components/RateSync.tsx', code);
console.log("Fixed duplicate");
