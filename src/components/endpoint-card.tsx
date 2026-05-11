"use client";

import { useState, useCallback, useEffect } from "react";
import { useConfig } from "@/lib/config-store";
import { sendRequest, type ProxyResponse } from "@/lib/api-client";
import { MethodBadge } from "@/components/method-badge";
import { CurlPreview } from "@/components/curl-preview";
import { ParamForm } from "@/components/param-form";
import { FormatSwitch } from "@/components/format-switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { ApiEndpoint } from "@/lib/api-definitions";
import { ChevronDown, ChevronUp, Play, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { CurlMode } from "@/lib/curl-builder";

interface EndpointCardProps {
  endpoint: ApiEndpoint;
}

export function EndpointCard({ endpoint }: EndpointCardProps) {
  const { config, addHistoryItem } = useConfig();
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [mode, setMode] = useState<CurlMode>(
    endpoint.supportsUrlMode ? "json" : endpoint.bodyType === "form-data" ? "form-data" : "json"
  );
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [tab, setTab] = useState<"playground" | "schema">("playground");

  // History Load Event Listener
  useEffect(() => {
    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string; values: Record<string, string> }>;
      if (customEvent.detail.path === endpoint.path) {
        setValues(customEvent.detail.values);
        setExpanded(true);
        // Scroll to card
        const el = document.getElementById(`endpoint-${endpoint.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("gowa_load_history", handleLoad);
    return () => window.removeEventListener("gowa_load_history", handleLoad);
  }, [endpoint.path, endpoint.id]);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((name: string, file: File | null) => {
    setFiles((prev) => {
      const next = { ...prev };
      if (file) {
        next[name] = file;
      } else {
        delete next[name];
      }
      return next;
    });
  }, []);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    let res: ProxyResponse;
    try {
      res = await sendRequest(endpoint, config, values, files, mode);
      setResponse(res);
      addHistoryItem({
        endpointName: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        status: res.status,
        statusText: res.statusText,
        isError: res.status >= 400 || !!res.error,
        values: { ...values },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to execute request";
      res = {
        status: 500,
        statusText: "Internal Server Error",
        body: null,
        error: errMsg,
        hint: "Please ensure your GoWA server is online and base URL is correct.",
      };
      setResponse(res);
      addHistoryItem({
        endpointName: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        status: 500,
        statusText: "Internal Server Error",
        isError: true,
        values: { ...values },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = useCallback(() => {
    const autofilled: Record<string, string> = {};
    endpoint.params.forEach((p) => {
      if (p.type === "boolean") {
        autofilled[p.name] = "true";
      } else if (p.type === "select" && p.options && p.options.length > 0) {
        autofilled[p.name] = p.options[0].value;
      } else if (p.name === "image_url") {
        autofilled[p.name] = "https://auto2000.co.id/berita-dan-tips/_next/image?url=https%3A%2F%2Fastradigitaldigiroomuat.blob.core.windows.net%2Fstorage-uat-001%2Fjenis-mobil-listrik.png&w=1080&q=75";
      } else if (p.name === "video_url") {
        autofilled[p.name] = "https://www.w3schools.com/html/mov_bbb.mp4";
      } else if (p.name === "sticker_url") {
        autofilled[p.name] = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Bkc3g0eDR5MGN5ZHltd2x2ZmU3bXJzd3BpeDF0NnVwZnR5eDRxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Cg5nU84a9pCo0/giphy.gif";
      } else if (p.placeholder) {
        autofilled[p.name] = p.placeholder;
      } else {
        autofilled[p.name] = "";
      }
    });
    setValues(autofilled);
  }, [endpoint.params]);

  return (
    <div
      id={`endpoint-${endpoint.id}`}
      className="group/card overflow-hidden rounded-xl border border-border/50 bg-card/50 transition-all duration-300 hover:border-border/80 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/5"
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 text-sm font-medium text-foreground/90 font-mono">
          {endpoint.path}
        </code>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {endpoint.name}
        </span>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/30">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="border-b border-border/30 p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {endpoint.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {endpoint.description}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center justify-between mb-4 bg-muted/50 p-1 rounded-lg border border-border/40">
                <button
                  onClick={() => setTab("playground")}
                  className={`flex-1 rounded-md py-1 text-xs font-semibold transition-all duration-150 font-sans ${
                    tab === "playground"
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Playground / Uji Coba
                </button>
                <button
                  onClick={() => setTab("schema")}
                  className={`flex-1 rounded-md py-1 text-xs font-semibold transition-all duration-150 font-sans ${
                    tab === "schema"
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dokumentasi API / Skema
                </button>
              </div>

              {tab === "playground" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground font-sans">
                      PARAMETER INPUT
                    </div>
                    {endpoint.params.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutofill}
                        className="h-6 gap-1 px-2 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-sans"
                      >
                        <Sparkles className="size-3" />
                        ✦ Muat Contoh
                      </Button>
                    )}
                  </div>

                  {endpoint.supportsUrlMode && (
                    <FormatSwitch mode={mode} onModeChange={setMode} />
                  )}

                  <ParamForm
                    params={endpoint.params}
                    values={values}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    mode={mode}
                    supportsUrlMode={endpoint.supportsUrlMode}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground font-sans">
                    Skema Parameter API
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/40 bg-background/40">
                            <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Nama Parameter</th>
                            <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Tipe Data</th>
                            <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Wajib Diisi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {endpoint.params.map((p) => (
                            <tr key={p.name} className="hover:bg-accent/5">
                              <td className="px-4 py-2.5 font-mono text-[11px] text-foreground">
                                {p.name}
                                {p.description && (
                                  <p className="mt-0.5 font-sans text-[10px] text-muted-foreground">
                                    {p.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">
                                  {p.type === "file" ? "binary" : p.type === "boolean" ? "boolean" : "string"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                {p.required ? (
                                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/20 font-sans">
                                    Ya
                                  </span>
                                ) : (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-sans">
                                    Tidak
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/20 p-3 text-[11px] text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1 font-sans">💡 Tips Integrasi AI & Developer:</p>
                    <p className="font-sans leading-relaxed">
                      Gunakan tombol <strong className="text-emerald-400">"Salin cURL Mentah / AI"</strong> di sebelah kanan atas untuk menyalin struktur cURL dengan teks contoh default, lalu kirimkan ke ChatGPT atau Gemini untuk mengonversi endpoint ini ke kode pemrograman lain secara instan!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: cURL preview & Execution */}
            <div className="p-5 flex flex-col gap-5">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3 font-sans">
                  GENERATOR KODE INTEGRASI
                </div>
                <CurlPreview endpoint={endpoint} config={config} values={values} mode={mode} />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full gap-2 bg-emerald-500 font-semibold text-primary-foreground transition-all duration-200 hover:bg-emerald-400 disabled:opacity-50 font-sans"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sedang Mengirim Permintaan...
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Kirim Permintaan API
                    </>
                  )}
                </Button>
              </div>

              {/* Response Panel */}
              {response && (
                <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground font-sans">
                      STATUS RESPONS SERVER
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                        response.status >= 200 && response.status < 300
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {response.status} {response.statusText}
                    </span>
                  </div>

                  {response.error ? (
                    <div className="flex flex-col gap-2 rounded border border-red-500/20 bg-red-500/5 p-3 text-xs">
                      <span className="font-semibold text-red-400 font-sans">{response.error}</span>
                      {response.hint && (
                        <span className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                          💡 {response.hint}
                        </span>
                      )}
                    </div>
                  ) : (
                    <pre className="max-h-[180px] overflow-auto rounded bg-background/80 p-3 font-mono text-[11px] text-slate-300">
                      <code>{JSON.stringify(response.body, null, 2)}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
