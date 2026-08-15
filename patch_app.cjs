const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /setter\(\n                json\.data\.payload !== undefined \? json\.data\.payload : json\.data,\n              \);/g,
  `
              let payload = json.data.payload !== undefined ? json.data.payload : json.data;
              if (key === 'rates') {
                if (!payload.gold24kExchange && payload.gold24k) payload.gold24kExchange = payload.gold24k - 50;
              }
              setter(payload);
`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
