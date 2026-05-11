"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, Sparkles, Film, Music, Check, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParamDef } from "@/lib/api-definitions";

interface ParamFormProps {
  params: ParamDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFileChange?: (name: string, file: File | null) => void;
  mode: "json" | "form-data";
  supportsUrlMode?: boolean;
}

// Predefined high-quality test media samples
interface MediaSample {
  label: string;
  url: string;
  previewUrl?: string;
}

const MEDIA_SAMPLES: Record<"image" | "sticker" | "video" | "audio", MediaSample[]> = {
  image: [
    {
      label: "🏎️ Mobil Listrik (Auto2000)",
      url: "https://auto2000.co.id/berita-dan-tips/_next/image?url=https%3A%2F%2Fastradigitaldigiroomuat.blob.core.windows.net%2Fstorage-uat-001%2Fjenis-mobil-listrik.png&w=3840&q=75",
    },
    {
      label: "⛰️ Pemandangan Indah (Unsplash)",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "💻 Programmer Coding (Unsplash)",
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    },
  ],
  sticker: [
    {
      label: "🐱 Kucing Lucu Bergerak (Giphy)",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Bkc3g0eDR5MGN5ZHltd2x2ZmU3bXJzd3BpeDF0NnVwZnR5eDRxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Cg5nU84a9pCo0/giphy.gif",
    },
    {
      label: "🐶 Anjing Shiba Inu (Giphy)",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMThjOTl5ajU0dmJreDA3ZzBpZXJjZnl1NnF2bTFzOHUxeWZrbmdieCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/13CoXDiaCcC2qc/giphy.gif",
    },
    {
      label: "☕ Kopi Semangat (Giphy)",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDloYXZ4Ym5ldjI1ZXh0bHA4d2Fndm1oZHZ6dHdyMW03djc0cHloYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/WTmHBsn9Y97Vp1vG5M/giphy.gif",
    },
  ],
  video: [
    {
      label: "🐰 Kartun Kelinci MP4 (W3Schools)",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      label: "🌊 Ombak Pantai MP4 (W3Schools)",
      url: "https://www.w3schools.com/html/movie.mp4",
    },
  ],
  audio: [
    {
      label: "🎵 Musik Klasik MP3 (SoundHelix)",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ],
};

function formatWAId(val: string): string {
  let clean = val.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  if (!clean.includes("@")) {
    if (clean.length > 13) {
      return clean + "@g.us";
    }
    return clean + "@s.whatsapp.net";
  }
  return val;
}

interface MediaSelectorProps {
  type: "image" | "sticker" | "video" | "audio";
  onSelect: (url: string) => void;
}

function MediaSelector({ type, onSelect }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const samples = MEDIA_SAMPLES[type];

  const Icon =
    type === "video"
      ? Film
      : type === "audio"
      ? Music
      : type === "sticker"
      ? Sparkles
      : ImageIcon;

  return (
    <div className="relative inline-block font-sans" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/20"
      >
        <Search className="size-3" />
        Cari Contoh
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 z-30 w-72 rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="mb-2 flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Icon className="size-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pilih Contoh {type}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
            {samples.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(sample.url);
                  setIsOpen(false);
                }}
                className="flex flex-col items-start gap-0.5 rounded-lg border border-border/30 bg-background/40 p-2 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
              >
                <span className="text-xs font-bold text-foreground">{sample.label}</span>
                <span className="truncate text-[9px] text-muted-foreground w-full font-mono">
                  {sample.url}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ParamForm({
  params,
  values,
  onChange,
  onFileChange,
  mode,
  supportsUrlMode,
}: ParamFormProps) {
  const filteredParams = params.filter((p) => {
    if (!supportsUrlMode) return true;
    if (mode === "json" && p.type === "file") return false;
    if (mode === "form-data" && p.name.endsWith("_url")) return false;
    return true;
  });

  if (filteredParams.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground italic font-sans">
        No parameters required
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredParams.map((param) => {
        const isPhoneField =
          param.name === "phone" || param.name === "receiver" || param.name === "sender";
        const currentVal = values[param.name] || "";
        const isFormatNeeded =
          isPhoneField &&
          currentVal.length > 2 &&
          (currentVal.startsWith("08") || (!currentVal.includes("@") && /^[0-9]+$/.test(currentVal)));

        const isUrlField = param.name.endsWith("_url");
        const mediaType = param.name.includes("sticker")
          ? "sticker"
          : param.name.includes("video")
          ? "video"
          : param.name.includes("audio")
          ? "audio"
          : "image";

        return (
          <div key={param.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={`param-${param.name}`}
                className="flex items-center gap-2 text-xs font-sans"
              >
                <span className="text-foreground font-semibold">{param.label}</span>
                {param.required && <span className="text-[10px] text-red-400">*</span>}
                {param.description && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    — {param.description}
                  </span>
                )}
              </Label>

              {/* Media Sample Finder */}
              {isUrlField && (
                <MediaSelector
                  type={mediaType}
                  onSelect={(url) => onChange(param.name, url)}
                />
              )}
            </div>

            {param.type === "textarea" ? (
              <textarea
                id={`param-${param.name}`}
                value={currentVal}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.placeholder}
                rows={3}
                className="flex min-h-[72px] w-full rounded-md border border-input bg-background/60 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans"
              />
            ) : param.type === "boolean" ? (
              <div className="flex items-center gap-2 font-sans">
                <Switch
                  id={`param-${param.name}`}
                  checked={currentVal === "true"}
                  onCheckedChange={(checked) =>
                    onChange(param.name, checked ? "true" : "false")
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {currentVal === "true" ? "true" : "false"}
                </span>
              </div>
            ) : param.type === "select" ? (
              <Select
                value={currentVal}
                onValueChange={(val) => onChange(param.name, val ?? "")}
              >
                <SelectTrigger
                  id={`param-${param.name}`}
                  className="h-8 bg-background/60 text-xs font-sans"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  {param.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : param.type === "file" ? (
              <Input
                id={`param-${param.name}`}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (onFileChange) {
                    onFileChange(param.name, file);
                  }
                  onChange(param.name, file ? file.name : "");
                }}
                className="h-9 bg-background/60 text-xs py-1 cursor-pointer font-sans"
              />
            ) : (
              <div className="flex flex-col gap-1">
                <Input
                  id={`param-${param.name}`}
                  value={currentVal}
                  onChange={(e) => onChange(param.name, e.target.value)}
                  placeholder={param.placeholder}
                  className={`h-8 bg-background/60 text-xs ${
                    param.name.includes("url") || param.isPathParam ? "font-mono" : "font-sans"
                  }`}
                />

                {/* WhatsApp Auto Formatter Badge */}
                {isFormatNeeded && (
                  <button
                    type="button"
                    onClick={() => onChange(param.name, formatWAId(currentVal))}
                    className="mt-1 flex items-center gap-1 self-start rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/20 font-sans"
                  >
                    <Check className="size-3" />
                    🪄 Klik untuk ubah ke ID WhatsApp: <strong className="ml-1 font-mono">{formatWAId(currentVal)}</strong>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
