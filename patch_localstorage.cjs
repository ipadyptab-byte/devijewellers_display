const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /if \(item\) setter\(JSON\.parse\(item\)\);/g,
  "if (item) { let p = JSON.parse(item); if (key === 'rates') p = enforceRounding(p); setter(p); }"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched localStorage fallback");
