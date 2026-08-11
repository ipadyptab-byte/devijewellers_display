const fs = require('fs');

let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// 1. Label
code = code.replace(
  /className="font-poppins font-bold uppercase tracking-widest text-\[#D4AF37\] leading-none mb-0 gold-gradient"/g,
  'className="font-poppins font-bold uppercase tracking-widest text-[#D4AF37] leading-none mb-0 gold-gradient whitespace-nowrap"'
);
code = code.replace(
  /className=\{`font-poppins font-bold uppercase tracking-widest leading-none mb-0 silver-gradient`\}/g,
  'className={`font-poppins font-bold uppercase tracking-widest leading-none mb-0 silver-gradient whitespace-nowrap`}'
);

// Add whitespace-nowrap to all title spans (SALE RATE, PURCHASE RATE, EXCHANGE RATE)
code = code.replace(
  /className="text-\[#FFD700\] font-poppins uppercase font-black tracking-\[0\.1em\] border-b border-\[#FFD700\]\/30 pb-0\.5 w-full text-center mb-0\.5"/g,
  'className="text-[#FFD700] font-poppins uppercase font-black tracking-[0.1em] border-b border-[#FFD700]/30 pb-0.5 w-full text-center mb-0.5 whitespace-nowrap"'
);
code = code.replace(
  /className="text-\[#E5E4E2\] font-poppins uppercase font-black tracking-\[0\.1em\] border-b border-\[#E5E4E2\]\/30 pb-0\.5 w-full text-center mb-0\.5"/g,
  'className="text-[#E5E4E2] font-poppins uppercase font-black tracking-[0.1em] border-b border-[#E5E4E2]/30 pb-0.5 w-full text-center mb-0.5 whitespace-nowrap"'
);
code = code.replace(
  /className=\{`\$\{accentColor\} font-poppins uppercase font-black tracking-\[0\.1em\] border-b pb-0\.5 w-full text-center mb-0\.5`\}/g,
  'className={`${accentColor} font-poppins uppercase font-black tracking-[0.1em] border-b pb-0.5 w-full text-center mb-0.5 whitespace-nowrap`}'
);
code = code.replace(
  /className="text-\[#E2E8F0\] font-poppins uppercase font-black tracking-\[0\.1em\] border-b border-zinc-400\/30 pb-0\.5 w-full text-center mb-0\.5"/g,
  'className="text-[#E2E8F0] font-poppins uppercase font-black tracking-[0.1em] border-b border-zinc-400/30 pb-0.5 w-full text-center mb-0.5 whitespace-nowrap"'
);

// 2. Adjust clamps to have a smaller minimum (e.g. 4px instead of 8px/12px)
// Labels
code = code.replace(
  /"clamp\(12px, min\(15cqh, 8cqw\), 24px\)"/g,
  '"clamp(4px, min(15cqh, 8cqw), 24px)"'
);
code = code.replace(
  /`clamp\(10px, \$\{labelFontSize\}px, min\(20cqh, 10cqw\)\)`/g,
  '`clamp(4px, ${labelFontSize}px, min(20cqh, 15cqw))`'
);

// Sale Title
code = code.replace(
  /"clamp\(8px, min\(10cqh, 15cqw\), 14px\)"/g,
  '"clamp(4px, min(10cqh, 15cqw), 14px)"'
);
code = code.replace(
  /`clamp\(6px, \$\{saleTitleFontSize\}px, min\(10cqh, 15cqw\)\)`/g,
  '`clamp(4px, ${saleTitleFontSize}px, min(10cqh, 15cqw))`'
);

// Rate Font
code = code.replace(
  /"clamp\(14px, min\(35cqh, 18cqw\), 48px\)"/g,
  '"clamp(6px, min(35cqh, 18cqw), 48px)"'
);
code = code.replace(
  /`clamp\(12px, \$\{rateFontSize\}px, min\(35cqh, 20cqw\)\)`/g,
  '`clamp(6px, ${rateFontSize}px, min(35cqh, 20cqw))`'
);

// Purchase Title
code = code.replace(
  /`clamp\(6px, \$\{purchaseTitleFontSize\}px, min\(10cqh, 15cqw\)\)`/g,
  '`clamp(4px, ${purchaseTitleFontSize}px, min(10cqh, 15cqw))`'
);
code = code.replace(
  /"clamp\(8px, min\(10cqh, 15cqw\), 14px\)"/g, // if previously caught by sale title regex, might not be there but doesn't hurt
  '"clamp(4px, min(10cqh, 15cqw), 14px)"'
);

// Purchase Rate
code = code.replace(
  /`clamp\(12px, \$\{purchaseRateFontSize\}px, min\(35cqh, 20cqw\)\)`/g,
  '`clamp(6px, ${purchaseRateFontSize}px, min(35cqh, 20cqw))`'
);
code = code.replace(
  /"clamp\(14px, min\(35cqh, 18cqw\), 48px\)"/g, 
  '"clamp(6px, min(35cqh, 18cqw), 48px)"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay fonts again.");
