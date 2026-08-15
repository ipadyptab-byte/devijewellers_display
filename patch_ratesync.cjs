const fs = require('fs');
let code = fs.readFileSync('src/components/RateSync.tsx', 'utf-8');

// interface
code = code.replace(
  /gold24kPurMult: number;/g,
  "gold24kExcMult: number;\n  gold24kPurMult: number;"
);

// initial state
code = code.replace(
  /gold24kPurMult: 0\.985,/g,
  "gold24kExcMult: 0.990,\n    gold24kPurMult: 0.985,"
);

// fetching
code = code.replace(
  /gold24kPurMult: data\.gold24kPurMult !== undefined \? data\.gold24kPurMult : 0\.985,/g,
  "gold24kExcMult: data.gold24kExcMult !== undefined ? data.gold24kExcMult : 0.990,\n            gold24kPurMult: data.gold24kPurMult !== undefined ? data.gold24kPurMult : 0.985,"
);

// reset defaults
code = code.replace(
  /gold24kPurMult: 0\.985,\n      gold22kSaleMult:/g,
  "gold24kExcMult: 0.990,\n      gold24kPurMult: 0.985,\n      gold22kSaleMult:"
);

// UI inputs
const purInput = `
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">24K Purchase (Mult)</label>
                <div className="relative">
                  <Calculator className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="number" 
                    step="0.001"
                    value={calcSettings.gold24kPurMult}
                    onChange={(e)=>setCalcSettings({...calcSettings, gold24kPurMult: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0B0B0D] border border-zinc-700 focus:border-[#D4AF37] rounded p-2.5 pl-7 font-mono text-white text-sm"
                  />
                </div>
              </div>`;

const excInput = `
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">24K Exchange (Mult)</label>
                <div className="relative">
                  <Calculator className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="number" 
                    step="0.001"
                    value={calcSettings.gold24kExcMult}
                    onChange={(e)=>setCalcSettings({...calcSettings, gold24kExcMult: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0B0B0D] border border-zinc-700 focus:border-[#D4AF37] rounded p-2.5 pl-7 font-mono text-white text-sm"
                  />
                </div>
              </div>`;

code = code.replace(purInput, excInput + purInput);

// Previews
const purPreview = `            <div className="bg-[#0B0B0D] border border-zinc-800 p-3.5 rounded flex justify-between items-center group hover:border-zinc-500 transition-colors">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">24K Purchase</span>
              <span className="font-serif font-bold text-base text-zinc-300">{formatPrice(Math.round(baseGold24k * calcSettings.gold24kPurMult) || 0)}</span>
            </div>`;

const excPreview = `            <div className="bg-[#0B0B0D] border border-zinc-800 p-3.5 rounded flex justify-between items-center group hover:border-zinc-500 transition-colors">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">24K Exchange</span>
              <span className="font-serif font-bold text-base text-zinc-300">{formatPrice(Math.round(baseGold24k * calcSettings.gold24kExcMult) || 0)}</span>
            </div>`;

code = code.replace(purPreview, excPreview + '\n' + purPreview);

// In the history table
code = code.replace(
  /{ label: '24K Gold', value: rates\.gold24k, pur: rates\.gold24kPurchase },/g,
  "{ label: '24K Gold', value: rates.gold24k, exc: rates.gold24kExchange, pur: rates.gold24kPurchase },"
);

fs.writeFileSync('src/components/RateSync.tsx', code);
console.log("Patched RateSync.tsx");
