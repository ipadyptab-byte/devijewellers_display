import fs from 'fs';
let code = fs.readFileSync('src/api.ts', 'utf-8');

const newEndpoint = `
apiRouter.post("/rates/manual_push", async (req, res) => {
  try {
    const received = req.body;
    
    // Map frontend JewelleryRates to DB schema
    const newDbRow = {
      gold24kSale: received.gold24k,
      gold24kPurchase: received.gold24kPurchase || (received.gold24k - 200),
      gold22kSale: received.gold22k,
      gold22kExchange: received.gold22kExchange || (received.gold22k - 50),
      gold22kPurchase: received.gold22kPurchase || (received.gold22k - 200),
      gold18kSale: received.gold18k,
      gold18kExchange: received.gold18kExchange || (received.gold18k - 50),
      gold18kPurchase: received.gold18kPurchase || (received.gold18k - 200),
      silverSale: received.silver,
      silverPurchase: received.silverPurchase || (received.silver - 2000),
      platinumSale: received.platinum,
      platinumPurchase: received.platinumPurchase || (received.platinum - 4000),
    };

    const inserted = await db.insert(rates).values(newDbRow).returning();
    
    // Broadcast via socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("rate_update", {
        type: "sync_success",
        data: inserted[0],
      });
    }

    res.json({ success: true, data: inserted[0] });
  } catch (err: any) {
    console.error("Manual push error:", err);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!code.includes("/rates/manual_push")) {
  code = code.replace('apiRouter.post("/rates/sync", async (req, res) => {', newEndpoint + '\napiRouter.post("/rates/sync", async (req, res) => {');
  fs.writeFileSync('src/api.ts', code);
  console.log("Patched src/api.ts");
} else {
  console.log("Already patched src/api.ts");
}
