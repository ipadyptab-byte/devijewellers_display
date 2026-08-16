const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none -mt-4 md:-mt-10 lg:-mt-16 mb-2 md:mb-6 lg:mb-8 gold-gradient whitespace-nowrap"',
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none mb-0 gold-gradient whitespace-nowrap"'
);

code = code.replace(
  'className={`font-poppins font-bold uppercase tracking-widest leading-none -mt-4 md:-mt-10 lg:-mt-16 mb-2 md:mb-6 lg:mb-8 silver-gradient whitespace-nowrap`}',
  'className={`font-poppins font-bold uppercase tracking-widest leading-none mb-0 silver-gradient whitespace-nowrap`}'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Restored TVDisplay h3 margins!");
