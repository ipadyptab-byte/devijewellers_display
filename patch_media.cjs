const fs = require('fs');
let code = fs.readFileSync('src/components/MediaManager.tsx', 'utf8');

const target = `                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{item.startDate && item.endDate ? \`\${new Date(item.startDate).toLocaleDateString()} - \${new Date(item.endDate).toLocaleDateString()}\` : 'No Expiry Date'}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-2 bg-black/40 px-2.5 py-1.5 rounded border border-zinc-800/50">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="font-semibold text-zinc-500">Loop Delay:</span>
                  <input 
                    type="number"
                    min="2"
                    max="300"
                    value={item.displayDuration || 8}`;

const replace = `                <div className="flex flex-col gap-2 mt-2 bg-black/40 p-2 rounded border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="font-semibold text-zinc-500">Expires:</span>
                    <input 
                      type="date"
                      value={item.endDate || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = media.map(m => m.id === item.id ? { ...m, endDate: val, startDate: m.startDate || new Date().toISOString().split('T')[0] } : m);
                        onUpdateMedia(updated);
                        
                        // We also trigger a quiet log for this change if desired, but updating silently is fine too.
                      }}
                      className="flex-1 min-w-0 bg-[#15161A] border border-zinc-800 font-mono rounded text-[#D4AF37] px-1.5 py-1 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="font-semibold text-zinc-500">Delay:</span>
                    <input 
                      type="number"
                      min="2"
                      max="300"
                      value={item.displayDuration || 8}`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/MediaManager.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Target not found. Looking at snippet...");
  console.log(code.substring(code.indexOf("<div className=\"p-4 flex flex-col gap-3\">"), code.indexOf("<div className=\"p-4 flex flex-col gap-3\">") + 1000));
}
