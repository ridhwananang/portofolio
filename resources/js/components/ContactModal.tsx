import {
    X,
    Send,
    CheckCircle2,
    Mail,
    Copy,
    Check,
    Sparkles,
    ArrowUpRight,
    Clock,
    MapPin,
    AlertCircle,
    MessageSquare,
    User,
    Tag,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { SiWhatsapp } from 'react-icons/si';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileEmail?: string;
    whatsappNumber?: string;
    linkedinUrl?: string;
}

const QUICK_TOPICS = [
    { label: '💼 Tawaran Proyek', topic: 'Diskusi Pengembangan Proyek Web' },
    { label: '🏢 Peluang Kerja', topic: 'Peluang Karir / Rekrutmen Software Engineer' },
    { label: '⚡ Konsultasi Teknis', topic: 'Konsultasi Arsitektur & Rekayasa Sistem' },
    { label: '☕ Diskusi Santai', topic: 'Diskusi Santai & Networking Teknis' },
];

export default function ContactModal({
    isOpen,
    onClose,
    profileEmail = 'ridhwananang@gmail.com',
    whatsappNumber = '081298502177',
    linkedinUrl = 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/',
}: ContactModalProps) {
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);

    const resetForm = () => {
        setFormName('');
        setFormEmail('');
        setFormSubject('');
        setFormMessage('');
        setIsSubmitted(false);
        setErrorMessage('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Lock document scroll and handle Escape key without inducing body layout shifts
    useEffect(() => {
        if (!isOpen) {
            resetForm();
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const cleanWa = (whatsappNumber || '081298502177').replace(/\D/g, '');
    const normalizedWa = cleanWa.startsWith('0')
        ? '62' + cleanWa.slice(1)
        : cleanWa.startsWith('62')
        ? cleanWa
        : '62' + cleanWa;

    const displayPhone = '+62 812-9850-2177';

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(profileEmail);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const whatsappMessage = encodeURIComponent(
        'Halo Ridhwan, saya melihat portofolio Anda dan tertarik untuk berdiskusi lebih lanjut. Apakah ada waktu untuk terhubung?'
    );

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
            setErrorMessage('Harap lengkapi semua kolom yang wajib diisi (Nama, Email, dan Pesan).');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        const finalSubject = formSubject.trim() || `Pesan dari ${formName.trim()}`;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: formName.trim(),
                    email: formEmail.trim(),
                    subject: finalSubject,
                    message: formMessage.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const validationErrors = Object.values(data.errors).flat().join(' ');
                    throw new Error(validationErrors);
                }
                throw new Error(data.message || 'Gagal mengirim pesan.');
            }

            try {
                localStorage.setItem('user_contact_email', formEmail.trim());
                localStorage.setItem('user_contact_name', formName.trim());
            } catch {
                // Ignore localStorage errors
            }

            setIsSubmitted(true);

            // Cleanly reset all input form fields on successful submission
            setFormName('');
            setFormEmail('');
            setFormSubject('');
            setFormMessage('');
        } catch (error: any) {
            setErrorMessage(error.message || 'Koneksi terganggu. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            id="contact-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 dark:bg-black/80 p-2 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto overscroll-contain scrollbar-none"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 14 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative my-auto flex w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] md:max-h-[min(90vh,680px)] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080e21] shadow-2xl shadow-slate-900/10 dark:shadow-black/70 transition-colors"
            >
                {/* Champagne Gold Specular Top Hairline */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent pointer-events-none z-30" />

                {/* Close Button with high touch area & visibility */}
                <button
                    onClick={handleClose}
                    className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-500 shadow-xs transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 dark:border-slate-700 dark:bg-[#0c162f] dark:text-slate-300 dark:hover:border-amber-400/50 dark:hover:bg-[#12214a] dark:hover:text-amber-300 cursor-pointer active:scale-95"
                    aria-label="Tutup dialog kontak"
                >
                    <X size={17} />
                </button>

                {/* Main Two-Column Structure */}
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-y-auto md:overflow-visible">
                    {/* Left Column: Direct Fast-Track Channels (Solid crisp background in both modes) */}
                    <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060b18] p-5 sm:p-6 md:p-7 relative overflow-hidden shrink-0">
                        <div className="space-y-4 sm:space-y-5 relative z-10">
                            {/* Availability Status Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 text-emerald-700 dark:text-emerald-400 shadow-2xs">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-[10.5px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                                    Tersedia untuk Kolaborasi
                                </span>
                            </div>

                            {/* Title & Introduction */}
                            <div className="space-y-1.5">
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    Mari Bekerja Sama
                                    <Sparkles size={18} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                </h3>
                                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                                    Punya ide proyek, kebutuhan sistem backend yang andal, tawaran posisi kerja, atau ingin berdiskusi teknis? Silakan kontak langsung atau kirim pesan.
                                </p>
                            </div>

                            {/* Direct Fast-Track Channels */}
                            <div className="space-y-2.5 pt-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                                    Akses Cepat & Langsung
                                </span>

                                {/* 1-Click Copy Email Pill */}
                                <div
                                    onClick={handleCopyEmail}
                                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-[#0c162f] dark:hover:border-amber-400/60 dark:hover:bg-[#0f1f42] active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
                                            <Mail size={17} />
                                        </div>
                                        <div className="text-left truncate">
                                            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Email Pribadi</p>
                                            <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-mono truncate">
                                                {profileEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] sm:text-[10.5px] font-mono font-bold transition-all bg-slate-100 text-slate-700 dark:bg-slate-800/90 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group-hover:border-amber-400/50">
                                        {copiedEmail ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                                <Check size={11} /> Tersalin!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                                                <Copy size={11} /> Salin
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Official WhatsApp Fast-Track (Uniform, high-contrast & authentic in both modes) */}
                                <a
                                    href={`https://wa.me/${normalizedWa}?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-[#0c162f] dark:hover:border-emerald-500/60 dark:hover:bg-[#0f1f42] active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_0_14px_rgba(37,211,102,0.35)] group-hover:scale-105 transition-transform">
                                            <SiWhatsapp size={19} />
                                        </div>
                                        <div className="text-left truncate">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">WhatsApp Fast-Track</p>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                                    <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-mono tracking-tight truncate">
                                                {displayPhone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
                                        <span className="hidden sm:inline text-[11px] font-mono">Chat</span>
                                        <ArrowUpRight size={15} />
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Trust Signals Footer */}
                        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2 relative z-10">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Clock size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                <span>Rata-rata respons: <strong className="text-slate-900 dark:text-white">&lt; 4 jam</strong> (Prioritas Utama)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <MapPin size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                <span>Tangerang Selatan, Banten • WIB (UTC+7)</span>
                            </div>
                            {linkedinUrl && (
                                <div className="flex items-center pt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                                    <a
                                        href={linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-amber-600 dark:hover:text-amber-400 font-semibold transition-colors inline-flex items-center gap-1"
                                    >
                                        LinkedIn Profile ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Unified Contact Form (7 cols) */}
                    <div className="md:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between bg-white dark:bg-[#080e21] relative md:max-h-[640px] md:overflow-y-auto scrollbar-none">
                        {isSubmitted ? (
                            <div className="my-auto flex flex-col items-center justify-center py-10 px-4 text-center relative z-10">
                                <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Pesan Berhasil Terkirim!
                                </h4>
                                <p className="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    Pesan Anda telah tersimpan dengan aman di inbox prioritas. Konfirmasi dan respon teknis akan dikirimkan ke email Anda dalam waktu <strong className="text-amber-600 dark:text-amber-400">&lt; 4 jam</strong>.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormName('');
                                            setFormEmail('');
                                            setFormSubject('');
                                            setFormMessage('');
                                            setIsSubmitted(false);
                                        }}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-[#0c162f] dark:text-slate-300 dark:hover:border-amber-400/40 dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                                    >
                                        Kirim Pesan Lain
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="luxury-btn-primary rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
                                    >
                                        Selesai & Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
                                <div className="pr-8 sm:pr-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                                            Kirim Pesan Langsung
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Silakan isi detail pesan di bawah. Pesan langsung terkirim ke inbox pribadi saya.
                                    </p>
                                </div>

                                {errorMessage && (
                                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/95 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                        <AlertCircle size={15} className="shrink-0 text-rose-500" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            <User size={12} className="text-slate-400 dark:text-amber-400/80" />
                                            <span>Nama Lengkap</span>
                                            <span className="text-amber-500 font-black">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Rian Pratama"
                                            className="w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-[#0c162f] dark:text-white dark:placeholder-slate-500 dark:hover:border-slate-600 dark:focus:border-amber-400/80 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            <Mail size={12} className="text-slate-400 dark:text-amber-400/80" />
                                            <span>Alamat Email</span>
                                            <span className="text-amber-500 font-black">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="rian@company.com"
                                            className="w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-[#0c162f] dark:text-white dark:placeholder-slate-500 dark:hover:border-slate-600 dark:focus:border-amber-400/80 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Subject / Topic with 1-Tap Quick Suggestion Chips */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            <Tag size={12} className="text-slate-400 dark:text-amber-400/80" />
                                            <span>Perihal / Topik Pesan</span>
                                            <span className="text-[10.5px] font-normal text-slate-400">(Opsional)</span>
                                        </label>
                                    </div>

                                    {/* 1-Tap Quick Topics helper chips */}
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                        {QUICK_TOPICS.map((item) => {
                                            const isSelected = formSubject === item.topic;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => setFormSubject(isSelected ? '' : item.topic)}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                                                        isSelected
                                                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs dark:bg-amber-400 dark:text-slate-950 dark:border-amber-400'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#0c162f] dark:text-slate-300 dark:border-slate-700/80 dark:hover:border-amber-400/40 dark:hover:bg-[#12214a] dark:hover:text-amber-300'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <input
                                        type="text"
                                        value={formSubject}
                                        onChange={(e) => setFormSubject(e.target.value)}
                                        placeholder="Ketik topik pesan Anda atau klik pilihan di atas..."
                                        className="w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-[#0c162f] dark:text-white dark:placeholder-slate-500 dark:hover:border-slate-600 dark:focus:border-amber-400/80 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                    />
                                </div>

                                {/* Row 3: Message Textarea */}
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                        <MessageSquare size={12} className="text-slate-400 dark:text-amber-400/80" />
                                        <span>Isi Pesan</span>
                                        <span className="text-amber-500 font-black">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formMessage}
                                        onChange={(e) => setFormMessage(e.target.value)}
                                        placeholder="Tuliskan detail kebutuhan, gambaran proyek, pertanyaan, atau pesan Anda secara jelas..."
                                        className="w-full resize-none rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-slate-700 dark:bg-[#0c162f] dark:text-white dark:placeholder-slate-500 dark:hover:border-slate-600 dark:focus:border-amber-400/80 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                    />
                                </div>

                                {/* Luxury Submit Button with High Contrast & Hover Effects */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="luxury-btn-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black active:scale-[0.99] disabled:opacity-50 shadow-md"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                                            <span>Mengirimkan Pesan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            <span>Kirim Pesan Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
