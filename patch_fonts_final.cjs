const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// Replace cqh -> vh, cqw -> vw, dvh -> vh, dvw -> vw in the clamp expressions
const replaceRegex = /fontSize:\s*([a-zA-Z0-9_|() ]+)\s*\?\s*`clamp\([^`]+\)`\s*:\s*"clamp\([^"]+"\)/g;

// To be safe, just replace all cqw, cqh, dvh, dvw inside the style blocks of TVDisplay.tsx
code = code.replace(/cqw/g, 'vw');
code = code.replace(/cqh/g, 'vh');
code = code.replace(/dvw/g, 'vw');
code = code.replace(/dvh/g, 'vh');
code = code.replace(/cqi/g, 'vw');
code = code.replace(/cqmin/g, 'vmin');
code = code.replace(/cqmax/g, 'vmax');

// Wait, the previous patch used: min(1cqh, 1cqw) -> min(1vh, 1vw) -> vmin! 
// Let's ensure this is replaced.

fs.writeFileSync('src/components/TVDisplay.tsx', code);
