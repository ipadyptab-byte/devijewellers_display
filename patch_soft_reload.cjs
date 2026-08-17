const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "        const timer = setTimeout(() => {\n          window.location.reload();\n        }, reloadMs);",
  "        const timer = setTimeout(() => {\n          console.log('Performing seamless background refresh of all TV assets...');\n          // Soft refresh\n          loadStateFromApi(\"displaySetting\", setDisplaySetting, INITIAL_DISPLAY_SETTING);\n          loadStateFromApi(\"systemConfig\", setSystemConfig, INITIAL_SYSTEM_CONFIG);\n          loadStateFromApi(\"media\", setMedia, INITIAL_MEDIA);\n          loadStateFromApi(\"promos\", setPromos, INITIAL_PROMOS);\n          loadStateFromApi(\"branches\", setBranches, INITIAL_BRANCHES);\n          loadStateFromApi(\"rates\", setRates, INITIAL_RATES);\n        }, reloadMs);"
);

// We need to define loadStateFromApi outside of the first useEffect so it can be called in the second useEffect, 
// OR just leave the pageReloadInterval timer as a soft reload without moving the function. Wait! loadStateFromApi is defined inside a useEffect!
// We can't call it there.
