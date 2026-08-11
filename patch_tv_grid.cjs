const fs = require('fs');

let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// 1. Inject the <style> block before the root TVDisplay render return
const styleBlock = `
      {/* CSS Styles injection for professional dynamic visual polish */}
      <style>{\`
        .responsive-rates-grid {
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-rows: 1fr;
        }
        @media (min-width: 768px) {
          .responsive-rates-grid:not(.force-portrait) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-auto-flow: column;
            grid-template-rows: repeat(var(--max-items), minmax(0, 1fr));
          }
        }
        .force-portrait {
          grid-template-columns: 1fr !important;
          grid-auto-rows: 1fr !important;
          grid-auto-flow: row !important;
        }
`;

// It replaces the existing `<style>{\`` injection:
code = code.replace('      {/* CSS Styles injection for professional dynamic visual polish */}\n      <style>{`', styleBlock);

// 2. Replace the main grid wrapper
const oldMainWrapper = `          {/* MAIN RATE CARDS GRID (SPLIT BY METAL GROUPS INTO SIDE-BY-SIDE VERTICAL COLUMNS) */}
          <div
            className={\`flex-1 grid gap-2 md:gap-4 my-1 \${isPortrait ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}\`}
          >`;

const newMainWrapper = `          {/* MAIN RATE CARDS GRID (FLAT RESPONSIVE AUTO-GRID) */}
          <div
            id="tv-main-rates-grid"
            className={\`flex-1 w-full h-full responsive-rates-grid gap-1 md:gap-2 my-1 \${isPortrait ? "force-portrait" : ""}\`}
            style={{ "--max-items": Math.max(goldRateItems.length, silverRateItems.length) } as any}
          >`;
code = code.replace(oldMainWrapper, newMainWrapper);

// 3. Remove Gold Column wrappers
const oldGoldWrappers = `            {/* GOLD RATES COLUMN */}
            {goldRateItems.length > 0 && (
              <div className="flex flex-col gap-1 w-full h-full min-h-0 shrink">
                <div
                  id="tv-gold-rate-grid"
                  className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-0 shrink"
                  style={{
                    gridTemplateRows: \`repeat(\${Math.max(goldRateItems.length, silverRateItems.length)}, minmax(0, 1fr))\`,
                  }}
                >`;

const newGoldWrappers = `            {/* GOLD RATES ITEMS */}`;
code = code.replace(oldGoldWrappers, newGoldWrappers);

// 4. Remove Gold Column wrapper endings and start Silver wrappers
const oldMiddleWrappers = `                  })}
                </div>
              </div>
            )}

            {/* SILVER & OTHER METALS COLUMN */}
            {silverRateItems.length > 0 && (
              <div className="flex flex-col gap-1 w-full h-full min-h-0 shrink">
                <div
                  id="tv-silver-rate-grid"
                  className="flex-1 w-full h-full grid gap-1 md:gap-2 min-h-0 shrink"
                  style={{
                    gridTemplateRows: \`repeat(\${Math.max(goldRateItems.length, silverRateItems.length)}, minmax(0, 1fr))\`,
                  }}
                >`;

const newMiddleWrappers = `                  })}
            {/* SILVER RATES ITEMS */}`;
code = code.replace(oldMiddleWrappers, newMiddleWrappers);

// 5. Remove Silver Column wrapper endings
const oldSilverEnd = `                  })}
                </div>
              </div>
            )}`;

const newSilverEnd = `                  })}`;
code = code.replace(oldSilverEnd, newSilverEnd);


fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Grid replaced successfully.");
