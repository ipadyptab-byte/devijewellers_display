const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectBlock = `
  // Auto page-reload mechanism for TV Displays to maintain absolute stability
  useEffect(() => {
    if (isStandaloneTvDisplay) {
      const minutes = displaySetting?.pageReloadIntervalMinutes || 60;
      if (minutes > 0) {
        const reloadMs = minutes * 60 * 1000;
        console.log(\`Setting TV Display auto-refresh timer to \${minutes} minutes.\`);
        const timer = setTimeout(() => {
          window.location.reload();
        }, reloadMs);
        return () => clearTimeout(timer);
      }
    }
  }, [isStandaloneTvDisplay, displaySetting?.pageReloadIntervalMinutes]);
`;

code = code.replace(
  "// Listen to Firestore for history",
  effectBlock + "\n  // Listen to Firestore for history"
);

fs.writeFileSync('src/App.tsx', code);
