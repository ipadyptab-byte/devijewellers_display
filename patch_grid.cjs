const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
  /className=\{`flex-1 min-h-0 min-w-0 w-full h-full responsive-rates-grid gap-1 md:gap-2 my-1 \$\{isPortrait \? "force-portrait" : ""\}`\}/g,
  'className={`flex-1 min-h-0 min-w-0 w-full h-full responsive-rates-grid gap-1 md:gap-2 mt-1 mb-3 md:mb-5 ${isPortrait ? "force-portrait" : ""}`}'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
