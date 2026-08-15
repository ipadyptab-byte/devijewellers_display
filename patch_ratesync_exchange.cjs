const fs = require('fs');
let code = fs.readFileSync('src/components/RateSync.tsx', 'utf-8');

const targetStr = `              {/* Gold Multipliers */}
              <div>
                <label className="block text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>24K Pur. Multiplier</span>
                </label>`;

const newStr = `              {/* Gold Multipliers */}
              <div>
                <label className="block text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>24K Exc. Multiplier</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">×</span>
                  <input 
                    type="number" 
                    step="0.001"
                    value={calcSettings.gold24kExcMult}
                    onChange={(e)=>setCalcSettings({...calcSettings, gold24kExcMult: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0B0B0D] border border-zinc-700 focus:border-[#D4AF37] rounded p-2.5 pl-7 font-mono text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>24K Pur. Multiplier</span>
                </label>`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/RateSync.tsx', code);
console.log("Patched RateSync.tsx");
