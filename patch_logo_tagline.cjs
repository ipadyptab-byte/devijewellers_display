const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// Remove the full white background from the logo img
code = code.replace(
  /className="h-16 md:h-20 lg:h-24 max-w-\[400px\] object-contain drop-shadow-\[0_4px_12px_rgba\(0,0,0,0\.5\)\] bg-white p-2 md:p-3 rounded-lg"/g,
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative z-10"'
);

code = code.replace(
  /className="h-16 md:h-20 lg:h-24 max-w-\[400px\] object-contain drop-shadow-\[0_4px_12px_rgba\(0,0,0,0\.5\)\] bg-white p-2 md:p-3 rounded-lg flex-shrink-0"/g,
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex-shrink-0 relative z-10"'
);

// Wrap the logo in a relative div with a white box at the bottom
code = code.replace(
  '{companyConfig?.logoImageBase64 ? (',
  '<div className="relative inline-flex flex-col items-center justify-center">\n            {/* White box specifically for the bottom tag line of the image */}\n            <div className="absolute bottom-0 w-3/4 h-1/4 md:h-1/3 bg-white/95 rounded-sm z-0 blur-[2px]"></div>\n            <div className="absolute bottom-0.5 w-[85%] h-1/4 md:h-[28%] bg-white rounded z-0 shadow-sm"></div>\n            {companyConfig?.logoImageBase64 ? ('
);

code = code.replace(
  '          )}',
  '          )}\n          </div>'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
