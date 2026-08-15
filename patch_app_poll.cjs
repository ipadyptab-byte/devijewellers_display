const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const statePoll = setInterval\(\(\) => \{\n\s*loadStateFromApi\(\n\s*"displaySetting",/g,
  "const statePoll = setInterval(() => {\n      loadStateFromApi(\n        \"displaySetting\","
);

code = code.replace(
  /loadStateFromApi\("branches", setBranches, INITIAL_BRANCHES\);\n\s*\}, 15000\);/g,
  "loadStateFromApi(\"branches\", setBranches, INITIAL_BRANCHES);\n    }, 300000); // 5 minutes instead of 15s to save Vercel Free Tier requests"
);

code = code.replace(
  /const intervalMs = \(displaySetting\?\.refreshInterval \|\| 15\) \* 1000;\n\s*const fallbackPoll = setInterval\(fetchCurrentRates, intervalMs\);/g,
  "const intervalMs = Math.max((displaySetting?.refreshInterval || 15) * 1000, 60000);\n    const fallbackPoll = setInterval(fetchCurrentRates, intervalMs); // Minimum 60s to save Vercel free tier limits"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx polling");
