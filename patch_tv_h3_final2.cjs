const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  '<div className="flex items-stretch w-full min-h-0 shrink mt-0">',
  '<div className="flex items-stretch w-full min-h-0 shrink mt-12 md:mt-16 lg:mt-24">'
);
code = code.replace(
  '<div className="flex items-stretch w-full min-h-0 shrink mt-0">',
  '<div className="flex items-stretch w-full min-h-0 shrink mt-12 md:mt-16 lg:mt-24">'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay h3 margins again 2!");
