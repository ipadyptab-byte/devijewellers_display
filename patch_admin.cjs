const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /setGoldFontSize\\(val\\);\\s*setSilverFontSize\\(val\\);/g,
  'setGoldFontSize(val);\\n                    setSilverFontSize(val);\\n                    setRateFontSize(val);'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard!");
