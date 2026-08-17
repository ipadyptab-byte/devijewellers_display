const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// The original strings were like:
// fontSize: labelFontSize ? `clamp(4px, ${labelFontSize}px, min(20cqh, 15cqw))` : "clamp(12px, min(17cqh, 6cqw), 80px)",

code = code.replace(/fontSize:\s*labelFontSize \? `\$\{labelFontSize\}px` : "clamp\(12px, 3vw, 80px\)"/g, 'fontSize: labelFontSize ? `clamp(4px, ${labelFontSize}px, min(20cqh, 15cqw))` : "clamp(12px, min(17cqh, 6cqw), 80px)"');
code = code.replace(/fontSize:\s*saleTitleFontSize \? `\$\{saleTitleFontSize\}px` : "clamp\(8px, 2\.5vw, 90px\)"/g, 'fontSize: saleTitleFontSize ? `clamp(4px, ${saleTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(goldFontSize \|\| rateFontSize\) \? `\$\{goldFontSize \|\| rateFontSize\}px` : "clamp\(16px, 5vw, 250px\)"/g, 'fontSize: (goldFontSize || rateFontSize) ? `clamp(6px, ${goldFontSize || rateFontSize}px, min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');
code = code.replace(/fontSize:\s*purchaseTitleFontSize \? `\$\{purchaseTitleFontSize\}px` : "clamp\(8px, 2\.5vw, 90px\)"/g, 'fontSize: purchaseTitleFontSize ? `clamp(4px, ${purchaseTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*purchaseRateFontSize \? `\$\{purchaseRateFontSize\}px` : "clamp\(16px, 5vw, 250px\)"/g, 'fontSize: purchaseRateFontSize ? `clamp(6px, ${purchaseRateFontSize}px, min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');

code = code.replace(/fontSize:\s*\(silverLabelFontSize \|\| labelFontSize\) \? `\$\{silverLabelFontSize \|\| labelFontSize\}px` : "clamp\(12px, 3vw, 80px\)"/g, 'fontSize: (silverLabelFontSize || labelFontSize) ? `clamp(4px, ${silverLabelFontSize || labelFontSize}px, min(20cqh, 15cqw))` : "clamp(12px, min(17cqh, 6cqw), 80px)"');
code = code.replace(/fontSize:\s*\(silverSaleTitleFontSize \|\| saleTitleFontSize\) \? `\$\{silverSaleTitleFontSize \|\| saleTitleFontSize\}px` : "clamp\(8px, 2\.5vw, 90px\)"/g, 'fontSize: (silverSaleTitleFontSize || saleTitleFontSize) ? `clamp(4px, ${silverSaleTitleFontSize || saleTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(silverFontSize \|\| rateFontSize\) \? `\$\{silverFontSize \|\| rateFontSize\}px` : "clamp\(16px, 5vw, 250px\)"/g, 'fontSize: (silverFontSize || rateFontSize) ? `clamp(6px, ${silverFontSize || rateFontSize}px, min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseTitleFontSize \|\| purchaseTitleFontSize\) \? `\$\{silverPurchaseTitleFontSize \|\| purchaseTitleFontSize\}px` : "clamp\(8px, 2\.5vw, 90px\)"/g, 'fontSize: (silverPurchaseTitleFontSize || purchaseTitleFontSize) ? `clamp(4px, ${silverPurchaseTitleFontSize || purchaseTitleFontSize}px, min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseRateFontSize \|\| purchaseRateFontSize\) \? `\$\{silverPurchaseRateFontSize \|\| purchaseRateFontSize\}px` : "clamp\(16px, 5vw, 250px\)"/g, 'fontSize: (silverPurchaseRateFontSize || purchaseRateFontSize) ? `clamp(6px, ${silverPurchaseRateFontSize || purchaseRateFontSize}px, min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');

fs.writeFileSync('src/components/TVDisplay.tsx', code);
