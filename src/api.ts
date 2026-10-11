import express from "express";
import {
  syncRates,
  latestRatesInMemory,
  lastSyncAttemptAt,
} from "./syncService.js";
import { sql, desc } from "drizzle-orm";
import { db } from "./db/index.js";
import {
  rates,
  syncLogs,
  calculationSettings,
  globalState,
} from "./db/schema.js";

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: "50mb" }));
apiRouter.use(express.urlencoded({ limit: "50mb", extended: true }));

// Prevent caching for all API routes
apiRouter.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

apiRouter.get("/rates/current", async (req, res) => {
  try {
    const settingsLog = await db
      .select()
      .from(calculationSettings)
      .limit(1)
      .catch(() => [
        { syncIntervalMinutes: 5, enableAutoSync: true, storeRatesInDb: true },
      ]);
    const currentSettings = settingsLog[0];
    const isStoreEnabled =
      !currentSettings || currentSettings.storeRatesInDb !== false;

    // If database rates storage is disabled and we have rates in memory, return memory rates
    if (!isStoreEnabled && latestRatesInMemory) {
      // Lazy sync check (only if auto-sync is enabled)
      const lastUpdate = latestRatesInMemory.updatedAt?.getTime() || Date.now();
      const minutes = currentSettings?.syncIntervalMinutes || 5;
      const isAutoSyncEnabled =
        !currentSettings || currentSettings.enableAutoSync !== false;
      const lastAttempt = Math.max(lastUpdate, lastSyncAttemptAt);

      if (isAutoSyncEnabled && Date.now() - lastAttempt > minutes * 60000) {
        await syncRates().catch((e) =>
          console.error("Lazy in-memory sync failed in background:", e),
        );
      }
      return res.json(latestRatesInMemory);
    }

    let current = await db
      .select()
      .from(rates)
      .orderBy(desc(rates.id))
      .limit(1)
      .catch(async (e) => {
        console.warn("Retrying rate select due to error:", e);
        return await db.select().from(rates).orderBy(desc(rates.id)).limit(1); // retry once
      });

    // Lazy sync check (only if enabled)
    if (current[0]) {
      const lastUpdate = current[0].updatedAt?.getTime() || Date.now();
      const minutes = currentSettings?.syncIntervalMinutes || 5;
      const isAutoSyncEnabled =
        !currentSettings || currentSettings.enableAutoSync !== false;
      const lastAttempt = Math.max(lastUpdate, lastSyncAttemptAt);

      if (isAutoSyncEnabled && Date.now() - lastAttempt > minutes * 60000) {
        // Await sync so Vercel serverless function doesn't terminate early.
        await syncRates().catch((e) =>
          console.error("Lazy sync failed in background:", e),
        );
        // Refetch to serve the absolute latest data:
        current = await db
          .select()
          .from(rates)
          .orderBy(desc(rates.id))
          .limit(1)
          .catch(() => current);
      }
    } else if (!isStoreEnabled && !latestRatesInMemory) {
      // If we don't have db record and storage is disabled, trigger initial sync
      try {
        await syncRates();
        if (latestRatesInMemory) {
          return res.json(latestRatesInMemory);
        }
      } catch (e) {
        console.error("Initial trigger sync failed:", e);
      }
    }

    res.json(current[0] || null);
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    const rootCause = error.cause ? String(error.cause) : error.stack;
    const isDbUnconfigured =
      (rootCause && rootCause.includes("ECONNREFUSED 127.0.0.1")) ||
      (error.message && error.message.includes("ECONNREFUSED 127.0.0.1"));
    const msg = isDbUnconfigured
      ? "Database requires configuration. Please add POSTGRES_URL or DATABASE_URL environment variables to your deployment."
      : error.message || "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});


apiRouter.post("/rates/manual_push", async (req, res) => {
  try {
    const received = req.body;
    
    // Map frontend JewelleryRates to DB schema
    const roundTo10 = (val) => Math.round(val / 10) * 10;
    const newDbRow = {
      gold24kSale: roundTo10(received.gold24k),
      gold24kExchange: roundTo10(received.gold24kExchange || (received.gold24k - 50)),
      gold24kPurchase: roundTo10(received.gold24kPurchase || (received.gold24k - 200)),
      gold22kSale: roundTo10(received.gold22k),
      gold22kExchange: roundTo10(received.gold22kExchange || (received.gold22k - 50)),
      gold22kPurchase: roundTo10(received.gold22kPurchase || (received.gold22k - 200)),
      gold18kSale: roundTo10(received.gold18k),
      gold18kExchange: roundTo10(received.gold18kExchange || (received.gold18k - 50)),
      gold18kPurchase: roundTo10(received.gold18kPurchase || (received.gold18k - 200)),
      silverSale: roundTo10(received.silver),
      silverPurchase: roundTo10(received.silverPurchase || (received.silver - 2000)),
      platinumSale: roundTo10(received.platinum),
      platinumPurchase: roundTo10(received.platinumPurchase || (received.platinum - 4000)),
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

apiRouter.post("/rates/sync", async (req, res) => {
  // Manual sync trigger
  try {
    await syncRates();
    res.json({ success: true });
  } catch (error: any) {
    const rootCause = error.cause ? String(error.cause) : error.stack;
    const isDbUnconfigured =
      rootCause.includes("ECONNREFUSED 127.0.0.1") ||
      error.message.includes("ECONNREFUSED 127.0.0.1");
    const msg = isDbUnconfigured
      ? "Database requires configuration. Please add POSTGRES_URL or DATABASE_URL environment variables to your deployment."
      : error.message + " | CAUSE: " + rootCause;
    res.status(500).json({ error: msg });
  }
});

// Allow GET for easy Synology NAS / External Cron integrations
apiRouter.get("/init-db", async (req, res) => {
  try {
    // Database schema is managed via Drizzle migrations internally in AI Studio.
    // However, for external deployments (like Vercel), we allow creating tables here.

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rates (
        id SERIAL PRIMARY KEY,
        gold_24k_sale INTEGER NOT NULL,
        gold_24k_purchase INTEGER NOT NULL,
        gold_22k_sale INTEGER NOT NULL,
        gold_22k_purchase INTEGER NOT NULL,
        gold_18k_sale INTEGER NOT NULL,
        gold_18k_purchase INTEGER NOT NULL,
        silver_sale INTEGER NOT NULL,
        silver_purchase INTEGER NOT NULL,
        platinum_sale INTEGER NOT NULL,
        platinum_purchase INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rate_history_logs (
        id SERIAL PRIMARY KEY,
        source_api_response JSONB,
        gold_24k_sale INTEGER NOT NULL,
        gold_24k_purchase INTEGER NOT NULL,
        gold_22k_sale INTEGER NOT NULL,
        gold_22k_purchase INTEGER NOT NULL,
        gold_18k_sale INTEGER NOT NULL,
        gold_18k_purchase INTEGER NOT NULL,
        silver_sale INTEGER NOT NULL,
        silver_purchase INTEGER NOT NULL,
        platinum_sale INTEGER NOT NULL,
        platinum_purchase INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        status TEXT NOT NULL,
        api_response JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS calculation_settings (
        id SERIAL PRIMARY KEY,
        sync_interval_minutes INTEGER NOT NULL DEFAULT 1,
        silver_purchase_offset INTEGER NOT NULL DEFAULT 5000,
        platinum_purchase_offset INTEGER NOT NULL DEFAULT 4000,
        enable_auto_sync BOOLEAN NOT NULL DEFAULT true,
        store_rates_in_db BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Auto-migrate newly added columns for existing users
    await db
      .execute(
        sql`
      ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS enable_auto_sync BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS page_reload_interval_minutes INTEGER NOT NULL DEFAULT 60;
    `,
      )
      .catch(() => {});
    await db
      .execute(
        sql`
      ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS store_rates_in_db BOOLEAN NOT NULL DEFAULT true;
    `,
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_exc_mult DOUBLE PRECISION NOT NULL DEFAULT 0.990;`
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.985;`
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.920;`,
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.900;`,
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.860;`,
      )
      .catch(() => {});
    await db
      .execute(
        sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.800;`,
      )
      .catch(() => {});

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS global_state (
        id SERIAL PRIMARY KEY,
        module_name TEXT NOT NULL UNIQUE,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    res.json({
      success: true,
      message:
        "Database initialized successfully! All required tables are structured.",
    });
  } catch (error: any) {
    if (error.message?.includes("permission denied")) {
      return res.json({
        success: true,
        message:
          "On AI Studio, database is already managed by drizzle. Initialization skipped.",
      });
    }
    const rootCause = error.cause ? String(error.cause) : error.stack;
    res.status(500).json({ error: error.message + " | CAUSE: " + rootCause });
  }
});

apiRouter.get("/rates/sync", async (req, res) => {
  try {
    await syncRates();
    res.json({ success: true });
  } catch (error: any) {
    const rootCause = error.cause ? String(error.cause) : error.stack;
    const isDbUnconfigured =
      rootCause.includes("ECONNREFUSED 127.0.0.1") ||
      error.message.includes("ECONNREFUSED 127.0.0.1");
    const msg = isDbUnconfigured
      ? "Database requires configuration. Please add POSTGRES_URL or DATABASE_URL environment variables to your deployment."
      : error.message + " | CAUSE: " + rootCause;
    res.status(500).json({ error: msg });
  }
});

apiRouter.get("/settings", async (req, res) => {
  try {
    let current = await db
      .select()
      .from(calculationSettings)
      .limit(1)
      .catch(async (e) => {
        console.warn("Retrying settings (auto-migrating)...");
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS enable_auto_sync BOOLEAN NOT NULL DEFAULT true;`
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS page_reload_interval_minutes INTEGER NOT NULL DEFAULT 60;`
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS store_rates_in_db BOOLEAN NOT NULL DEFAULT true;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_exc_mult DOUBLE PRECISION NOT NULL DEFAULT 0.990;`
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.985;`
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.920;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.900;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.860;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.800;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS use_manual_rates BOOLEAN NOT NULL DEFAULT false;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_gold24k INTEGER NOT NULL DEFAULT 150000;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_silver INTEGER NOT NULL DEFAULT 250000;`,
          )
          .catch(console.error);
        await db
          .execute(
            sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_platinum INTEGER NOT NULL DEFAULT 0;`,
          )
          .catch(console.error);
        return await db.select().from(calculationSettings).limit(1);
      });
    console.log(
      "Settings keys:",
      current[0] ? Object.keys(current[0]) : "No settings row",
    );
    res.json(
      current[0] || {
        syncIntervalMinutes: 5,
        silverPurchaseOffset: 5000,
        platinumPurchaseOffset: 4000,
        enableAutoSync: true,
      },
    );
  } catch (err: any) {
    const rootCause = err.cause ? String(err.cause) : err.stack;
    res.status(500).json({ error: err.message + " | CAUSE: " + rootCause });
  }
});

apiRouter.post("/settings", async (req, res) => {
  try {
    if (req.body) {
      await db
        .insert(calculationSettings)
        .values({ id: 1, ...req.body })
        .onConflictDoUpdate({
          target: calculationSettings.id,
          set: { ...req.body, updatedAt: new Date() },
        })
        .catch(async (e) => {
          console.warn(
            "Attempting auto-migration on settings post due to error:",
            e,
          );
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS enable_auto_sync BOOLEAN NOT NULL DEFAULT true;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS store_rates_in_db BOOLEAN NOT NULL DEFAULT true;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_exc_mult DOUBLE PRECISION NOT NULL DEFAULT 0.990;`
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold24k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.985;`
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.920;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold22k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.900;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_sale_mult DOUBLE PRECISION NOT NULL DEFAULT 0.860;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS gold18k_pur_mult DOUBLE PRECISION NOT NULL DEFAULT 0.800;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS use_manual_rates BOOLEAN NOT NULL DEFAULT false;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_gold24k INTEGER NOT NULL DEFAULT 150000;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_silver INTEGER NOT NULL DEFAULT 250000;`,
            )
            .catch(() => {});
          await db
            .execute(
              sql`ALTER TABLE calculation_settings ADD COLUMN IF NOT EXISTS manual_platinum INTEGER NOT NULL DEFAULT 0;`,
            )
            .catch(() => {});

          await db
            .insert(calculationSettings)
            .values({ id: 1, ...req.body })
            .onConflictDoUpdate({
              target: calculationSettings.id,
              set: { ...req.body, updatedAt: new Date() },
            });
        });
    }
    res.json({ success: true });
  } catch (err: any) {
    const rootCause = err.cause ? String(err.cause) : err.stack;
    res.status(500).json({ error: err.message + " | CAUSE: " + rootCause });
  }
});

apiRouter.get("/logs", async (req, res) => {
  try {
    const recentLogs = await db
      .select()
      .from(syncLogs)
      .orderBy(syncLogs.createdAt)
      .limit(20)
      .catch(async (e) => {
        console.warn("Retrying logs...");
        return await db
          .select()
          .from(syncLogs)
          .orderBy(syncLogs.createdAt)
          .limit(20);
      });
    res.json(recentLogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// New Unified API endpoints for Android App (Media, Promos, Configs, Branches, etc.)
apiRouter.get("/state/:module", async (req, res) => {
  try {
    const { module } = req.params;
    let current = await db
      .select()
      .from(globalState)
      .where(sql`${globalState.moduleName} = ${module}`)
      .limit(1);

    if (!current || current.length === 0) {
      return res.json({
        success: true,
        data: null,
        message:
          "Settings not yet configured in DB. Rely on internal defaults.",
      });
    }
    res.json({ success: true, data: current[0].data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/state/:module", async (req, res) => {
  try {
    const { module } = req.params;
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "Body must be a JSON object or array" });
    }

    const existing = await db.select().from(globalState).where(sql`module_name = ${module}`).limit(1);
    if (existing.length > 0) {
      await db.update(globalState).set({ data: req.body as any, updatedAt: new Date() }).where(sql`module_name = ${module}`);
    } else {
      await db.insert(globalState).values({ moduleName: module, data: req.body as any });
    }

    // Broadcast to other clients that a state changed
    const io = req.app.get("io");
    if (io) {
      io.emit("state_update", { module, data: req.body });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/settings/display", async (req, res) => {
  try {
    let current = await db
      .select()
      .from(globalState)
      .where(sql`${globalState.moduleName} = 'displaySetting'`)
      .limit(1);

    if (current && current[0]?.data) {
      const data: any = current[0].data;
      return res.json({
        background_color: data.customPrimaryBg || "#FFF8E1",
        text_color: "#212529",
        ...data,
      });
    }

    res.json({
      background_color: "#FFF8E1",
      text_color: "#212529",
    });
  } catch (err: any) {
    res.json({
      background_color: "#FFF8E1",
      text_color: "#212529",
    });
  }
});

apiRouter.post("/gemini/generate-status-bg", async (req, res) => {
  try {
    const { promptType, customPrompt, seed } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCDMY0W0PPeuldVOjyES81uwpu2S0o4uK8";

    // Rich pools of curated high-resolution 100% authentic gold jewellery backgrounds
    // Exclusively focused on Devi Jewellers fine gold jewellery, bridal ornaments, necklaces, and bangles
    const categoryLibraries: Record<string, string[]> = {
      devi_bridal: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85", // traditional Indian royal bride in heavy gold jewellery
        "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=1200&q=85", // bride wearing royal gold necklaces and ornaments
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85", // festive gold jewellery bridal portrait
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85", // festive bride warm golden jewellery glow
        "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=85", // bride with intricate gold bangles and rings
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85", // royal bridal jewellery portrait
      ],
      devi_antique_choker: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85", // 22k gold choker & temple necklace
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85", // intricate antique gold jewellery choker
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85", // royal necklace and gold nath setting
        "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=1200&q=85", // pure 22k gold necklace on dark velvet
      ],
      devi_temple_gold: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85", // traditional temple gold choker
        "https://images.unsplash.com/photo-1576014131341-fe1486fb2475?auto=format&fit=crop&w=1200&q=85", // traditional Indian 22k gold jewellery piece
        "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=85", // luxury gold jewellery showcase
        "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=1200&q=85", // traditional gold jewellery set
      ],
      devi_bangles_rings: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85", // pure gold bangles and kadas
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85", // pure gold ring & jewellery display
        "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1200&q=85", // handcrafted pure gold rings & ornaments
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85", // exquisite handcrafted gold earrings
      ],
      devi_gold_ornaments: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85", // 22k gold choker & temple necklace
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85", // intricate antique gold jewellery
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85", // gold nath and necklace
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85", // gold bangles
        "https://images.unsplash.com/photo-1576014131341-fe1486fb2475?auto=format&fit=crop&w=1200&q=85", // traditional Indian gold jewellery
        "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=85", // luxury jewellery showcase
      ],
      custom: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1576014131341-fe1486fb2475?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
      ],
    };

    // Alias legacy keys for backward compatibility
    categoryLibraries.plain_gold = categoryLibraries.devi_gold_ornaments;
    categoryLibraries.marathi_lady = categoryLibraries.devi_bridal;
    categoryLibraries.royal_gold = categoryLibraries.devi_antique_choker;
    categoryLibraries.nath_jewellery = categoryLibraries.devi_bridal;

    let promptText = "";
    if (promptType === "devi_bridal" || promptType === "marathi_lady") {
      promptText =
        "Devi Jewellers exclusive royal bridal gold jewellery collection, authentic Maharashtrian bride wearing pure 22k gold nath nose ring, traditional thushi choker necklace, kolhapuri saaj, gold jhumkas, and temple gold bangles, rich green paithani silk saree, luxurious Devi Jewellers hallmark gold collection, high resolution 8k photography";
    } else if (promptType === "devi_antique_choker" || promptType === "royal_gold") {
      promptText =
        "Devi Jewellers grand royal 22k antique gold choker necklace, heavy handcrafted temple gold jewellery, pure hallmarked gold necklace studded with uncut polki and rubies on deep royal red velvet, exquisite goldsmith craftsmanship, Devi Jewellers fine gold showroom display, 8k cinematic lighting";
    } else if (promptType === "devi_temple_gold") {
      promptText =
        "Devi Jewellers handcrafted traditional temple gold necklace, antique lakshmi haram, 22 karat pure gold ornaments, hallmarked gold jewellery pieces displayed on royal dark velvet, glittering warm golden highlights, Devi Jewellers showroom collection, 8k photography";
    } else if (promptType === "devi_bangles_rings") {
      promptText =
        "Devi Jewellers traditional 22k gold bangles, kadas, and handcrafted gold rings, pure hallmarked gold bridal jewellery set, sparkling fine gold details, luxury jewellery display stand, Devi Jewellers hallmark gold collection";
    } else if (promptType === "plain_gold" || promptType === "devi_gold_ornaments") {
      promptText =
        "Devi Jewellers exclusive pure 22k hallmark gold jewellery showroom showcase, glittering gold necklace, antique gold jhumkas, mangalsutra, bridal ornaments on dark velvet, warm cinematic luxury jewellery lighting, 8k photographic quality";
    } else {
      promptText =
        `Devi Jewellers exclusive 22k hallmark gold jewellery collection: ${customPrompt || "handcrafted royal gold necklace and bridal ornaments"}, pure hallmarked gold jewellery, authentic Devi Jewellers showroom styling, exquisite craftsmanship, 8k jewellery photography`;
    }

    let geminiQuotaNotice: string | null = null;

    // 1) Try Gemini image generation model with user API key
    if (apiKey) {
      const candidateModels = [
        "gemini-3.1-flash-lite-image",
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3-pro-image",
      ];
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
        const chosenRatio = validAspectRatios.includes(req.body?.aspectRatio) ? req.body.aspectRatio : "9:16";

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [{ text: promptText }],
              },
              config: {
                imageConfig: {
                  aspectRatio: chosenRatio,
                },
              },
            });

            if (response.candidates?.[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                  const mime = part.inlineData.mimeType || "image/png";
                  return res.json({
                    imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                    notice: `✨ Direct Gemini AI Image (${modelName}) synthesized for your prompt!`,
                    isDirectAi: true,
                  });
                }
              }
            }
          } catch (modelErr: any) {
            // continue trying other models
          }
        }
      } catch (geminiErr: any) {
        const msg = geminiErr?.message || "";
        if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
          geminiQuotaNotice = "Gemini API key active! (Note: Google requires a billing account on your project for Gemini image generation).";
        }
      }
    }

    // 2) Try Flux AI model for direct prompt-to-image synthesis
    try {
      const cleanPrompt = promptText.replace(/[^a-zA-Z0-9 ,.-]/g, " ").trim();
      const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?model=flux&width=540&height=960&nologo=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const fluxRes = await fetch(fluxUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      clearTimeout(timeoutId);

      if (fluxRes.ok) {
        const contentType = fluxRes.headers.get("content-type") || "";
        if (contentType.includes("image/")) {
          const arrayBuffer = await fluxRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const mime = contentType.split(";")[0] || "image/jpeg";
          return res.json({
            imageUrl: `data:${mime};base64,${base64}`,
            notice: "✨ Newly synthesized AI Image generated for your prompt!",
            isDirectAi: true,
          });
        }
      }
    } catch (fluxErr) {
      // Fall through to rich category pool
    }

    // 3) Intelligent category matching based on prompt words
    let targetCategory = promptType || "devi_bridal";
    const customLower = (customPrompt || "").toLowerCase();

    if (customLower.includes("nath") || customLower.includes("nose ring") || customLower.includes("thushi") || customLower.includes("bride") || customLower.includes("marathi") || customLower.includes("paithani")) {
      targetCategory = "devi_bridal";
    } else if (customLower.includes("choker") || customLower.includes("kundan") || customLower.includes("polki") || customLower.includes("royal necklace") || customLower.includes("antique")) {
      targetCategory = "devi_antique_choker";
    } else if (customLower.includes("temple") || customLower.includes("haram") || customLower.includes("lakshmi") || customLower.includes("traditional")) {
      targetCategory = "devi_temple_gold";
    } else if (customLower.includes("bangle") || customLower.includes("kada") || customLower.includes("ring") || customLower.includes("bracelet") || customLower.includes("earring")) {
      targetCategory = "devi_bangles_rings";
    } else if (customLower.includes("necklace") || customLower.includes("ornament") || customLower.includes("gold") || customLower.includes("devi")) {
      targetCategory = "devi_gold_ornaments";
    }

    const pool = categoryLibraries[targetCategory] || categoryLibraries.devi_bridal;
    // Pick an image dynamically based on random + timestamp so every single click delivers a fresh, non-repeated image
    const chosenIndex = Math.floor(Math.random() * pool.length);
    const chosenUrl = pool[chosenIndex];

    const categoryNames: Record<string, string> = {
      devi_bridal: "Devi Jewellers Royal Bridal Gold Collection",
      devi_antique_choker: "Devi Jewellers Antique 22K Gold Choker",
      devi_temple_gold: "Devi Jewellers Temple Gold Haram",
      devi_bangles_rings: "Devi Jewellers 22K Gold Bangles & Rings",
      devi_gold_ornaments: "Devi Jewellers Hallmarked Gold Showcase",
      custom: "Devi Jewellers Fine Gold Jewellery Collection",
      plain_gold: "Devi Jewellers 22K Gold Ornaments",
      marathi_lady: "Devi Jewellers Bridal Gold Collection",
      royal_gold: "Devi Jewellers Antique Choker Collection",
    };

    return res.json({
      imageUrl: chosenUrl,
      notice: geminiQuotaNotice
        ? `${geminiQuotaNotice} Selected ${categoryNames[targetCategory] || "Devi Jewellers Gold"} style #${chosenIndex + 1}. Click again for next variation, or use "Upload Photo" directly!`
        : `✨ Devi Jewellers Gold Jewellery (${categoryNames[targetCategory] || "Pure 22K Gold"} #${chosenIndex + 1}) loaded! Click again to generate next variation.`,
    });
  } catch (err: any) {
    console.error("AI background error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI background" });
  }
});

