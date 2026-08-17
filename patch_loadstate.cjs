const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `  const loadStateFromApi = async (
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
              
              // Also update localStorage so next initial load gets the absolute newest value immediately
              try {
                window.localStorage.setItem(\`asm_\${key}\`, JSON.stringify(payload));
              } catch (e) {}
              
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

// We have an issue where loadStateFromApi is defined inside App component scope. We will replace it.
const regex = /const loadStateFromApi = async \([\s\S]*?setter\(backup\);\n      \}\n    \};/;

if (regex.test(code)) {
  code = code.replace(regex, targetFunc);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched loadStateFromApi");
} else {
  console.log("Could not find loadStateFromApi");
}

