const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
  'className={`w-full text-[#F8F5EE] select-none h-full flex flex-col justify-between font-poppins transition-all duration-700 p-0 pb-3 md:pb-5 relative overflow-hidden ${isRotatingBgActive ? "bg-black" : themeBg} @container`}',
  'className={`w-full text-[#F8F5EE] select-none h-full flex flex-col justify-between font-poppins transition-all duration-700 p-0 pb-3 md:pb-5 px-3 md:px-5 relative overflow-hidden ${isRotatingBgActive ? "bg-black" : themeBg} @container`}'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
