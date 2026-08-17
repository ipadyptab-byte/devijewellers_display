const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "const [refreshInterval, setRefreshInterval] = useState<number>(displaySetting.refreshInterval || 15);",
  "const [refreshInterval, setRefreshInterval] = useState<number>(displaySetting.refreshInterval || 15);\n  const [pageReloadIntervalMinutes, setPageReloadIntervalMinutes] = useState<number>(displaySetting.pageReloadIntervalMinutes || 60);"
);

code = code.replace(
  "setRefreshInterval(displaySetting.refreshInterval || 15);",
  "setRefreshInterval(displaySetting.refreshInterval || 15);\n    setPageReloadIntervalMinutes(displaySetting.pageReloadIntervalMinutes || 60);"
);

code = code.replace(
  "refreshInterval,",
  "refreshInterval,\n      pageReloadIntervalMinutes,"
);

const settingBlock = `
              <div className="flex flex-col gap-1.5 p-3.5 bg-[#0B0B0D] rounded border border-zinc-800/70">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-zinc-400">Page Reload Interval (Minutes)</span>
                  <span className="text-[#D4AF37] font-bold">{pageReloadIntervalMinutes} m</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={pageReloadIntervalMinutes === 0 ? '' : pageReloadIntervalMinutes}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                    setPageReloadIntervalMinutes(val);
                  }}
                  className="w-full bg-[#141416] text-white border border-zinc-800/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none rounded px-3 py-1.5 text-sm mt-1.5 font-mono"
                  placeholder="e.g. 60"
                />
                <p className="text-[9.5px] text-zinc-500 mt-2 leading-snug">
                  Forces the TV display to completely refresh the webpage occasionally to ensure maximum stability and pull major new media files. 
                </p>
              </div>
`;

code = code.replace(
  "              {/* Rates Display Duration */}",
  settingBlock + "              {/* Rates Display Duration */}"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
