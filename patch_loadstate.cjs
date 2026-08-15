const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /if \(!payload\.gold24kExchange && payload\.gold24k\) payload\.gold24kExchange = payload\.gold24k - 50;/g,
  "if (!payload.gold24kExchange && payload.gold24k) payload.gold24kExchange = payload.gold24k - 50;\n                payload = enforceRounding(payload);"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched loadStateFromApi");
