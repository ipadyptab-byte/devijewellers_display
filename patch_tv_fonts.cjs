const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// For Labels (24K GOLD)
code = code.replace(
  /"clamp\(4px, min\(15cqh, 8cqw\), 24px\)"/g,
  '"clamp(12px, min(25cqh, 12cqw), 120px)"'
);
// For SALE / PURCHASE / EXCHANGE titles
code = code.replace(
  /"clamp\(4px, min\(10cqh, 15cqw\), 14px\)"/g,
  '"clamp(8px, min(15cqh, 10cqw), 70px)"'
);
// For Rate Values (7245)
code = code.replace(
  /"clamp\(6px, min\(35cqh, 18cqw\), 48px\)"/g,
  '"clamp(16px, min(45cqh, 22cqw), 250px)"'
);


fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay fonts!");
