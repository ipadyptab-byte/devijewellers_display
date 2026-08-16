const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  /className="w-full h-full object-cover transition-all"/g,
  `className="w-full h-full object-contain transition-all"`
);

code = code.replace(
  /className="w-full h-full object-cover bg-black"/g,
  `className="w-full h-full object-contain bg-black"`
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay contain logic!");
