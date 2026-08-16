const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// 1. Parent div: change justify-center py-0 to justify-start py-3
code = code.replace(
  /<div className="relative h-full flex-1 z-10 px-1 md:px-4 py-0 flex flex-col items-center justify-center text-center shrink min-h-0">/g,
  '<div className="relative h-full flex-1 z-10 px-1 md:px-4 py-3 flex flex-col items-center justify-start text-center shrink min-h-0">'
);

// 2. Gold H3: clean up absolute and margins
code = code.replace(
  /className="font-poppins font-bold uppercase tracking-widest text-\\[#D4AF37\\] leading-none mb-1 md:mb-3 lg:mb-5 absolute top-3 md:top-5 lg:top-8 left-0 right-0 gold-gradient whitespace-nowrap"/g,
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none gold-gradient whitespace-nowrap shrink-0"'
);

// 3. Silver H3: clean up absolute and margins
code = code.replace(
  /className=\{\`font-poppins font-bold uppercase tracking-widest leading-none mb-1 md:mb-3 lg:mb-5 absolute top-3 md:top-5 lg:top-8 left-0 right-0 silver-gradient whitespace-nowrap\`\}/g,
  'className={`font-poppins font-bold uppercase tracking-widest leading-none silver-gradient whitespace-nowrap shrink-0`}'
);

// 4. Rate Typography Div: remove mt-12/24, add my-auto
code = code.replace(
  /<div className="flex items-stretch w-full min-h-0 shrink mt-12 md:mt-16 lg:mt-24">/g,
  '<div className="flex items-stretch w-full min-h-0 shrink mt-auto mb-auto">'
);
code = code.replace(
  /<div className="flex items-stretch w-full min-h-0 shrink mt-0">/g,
  '<div className="flex items-stretch w-full min-h-0 shrink mt-auto mb-auto">'
);


fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay layout to perfectly center and margin!");
