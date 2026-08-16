const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// For Labels (24K GOLD) -> Reduce by 3 (was 25cqh, 12cqw) -> Now 22cqh, 9cqw
code = code.replace(
  /"clamp\(12px, min\(25cqh, 12cqw\), 120px\)"/g,
  '"clamp(12px, min(22cqh, 9cqw), 100px)"'
);
// For SALE / PURCHASE / EXCHANGE titles -> Increase by 3 (was 15cqh, 10cqw) -> Now 18cqh, 13cqw
code = code.replace(
  /"clamp\(8px, min\(15cqh, 10cqw\), 70px\)"/g,
  '"clamp(8px, min(18cqh, 13cqw), 90px)"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay fonts again!");
