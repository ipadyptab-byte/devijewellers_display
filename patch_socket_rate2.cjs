const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /        setRates\(\(prev: JewelleryRates\) => \{\n          if \(JSON\.stringify\(prev\) !== JSON\.stringify\(newRates\)\) \{\n            saveToStorage\("rates", newRates\);\n            return enforceRounding\(newRates\);\n          \}\n          return prev;\n        \}\);/;

const replacement1 = `        setRates((prev: JewelleryRates) => {
          if (JSON.stringify(prev) !== JSON.stringify(newRates)) {
            const rounded = enforceRounding(newRates);
            saveToStorage("rates", rounded);
            try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
            return rounded;
          }
          return prev;
        });`;

const regex2 = /            setRates\(\(prev: JewelleryRates\) => \{\n              if \(JSON\.stringify\(prev\) !== JSON\.stringify\(newRates\)\) \{\n                return enforceRounding\(newRates\);\n              \}\n              return prev;\n            \}\);/;

const replacement2 = `            setRates((prev: JewelleryRates) => {
              if (JSON.stringify(prev) !== JSON.stringify(newRates)) {
                const rounded = enforceRounding(newRates);
                try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
                return rounded;
              }
              return prev;
            });`;

code = code.replace(regex1, replacement1);
code = code.replace(regex2, replacement2);
fs.writeFileSync('src/App.tsx', code);
