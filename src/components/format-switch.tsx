"use client";

import { FileJson, Upload } from "lucide-react";
import type { CurlMode } from "@/lib/curl-builder";

interface FormatSwitchProps {
  mode: CurlMode;
  onModeChange: (mode: CurlMode) => void;
}

export function FormatSwitch({ mode, onModeChange }: FormatSwitchProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 p-0.5">
      <button
        onClick={() => onModeChange("json")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
          mode === "json"
            ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <FileJson className="size-3.5" />
        URL (JSON)
      </button>
      <button
        onClick={() => onModeChange("form-data")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
          mode === "form-data"
            ? "bg-purple-500/15 text-purple-400 shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Upload className="size-3.5" />
        File (multipart)
      </button>
    </div>
  );
}
