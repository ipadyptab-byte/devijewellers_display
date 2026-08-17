const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-black/40 p-2 rounded"',
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-white p-2 md:p-3 rounded-lg"'
);

code = code.replace(
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex-shrink-0"',
  'className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-white p-2 md:p-3 rounded-lg flex-shrink-0"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
