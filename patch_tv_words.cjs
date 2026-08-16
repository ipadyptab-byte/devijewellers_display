const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  />\\s*SALE RATE\\s*</g,
  '>\\n                                  SALE\\n                                <'
);

code = code.replace(
  />\\s*PURCHASE RATE\\s*</g,
  '>\\n                                  PURCHASE\\n                                <'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay words!");
