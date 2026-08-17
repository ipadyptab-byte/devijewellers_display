const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "  const [refreshInterval,\n      pageReloadIntervalMinutes, setRefreshInterval]",
  "  const [refreshInterval, setRefreshInterval]"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
