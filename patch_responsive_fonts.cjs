const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// Add @container to root if not there
code = code.replace(/id="tv-display-root"\n\s*className={`(.*?)`}/, (match, p1) => {
    if (!p1.includes('@container')) {
        return `id="tv-display-root"\n      className={\`${p1} @container\`}`;
    }
    return match;
});

code = code.replace(/fontSize:\s*labelFontSize \? `[^`]+` : "[^"]+"/g, 'fontSize: labelFontSize ? `clamp(4px, calc(${labelFontSize} * min(1cqh, 1cqw) / 10.8), min(20cqh, 15cqw))` : "clamp(12px, min(17cqh, 6cqw), 80px)"');
code = code.replace(/fontSize:\s*saleTitleFontSize \? `[^`]+` : "[^"]+"/g, 'fontSize: saleTitleFontSize ? `clamp(4px, calc(${saleTitleFontSize} * min(1cqh, 1cqw) / 10.8), min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(goldFontSize \|\| rateFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (goldFontSize || rateFontSize) ? `clamp(6px, calc(${goldFontSize || rateFontSize} * min(1cqh, 1cqw) / 10.8), min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');
code = code.replace(/fontSize:\s*purchaseTitleFontSize \? `[^`]+` : "[^"]+"/g, 'fontSize: purchaseTitleFontSize ? `clamp(4px, calc(${purchaseTitleFontSize} * min(1cqh, 1cqw) / 10.8), min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*purchaseRateFontSize \? `[^`]+` : "[^"]+"/g, 'fontSize: purchaseRateFontSize ? `clamp(6px, calc(${purchaseRateFontSize} * min(1cqh, 1cqw) / 10.8), min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');

code = code.replace(/fontSize:\s*\(silverLabelFontSize \|\| labelFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (silverLabelFontSize || labelFontSize) ? `clamp(4px, calc(${silverLabelFontSize || labelFontSize} * min(1cqh, 1cqw) / 10.8), min(20cqh, 15cqw))` : "clamp(12px, min(17cqh, 6cqw), 80px)"');
code = code.replace(/fontSize:\s*\(silverSaleTitleFontSize \|\| saleTitleFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (silverSaleTitleFontSize || saleTitleFontSize) ? `clamp(4px, calc(${silverSaleTitleFontSize || saleTitleFontSize} * min(1cqh, 1cqw) / 10.8), min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(silverFontSize \|\| rateFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (silverFontSize || rateFontSize) ? `clamp(6px, calc(${silverFontSize || rateFontSize} * min(1cqh, 1cqw) / 10.8), min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseTitleFontSize \|\| purchaseTitleFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (silverPurchaseTitleFontSize || purchaseTitleFontSize) ? `clamp(4px, calc(${silverPurchaseTitleFontSize || purchaseTitleFontSize} * min(1cqh, 1cqw) / 10.8), min(10cqh, 15cqw))` : "clamp(8px, min(18cqh, 13cqw), 90px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseRateFontSize \|\| purchaseRateFontSize\) \? `[^`]+` : "[^"]+"/g, 'fontSize: (silverPurchaseRateFontSize || purchaseRateFontSize) ? `clamp(6px, calc(${silverPurchaseRateFontSize || purchaseRateFontSize} * min(1cqh, 1cqw) / 10.8), min(35cqh, 20cqw))` : "clamp(16px, min(45cqh, 22cqw), 250px)"');

fs.writeFileSync('src/components/TVDisplay.tsx', code);
