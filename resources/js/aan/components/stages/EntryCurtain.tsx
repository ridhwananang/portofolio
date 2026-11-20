import { Sparkles, Music, Play, Upload, RotateCcw } from "lucide-react";
import { useRef } from "react";
import { AI_MOOD_PRESETS, AUDIO_SEGMENT } from "@/aan/config/experience";
import type { AudioStatus, ExperiencePalette } from "@/aan/types/experience";

interface EntryCurtainProps {
  audioStatus: AudioStatus;
  palette: ExperiencePalette;
  onSelectPalette: (palette: ExperiencePalette) => void;
  onSelectCustomAudio: (file: File, startAt100s: boolean) => void;
  onResetYoutubeAudio: () => void;
  onStart: () => void;
}

export function EntryCurtain({
  audioStatus,
  palette,
  onSelectPalette,
  onSelectCustomAudio,
  onResetYoutubeAudio,
  onStart,
}: EntryCurtainProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
return;
}

    onSelectCustomAudio(file, false);
  };

  return (
    <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-16">
      <div className="luxury-glass luxury-gold-ring relative w-full max-w-2xl overflow-hidden rounded-3xl p-7 sm:p-11">
        {/* Subtle corner accent */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: palette.accentHex }}
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-1">
            <Sparkles className="h-3.5 w-3.5 text-[#ead49b]" />
            <span className="font-mono-precision text-[10px] tracking-[0.24em] text-[#ead49b] uppercase">
              Interactive Prelude · AI Curated
            </span>
          </div>

          <h1 className="font-editorial text-4xl font-medium tracking-tight text-[#f5efe6] sm:text-6xl">
            Mahkota yang{" "}
            <span className="gold-gradient-text italic">Berserah</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#a69f95] sm:text-base">
            Sebuah perjalanan visual sinematik: hitung mundur{" "}
            <span className="text-[#f5efe6]">1 · 2 · 3</span>, kembang api
            selama <span className="text-[#f5efe6]">10 detik</span>, hingga
            tumbuhnya akar, mekarnya bunga, dan gugurnya daun selaras dengan
            segmen <span className="text-[#ead49b]">1:40 – 1:58</span>.
          </p>

          {/* Mood / AI Palette selector */}
          <div className="mt-7 w-full max-w-md">
            <p className="mb-2.5 font-mono-precision text-[10px] tracking-[0.22em] text-[#a69f95] uppercase">
              Nuansa Visual & Bunga
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(AI_MOOD_PRESETS).map(([key, preset]) => {
                const selected = palette.moodLabel === preset.moodLabel;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectPalette(preset)}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs transition-all cursor-pointer ${
                      selected
                        ? "border-[#d4af37]/70 bg-[#d4af37]/12 text-[#f5efe6]"
                        : "border-white/10 bg-white/[0.02] text-[#a69f95] hover:border-white/25 hover:text-[#f5efe6]"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-2 ring-white/15"
                      style={{ backgroundColor: preset.petalPrimary }}
                    />
                    <span className="truncate font-medium">
                      {preset.moodLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Start CTA */}
          <button
            type="button"
            onClick={onStart}
            className="group relative mt-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-[#ead49b]/60 bg-gradient-to-r from-[#d4af37] via-[#ead49b] to-[#c79e30] px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-[#09090c] uppercase shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_55px_rgba(212,175,55,0.48)] active:scale-[0.99]"
          >
            <Play className="h-4 w-4 fill-current transition-transform group-hover:translate-x-0.5" />
            <span>Mulai Pengalaman</span>
          </button>

          {/* Audio source status & optional local audio selector */}
          <div className="mt-7 flex w-full flex-col items-center gap-2 border-t border-white/10 pt-5 text-xs text-[#a69f95]">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Music className="h-3.5 w-3.5 text-[#d4af37]" />
              {audioStatus.mode === "custom-file" ? (
                <span>
                  Audio Lokal:{" "}
                  <strong className="text-[#f5efe6]">
                    {audioStatus.customFileName}
                  </strong>
                </span>
              ) : (
                <span>
                  Sumber Audio:{" "}
                  <strong className="text-[#f5efe6]">
                    YouTube ({AUDIO_SEGMENT.youtubeVideoId} · 1:40–1:58)
                  </strong>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] text-[#d6cfc5] transition hover:border-[#d4af37]/40 hover:text-[#f5efe6]"
              >
                <Upload className="h-3 w-3" />
                <span>Pakai File Audio Lokal (Opsional)</span>
              </button>

              {audioStatus.mode === "custom-file" && (
                <button
                  type="button"
                  onClick={onResetYoutubeAudio}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] text-[#d6cfc5] transition hover:border-[#d4af37]/40 hover:text-[#f5efe6]"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Kembali ke YouTube</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
