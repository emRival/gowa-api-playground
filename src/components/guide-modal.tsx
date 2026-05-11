"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Settings, HelpCircle, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [alwaysShow, setAlwaysShow] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gowa_show_guide");
      setAlwaysShow(stored !== "false");
    }
  }, [isOpen]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gowa_show_guide", String(alwaysShow));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Background gradient effects */}
        <div className="absolute -top-12 -right-12 size-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="border-b border-border/40 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <BookOpen className="size-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-sans">
                👋 Selamat Datang di GoWA API Playground!
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Panduan kilat super mudah untuk memahami cara menggunakan dokumentasi interaktif ini.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Step 1 */}
            <div className="flex gap-3 rounded-xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-border/80">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 text-xs font-mono">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground font-sans flex items-center gap-1.5">
                  <Settings className="size-3.5 text-emerald-400" />
                  Isi Konfigurasi (Bar Atas)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  Masukkan URL server GoWA Anda, Username, Password, dan Device ID.
                  <br />
                  <span className="text-emerald-400 font-semibold">🔒 100% Aman:</span> Data disimpan lokal di browser Anda saja, tidak pernah dikirim ke server luar apa pun!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 rounded-xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-border/80">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 text-xs font-mono">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground font-sans">
                  📁 Pilih Fitur / Endpoint
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  Pilih fitur yang ingin dicoba di menu kiri (seperti kirim pesan, gambar, dll.). Tekan tombol 
                  <strong className="text-emerald-400 font-semibold"> "✦ Muat Contoh"</strong> di bagian parameter untuk mengisi data simulasi secara otomatis dan instan!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 rounded-xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-border/80">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 text-xs font-mono">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground font-sans">
                  💻 Uji Coba & Skema API
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  Gunakan tab <strong>Playground</strong> untuk mengirim permintaan uji coba ke server GoWA Anda. Gunakan tab <strong>Dokumentasi API</strong> untuk mempelajari jenis data dan struktur parameter bidang secara detail.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3 rounded-xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-border/80">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 text-xs font-mono">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground font-sans">
                  📋 Salin cURL untuk AI
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  Gunakan tombol <strong>"Salin cURL Mentah / AI"</strong> untuk mendapatkan cURL berisi placeholder. Kirimkan ke ChatGPT atau Gemini agar AI langsung membuatkan Anda kode integrasi otomatis dalam bahasa pemrograman apa pun!
                </p>
              </div>
            </div>

          </div>

          {/* Security Alert Note */}
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-yellow-500 flex items-center gap-1.5 font-sans mb-0.5">
              ⚠️ Penting tentang Penyimpanan Lokal (Local Storage):
            </span>
            <p className="font-sans text-yellow-500/80 leading-relaxed">
              Kredensial Anda disimpan secara otomatis di browser komputer ini agar tidak perlu mengetik ulang berulang-ulang kali setiap kali halaman dimuat. <strong>Jika menggunakan komputer publik atau bersama orang lain</strong>, harap tekan tombol <strong>"Reset"</strong> di bagian kanan atas konfigurasi sebelum menutup peramban untuk menghapus semua data tersimpan!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border/40 p-6 sm:flex-row sm:items-center sm:justify-between bg-background/20">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={alwaysShow}
              onChange={(e) => setAlwaysShow(e.target.checked)}
              className="size-3.5 rounded border-muted bg-background text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-xs text-muted-foreground font-sans">
              Tampilkan panduan ini setiap kali web dibuka
            </span>
          </label>
          <Button
            onClick={handleClose}
            className="gap-1.5 bg-emerald-500 text-primary-foreground hover:bg-emerald-400 font-sans font-semibold text-xs py-1 h-8 px-4"
          >
            Mulai Belajar
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

      </div>
    </div>
  );
}
