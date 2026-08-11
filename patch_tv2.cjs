const fs = require('fs');

let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// Restore grid to minmax(0, 1fr)
code = code.replace(
  /gridTemplateRows: `repeat\(\$\{Math\.max\(goldRateItems\.length, silverRateItems\.length\)\}, minmax\(min-content, 1fr\)\)`,/g,
  'gridTemplateRows: `repeat(${Math.max(goldRateItems.length, silverRateItems.length)}, minmax(0, 1fr))`,'
);

// Restore overflow hidden to root
code = code.replace(
  'p-0 relative overflow-y-auto overflow-x-hidden ${isRotatingBgActive',
  'p-0 relative overflow-hidden ${isRotatingBgActive'
);

// Restore shrink to containers
code = code.replace(
  /className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-\[min-content\]"/g,
  'className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-0 shrink"'
);

code = code.replace(
  /className="flex flex-col gap-1 w-full h-full min-h-\[min-content\]"/g,
  'className="flex flex-col gap-1 w-full h-full min-h-0 shrink"'
);

// Add @container to rate box wrapper
code = code.replace(
  /className="relative w-full h-full filter drop-shadow-\[0_4px_12px_rgba\(0,0,0,0\.4\)\]"/g,
  'className="relative w-full h-full filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] @container"'
);

// Restore inner content flex shrinking
code = code.replace(
  /className="relative h-full flex-1 z-10 px-2 md:px-6 py-2 md:py-3 flex flex-col items-center justify-center text-center min-h-\[min-content\]"/g,
  'className="relative h-full flex-1 z-10 px-1 md:px-4 py-0 flex flex-col items-center justify-center text-center shrink min-h-0"'
);

code = code.replace(
  /className="flex items-stretch w-full min-h-\[min-content\] mt-1 md:mt-2"/g,
  'className="flex items-stretch w-full min-h-0 shrink mt-0"'
);

// Update font sizes to use container queries (cqh)
// labelFontSize
code = code.replace(
  /fontSize: labelFontSize \? `clamp\(12px, \$\{labelFontSize\}px, 6vw\)` : "clamp\(14px, min\(3\.5vw, 4vh\), 32px\)",/g,
  'fontSize: labelFontSize ? `clamp(10px, ${labelFontSize}px, 20cqh)` : "clamp(12px, 15cqh, 24px)",'
);
// Make sure to catch if they already have original format
code = code.replace(
  /fontSize: labelFontSize\s*\?\s*`\$\{labelFontSize\}px`\s*:\s*"clamp\(14px, min\(3\.5vw, 4vh\), 32px\)",/g,
  'fontSize: labelFontSize ? `clamp(10px, ${labelFontSize}px, 20cqh)` : "clamp(12px, 15cqh, 24px)",'
);

// saleTitleFontSize
code = code.replace(
  /fontSize: saleTitleFontSize \? `clamp\(8px, \$\{saleTitleFontSize\}px, 4vw\)` : "clamp\(8px,1\.2vh,14px\)",/g,
  'fontSize: saleTitleFontSize ? `clamp(6px, ${saleTitleFontSize}px, 10cqh)` : "clamp(8px, 10cqh, 14px)",'
);
code = code.replace(
  /fontSize: saleTitleFontSize\s*\?\s*`\$\{saleTitleFontSize\}px`\s*:\s*"clamp\(8px,1\.2vh,14px\)",/g,
  'fontSize: saleTitleFontSize ? `clamp(6px, ${saleTitleFontSize}px, 10cqh)` : "clamp(8px, 10cqh, 14px)",'
);

// rateFontSize
code = code.replace(
  /fontSize: rateFontSize \? `clamp\(14px, \$\{rateFontSize\}px, 8vw\)` : "clamp\(16px, min\(4\.5vw, 5\.5vh\), 52px\)",/g,
  'fontSize: rateFontSize ? `clamp(12px, ${rateFontSize}px, 35cqh)` : "clamp(14px, 35cqh, 48px)",'
);
code = code.replace(
  /fontSize: rateFontSize\s*\?\s*`\$\{rateFontSize\}px`\s*:\s*"clamp\(16px, min\(4\.5vw, 5\.5vh\), 52px\)",/g,
  'fontSize: rateFontSize ? `clamp(12px, ${rateFontSize}px, 35cqh)` : "clamp(14px, 35cqh, 48px)",'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay.tsx perfectly!");
