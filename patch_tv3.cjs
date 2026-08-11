const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// purchaseTitleFontSize
code = code.replace(
  /fontSize: purchaseTitleFontSize\s*\?\s*`\$\{purchaseTitleFontSize\}px`\s*:\s*"clamp\(8px,1\.2vh,14px\)",/g,
  'fontSize: purchaseTitleFontSize ? `clamp(6px, ${purchaseTitleFontSize}px, 10cqh)` : "clamp(8px, 10cqh, 14px)",'
);

code = code.replace(
  /fontSize: purchaseTitleFontSize\s*\?\s*`\$\{purchaseTitleFontSize\}px`\s*:\s*"clamp\(10px,1\.5vh,16px\)",/g,
  'fontSize: purchaseTitleFontSize ? `clamp(6px, ${purchaseTitleFontSize}px, 10cqh)` : "clamp(8px, 10cqh, 14px)",'
);

// purchaseRateFontSize
code = code.replace(
  /fontSize: purchaseRateFontSize\s*\?\s*`\$\{purchaseRateFontSize\}px`\s*:\s*"clamp\(16px, min\(4\.5vw, 5\.5vh\), 52px\)",/g,
  'fontSize: purchaseRateFontSize ? `clamp(12px, ${purchaseRateFontSize}px, 35cqh)` : "clamp(14px, 35cqh, 48px)",'
);

code = code.replace(
  /fontSize: purchaseRateFontSize\s*\?\s*`\$\{purchaseRateFontSize\}px`\s*:\s*"clamp\(18px, min\(5vw, 6vh\), 56px\)",/g,
  'fontSize: purchaseRateFontSize ? `clamp(12px, ${purchaseRateFontSize}px, 35cqh)` : "clamp(14px, 35cqh, 48px)",'
);

// The silver specific saleTitleFontSize and rateFontSize
code = code.replace(
  /fontSize: saleTitleFontSize\s*\?\s*`\$\{saleTitleFontSize\}px`\s*:\s*"clamp\(10px,1\.5vh,16px\)",/g,
  'fontSize: saleTitleFontSize ? `clamp(6px, ${saleTitleFontSize}px, 10cqh)` : "clamp(8px, 10cqh, 14px)",'
);

code = code.replace(
  /fontSize: rateFontSize\s*\?\s*`\$\{rateFontSize\}px`\s*:\s*"clamp\(18px, min\(5vw, 6vh\), 56px\)",/g,
  'fontSize: rateFontSize ? `clamp(12px, ${rateFontSize}px, 35cqh)` : "clamp(14px, 35cqh, 48px)",'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched ALL fonts sizes");
