/**
 * Client API services for rates, settings, and Gemini AI status backgrounds
 */

export interface CurrentRatesResponse {
  gold_24k_sale: number;
  gold_22k_sale: number;
  gold_18k_sale: number;
  silver_per_kg_sale: number;
  gold24kSale?: number;
  gold22kSale?: number;
  gold18kSale?: number;
  silverSale?: number;
  [key: string]: any;
}

export interface DisplaySettingsResponse {
  background_color?: string;
  text_color?: string;
  customPrimaryBg?: string;
  customGoldColor?: string;
  [key: string]: any;
}

export interface GenerateBgRequest {
  promptType: "plain_gold" | "marathi_lady" | "royal_gold" | "custom";
  customPrompt?: string;
  aspectRatio?: "9:16" | "1:1" | "16:9" | "3:4" | "4:3";
}

export interface GenerateBgResponse {
  imageUrl?: string;
  notice?: string;
  error?: string;
}

export const ratesApi = {
  getCurrent: async (): Promise<CurrentRatesResponse> => {
    try {
      const res = await fetch(`/api/rates/current?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (!data) {
        // Fallback to localStorage if server returns empty
        const saved = localStorage.getItem("asm_rates");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            gold_24k_sale: parsed.gold24k || 154300,
            gold_22k_sale: parsed.gold22k || 141950,
            gold_18k_sale: parsed.gold18k || 116120,
            silver_per_kg_sale: parsed.silver || 260000,
          };
        }
      }

      const gold24k = data.gold_24k_sale || data.gold24kSale || data.gold24k || 154300;
      const gold22k = data.gold_22k_sale || data.gold22kSale || data.gold22k || 141950;
      const gold18k = data.gold_18k_sale || data.gold18kSale || data.gold18k || 116120;
      const silver = data.silver_per_kg_sale || data.silver_sale || data.silverSale || data.silver || 260000;

      return {
        ...data,
        gold_24k_sale: gold24k,
        gold_22k_sale: gold22k,
        gold_18k_sale: gold18k,
        silver_per_kg_sale: silver,
        silver_sale: silver,
      };
    } catch (err) {
      console.warn("Falling back to local rates:", err);
      const saved = localStorage.getItem("asm_rates");
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        gold_24k_sale: parsed.gold24k || 154300,
        gold_22k_sale: parsed.gold22k || 141950,
        gold_18k_sale: parsed.gold18k || 116120,
        silver_per_kg_sale: parsed.silver || 260000,
      };
    }
  },
};

export const settingsApi = {
  getDisplay: async (): Promise<DisplaySettingsResponse> => {
    try {
      const res = await fetch(`/api/settings/display`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback to local state
    try {
      const saved = localStorage.getItem("asm_displaySetting");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          background_color: parsed.customPrimaryBg || "#FFF8E1",
          text_color: "#212529",
          ...parsed,
        };
      }
    } catch {}

    return {
      background_color: "#FFF8E1",
      text_color: "#212529",
    };
  },
};

export const geminiApi = {
  generateStatusBg: async (params: GenerateBgRequest): Promise<GenerateBgResponse> => {
    try {
      const res = await fetch("/api/gemini/generate-status-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP Error ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return {
        error: err.message || "Failed to generate AI background",
      };
    }
  },
};
