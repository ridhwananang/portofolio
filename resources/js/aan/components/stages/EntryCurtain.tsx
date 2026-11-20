import gsap from 'gsap';
import { Play, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ExperiencePalette } from '@/aan/types/experience';

interface EntryCurtainProps {
    palette: ExperiencePalette;
    audioReady: boolean;
    onStart: () => void;
}

export function EntryCurtain({
    palette,
    audioReady,
    onStart,
}: EntryCurtainProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const ringRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (cardRef.current) {
                gsap.fromTo(
                    cardRef.current,
                    { y: 22, opacity: 0, scale: 0.96 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1.15,
                        ease: 'power3.out',
                    },
                );
            }

            if (ringRef.current) {
                gsap.to(ringRef.current, {
                    rotation: 360,
                    duration: 32,
                    repeat: -1,
                    ease: 'none',
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <section className="relative z-20 flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-12">
            {/* Soft ambient celestial halo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl sm:h-[36rem] sm:w-[36rem]"
                style={{
                    background: `radial-gradient(circle, ${palette.accentHex}38 0%, rgba(186, 210, 255, 0.1) 46%, transparent 72%)`,
                }}
            />

            <div
                ref={cardRef}
                className="luxury-glass luxury-gold-ring relative w-full max-w-md overflow-hidden rounded-[2rem] px-8 py-12 text-center shadow-[0_32px_90px_rgba(0,0,0,0.85)] sm:px-12 sm:py-14"
            >
                {/* Subtle top shimmer hairline */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-12 top-0 h-[1px]"
                    style={{
                        background: `linear-gradient(90deg, transparent 0%, ${palette.accentHex}88 50%, transparent 100%)`,
                    }}
                />

                {/* Delicate rotating orbital crest */}
                <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center">
                    <div
                        ref={ringRef}
                        className="absolute inset-0 rounded-full border border-dashed"
                        style={{ borderColor: `${palette.accentHex}55` }}
                    >
                        <span
                            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
                            style={{
                                backgroundColor: '#ead49b',
                                boxShadow: `0 0 10px ${palette.accentHex}`,
                            }}
                        />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10">
                        <Sparkles className="h-4 w-4 text-[#ead49b]" />
                    </div>
                </div>

                <p className="font-mono-precision text-[10px] tracking-[0.32em] text-[#ead49b]/80 uppercase">
                    Sebuah Perjalanan Malam
                </p>

                <h1 className="font-editorial mt-3 text-4xl font-medium tracking-tight text-[#f5efe6] sm:text-5xl">
                    Di Bawah{' '}
                    <span className="gold-gradient-text italic">
                        Langit Ini
                    </span>
                </h1>

                <p className="mx-auto mt-3.5 max-w-xs text-xs leading-relaxed text-[#a69f95] sm:text-sm">
                    Nyalakan suara dan nikmati kisahnya dari hitungan pertama
                    hingga akhir.
                </p>

                {/* Luxury Modern "Mulai" CTA */}
                <div className="mt-9 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={onStart}
                        className="group relative inline-flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-full border border-[#ead49b]/70 bg-gradient-to-r from-[#d4af37] via-[#f1dca7] to-[#c99e32] px-10 py-3.5 text-xs font-semibold tracking-[0.24em] text-[#09090d] uppercase shadow-[0_0_38px_rgba(212,175,55,0.32)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_56px_rgba(234,212,155,0.52)] active:scale-[0.98] sm:text-sm"
                    >
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                        />
                        <Play className="relative h-4 w-4 fill-current transition-transform duration-300 group-hover:translate-x-0.5" />
                        <span className="relative">Mulai</span>
                    </button>

                    <div className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#a69f95]/75 uppercase">
                        <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                audioReady
                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]'
                                    : 'animate-pulse bg-[#ead49b]/70'
                            }`}
                        />
                        {/* <span>{audioReady ? "Audio Siap" : "Menyiapkan Audio"}</span> */}
                    </div>
                </div>
            </div>
        </section>
    );
}
