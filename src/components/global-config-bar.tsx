"use client";

import { useConfig } from "@/lib/config-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Globe,
  User,
  Lock,
  Smartphone,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

interface GlobalConfigBarProps {
  onOpenGuide?: () => void;
}

export function GlobalConfigBar({ onOpenGuide }: GlobalConfigBarProps) {
  const { config, setField, reset, remember, setRemember } = useConfig();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sticky top-0 z-50 border-b border-border/60 bg-[var(--config-bar-bg)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 py-3">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15">
              <Settings className="size-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-foreground font-sans">
              Konfigurasi API GoWA
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            
            {/* Remember Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-muted-foreground transition-colors hover:text-foreground font-sans" title="Menyimpan kredensial di browser Anda secara lokal agar tidak hilang saat halaman di-refresh">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-3 rounded border-muted bg-background text-emerald-500 focus:ring-emerald-500"
              />
              Ingat Kredensial (Lokal)
            </label>

            <span className="text-border/40 text-xs hidden sm:inline">|</span>

            {/* Guide Button */}
            {onOpenGuide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenGuide}
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground font-sans"
              >
                <HelpCircle className="size-3.5 text-emerald-400" />
                Panduan
              </Button>
            )}

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground font-sans"
              title="Hapus semua kredensial yang tersimpan di browser ini"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* Collapse/Expand Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronUp className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Fields */}
        {!collapsed && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="config-base-url"
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans"
              >
                <Globe className="size-3" />
                Base URL (Alamat Server GoWA)
              </Label>
              <Input
                id="config-base-url"
                value={config.baseUrl}
                onChange={(e) => setField("baseUrl", e.target.value)}
                placeholder="http://localhost:3000"
                className="h-8 bg-background/60 font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="config-username"
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans"
              >
                <User className="size-3" />
                Username API
              </Label>
              <Input
                id="config-username"
                value={config.username}
                onChange={(e) => setField("username", e.target.value)}
                placeholder="admin"
                className="h-8 bg-background/60 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="config-password"
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans"
              >
                <Lock className="size-3" />
                Password API
              </Label>
              <Input
                id="config-password"
                type="password"
                value={config.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••••"
                className="h-8 bg-background/60 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="config-device-id"
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans"
              >
                <Smartphone className="size-3" />
                Device ID (X-Device-Id)
              </Label>
              <Input
                id="config-device-id"
                value={config.deviceId}
                onChange={(e) => setField("deviceId", e.target.value)}
                placeholder="628xxx@s.whatsapp.net"
                className="h-8 bg-background/60 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
