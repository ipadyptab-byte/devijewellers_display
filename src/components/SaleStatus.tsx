import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ratesApi, settingsApi, geminiApi } from "../lib/api";
import { JewelleryRates, SaleStatusItem, Branch, SystemConfig } from "../types";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantStyles = "bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-sm";

    if (variant === "destructive") {
      variantStyles = "bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm";
    } else if (variant === "outline") {
      variantStyles = "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-200";
    } else if (variant === "secondary") {
      variantStyles = "bg-zinc-800 hover:bg-zinc-700 text-zinc-100";
    } else if (variant === "ghost") {
      variantStyles = "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white";
    } else if (variant === "link") {
      variantStyles = "text-amber-400 underline-offset-4 hover:underline bg-transparent";
    }

    let sizeStyles = "h-9 px-4 py-2 text-sm";
    if (size === "sm") {
      sizeStyles = "h-8 px-3 text-xs";
    } else if (size === "lg") {
      sizeStyles = "h-11 px-6 text-base";
    } else if (size === "icon") {
      sizeStyles = "h-9 w-9 p-0 flex items-center justify-center";
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export interface SaleStatusProps {
  rates?: JewelleryRates;
  saleStatuses?: SaleStatusItem[];
  branches?: Branch[];
  systemConfig?: SystemConfig;
  onUpdateSaleStatuses?: (newStatuses: SaleStatusItem[]) => void;
  onTriggerLog?: (action: string, details: string) => void;
}

export default function SaleStatus({
  rates: initialRatesProp,
  onTriggerLog,
}: SaleStatusProps = {}) {
  // Indian time
  const getIndianTime = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  };

  const [currentTime, setCurrentTime] = useState<Date>(getIndianTime());
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isWorking, setIsWorking] = useState<"idle" | "saving" | "sharing">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Optional directory handle if user selects a folder (File System Access API)
  const [dirHandle, setDirHandle] = useState<any>(null);

  // Gemini AI Background states
  const [aiBgUrl, setAiBgUrl] = useState<string | null>(null);
  const [aiPromptType, setAiPromptType] = useState<string>("devi_bridal");
  const [customPromptText, setCustomPromptText] = useState<string>("");
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aspectRatioMode, setAspectRatioMode] = useState<"whatsapp_status" | "full_screen">("whatsapp_status");
  const [showAiControls, setShowAiControls] = useState<boolean>(true);
  const [transparentBoxes, setTransparentBoxes] = useState<boolean>(true);

  const [seedCounter, setSeedCounter] = useState<number>(() => Math.floor(Math.random() * 100));

  const handleGenerateAiBg = async () => {
    try {
      setIsGeneratingAiBg(true);
      setAiError(null);
      setAiNotice(null);
      const nextSeed = seedCounter + 1;
      setSeedCounter(nextSeed);

      const res = await geminiApi.generateStatusBg({
        promptType: aiPromptType,
        customPrompt: customPromptText,
        aspectRatio: aspectRatioMode === "whatsapp_status" ? "9:16" : "1:1",
        seed: nextSeed,
      });

      if (res.imageUrl) {
        setAiBgUrl(res.imageUrl);
        if (res.notice) {
          setAiNotice(res.notice);
        }
        onTriggerLog?.("AI_STATUS_BG", `Generated AI background with theme: ${aiPromptType}`);
      } else {
        setAiError(res.error || "Could not generate AI background.");
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setAiError(err?.message || "Failed to call Gemini AI image API.");
    } finally {
      setIsGeneratingAiBg(false);
    }
  };

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Try modern file picker (lets user choose exact save location and filename)
  const saveWithPicker = async (blob: Blob, suggestedName: string) => {
    try {
      const win = window as any;
      if (win?.showSaveFilePicker) {
        const handle = await win.showSaveFilePicker({
          suggestedName,
          types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Let user choose a folder and remember it (for capable browsers)
  const chooseFolder = async () => {
    try {
      const win = window as any;
      if (win?.showDirectoryPicker) {
        const handle = await win.showDirectoryPicker();
        setDirHandle(handle);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Save directly into a chosen folder (File System Access API)
  const saveToChosenFolder = async (blob: Blob, filename: string) => {
    try {
      if (!dirHandle) return false;
      const hasPerm = (await dirHandle.queryPermission?.({ mode: "readwrite" })) === "granted"
        || (await dirHandle.requestPermission?.({ mode: "readwrite" })) === "granted";
      if (!hasPerm) return false;
      const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch {
      return false;
    }
  };

  const FILENAME = `dj_daily_rate-${format(getIndianTime(), "yyyyMMdd")}.png`;

  // Download from preview overlay (picker/folder if possible, else anchor/dataUrl)
  const handleDownloadFromPreview = async () => {
    try {
      if (!imageBlob && !previewUrl) return;
      const blob = imageBlob || (await (await fetch(previewUrl as string)).blob());
      // Prefer picker, then chosen folder, then anchor/dataUrl via saveBlobToGallery fallbacks
      if (await saveWithPicker(blob, FILENAME)) {
        setPreviewUrl(null);
        return;
      }
      if (await saveToChosenFolder(blob, FILENAME)) {
        setPreviewUrl(null);
        return;
      }
      await saveBlobToGallery(blob, FILENAME, previewUrl || undefined);
      setPreviewUrl(null);
    } catch {
      // ignore; overlay remains
    }
  };

  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getIndianTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [currentRates, setCurrentRates] = useState<any>(() => {
    if (initialRatesProp) {
      return {
        gold_24k_sale: initialRatesProp.gold24k,
        gold_22k_sale: initialRatesProp.gold22k,
        gold_18k_sale: initialRatesProp.gold18k,
        silver_per_kg_sale: initialRatesProp.silver,
      };
    }
    return {
      gold_24k_sale: 74500,
      gold_22k_sale: 68500,
      gold_18k_sale: 56200,
      silver_per_kg_sale: 92000,
    };
  });

  const [settings, setSettings] = useState<{ background_color?: string; text_color?: string }>({
    background_color: "#FFF8E1",
    text_color: "#212529",
  });

  useEffect(() => {
    if (initialRatesProp) {
      setCurrentRates({
        gold_24k_sale: initialRatesProp.gold24k,
        gold_22k_sale: initialRatesProp.gold22k,
        gold_18k_sale: initialRatesProp.gold18k,
        silver_per_kg_sale: initialRatesProp.silver,
      });
    }
  }, [initialRatesProp]);

  useEffect(() => {
    let isMounted = true;
    const fetchRatesAndSettings = async () => {
      try {
        const [ratesRes, settingsRes] = await Promise.allSettled([
          ratesApi.getCurrent(),
          settingsApi.getDisplay(),
        ]);
        if (isMounted) {
          if (ratesRes.status === "fulfilled" && ratesRes.value) {
            setCurrentRates(ratesRes.value);
          }
          if (settingsRes.status === "fulfilled" && settingsRes.value) {
            setSettings(settingsRes.value);
          }
        }
      } catch {
        // graceful fallback to initial rates
      }
    };

    fetchRatesAndSettings();
    const interval = setInterval(fetchRatesAndSettings, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const theme = useMemo(() => {
    return {
      background: settings?.background_color || "#FFF8E1",
      text: settings?.text_color || "#212529",
    };
  }, [settings]);

  // Generate PNG from the on-screen node to preserve computed layout
  const generateImage = async (): Promise<{ blob: Blob; url: string; dataUrl: string } | null> => {
    if (!captureRef.current) return null;

    const node = captureRef.current;

    const { toPng } = await import("html-to-image");

    // Use actual rendered size to avoid blank outputs on some Android browsers
    const rect = node.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(rect.width));
    const height = Math.max(1, Math.ceil(rect.height));

    const options: any = {
      cacheBust: true,
      pixelRatio: 2,
      skipFonts: true,
      fontEmbedCSS: "",
      backgroundColor: aiBgUrl ? "#0f172a" : (theme.background || "#FFF8E1"),
      width,
      height,
      style: {
        transform: "none",
      },
      // Exclude footer (buttons), AI control panel, and preview overlay from the captured image
      filter: (n: HTMLElement) =>
        !n.closest?.("#action-footer") &&
        !n.closest?.("#preview-overlay") &&
        !n.closest?.("#ai-control-panel"),
    };
    // Explicitly specify canvas dimensions for some WebViews
    options.canvasWidth = width * 2;
    options.canvasHeight = height * 2;

    const dataUrl = await toPng(node, options);

    // Convert data URL to Blob for saving/sharing
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setImageBlob(blob);
    setPreviewUrl(dataUrl);
    return { blob, url, dataUrl };
  };

  // Save/share image across Android/iOS browsers and in-app WebViews
  const saveBlobToGallery = async (blob: Blob, filename: string, dataUrl?: string) => {
    try {
      const file = new File([blob], filename, { type: "image/png" });

      // 1) Prefer native share with files where supported
      const nav = navigator as any;
      if (nav?.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "Today's Sale Rates" });
        return;
      }

      // 2) iOS Safari: download attribute is ignored; navigate to data URL so user can save
      if (isIOS && dataUrl) {
        try {
          window.location.href = dataUrl;
          return;
        } catch {}
      }

      // 3) Anchor download for full browsers (mostly Android)
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      if ("download" in a && !isIOS) {
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }

      // 4) New tab with image (long-press to save)
      const newTab = window.open();
      if (newTab) {
        newTab.document.title = filename;
        const img = newTab.document.createElement("img");
        img.src = dataUrl || blobUrl;
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        newTab.document.body.style.margin = "0";
        newTab.document.body.appendChild(img);
        return;
      }

      // 5) Last resort: force navigation to data URL derived from blob
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          window.location.href = reader.result as string;
        } catch {
          // show inline preview overlay
          setPreviewUrl((reader.result as string) || dataUrl || blobUrl);
        }
      };
      reader.readAsDataURL(blob);

      // Also show inline preview overlay as a UX fallback
      setPreviewUrl(dataUrl || blobUrl);
    } catch (err) {
      console.error("Save image failed", err);
      // Inline preview overlay so users can long-press save in restrictive envs
      try {
        const blobUrl = URL.createObjectURL(blob);
        setPreviewUrl(dataUrl || blobUrl);
      } catch {
        // ignore
      }
    }
  };

  const handleSaveImage = async () => {
    try {
      setIsWorking("saving");
      const generated = await generateImage();
      if (!generated) throw new Error("Failed to render image");
      await saveBlobToGallery(generated.blob, FILENAME, generated.dataUrl);
      onTriggerLog?.("STATUS_POSTER_DOWNLOAD", "Saved WhatsApp status image to device");
    } catch (e) {
      console.error("Failed to save image", e);
      // No alert; a preview overlay will appear in restrictive WebViews to allow long-press save
    } finally {
      setIsWorking("idle");
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setIsWorking("sharing");
      const generated = await generateImage();
      if (!generated) throw new Error("Failed to render image for sharing");
      const { blob, dataUrl } = generated;

      const file = new File([blob], FILENAME, { type: "image/png" });
      onTriggerLog?.("WHATSAPP_SHARE", "Initiated WhatsApp status image share");

      // 1) If running inside our Android App with JavaScript Interface, use native Android sharing
      const win = window as any;
      if (win?.AndroidNative?.shareImage) {
        try {
          win.AndroidNative.shareImage(dataUrl, "Today's Rates", "", "com.whatsapp");
          return;
        } catch (androidErr) {
          console.warn("AndroidNative.shareImage failed, falling back to Web Share", androidErr);
        }
      }

      // 2) Try Web Share API with image file ONLY (Supported on Android Chrome/Edge, iOS Safari, etc.)
      const nav = navigator as any;
      if (nav?.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file] });
        return;
      }

      // 3) If browser/WebView does not support file sharing (e.g. WebView without native bridge),
      // do NOT navigate to whatsapp:// or wa.me/?text= as that cannot attach images and throws errors in WebView.
      // Instead, save/download the image and display the full-screen preview with instructions.
      await saveBlobToGallery(blob, FILENAME, dataUrl);
      setPreviewUrl(dataUrl);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Share failed", e);
        try {
          setPreviewUrl((await generateImage())?.dataUrl || null);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsWorking("idle");
    }
  };

  if (!currentRates) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-300 font-serif">Loading current rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center justify-between overflow-y-auto">
      {/* Top AI Control Panel */}
      <div id="ai-control-panel" className="w-full max-w-2xl bg-gray-800/95 border-b border-gold-500/30 p-2 sm:p-3 shadow-lg shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-400 to-gold-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <i className="fas fa-wand-magic-sparkles"></i> Gemini AI
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-gold-200">AI Status Background</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={transparentBoxes ? "default" : "outline"}
              onClick={() => setTransparentBoxes(!transparentBoxes)}
              className={`text-[11px] h-7 px-2 cursor-pointer transition-all ${
                transparentBoxes
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 font-bold"
                  : "border-gold-500/40 bg-gray-700/60 hover:bg-gray-700 text-gold-200"
              }`}
              title="Toggle Box Transparency: show only numbers and text"
            >
              <i className={`fas ${transparentBoxes ? "fa-cube text-amber-400" : "fa-square text-gray-400"} mr-1`}></i>
              {transparentBoxes ? "Transparent: ON" : "Boxed"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAspectRatioMode(prev => prev === "whatsapp_status" ? "full_screen" : "whatsapp_status")}
              className="text-[11px] h-7 px-2 border-gold-500/40 bg-gray-700/60 hover:bg-gray-700 text-gold-200 cursor-pointer"
              title="Toggle WhatsApp Status Aspect Ratio Fit"
            >
              <i className={`fas ${aspectRatioMode === "whatsapp_status" ? "fa-mobile-screen" : "fa-expand"} mr-1 text-gold-400`}></i>
              {aspectRatioMode === "whatsapp_status" ? "9:16 WhatsApp Fit" : "Full Screen"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAiControls(!showAiControls)}
              className="text-xs h-7 px-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <i className={`fas ${showAiControls ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
            </Button>
          </div>
        </div>

        {showAiControls && (
          <div className="space-y-2 text-xs">
            {/* Theme selector - 100% Gold Jewellery & Devi Jewellers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setAiPromptType("devi_bridal")}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                  aiPromptType === "devi_bridal"
                    ? "bg-amber-500/20 border-gold-400 text-amber-200 font-bold"
                    : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>👑</span>
                <span className="truncate">Devi Bridal Gold</span>
              </button>

              <button
                type="button"
                onClick={() => setAiPromptType("devi_antique_choker")}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                  aiPromptType === "devi_antique_choker"
                    ? "bg-amber-500/20 border-gold-400 text-amber-200 font-bold"
                    : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>✨</span>
                <span className="truncate">Antique Choker</span>
              </button>

              <button
                type="button"
                onClick={() => setAiPromptType("devi_temple_gold")}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                  aiPromptType === "devi_temple_gold"
                    ? "bg-amber-500/20 border-gold-400 text-amber-200 font-bold"
                    : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>📿</span>
                <span className="truncate">Temple Haram</span>
              </button>

              <button
                type="button"
                onClick={() => setAiPromptType("devi_bangles_rings")}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                  aiPromptType === "devi_bangles_rings"
                    ? "bg-amber-500/20 border-gold-400 text-amber-200 font-bold"
                    : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>💍</span>
                <span className="truncate">Bangles & Rings</span>
              </button>

              <button
                type="button"
                onClick={() => setAiPromptType("custom")}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
                  aiPromptType === "custom"
                    ? "bg-amber-500/20 border-gold-400 text-amber-200 font-bold"
                    : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>🎨</span>
                <span className="truncate">Custom Prompt</span>
              </button>
            </div>

            {/* Custom prompt text area */}
            {aiPromptType === "custom" && (
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Devi Jewellers royal gold necklace, bridal nath, antique jhumkas..."
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isGeneratingAiBg) {
                        e.preventDefault();
                        handleGenerateAiBg();
                      }
                    }}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateAiBg}
                    disabled={isGeneratingAiBg}
                    className="h-8 px-3 text-xs bg-gold-500 hover:bg-gold-600 text-black font-bold shrink-0 cursor-pointer"
                  >
                    Go
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px] text-gray-400">
                  <span className="text-gray-500">Quick jewellery ideas:</span>
                  <button
                    type="button"
                    onClick={() => { setCustomPromptText("Devi Jewellers Maharashtrian bride royal gold nath and thushi necklace"); }}
                    className="hover:text-gold-300 underline cursor-pointer"
                  >
                    Devi Bridal Nath
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setCustomPromptText("Devi Jewellers handcrafted 22k antique gold choker necklace on velvet"); }}
                    className="hover:text-gold-300 underline cursor-pointer"
                  >
                    Devi 22K Choker
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setCustomPromptText("Devi Jewellers temple gold lakshmi haram and royal gold bangles"); }}
                    className="hover:text-gold-300 underline cursor-pointer"
                  >
                    Devi Temple Haram
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => { setCustomPromptText("Devi Jewellers 22k hallmarked pure gold bridal jewellery ornaments"); }}
                    className="hover:text-gold-300 underline cursor-pointer"
                  >
                    Devi Gold Collection
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                onClick={handleGenerateAiBg}
                disabled={isGeneratingAiBg}
                className="flex-1 bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 hover:from-amber-600 hover:to-gold-600 text-black font-bold h-8 text-xs rounded-lg shadow-md cursor-pointer"
              >
                {isGeneratingAiBg ? (
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-circle-notch animate-spin"></i> Generating AI Image...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-sparkles"></i> Generate AI Background
                  </span>
                )}
              </Button>

              {/* Upload Own Photo */}
              <label className="h-8 text-xs border border-gold-500/50 bg-gray-750 hover:bg-gray-700 text-gold-200 px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0">
                <i className="fas fa-cloud-arrow-up text-gold-400"></i>
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setAiBgUrl(event.target.result as string);
                          setAiNotice(`Applied custom photo "${file.name}" as status backdrop`);
                          setAiError(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {aiBgUrl && (
                <Button
                  onClick={() => setAiBgUrl(null)}
                  variant="outline"
                  className="h-8 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 px-3 cursor-pointer shrink-0"
                  title="Remove AI Background"
                >
                  <i className="fas fa-rotate-left mr-1"></i> Reset
                </Button>
              )}
            </div>

            {aiError && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-2 rounded-md text-[11px] flex items-center justify-between">
                <span><i className="fas fa-exclamation-circle mr-1"></i> {aiError}</span>
                <button onClick={() => setAiError(null)} className="text-red-300 hover:text-white ml-2 cursor-pointer">×</button>
              </div>
            )}

            {aiNotice && (
              <div className="bg-amber-900/30 border border-amber-500/40 text-amber-200 p-2 rounded-md text-[11px] flex items-center justify-between">
                <span><i className="fas fa-info-circle mr-1 text-gold-400"></i> {aiNotice}</span>
                <button onClick={() => setAiNotice(null)} className="text-amber-300 hover:text-white ml-2 cursor-pointer">×</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Poster Container (Captured for Image/WhatsApp) */}
      <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden">
        <div
          ref={captureRef}
          className={`relative flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
            aspectRatioMode === "whatsapp_status"
              ? "w-full max-w-[420px] aspect-[9/16] rounded-2xl border-2 border-gold-400/80 my-auto"
              : "w-full h-full rounded-2xl border border-gold-400/30"
          }`}
          style={{
            backgroundColor: aiBgUrl ? "#0f172a" : theme.background,
            color: aiBgUrl ? "#ffffff" : theme.text,
          }}
        >
          {/* AI Background Image */}
          {aiBgUrl && (
            <>
              <img
                src={aiBgUrl}
                alt="AI Jewellery Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              {/* Soft dark gradient vignette to make rates stand out crystal clear */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-0 pointer-events-none" />
            </>
          )}

          {/* Header */}
          <div
            className={`relative z-10 shrink-0 text-black px-3 py-2 flex justify-center items-center transition-all ${
              aiBgUrl || transparentBoxes ? "bg-transparent border-none shadow-none" : "shadow-md border-b border-amber-500/50"
            }`}
            style={{
              backgroundColor: aiBgUrl || transparentBoxes ? "transparent" : "#d97706",
              backgroundImage: aiBgUrl || transparentBoxes ? "none" : "linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%)",
            }}
          >
            <img
              src="/logo.png"
              alt="Devi Jewellers Logo"
              className="h-14 md:h-18 w-[200px] md:w-[280px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
            />
          </div>

          {/* Capture Area */}
          <div className="relative z-10 flex-1 flex flex-col w-full min-h-0 overflow-hidden">
            {/* Top bar - Date and Time */}
            <div
              className={`shrink-0 py-2 px-3 flex items-center justify-center transition-all ${
                aiBgUrl || transparentBoxes ? "bg-transparent border-none shadow-none" : "shadow-md border-b-2"
              }`}
              style={{
                backgroundColor: aiBgUrl || transparentBoxes ? "transparent" : "#701a2e",
                backgroundImage: aiBgUrl || transparentBoxes ? "none" : "linear-gradient(90deg, #581121 0%, #7e1e35 50%, #581121 100%)",
                borderColor: aiBgUrl || transparentBoxes ? "transparent" : "#f59e0b",
              }}
            >
              <div
                className={`text-center px-4 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                  aiBgUrl || transparentBoxes ? "bg-transparent border-none shadow-none" : "border shadow-lg"
                }`}
                style={{
                  backgroundColor: aiBgUrl || transparentBoxes ? "transparent" : "#2a0812",
                  borderColor: aiBgUrl || transparentBoxes ? "transparent" : "#f59e0b",
                  borderWidth: aiBgUrl || transparentBoxes ? "0px" : "1.5px",
                  boxShadow: aiBgUrl || transparentBoxes ? "none" : "0 2px 6px rgba(0, 0, 0, 0.5)",
                  minWidth: "250px",
                }}
              >
                <div
                  className="text-xs sm:text-sm font-extrabold tracking-wide uppercase flex items-center justify-center gap-1.5"
                  style={{
                    color: "#fde047",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.9)",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>📅</span>
                  <span>{format(currentTime, "EEEE, dd-MMM-yyyy")}</span>
                </div>
                <div
                  className="text-base sm:text-xl font-black tracking-widest flex items-center justify-center gap-2 mt-0.5"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.9)",
                    fontFamily: "'JetBrains Mono', monospace, sans-serif",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#fde047" }}>⏰</span>
                  <span>{format(currentTime, "hh:mm a")}</span>
                  <span
                    className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ml-1"
                    style={{
                      backgroundColor: aiBgUrl || transparentBoxes ? "transparent" : "rgba(133, 30, 62, 0.7)",
                      color: "#fef08a",
                      border: aiBgUrl || transparentBoxes ? "none" : "1px solid rgba(253, 224, 71, 0.5)",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.9)",
                    }}
                  >
                    IST
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div
              className={`shrink-0 text-center py-1.5 md:py-2 transition-all ${
                aiBgUrl || transparentBoxes ? "bg-transparent shadow-none" : "shadow"
              }`}
              style={{
                backgroundColor: aiBgUrl || transparentBoxes ? "transparent" : "#d97706",
                backgroundImage: aiBgUrl || transparentBoxes ? "none" : "linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%)",
                borderBottom: "none",
              }}
            >
              <h2
                className="font-display font-black text-sm sm:text-base md:text-xl tracking-wider uppercase"
                style={{
                  color: "#fde047",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.9)",
                }}
              >
                TODAY'S SALE RATES
              </h2>
            </div>

            {/* Rate Cards */}
            <div className="flex-1 min-h-0 flex flex-col gap-2 p-2 sm:p-2.5 overflow-hidden">
              <RateCard title="24K GOLD (Per 10 gms)" value={currentRates.gold_24k_sale} hasBg={!!aiBgUrl || transparentBoxes} />
              <RateCard title="22K GOLD (Per 10 gms)" value={currentRates.gold_22k_sale} hasBg={!!aiBgUrl || transparentBoxes} />
              <RateCard title="18K GOLD (Per 10 gms)" value={currentRates.gold_18k_sale} hasBg={!!aiBgUrl || transparentBoxes} />
              <RateCard title="SILVER (Per KG)" value={currentRates.silver_per_kg_sale} hasBg={!!aiBgUrl || transparentBoxes} />
            </div>

            {/* Devi Jewellers Hallmark Authenticity Footer Badge */}
            <div className="shrink-0 pb-2 text-center">
              <p
                className="text-[10px] sm:text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5"
                style={{
                  color: "#fde047",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.9)",
                }}
              >
                <span>✦</span>
                <span>DEVI JEWELLERS • 100% BIS 916 HALLMARKED GOLD</span>
                <span>✦</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div
        id="action-footer"
        className="shrink-0 w-full border-t border-gray-800 bg-gray-900/95 shadow-inner z-30"
      >
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          <Button
            onClick={handleSaveImage}
            className="bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-black px-5 py-2.5 text-sm sm:text-base font-bold rounded-lg shadow-md border border-gold-300/40 cursor-pointer"
            disabled={isWorking !== "idle"}
          >
            <i className="fas fa-download mr-2"></i>
            {isWorking === "saving" ? "Saving..." : "Save Image"}
          </Button>
          <Button
            onClick={handleShareWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-sm sm:text-base font-bold rounded-lg shadow-md border border-green-400/30 cursor-pointer"
            disabled={isWorking !== "idle"}
          >
            <i className="fab fa-whatsapp mr-2 text-lg"></i>
            {isWorking === "sharing" ? "Opening Share..." : "Share on WhatsApp"}
          </Button>
        </div>
      </div>

      {/* Preview Overlay */}
      {previewUrl && (
        <div
          id="preview-overlay"
          className="fixed inset-0 z-50 bg-black/90 p-0 flex items-center justify-center"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} /* allow long-press without closing */
            />
            <div className="absolute top-4 right-4 z-50">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setPreviewUrl(null)}
                className="rounded-full w-9 h-9 p-0 flex items-center justify-center cursor-pointer"
              >
                <i className="fas fa-times text-lg"></i>
              </Button>
            </div>
            <div className="absolute bottom-6 inset-x-0 flex items-center justify-center pointer-events-none px-4">
              <div
                className="pointer-events-auto bg-gray-900/90 border border-gold-500/50 rounded-xl px-5 py-3 text-gold-100 shadow-xl text-center backdrop-blur-md"
                onClick={() => setPreviewUrl(null)}
              >
                <div className="text-sm font-bold flex items-center justify-center gap-2">
                  <i className="fas fa-hand-pointer text-amber-400"></i> Long press the image to Save/Download
                </div>
                <div className="text-[11px] mt-1 text-gray-400">Tap anywhere to close</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Rate Card Component
function RateCard({ title, value, hasBg }: { title: string; value: number | string; hasBg?: boolean }) {
  const formattedVal = typeof value === "number" ? value.toLocaleString("en-IN") : (value ?? 0);
  const text = `₹${formattedVal}`;
  const charLen = text.length;
  const viewBoxWidth = Math.max(100, charLen * 18);

  return (
    <div
      className={`flex-1 min-h-0 w-full flex flex-col justify-center rounded-xl overflow-hidden transition-all ${
        hasBg ? "bg-transparent border-0 border-none shadow-none" : "border-2 shadow-md bg-white border-amber-500 rounded-2xl"
      }`}
      style={{
        backgroundColor: hasBg ? "transparent" : "#ffffff",
        borderColor: hasBg ? "transparent" : "#f59e0b",
        border: hasBg ? "none" : "2px solid #f59e0b",
        boxShadow: hasBg ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className={`flex items-center justify-between w-full px-2.5 py-0.5 shrink-0 ${
          hasBg ? "bg-transparent border-none shadow-none" : "border-b px-3 py-1 sm:py-1.5"
        }`}
        style={{
          backgroundColor: hasBg ? "transparent" : "#fef3c7",
          backgroundImage: hasBg ? "none" : "linear-gradient(90deg, #fef3c7 0%, #fffbeb 50%, #fef3c7 100%)",
          borderColor: hasBg ? "transparent" : "#fcd34d",
          borderBottom: hasBg ? "none" : "1px solid #fcd34d",
        }}
      >
        <h4
          className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider"
          style={{
            color: hasBg ? "#fde047" : "#09090b",
            textShadow: hasBg
              ? "0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.9)"
              : "none",
          }}
        >
          {title}
        </h4>
        <div
          className={`flex items-center justify-center ${
            hasBg ? "bg-transparent border-none shadow-none" : "w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-sm"
          }`}
          style={{
            backgroundColor: hasBg ? "transparent" : "#851e3e",
            border: hasBg ? "none" : "none",
          }}
        >
          <i
            className={`fas fa-rupee-sign ${hasBg ? "text-amber-300" : "text-white"} text-xs sm:text-sm`}
            style={{
              textShadow: hasBg ? "0 2px 4px rgba(0, 0, 0, 0.95)" : "none",
            }}
          ></i>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-0.5">
        <svg
          className="w-full h-full max-h-12 sm:max-h-16 md:max-h-20"
          viewBox={`0 0 ${viewBoxWidth} 40`}
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fill={hasBg ? "#ffffff" : "#1e3a8a"}
            stroke={hasBg ? "#000000" : "#1e3a8a"}
            strokeWidth={hasBg ? "1.4" : "0.8"}
            paintOrder="stroke fill"
            className="font-black"
            fontFamily="'League Spartan', 'Gill Sans Ultra Bold', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="30"
            style={{
              filter: hasBg
                ? "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.95)) drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.9))"
                : "none",
            }}
          >
            {text}
          </text>
        </svg>
      </div>
    </div>
  );
}
