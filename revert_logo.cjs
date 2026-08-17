const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

const targetStr = `        {/* Center Logo */}
        <div className="flex flex-1 justify-center items-center">
          <div className="relative inline-flex flex-col items-center justify-center">
            {/* White box specifically for the bottom tag line of the image */}
            <div className="absolute bottom-0 w-3/4 h-1/4 md:h-1/3 bg-white/95 rounded-sm z-0 blur-[2px]"></div>
            <div className="absolute bottom-0.5 w-[85%] h-1/4 md:h-[28%] bg-white rounded z-0 shadow-sm"></div>
            {companyConfig?.logoImageBase64 ? (
            <img
              src={companyConfig.logoImageBase64}
              alt={companyConfig.logoText || "Brand Logo"}
              className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative z-10"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Devi Jewellers Logo"
              className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex-shrink-0 relative z-10"
              onError={(e) => {
                if (e.currentTarget.src.includes(".png")) {
                  e.currentTarget.src = "/logo.jpg";
                } else if (e.currentTarget.src.includes(".jpg")) {
                  e.currentTarget.src = "/logo.jpeg";
                }
              }}
            />
          )}
          </div>
        </div>`;

const replaceStr = `        {/* Center Logo */}
        <div className="flex flex-1 justify-center items-center">
          {companyConfig?.logoImageBase64 ? (
            <img
              src={companyConfig.logoImageBase64}
              alt={companyConfig.logoText || "Brand Logo"}
              className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-black/40 p-2 rounded"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Devi Jewellers Logo"
              className="h-16 md:h-20 lg:h-24 max-w-[400px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex-shrink-0"
              onError={(e) => {
                if (e.currentTarget.src.includes(".png")) {
                  e.currentTarget.src = "/logo.jpg";
                } else if (e.currentTarget.src.includes(".jpg")) {
                  e.currentTarget.src = "/logo.jpeg";
                }
              }}
            />
          )}
        </div>`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/TVDisplay.tsx', code);
  console.log("Reverted successfully");
} else {
  console.log("Could not find the exact string. Falling back to regex...");
  // Use regex if there are slight whitespace differences
  const regex = /\{\/\*\s*Center Logo\s*\*\/\}\s*<div className="flex flex-1 justify-center items-center">[\s\S]*?<\/div>\s*<\/div>/;
  code = code.replace(regex, replaceStr);
  fs.writeFileSync('src/components/TVDisplay.tsx', code);
  console.log("Reverted with regex");
}

