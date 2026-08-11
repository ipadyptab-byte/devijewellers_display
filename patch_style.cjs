const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  '        .force-portrait {\n          grid-template-columns: 1fr !important;\n          grid-auto-rows: 1fr !important;\n          grid-auto-flow: row !important;\n        }',
  '        .force-portrait {\n          grid-template-columns: 1fr !important;\n          grid-template-rows: none !important;\n          grid-auto-rows: 1fr !important;\n          grid-auto-flow: row !important;\n        }'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched force-portrait.");
