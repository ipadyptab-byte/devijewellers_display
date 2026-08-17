const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const intervalMs = 300000; // Poll rates every 5 minutes maximum to save free tier limits. Realtime updates are handled by WebSockets.",
  "const intervalMs = (displaySetting?.refreshInterval && displaySetting.refreshInterval > 5 ? displaySetting.refreshInterval : 15) * 1000; // Respect user-defined interval"
);

// Also change the state poll interval from 10 minutes to respect refreshInterval (or 30s)
code = code.replace(
  "}, 600000); // 10 minutes instead of 15s to save Vercel Free Tier requests",
  "}, (displaySetting?.refreshInterval && displaySetting.refreshInterval > 10 ? displaySetting.refreshInterval : 30) * 1000);"
);

fs.writeFileSync('src/App.tsx', code);
