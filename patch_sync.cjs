const fs = require('fs');
let code = fs.readFileSync('src/syncService.ts', 'utf-8');

code = code.replace(
  /const gold24kSale = Math\.round\(raw24k\);\n\s*const gold24kExchange = Math\.round\(gold24kSale \* m24kExc\);\n\s*const gold24kPurchase = Math\.round\(gold24kSale \* m24kPur\);\n\s*const gold22kSale = Math\.round\(gold24kSale \* m22kSale\);\n\s*const gold22kExchange = Math\.round\(gold24kSale \* m22kExc\);\n\s*const gold22kPurchase = Math\.round\(gold24kSale \* m22kPur\);\n\s*const gold18kSale = Math\.round\(gold24kSale \* m18kSale\);\n\s*const gold18kExchange = Math\.round\(gold24kSale \* m18kExc\);\n\s*const gold18kPurchase = Math\.round\(gold24kSale \* m18kPur\);\n\s*const silverSale = Math\.round\(rawSilver\);\n\s*const silverPurchase = Math\.round\(silverSale - settings\.silverPurchaseOffset\);\n\s*const platinumSale = Math\.round\(rawPlatinum \|\| 0\);\n\s*const platinumPurchase = Math\.round\(platinumSale - settings\.platinumPurchaseOffset\);/g,
  `const roundTo10 = (val) => Math.round(val / 10) * 10;
    const gold24kSale = roundTo10(raw24k);
    const gold24kExchange = roundTo10(gold24kSale * m24kExc);
    const gold24kPurchase = roundTo10(gold24kSale * m24kPur);
    const gold22kSale = roundTo10(gold24kSale * m22kSale);
    const gold22kExchange = roundTo10(gold24kSale * m22kExc);
    const gold22kPurchase = roundTo10(gold24kSale * m22kPur);
    const gold18kSale = roundTo10(gold24kSale * m18kSale);
    const gold18kExchange = roundTo10(gold24kSale * m18kExc);
    const gold18kPurchase = roundTo10(gold24kSale * m18kPur);
    
    const silverSale = roundTo10(rawSilver);
    const silverPurchase = roundTo10(silverSale - settings.silverPurchaseOffset);
    const platinumSale = roundTo10(rawPlatinum || 0);
    const platinumPurchase = roundTo10(platinumSale - settings.platinumPurchaseOffset);`
);

fs.writeFileSync('src/syncService.ts', code);
console.log("Patched syncService.ts");
