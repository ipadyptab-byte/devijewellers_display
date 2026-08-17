const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /        setRates\(\(prev: JewelleryRates\) => \{\n          if \(JSON\.stringify\(prev\) !== JSON\.stringify\(newRates\)\) \{[\s\S]*?            saveToStorage\("trends", newTrends\);\n            return enforceRounding\(newRates\);\n          \}\n          return prev;\n        \}\);/;

const replacement = `        setRates((prev: JewelleryRates) => {
          if (JSON.stringify(prev) !== JSON.stringify(newRates)) {
            const newTrends = {
              gold24k:
                newRates.gold24k > prev.gold24k
                  ? "up"
                  : newRates.gold24k < prev.gold24k
                    ? "down"
                    : "neutral",
              gold22k:
                newRates.gold22k > prev.gold22k
                  ? "up"
                  : newRates.gold22k < prev.gold22k
                    ? "down"
                    : "neutral",
              gold20k: "neutral",
              gold18k:
                newRates.gold18k > prev.gold18k
                  ? "up"
                  : newRates.gold18k < prev.gold18k
                    ? "down"
                    : "neutral",
              silver:
                newRates.silver > prev.silver
                  ? "up"
                  : newRates.silver < prev.silver
                    ? "down"
                    : "neutral",
              platinum: "neutral",
            } as RateTrends;
            setTrends(newTrends);
            
            const rounded = enforceRounding(newRates);
            
            // Sync to local storage for instant access on hard reloads
            try { window.localStorage.setItem('asm_trends', JSON.stringify(newTrends)); } catch(e){}
            try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
            
            // Actually broadcast the change to DB so other TVs get it
            saveToStorage("trends", newTrends);
            saveToStorage("rates", rounded);
            
            return rounded;
          }
          return prev;
        });`;

if(regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched rate_update");
} else {
  console.log("Could not find setRates in rate_update");
}

