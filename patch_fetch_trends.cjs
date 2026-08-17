const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /          setRates\(enforceRounding\(newRates\)\);\n        \}\n      \}\)\n      \.catch\(\(err\)/;

const replacement1 = `          setRates((prev: JewelleryRates) => {
            if (JSON.stringify(prev) !== JSON.stringify(newRates)) {
              const newTrends = {
                gold24k: newRates.gold24k > prev.gold24k ? "up" : newRates.gold24k < prev.gold24k ? "down" : "neutral",
                gold22k: newRates.gold22k > prev.gold22k ? "up" : newRates.gold22k < prev.gold22k ? "down" : "neutral",
                gold20k: "neutral",
                gold18k: newRates.gold18k > prev.gold18k ? "up" : newRates.gold18k < prev.gold18k ? "down" : "neutral",
                silver: newRates.silver > prev.silver ? "up" : newRates.silver < prev.silver ? "down" : "neutral",
                platinum: "neutral",
              } as RateTrends;
              setTrends(newTrends);
              
              const rounded = enforceRounding(newRates);
              try { window.localStorage.setItem('asm_trends', JSON.stringify(newTrends)); } catch(e){}
              try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
              return rounded;
            }
            return prev;
          });
        }
      })
      .catch((err)`;

if (regex1.test(code)) {
  code = code.replace(regex1, replacement1);
  console.log("Patched initial fetch");
} else {
  console.log("Failed to patch initial fetch");
}

const regex2 = /            setRates\(\(prev: JewelleryRates\) => \{\n              if \(JSON\.stringify\(prev\) !== JSON\.stringify\(newRates\)\) \{\n                const rounded = enforceRounding\(newRates\);\n                try \{ window\.localStorage\.setItem\('asm_rates', JSON\.stringify\(rounded\)\); \} catch\(e\)\{\}\n                return rounded;\n              \}\n              return prev;\n            \}\);/;

const replacement2 = `            setRates((prev: JewelleryRates) => {
              if (JSON.stringify(prev) !== JSON.stringify(newRates)) {
                const newTrends = {
                  gold24k: newRates.gold24k > prev.gold24k ? "up" : newRates.gold24k < prev.gold24k ? "down" : "neutral",
                  gold22k: newRates.gold22k > prev.gold22k ? "up" : newRates.gold22k < prev.gold22k ? "down" : "neutral",
                  gold20k: "neutral",
                  gold18k: newRates.gold18k > prev.gold18k ? "up" : newRates.gold18k < prev.gold18k ? "down" : "neutral",
                  silver: newRates.silver > prev.silver ? "up" : newRates.silver < prev.silver ? "down" : "neutral",
                  platinum: "neutral",
                } as RateTrends;
                setTrends(newTrends);
                
                const rounded = enforceRounding(newRates);
                try { window.localStorage.setItem('asm_trends', JSON.stringify(newTrends)); } catch(e){}
                try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
                return rounded;
              }
              return prev;
            });`;

if (regex2.test(code)) {
  code = code.replace(regex2, replacement2);
  console.log("Patched fallback poll fetch");
} else {
  console.log("Failed to patch fallback poll fetch");
}

fs.writeFileSync('src/App.tsx', code);
