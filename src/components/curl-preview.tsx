"use client";

import { useState, useCallback, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiEndpoint } from "@/lib/api-definitions";
import type { GlobalConfig } from "@/lib/config-store";
import { buildCurl } from "@/lib/curl-builder";
import { generateSnippet } from "@/lib/code-snippets";

function tokenizeCurl(curl: string) {
  const tokens: { type: string; value: string }[] = [];
  const lines = curl.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("curl")) {
      tokens.push({ type: "command", value: "curl" });
      const rest = trimmed.slice(4);
      if (rest) tokens.push({ type: "text", value: rest });
    } else if (trimmed.startsWith("-X")) {
      tokens.push({ type: "flag", value: "-X" });
      const method = trimmed.slice(3).replace(" \\", "").trim();
      tokens.push({ type: "method", value: " " + method });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    } else if (trimmed.startsWith("-H")) {
      tokens.push({ type: "flag", value: "-H" });
      const headerVal = trimmed.slice(3).replace(" \\", "").trim();
      tokens.push({ type: "header", value: " " + headerVal });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    } else if (trimmed.startsWith("-F")) {
      tokens.push({ type: "flag", value: "-F" });
      const formVal = trimmed.slice(3).replace(" \\", "").trim();
      tokens.push({ type: "form", value: " " + formVal });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    } else if (trimmed.startsWith("-d")) {
      tokens.push({ type: "flag", value: "-d" });
      const dataVal = trimmed.slice(3).replace(" \\", "").trim();
      tokens.push({ type: "data", value: " " + dataVal });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    } else if (trimmed.startsWith('"http') || trimmed.startsWith("'http") || trimmed.startsWith("http")) {
      tokens.push({ type: "url", value: trimmed.replace(" \\", "") });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    } else {
      tokens.push({ type: "data", value: trimmed.replace(" \\", "") });
      if (trimmed.endsWith("\\")) tokens.push({ type: "continuation", value: " \\" });
    }
    tokens.push({ type: "newline", value: "\n" });
  }

  return tokens;
}

const typeColors: Record<string, string> = {
  command: "text-cyan-400 font-bold",
  flag: "text-amber-400",
  method: "text-emerald-400 font-semibold",
  header: "text-slate-400",
  form: "text-purple-300",
  data: "text-slate-300",
  url: "text-emerald-300",
  continuation: "text-slate-600",
  text: "text-slate-300",
};

interface CurlPreviewProps {
  endpoint: ApiEndpoint;
  config: GlobalConfig;
  values: Record<string, string>;
  mode: "json" | "form-data";
}

type TargetLang = "curl" | "js" | "python" | "php" | "go";

export function CurlPreview({ endpoint, config, values, mode }: CurlPreviewProps) {
  const [activeLang, setActiveLang] = useState<TargetLang>("curl");
  const [copiedActive, setCopiedActive] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Dynamically compute codes
  const curlActive = useMemo(() => buildCurl(endpoint, config, values, mode, false), [endpoint, config, values, mode]);
  const curlRaw = useMemo(() => buildCurl(endpoint, config, values, mode, true), [endpoint, config, values, mode]);

  const jsActive = useMemo(() => generateSnippet("js", endpoint, config, values, mode, false), [endpoint, config, values, mode]);
  const jsRaw = useMemo(() => generateSnippet("js", endpoint, config, values, mode, true), [endpoint, config, values, mode]);

  const pythonActive = useMemo(() => generateSnippet("python", endpoint, config, values, mode, false), [endpoint, config, values, mode]);
  const pythonRaw = useMemo(() => generateSnippet("python", endpoint, config, values, mode, true), [endpoint, config, values, mode]);

  const phpActive = useMemo(() => generateSnippet("php", endpoint, config, values, mode, false), [endpoint, config, values, mode]);
  const phpRaw = useMemo(() => generateSnippet("php", endpoint, config, values, mode, true), [endpoint, config, values, mode]);

  const goActive = useMemo(() => generateSnippet("go", endpoint, config, values, mode, false), [endpoint, config, values, mode]);
  const goRaw = useMemo(() => generateSnippet("go", endpoint, config, values, mode, true), [endpoint, config, values, mode]);

  // Select code based on active language
  const activeCode = useMemo(() => {
    if (activeLang === "curl") return curlActive;
    if (activeLang === "js") return jsActive;
    if (activeLang === "python") return pythonActive;
    if (activeLang === "php") return phpActive;
    return goActive;
  }, [activeLang, curlActive, jsActive, pythonActive, phpActive, goActive]);

  const rawCode = useMemo(() => {
    if (activeLang === "curl") return curlRaw;
    if (activeLang === "js") return jsRaw;
    if (activeLang === "python") return pythonRaw;
    if (activeLang === "php") return phpRaw;
    return goRaw;
  }, [activeLang, curlRaw, jsRaw, pythonRaw, phpRaw, goRaw]);

  const tokens = useMemo(() => {
    if (activeLang === "curl") return tokenizeCurl(curlActive);
    return [];
  }, [activeLang, curlActive]);

  const handleCopy = useCallback(async (text: string, isRaw: boolean) => {
    const copyToClipboard = async (str: string) => {
      try {
        await navigator.clipboard.writeText(str);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = str;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    };

    await copyToClipboard(text);
    if (isRaw) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      setCopiedActive(true);
      setTimeout(() => setCopiedActive(false), 2000);
    }
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-[#0A0E1A] dark">
      
      {/* Language Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/40 bg-background/20 p-1">
        {(["curl", "js", "python", "php", "go"] as TargetLang[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 font-sans ${
              activeLang === lang
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang === "js" ? "JS (Fetch)" : lang}
          </button>
        ))}
      </div>

      {/* Action Header */}
      <div className="flex flex-col gap-2 border-b border-border/40 px-4 py-2 sm:flex-row sm:items-center sm:justify-between bg-background/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/70" />
            <div className="size-2.5 rounded-full bg-amber-500/70" />
            <div className="size-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="ml-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 font-sans">
            KODE GENERATOR ({activeLang === "js" ? "JS FETCH" : activeLang})
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(activeCode, false)}
            className="h-6 gap-1 px-2 text-[10px] font-semibold text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 font-sans"
            title="Salin kode integrasi dengan kredensial aktif Anda"
          >
            {copiedActive ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Salin Kode Aktif
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(rawCode, true)}
            className="h-6 gap-1 px-2 text-[10px] font-semibold text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 font-sans"
            title="Salin kode mentah / template kosong untuk dikirim ke AI"
          >
            {copiedRaw ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Salin Kode Mentah / AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code Display */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed max-h-[350px] overflow-y-auto">
        <code>
          {activeLang === "curl" ? (
            tokens.map((token, i) =>
              token.type === "newline" ? (
                <br key={i} />
              ) : (
                <span key={i} className={typeColors[token.type] || "text-slate-300"}>
                  {token.value}
                </span>
              )
            )
          ) : (
            <span className="text-slate-300 font-mono select-all">
              {activeCode}
            </span>
          )}
        </code>
      </pre>
    </div>
  );
}
