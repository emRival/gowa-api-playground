"use client";

import { useState, useCallback, useEffect } from "react";
import { API_CATEGORIES } from "@/lib/api-definitions";
import { GlobalConfigBar } from "@/components/global-config-bar";
import { SidebarNav } from "@/components/sidebar-nav";
import { EndpointCard } from "@/components/endpoint-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Smartphone, MessageSquare, Users, Trash2, Clock, Play, ChevronDown, ChevronUp } from "lucide-react";
import { GuideModal } from "@/components/guide-modal";
import { useConfig } from "@/lib/config-store";
import { Button } from "@/components/ui/button";

const categoryIcons: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="size-5 text-blue-400" />,
  MessageSquare: <MessageSquare className="size-5 text-emerald-400" />,
  Users: <Users className="size-5 text-purple-400" />,
};

export default function PlaygroundPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string | undefined>();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { history, clearHistory } = useConfig();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gowa_show_guide");
      if (stored !== "false") {
        setIsGuideOpen(true);
      }
    }
  }, []);

  const handleEndpointClick = useCallback((id: string) => {
    setActiveEndpoint(id);
    const el = document.getElementById(`endpoint-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleReloadHistory = (path: string, values: Record<string, string>) => {
    window.dispatchEvent(
      new CustomEvent("gowa_load_history", {
        detail: { path, values },
      })
    );
  };

  return (
    <div className="flex h-screen flex-col">
      <GlobalConfigBar onOpenGuide={() => setIsGuideOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNav
          activeEndpoint={activeEndpoint}
          onEndpointClick={handleEndpointClick}
        />

        {/* Main content */}
        <ScrollArea className="flex-1">
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            
            {/* Hero */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50/50 ring-1 ring-border/50 overflow-hidden">
                  <img 
                    src="/gowa-logo.svg" 
                    alt="GoWA Logo" 
                    className="size-8 object-contain" 
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                    GoWA API Playground
                  </h1>
                  <p className="text-sm text-muted-foreground font-sans">
                    Interactive documentation & cURL generator for Go WhatsApp Multi-Device
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 ring-1 ring-emerald-500/20">
                  ✦ Secure Streaming Proxy
                </span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-400 ring-1 ring-blue-500/20">
                  ✦ Zero-Disk Architecture
                </span>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-400 ring-1 ring-purple-500/20">
                  ✦ cURL & Payload Generator
                </span>
              </div>
            </div>

            {/* Endpoint categories */}
            {API_CATEGORIES.map((category) => (
              <section key={category.id} className="mb-12">
                <div className="mb-5 flex items-center gap-3">
                  {categoryIcons[category.icon]}
                  <h2 className="text-lg font-bold tracking-tight text-foreground font-sans">
                    {category.label}
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground font-sans">
                    {category.endpoints.length} endpoints
                  </span>
                </div>
                <Separator className="mb-5 opacity-30" />
                <div className="flex flex-col gap-3">
                  {category.endpoints.map((endpoint) => (
                    <EndpointCard key={endpoint.id} endpoint={endpoint} />
                  ))}
                </div>
              </section>
            ))}

            {/* Request History Log collapsible panel */}
            <section className="mt-16 rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15">
                    <Clock className="size-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground font-sans">
                    📜 Riwayat Uji Coba API
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                    {history.length} request
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-7 gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-sans"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus Semua
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="h-7 p-0 w-7 text-muted-foreground hover:text-foreground"
                  >
                    {isHistoryExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {isHistoryExpanded && (
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-center py-6 text-xs text-muted-foreground italic font-sans">
                      Belum ada riwayat pengiriman. Klik tombol "Kirim Permintaan API" di atas untuk merekam uji coba Anda.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/40">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse font-sans">
                          <thead>
                            <tr className="border-b border-border/40 bg-background/40">
                              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Waktu</th>
                              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Endpoint</th>
                              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fitur</th>
                              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {history.map((item) => (
                              <tr key={item.id} className="hover:bg-accent/5">
                                <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                                  {item.timestamp}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <span
                                      className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                                        item.method === "POST"
                                          ? "bg-emerald-500/15 text-emerald-400"
                                          : item.method === "DELETE"
                                          ? "bg-red-500/15 text-red-400"
                                          : "bg-blue-500/15 text-blue-400"
                                      }`}
                                    >
                                      {item.method}
                                    </span>
                                    <span className="text-foreground/80">{item.path}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-foreground/80 font-medium">
                                  {item.endpointName}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono ${
                                      !item.isError
                                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                                        : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                                    }`}
                                  >
                                    {item.status} {item.statusText}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReloadHistory(item.path, item.values)}
                                    className="h-6 gap-1 px-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                  >
                                    <Play className="size-2.5 fill-current" />
                                    Muat Ulang Form
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-16 border-t border-border/30 py-8 text-center flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground font-sans flex items-center gap-1.5 flex-wrap justify-center">
                <span>GoWA API Playground</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="flex items-center gap-1">
                  Built with AI by 
                  <a
                    href="https://instagram.com/em_rival"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 font-semibold hover:text-emerald-400 hover:underline transition-colors"
                  >
                    @em_rival
                  </a>
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground/70 font-sans">
                Untuk integrasi{" "}
                <a
                  href="https://github.com/aldinokemal/go-whatsapp-web-multidevice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400/80 hover:text-emerald-400 underline decoration-emerald-500/20 underline-offset-2"
                >
                  go-whatsapp-web-multidevice
                </a>
              </p>
              <p className="mt-2 max-w-md text-[10px] text-muted-foreground/50 leading-relaxed font-sans border border-border/30 bg-muted/20 px-3 py-1.5 rounded-md">
                🛡️ Semua permintaan diuji langsung via server-less proxy. 
                Tidak ada data kredensial maupun file media yang disimpan di disk (100% Memori Transit).
              </p>
            </footer>
          </main>
        </ScrollArea>
      </div>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
