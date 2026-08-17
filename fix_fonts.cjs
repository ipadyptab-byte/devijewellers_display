const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// Replace standard font sizes
code = code.replace(/fontSize:\s*labelFontSize \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: labelFontSize ? `${labelFontSize}px` : "clamp(12px, 3vw, 80px)"');
code = code.replace(/fontSize:\s*saleTitleFontSize \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: saleTitleFontSize ? `${saleTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(goldFontSize \|\| rateFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (goldFontSize || rateFontSize) ? `${goldFontSize || rateFontSize}px` : "clamp(16px, 5vw, 250px)"');
code = code.replace(/fontSize:\s*purchaseTitleFontSize \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: purchaseTitleFontSize ? `${purchaseTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*purchaseRateFontSize \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: purchaseRateFontSize ? `${purchaseRateFontSize}px` : "clamp(16px, 5vw, 250px)"');

// Replace silver font sizes
code = code.replace(/fontSize:\s*\(silverLabelFontSize \|\| labelFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (silverLabelFontSize || labelFontSize) ? `${silverLabelFontSize || labelFontSize}px` : "clamp(12px, 3vw, 80px)"');
code = code.replace(/fontSize:\s*\(silverSaleTitleFontSize \|\| saleTitleFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (silverSaleTitleFontSize || saleTitleFontSize) ? `${silverSaleTitleFontSize || saleTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(silverFontSize \|\| rateFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (silverFontSize || rateFontSize) ? `${silverFontSize || rateFontSize}px` : "clamp(16px, 5vw, 250px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseTitleFontSize \|\| purchaseTitleFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (silverPurchaseTitleFontSize || purchaseTitleFontSize) ? `${silverPurchaseTitleFontSize || purchaseTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseRateFontSize \|\| purchaseRateFontSize\) \? `clamp\([^`]+` : "clamp\([^"]+"\)/g, 'fontSize: (silverPurchaseRateFontSize || purchaseRateFontSize) ? `${silverPurchaseRateFontSize || purchaseRateFontSize}px` : "clamp(16px, 5vw, 250px)"');

// Also catch any remaining cqw or cqh which we changed to vw/vh blindly, let's just make sure the regex works by using the current state which has vw/vh
code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(/fontSize:\s*labelFontSize \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: labelFontSize ? `${labelFontSize}px` : "clamp(12px, 3vw, 80px)"');
code = code.replace(/fontSize:\s*saleTitleFontSize \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: saleTitleFontSize ? `${saleTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(goldFontSize \|\| rateFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (goldFontSize || rateFontSize) ? `${goldFontSize || rateFontSize}px` : "clamp(16px, 5vw, 250px)"');
code = code.replace(/fontSize:\s*purchaseTitleFontSize \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: purchaseTitleFontSize ? `${purchaseTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*purchaseRateFontSize \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: purchaseRateFontSize ? `${purchaseRateFontSize}px` : "clamp(16px, 5vw, 250px)"');

code = code.replace(/fontSize:\s*\(silverLabelFontSize \|\| labelFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (silverLabelFontSize || labelFontSize) ? `${silverLabelFontSize || labelFontSize}px` : "clamp(12px, 3vw, 80px)"');
code = code.replace(/fontSize:\s*\(silverSaleTitleFontSize \|\| saleTitleFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (silverSaleTitleFontSize || saleTitleFontSize) ? `${silverSaleTitleFontSize || saleTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(silverFontSize \|\| rateFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (silverFontSize || rateFontSize) ? `${silverFontSize || rateFontSize}px` : "clamp(16px, 5vw, 250px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseTitleFontSize \|\| purchaseTitleFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (silverPurchaseTitleFontSize || purchaseTitleFontSize) ? `${silverPurchaseTitleFontSize || purchaseTitleFontSize}px` : "clamp(8px, 2.5vw, 90px)"');
code = code.replace(/fontSize:\s*\(silverPurchaseRateFontSize \|\| purchaseRateFontSize\) \? `clamp[^`]+` : "clamp[^"]+"/g, 'fontSize: (silverPurchaseRateFontSize || purchaseRateFontSize) ? `${silverPurchaseRateFontSize || purchaseRateFontSize}px` : "clamp(16px, 5vw, 250px)"');

fs.writeFileSync('src/components/TVDisplay.tsx', code);
