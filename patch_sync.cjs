const fs = require('fs');
let code = fs.readFileSync('src/syncService.ts', 'utf-8');

code = code.replace(
  /const m24kPur = settings\.gold24kPurMult \?\? 0\.985;/g,
  "const m24kExc = settings.gold24kExcMult ?? 0.990;\n    const m24kPur = settings.gold24kPurMult ?? 0.985;"
);

code = code.replace(
  /const gold24kPurchase = Math\.round\(gold24kSale \* m24kPur\);/g,
  "const gold24kExchange = Math.round(gold24kSale * m24kExc);\n    const gold24kPurchase = Math.round(gold24kSale * m24kPur);"
);

code = code.replace(
  /gold24kSale,\n      gold24kPurchase,/g,
  "gold24kSale,\n      gold24kExchange,\n      gold24kPurchase,"
);

code = code.replace(
  /lastRate\.gold24kSale === rateData\.gold24kSale &&/g,
  "lastRate.gold24kSale === rateData.gold24kSale &&\n            lastRate.gold24kExchange === rateData.gold24kExchange &&"
);

fs.writeFileSync('src/syncService.ts', code);
console.log("Patched sync service");
