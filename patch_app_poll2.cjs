const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /300000\); \/\/ 5 minutes instead of 15s to save Vercel Free Tier requests/g,
  "600000); // 10 minutes instead of 15s to save Vercel Free Tier requests"
);

code = code.replace(
  /const intervalMs = Math\.max\(\(displaySetting\?\.refreshInterval \|\| 15\) \* 1000, 60000\);\n\s*const fallbackPoll = setInterval\(fetchCurrentRates, intervalMs\); \/\/ Minimum 60s to save Vercel free tier limits/g,
  "const intervalMs = 300000; // Poll rates every 5 minutes maximum to save free tier limits. Realtime updates are handled by WebSockets.\n    const fallbackPoll = setInterval(fetchCurrentRates, intervalMs);"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx polling 2");
