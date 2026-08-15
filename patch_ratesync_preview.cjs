const fs = require('fs');
let code = fs.readFileSync('src/components/RateSync.tsx', 'utf-8');

code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold24kExcMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold24kExcMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold24kPurMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold24kPurMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold22kSaleMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold22kSaleMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold22kExcMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold22kExcMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold22kPurMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold22kPurMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold18kSaleMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold18kSaleMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold18kExcMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold18kExcMult) / 10) * 10"
);
code = code.replace(
  /Math\.round\(baseGold24k \* calcSettings\.gold18kPurMult\)/g,
  "Math.round((baseGold24k * calcSettings.gold18kPurMult) / 10) * 10"
);

// We also need to fix baseSilver offset preview:
code = code.replace(
  /baseSilver - calcSettings\.silverPurchaseOffset \|\| 0/g,
  "Math.round((baseSilver - calcSettings.silverPurchaseOffset) / 10) * 10 || 0"
);

code = code.replace(
  /basePlatinum - calcSettings\.platinumPurchaseOffset \|\| 0/g,
  "Math.round((basePlatinum - calcSettings.platinumPurchaseOffset) / 10) * 10 || 0"
);

fs.writeFileSync('src/components/RateSync.tsx', code);
console.log("Patched RateSync.tsx previews");
