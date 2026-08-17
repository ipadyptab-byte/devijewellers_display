const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "        const timer = setTimeout(() => {\n          console.log('Performing seamless background refresh of all TV assets...');\n          // Soft refresh\n          loadStateFromApi(\"displaySetting\", setDisplaySetting, INITIAL_DISPLAY_SETTING);\n          loadStateFromApi(\"systemConfig\", setSystemConfig, INITIAL_SYSTEM_CONFIG);\n          loadStateFromApi(\"media\", setMedia, INITIAL_MEDIA);\n          loadStateFromApi(\"promos\", setPromos, INITIAL_PROMOS);\n          loadStateFromApi(\"branches\", setBranches, INITIAL_BRANCHES);\n          loadStateFromApi(\"rates\", setRates, INITIAL_RATES);\n        }, reloadMs);",
  "        const timer = setInterval(() => {\n          console.log('Performing seamless background refresh of all TV assets...');\n          loadStateFromApi(\"displaySetting\", setDisplaySetting, INITIAL_DISPLAY_SETTING);\n          loadStateFromApi(\"systemConfig\", setSystemConfig, INITIAL_SYSTEM_CONFIG);\n          loadStateFromApi(\"media\", setMedia, INITIAL_MEDIA);\n          loadStateFromApi(\"promos\", setPromos, INITIAL_PROMOS);\n          loadStateFromApi(\"branches\", setBranches, INITIAL_BRANCHES);\n          loadStateFromApi(\"rates\", setRates, INITIAL_RATES);\n        }, reloadMs);"
);

// We should also replace the timer = setTimeout with timer = setInterval because reloadMs is meant to be a repeating interval, but before we did a location.reload() which destroyed the timer anyway. So now it needs to be an interval!
code = code.replace(
  "return () => clearTimeout(timer);",
  "return () => clearInterval(timer);"
);

fs.writeFileSync('src/App.tsx', code);
