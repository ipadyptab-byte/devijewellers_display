const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  'className={`font-poppins font-bold uppercase tracking-widest leading-none -mt-4 md:-mt-8 lg:-mt-12 mb-2 md:mb-6 lg:mb-8 silver-gradient whitespace-nowrap`}',
  'className={`font-poppins font-bold uppercase tracking-widest leading-none -mt-4 md:-mt-10 lg:-mt-16 mb-2 md:mb-6 lg:mb-8 silver-gradient whitespace-nowrap`}'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay h3 margins silver!");
