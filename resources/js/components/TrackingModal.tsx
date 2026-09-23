import {
    X,
    Search,
    ArrowRight,
    ShieldCheck,
    Clock,
    Hash,
    MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TrackingModal({ isOpen, onClose }: TrackingModalProps) {
    const [trackingCode, setTrackingCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTrackingCode('');
            setError(null);
            setIsSubmitting(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = trackingCode.trim().toUpperCase();

        if (!code) {
            setError('Silakan masukkan kode pelacakan proyek Anda.');
            return;
        }

        if (code.length < 5) {
            setError('Format kode tidak valid. Contoh: PRJ-A1B2C3D4');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        // Direct navigation to tracker page
        window.location.href = `/track-project/${code}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 15 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95 z-10"
                >
                    {/* Background Decorative Glow */}
                    <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/20" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="cursor-pointer absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Tutup (Esc)"
                    >
                        <X size={18} />
                    </button>

                    {/* Modal Header */}
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
                            <Search size={22} />
                        </div>
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:text-violet-300">
                                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                                <span>Live Project Tracker</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Lacak Status Proyek Anda
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Pantau perkembangan pengerjaan, tinjau preview live staging, dan kelola pembayaran rekening bersama (escrow) secara transparan.
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Kode Pelacakan (Tracking Code)
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Hash size={16} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    required
                                    value={trackingCode}
                                    onChange={(e) => {
                                        setTrackingCode(e.target.value.toUpperCase());
                                        if (error) setError(null);
                                    }}
                                    placeholder="Contoh: PRJ-NQITEXMS"
                                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/90 pl-10 pr-4 py-3 text-sm font-mono font-bold tracking-wider text-slate-900 uppercase placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:font-normal outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:focus:border-violet-500 dark:focus:bg-slate-950"
                                />
                            </div>
                            {error && (
                                <p className="mt-1.5 text-xs font-semibold text-rose-500 animate-shake">
                                    {error}
                                </p>
                            )}
                            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                                * Kode tracking diawali dengan prefix <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">PRJ-</span> yang diterbitkan sesaat setelah Anda memesan layanan.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <span>Membuka Halaman Pelacak...</span>
                            ) : (
                                <>
                                    <span>Buka Halaman Pelacakan Proyek</span>
                                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Escrow Reassurance & WhatsApp Help */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <ShieldCheck size={14} />
                                Proteksi Rekber Escrow Aktif
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={13} />
                                Update Real-Time
                            </span>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-950/40 dark:text-slate-400 flex items-center justify-between gap-2 border border-slate-200/60 dark:border-slate-850">
                            <span>Lupa atau kehilangan kode pelacakan Anda?</span>
                            <a
                                href="https://wa.me/6289602520330?text=Halo%20Ridhwan,%20saya%20ingin%20menanyakan%20kode%20tracking%20proyek%20saya"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                            >
                                <MessageCircle size={13} />
                                <span>Bantuan WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
