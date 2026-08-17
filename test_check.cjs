const fs = require('fs');
const code = fs.readFileSync('src/components/MediaManager.tsx', 'utf8');
console.log(code.substring(code.indexOf("<div className=\"p-4 flex flex-col gap-3\">"), code.indexOf("<div className=\"p-4 flex flex-col gap-3\">") + 1600));
