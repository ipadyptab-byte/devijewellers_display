const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const roundFunc = `
const enforceRounding = (r: any): any => {
  if (!r) return r;
  const rnd = (val: any) => typeof val === 'number' ? Math.round(val / 10) * 10 : val;
  return {
    ...r,
    gold24k: rnd(r.gold24k),
    gold24kExchange: rnd(r.gold24kExchange || (r.gold24k ? r.gold24k - 50 : 0)),
    gold24kPurchase: rnd(r.gold24kPurchase),
    gold22k: rnd(r.gold22k),
    gold22kExchange: rnd(r.gold22kExchange),
    gold22kPurchase: rnd(r.gold22kPurchase),
    gold20k: rnd(r.gold20k),
    gold20kPurchase: rnd(r.gold20kPurchase),
    gold18k: rnd(r.gold18k),
    gold18kExchange: rnd(r.gold18kExchange),
    gold18kPurchase: rnd(r.gold18kPurchase),
    silver: rnd(r.silver),
    silverPurchase: rnd(r.silverPurchase),
    platinum: rnd(r.platinum),
    platinumPurchase: rnd(r.platinumPurchase),
  };
};
`;

code = code.replace(/const \[rates, setRates\] = useState<JewelleryRates>\(INITIAL_RATES\);/, roundFunc + '\n  const [rates, setRates] = useState<JewelleryRates>(enforceRounding(INITIAL_RATES));');

// Replace setRates(xxx) with setRates(enforceRounding(xxx))
code = code.replace(/setRates\(parsed\)/g, 'setRates(enforceRounding(parsed))');
code = code.replace(/setRates\(parsedData\)/g, 'setRates(enforceRounding(parsedData))');
code = code.replace(/setRates\(newRates\)/g, 'setRates(enforceRounding(newRates))');
code = code.replace(/setRates\(payload\)/g, 'setRates(key === "rates" ? enforceRounding(payload) : payload)');

// Also fix the callback versions: setRates((prev: JewelleryRates) => ... return newRates;)
code = code.replace(/return newRates;/g, 'return enforceRounding(newRates);');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx rounding");
