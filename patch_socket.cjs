const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `    socket.on("state_update", ({ module, data }) => {
      const payload = data.payload !== undefined ? data.payload : data;
      
      // Update local storage so any future page refresh gets this new value immediately synchronously!
      try {
        window.localStorage.setItem(\`asm_\${module}\`, JSON.stringify(payload));
      } catch (e) {}

      switch (module) {`;

code = code.replace(`    socket.on("state_update", ({ module, data }) => {
      const payload = data.payload !== undefined ? data.payload : data;
      switch (module) {`, replacement);


const replacementRates = `    socket.on("rate_update", (socketData) => {
      if (socketData.type === "sync_success" && socketData.data) {
        const received = socketData.data;
        const newRates: JewelleryRates = {
          gold24k: received.gold24kSale,
          gold24kExchange: received.gold24kExchange || (received.gold24kSale - 50),
          gold24kPurchase: received.gold24kPurchase,
          gold22k: received.gold22kSale,
          gold22kExchange: received.gold22kExchange,
          gold22kPurchase: received.gold22kPurchase,
          gold20k: received.gold22kSale - 200, // Legacy fallback
          gold20kPurchase: received.gold22kPurchase - 200,
          gold18k: received.gold18kSale,
          gold18kExchange: received.gold18kExchange,
          gold18kPurchase: received.gold18kPurchase,
          silver: received.silverSale,
          silverPurchase: received.silverPurchase,
          platinum: received.platinumSale,
          platinumPurchase: received.platinumPurchase,
        };
        const rounded = enforceRounding(newRates);
        setRates(rounded);
        try { window.localStorage.setItem('asm_rates', JSON.stringify(rounded)); } catch(e){}
        
        // Also update trends
        const newTrends = {
            gold24k: received.gold24kSale > rates.gold24k ? "up" : received.gold24kSale < rates.gold24k ? "down" : "neutral",
            gold22k: received.gold22kSale > rates.gold22k ? "up" : received.gold22kSale < rates.gold22k ? "down" : "neutral",
            gold20k: "neutral",
            gold18k: received.gold18kSale > rates.gold18k ? "up" : received.gold18kSale < rates.gold18k ? "down" : "neutral",
            silver: received.silverSale > rates.silver ? "up" : received.silverSale < rates.silver ? "down" : "neutral",
            platinum: received.platinumSale > rates.platinum ? "up" : received.platinumSale < rates.platinum ? "down" : "neutral",
        } as RateTrends;
        setTrends(newTrends);
        try { window.localStorage.setItem('asm_trends', JSON.stringify(newTrends)); } catch(e){}
      }
    });`;

// Wait, the existing rate_update doesn't update localStorage or trends in socket listener. Let's see how it looks.
