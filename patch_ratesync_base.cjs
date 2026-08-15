const fs = require('fs');
let code = fs.readFileSync('src/components/RateSync.tsx', 'utf-8');

code = code.replace(
  /formatPrice\(baseGold24k\)/g,
  "formatPrice(Math.round(baseGold24k / 10) * 10)"
);
code = code.replace(
  /formatPrice\(baseSilver, true\)/g,
  "formatPrice(Math.round(baseSilver / 10) * 10, true)"
);
code = code.replace(
  /formatPrice\(basePlatinum, true\)/g,
  "formatPrice(Math.round(basePlatinum / 10) * 10, true)"
);

fs.writeFileSync('src/components/RateSync.tsx', code);
console.log("Patched RateSync.tsx base prices");
