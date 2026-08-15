const fs = require('fs');
let code = fs.readFileSync('src/components/SaleStatus.tsx', 'utf-8');

// Remove from displayItems
code = code.replace(
  /const displayItems: { label: string; sub: string; val: string; exchangeVal\?: string }\[\] = \[\];/g,
  "const displayItems: { label: string; sub: string; val: string; }[] = [];"
);

code = code.replace(
  /if \(show24k\) displayItems\.push\({ label: '24K GOLD RATE', sub: '10gm', val: formatINR\(rates\.gold24k\), exchangeVal: formatINR\(rates\.gold24kExchange \|\| \(rates\.gold24k \? rates\.gold24k - 50 : 0\)\) }\);/g,
  "if (show24k) displayItems.push({ label: '24K GOLD RATE', sub: '10gm', val: formatINR(rates.gold24k) });"
);

code = code.replace(
  /if \(show22k\) displayItems\.push\({ label: '22K GOLD RATE', sub: '10gm', val: formatINR\(rates\.gold22k\), exchangeVal: formatINR\(rates\.gold22kExchange \|\| 0\) }\);/g,
  "if (show22k) displayItems.push({ label: '22K GOLD RATE', sub: '10gm', val: formatINR(rates.gold22k) });"
);

code = code.replace(
  /if \(show18k\) displayItems\.push\({ label: '18K GOLD RATE', sub: '10gm', val: formatINR\(rates\.gold18k\), exchangeVal: formatINR\(rates\.gold18kExchange \|\| 0\) }\);/g,
  "if (show18k) displayItems.push({ label: '18K GOLD RATE', sub: '10gm', val: formatINR(rates.gold18k) });"
);

// Remove EXCHANGE column header in Canvas
code = code.replace(
  /ctx\.fillText\("EXCHANGE \(INR\)", 780, 552\);/g,
  ""
);

// Remove exchange value drawing in Canvas
code = code.replace(
  /\/\/ Exchange Value column\n\s*if \(item\.exchangeVal && item\.exchangeVal !== '₹0'\) \{\n\s*ctx\.fillStyle = '#FFFFFF';\n\s*ctx\.font = "bold 40px 'Playfair Display', serif";\n\s*ctx\.textAlign = 'right';\n\s*ctx\.fillText\(item\.exchangeVal, 780, currentY \+ 30\);\n\s*\}/g,
  ""
);

// Remove exchange from 22k HTML
code = code.replace(
  /<div className="flex flex-col">\n\s*<span className="text-\[10px\] text-zinc-500 font-mono uppercase">Exchange<\/span>\n\s*<span className={`text-\[24px\] font-bold \$\{previewStyles\.priceText\}`}>\n\s*\{formatINR\(rates\.gold22kExchange \|\| 0\)\}\n\s*<\/span>\n\s*<\/div>/g,
  ""
);

// Remove exchange from 18k HTML
code = code.replace(
  /<div className="flex flex-col">\n\s*<span className="text-\[10px\] text-zinc-500 font-mono uppercase">Exchange<\/span>\n\s*<span className={`text-\[24px\] font-bold \$\{previewStyles\.priceText\}`}>\n\s*\{formatINR\(rates\.gold18kExchange \|\| 0\)\}\n\s*<\/span>\n\s*<\/div>/g,
  ""
);

// Remove 'Sale' label from 22k and 18k since they're standalone now
code = code.replace(
  /<span className={`text-\[10px\] \$\{previewStyles\.accent\} font-mono uppercase`}>Sale<\/span>/g,
  ""
);

fs.writeFileSync('src/components/SaleStatus.tsx', code);
console.log("Patched SaleStatus.tsx");
