const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const loadStateFuncStr = `  const loadStateFromApi = async (
      key: string,
      setter: (val: any) => void,
      backup: any,
    ) => {
      try {
        const res = await fetch(\`/api/state/\${key}\`);
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const json = await res.json();
            if (json.data) {
              let payload = json.data.payload !== undefined ? json.data.payload : json.data;
              if (key === 'rates') {
                if (!payload.gold24kExchange && payload.gold24k) payload.gold24kExchange = payload.gold24k - 50;
                payload = enforceRounding(payload);
              }
              setter(payload);
              return;
            }
          }
        }
      } catch (err) {}

      try {
        const item = localStorage.getItem(\`asm_\${key}\`);
        if (item) { let p = JSON.parse(item); if (key === 'rates') p = enforceRounding(p); setter(p); }
        else setter(backup);
      } catch (e) {
        setter(backup);
      }
    };`;

code = code.replace(
  "  // 1. Load initial states from backend SQL database, fallback to localStorage if they exist, or seed them\n  useEffect(() => {\n    const loadStateFromApi = async (\n      key: string,\n      setter: (val: any) => void,\n      backup: any,\n    ) => {\n      try {\n        const res = await fetch(`/api/state/${key}`);\n        if (res.ok) {\n          const contentType = res.headers.get(\"content-type\");\n          if (contentType && contentType.indexOf(\"application/json\") !== -1) {\n            const json = await res.json();\n            if (json.data) {\n              \n              let payload = json.data.payload !== undefined ? json.data.payload : json.data;\n              if (key === 'rates') {\n                if (!payload.gold24kExchange && payload.gold24k) payload.gold24kExchange = payload.gold24k - 50;\n                payload = enforceRounding(payload);\n              }\n              setter(payload);\n\n              return;\n            }\n          }\n        }\n      } catch (err) {}\n\n      try {\n        const item = localStorage.getItem(`asm_${key}`);\n        if (item) { let p = JSON.parse(item); if (key === 'rates') p = enforceRounding(p); setter(p); }\n        else setter(backup);\n      } catch (e) {\n        setter(backup);\n      }\n    };",
  loadStateFuncStr + "\n\n  // 1. Load initial states from backend SQL database, fallback to localStorage if they exist, or seed them\n  useEffect(() => {"
);

fs.writeFileSync('src/App.tsx', code);
