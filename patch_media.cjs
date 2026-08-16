const fs = require('fs');
let code = fs.readFileSync('src/components/MediaManager.tsx', 'utf-8');

code = code.replace(
  /<div className="flex flex-col gap-1">\s*<label className="text-\[10px\] font-mono uppercase tracking-widest text-zinc-400">Broadcast Start Date<\/label>\s*<input \s*type="date" \s*value={newStart}\s*onChange={\(e\) => setNewStart\(e\.target\.value\)}\s*className="bg-\[#0B0B0D\] border border-zinc-800 text-xs p-2 rounded focus:outline-none"\s*\/>\s*<\/div>\s*<div className="flex flex-col gap-1">\s*<label className="text-\[10px\] font-mono uppercase tracking-widest text-zinc-400">Expirational End Date<\/label>\s*<input \s*type="date" \s*value={newEnd}\s*onChange={\(e\) => setNewEnd\(e\.target\.value\)}\s*className="bg-\[#0B0B0D\] border border-zinc-800 text-xs p-2 rounded focus:outline-none"\s*\/>\s*<\/div>/,
  `<div className="md:col-span-2 flex flex-col gap-3 bg-black/20 p-3 rounded-lg border border-zinc-800/50 mt-1">
              <label className="flex items-center gap-3 cursor-pointer w-fit group">
                <input 
                  type="checkbox" 
                  checked={enableDates}
                  onChange={(e) => setEnableDates(e.target.checked)}
                  className="w-4 h-4 rounded appearance-none border border-zinc-600 checked:bg-[#D4AF37] checked:border-[#D4AF37] flex-shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45"
                />
                <span className="text-xs font-serif font-bold text-[#D4AF37] tracking-wider group-hover:text-[#F4D03F] transition-colors mt-0.5">
                  Enable Broadcast Dates
                </span>
              </label>

              {enableDates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Broadcast Start Date</label>
                    <input 
                      type="date" 
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="bg-[#0B0B0D] border border-zinc-800 text-xs p-2 rounded focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Expirational End Date</label>
                    <input 
                      type="date" 
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="bg-[#0B0B0D] border border-zinc-800 text-xs p-2 rounded focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>`
);
fs.writeFileSync('src/components/MediaManager.tsx', code);
console.log("Patched media manager");
