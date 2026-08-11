const fs = require('fs');

let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// 1. Make root container scrollable
code = code.replace(
  'p-0 relative overflow-hidden ${isRotatingBgActive',
  'p-0 relative overflow-y-auto overflow-x-hidden ${isRotatingBgActive'
);

// 2. Change gold grid minmax
code = code.replace(
  /gridTemplateRows: `repeat\(\$\{Math\.max\(goldRateItems\.length, silverRateItems\.length\)\}, minmax\(0, 1fr\)\)`,/g,
  'gridTemplateRows: `repeat(${Math.max(goldRateItems.length, silverRateItems.length)}, minmax(min-content, 1fr))`,'
);

// 3. Remove min-h-0 shrink from the inner rate boxes to allow them to wrap text and grow
code = code.replace(
  /className="relative h-full flex-1 z-10 px-2 md:px-6 py-0\.5 md:py-1 flex flex-col items-center justify-center text-center shrink min-h-0"/g,
  'className="relative h-full flex-1 z-10 px-2 md:px-6 py-2 md:py-3 flex flex-col items-center justify-center text-center min-h-[min-content]"'
);

code = code.replace(
  /className="flex items-stretch w-full min-h-0 shrink -mt-1 md:-mt-2"/g,
  'className="flex items-stretch w-full min-h-[min-content] mt-1 md:mt-2"'
);

// Let's also adjust the font-size overrides to cap them so they don't break the layout too much
// labelFontSize
code = code.replace(
  /fontSize: labelFontSize\s*\?\s*`\$\{labelFontSize\}px`\s*:\s*"clamp\(14px, min\(3\.5vw, 4vh\), 32px\)",/g,
  'fontSize: labelFontSize ? `clamp(12px, ${labelFontSize}px, 6vw)` : "clamp(14px, min(3.5vw, 4vh), 32px)",'
);

// saleTitleFontSize
code = code.replace(
  /fontSize: saleTitleFontSize\s*\?\s*`\$\{saleTitleFontSize\}px`\s*:\s*"clamp\(8px,1\.2vh,14px\)",/g,
  'fontSize: saleTitleFontSize ? `clamp(8px, ${saleTitleFontSize}px, 4vw)` : "clamp(8px,1.2vh,14px)",'
);

// rateFontSize
code = code.replace(
  /fontSize: rateFontSize\s*\?\s*`\$\{rateFontSize\}px`\s*:\s*"clamp\(16px, min\(4\.5vw, 5\.5vh\), 52px\)",/g,
  'fontSize: rateFontSize ? `clamp(14px, ${rateFontSize}px, 8vw)` : "clamp(16px, min(4.5vw, 5.5vh), 52px)",'
);

// Wait, the grid containers also have `min-h-0 shrink`. Let's remove them.
code = code.replace(
  /className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-0 shrink"/g,
  'className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-[min-content]"'
);

// The columns:
code = code.replace(
  /className="flex flex-col gap-1 w-full h-full min-h-0 shrink"/g,
  'className="flex flex-col gap-1 w-full h-full min-h-[min-content]"'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay.tsx");
