const fs = require('fs');

let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

// 1. Add @container to the flex-1 columns
code = code.replace(
  /className="flex-1 flex flex-col items-center justify-center px-1"/g,
  'className="flex-1 flex flex-col items-center justify-center px-1 @container"'
);

// 2. Adjust font size logic to include min(cqh, cqw)

// Label (Top title of the box, relies on the outer @container which is the whole box)
// currently: clamp(10px, ${labelFontSize}px, 20cqh) : clamp(12px, 15cqh, 24px)
// Outbox is full width, so 15cqh vs 8cqw. "24K GOLD" is 8 chars.
code = code.replace(
  /fontSize: labelFontSize \? `clamp\(10px, \$\{labelFontSize\}px, 20cqh\)` : "clamp\(12px, 15cqh, 24px\)",/g,
  'fontSize: labelFontSize ? `clamp(10px, ${labelFontSize}px, min(20cqh, 10cqw))` : "clamp(12px, min(15cqh, 8cqw), 24px)",'
);

// Sale Title (Inside the new @container for the column)
code = code.replace(
  /fontSize: saleTitleFontSize \? `clamp\(6px, \$\{saleTitleFontSize\}px, 10cqh\)` : "clamp\(8px, 10cqh, 14px\)",/g,
  'fontSize: saleTitleFontSize ? `clamp(6px, ${saleTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(10cqh, 15cqw), 14px)",'
);

// Rate Font (Inside the new @container for the column)
code = code.replace(
  /fontSize: rateFontSize \? `clamp\(12px, \$\{rateFontSize\}px, 35cqh\)` : "clamp\(14px, 35cqh, 48px\)",/g,
  'fontSize: rateFontSize ? `clamp(12px, ${rateFontSize}px, min(35cqh, 20cqw))` : "clamp(14px, min(35cqh, 18cqw), 48px)",'
);

// Purchase Title
code = code.replace(
  /fontSize: purchaseTitleFontSize \? `clamp\(6px, \$\{purchaseTitleFontSize\}px, 10cqh\)` : "clamp\(8px, 10cqh, 14px\)",/g,
  'fontSize: purchaseTitleFontSize ? `clamp(6px, ${purchaseTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(10cqh, 15cqw), 14px)",'
);

// Purchase Rate
code = code.replace(
  /fontSize: purchaseRateFontSize \? `clamp\(12px, \$\{purchaseRateFontSize\}px, 35cqh\)` : "clamp\(14px, 35cqh, 48px\)",/g,
  'fontSize: purchaseRateFontSize ? `clamp(12px, ${purchaseRateFontSize}px, min(35cqh, 20cqw))` : "clamp(14px, min(35cqh, 18cqw), 48px)",'
);

// Also add a 'whitespace-nowrap' to the rate spans so they don't break lines, forcing them to shrink instead
code = code.replace(
  /className="font-poppins font-black tracking-tight leading-none gold-gradient"/g,
  'className="font-poppins font-black tracking-tight leading-none gold-gradient whitespace-nowrap"'
);
code = code.replace(
  /className=\{`font-poppins font-black tracking-tight leading-none \$\{accentColor\}`\}/g,
  'className={`font-poppins font-black tracking-tight leading-none ${accentColor} whitespace-nowrap`}'
);
code = code.replace(
  /className=\{`font-poppins font-black tracking-tight leading-none \$\{item\.key === "silver" \? "text-\[#ededed\]" : "text-zinc-400"\}`\}/g,
  'className={`font-poppins font-black tracking-tight leading-none whitespace-nowrap ${item.key === "silver" ? "text-[#ededed]" : "text-zinc-400"}`}'
);

// For the silver box specifically, we have similar spans:
code = code.replace(
  /className=\{`font-poppins font-black tracking-tight leading-none \$\{\n                                    item\.key === "silver"\n                                      \? "text-\[#ededed\]"\n                                      : "text-\[#E5E4E2\]"\n                                  \}`\}/g,
  'className={`font-poppins font-black tracking-tight leading-none whitespace-nowrap ${item.key === "silver" ? "text-[#ededed]" : "text-[#E5E4E2]"}`}'
);

// Let's do a catch all for the spans with font-black
code = code.replace(/font-black tracking-tight leading-none/g, 'font-black tracking-tight leading-none whitespace-nowrap');
// deduplicate if it was already replaced
code = code.replace(/whitespace-nowrap whitespace-nowrap/g, 'whitespace-nowrap');

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched font scaling logic in TVDisplay.tsx!");
