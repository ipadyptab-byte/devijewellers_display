const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// For Labels (24K GOLD) -> Reduce by 5
code = code.replace(
  /"clamp\(12px, min\(22cqh, 9cqw\), 100px\)"/g,
  '"clamp(12px, min(17cqh, 6cqw), 80px)"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay fonts again!");
