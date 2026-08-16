const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

code = code.replace(
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none mb-1 md:mb-3 lg:mb-5 absolute top-3 md:top-5 lg:top-8 left-0 right-0 gold-gradient whitespace-nowrap"',
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none gold-gradient whitespace-nowrap shrink-0"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay gold h3!");
