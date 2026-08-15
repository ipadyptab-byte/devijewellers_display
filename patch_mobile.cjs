const fs = require('fs');
let code = fs.readFileSync('src/components/MobileControl.tsx', 'utf-8');

code = code.replace(
  /next\.gold24kPurchase = Math\.round\(num - 200\);/g,
  "next.gold24kExchange = Math.round(num - 50);\n         next.gold24kPurchase = Math.round(num - 200);"
);

const purchaseInput = `                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Purchase (10g)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">₹</span>
                    <input 
                      type="number" 
                      value={editRates.gold24kPurchase || ''} 
                      onChange={(e) => handleRateInputChange('gold24kPurchase', e.target.value)}
                      className="w-full bg-[#0B0B0D] border border-zinc-800 focus:border-[#D4AF37] rounded p-1.5 pl-5 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>`;

const exchangeInput = `                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Exchange (10g)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">₹</span>
                    <input 
                      type="number" 
                      value={editRates.gold24kExchange || ''} 
                      onChange={(e) => handleRateInputChange('gold24kExchange', e.target.value)}
                      className="w-full bg-[#0B0B0D] border border-zinc-800 focus:border-[#D4AF37] rounded p-1.5 pl-5 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>`;

code = code.replace(purchaseInput, exchangeInput + '\n' + purchaseInput);

fs.writeFileSync('src/components/MobileControl.tsx', code);
console.log("Patched MobileControl.tsx");
