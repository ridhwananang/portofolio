import {
    X,
    Send,
    CheckCircle2,
    Mail,
    Copy,
    Check,
    Briefcase,
    Building2,
    Sparkles,
    ArrowUpRight,
    Clock,
    MapPin,
    AlertCircle,
    ChevronDown,
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
    githubUrl?: string;
}

type IntentType = 'project' | 'hiring' | 'general';

export default function ContactModal({
    isOpen,
    onClose,
    profileEmail = 'ridhwananang@gmail.com',
    whatsappNumber = '081298502177',
    linkedinUrl = 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/',
    githubUrl = 'https://github.com/ridhwananang',
}: ContactModalProps) {
    const [intent, setIntent] = useState<IntentType>('project');
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formRole, setFormRole] = useState('Full-Time Remote');
    const [formProjectTopic, setFormProjectTopic] = useState('');
    const [formCollaborationType, setFormCollaborationType] = useState('Partner Teknis / Co-Development');
    const [formSubject, setFormSubject] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Lock document scroll and handle Escape key to prevent glitchy background scrolling
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Prevent layout shift from scrollbar disappearing
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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
        intent === 'project'
            ? `Halo Ridhwan, saya melihat portofolio Anda dan tertarik untuk mendiskusikan peluang kolaborasi proyek. Bisakah kita jadwalkan waktu untuk diskusi?`
            : intent === 'hiring'
            ? `Halo Ridhwan, kami tertarik dengan profil dan portofolio Anda untuk peluang kerja di tim kami. Bisakah kita terhubung?`
            : `Halo Ridhwan, saya melihat portofolio Anda dan ingin berdiskusi seputar software engineering.`
    );

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
            setErrorMessage('Harap lengkapi semua kolom yang wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        let formattedSubject = '';
        let structuredMessage = formMessage.trim();

        if (intent === 'project') {
            formattedSubject = `[KOLABORASI] ${formProjectTopic.trim() || 'Proyek'} - ${formName.trim()}`;
            structuredMessage = `${formMessage.trim()}\n\n---\n🤝 Detail Kolaborasi Proyek:\n• Topik / Proyek: ${formProjectTopic.trim() || 'Kolaborasi Teknis'}\n• Bentuk Kolaborasi: ${formCollaborationType}\n• Kontak: ${formName.trim()} (${formEmail.trim()})`;
        } else if (intent === 'hiring') {
            formattedSubject = `[REKRUTMEN] ${formRole}${formCompany ? ` di ${formCompany.trim()}` : ''} - ${formName.trim()}`;
            structuredMessage = `${formMessage.trim()}\n\n---\n🏢 Detail Rekrutmen:\n• Perusahaan: ${formCompany.trim() || 'N/A'}\n• Tipe Posisi: ${formRole}\n• Kontak: ${formName.trim()} (${formEmail.trim()})`;
        } else {
            formattedSubject = formSubject.trim() ? `[DISKUSI] ${formSubject.trim()}` : `[DISKUSI] Pesan dari ${formName.trim()}`;
        }

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
                    subject: formattedSubject,
                    message: structuredMessage,
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

            localStorage.setItem('user_contact_email', formEmail.trim());
            localStorage.setItem('user_contact_name', formName.trim());
            setIsSubmitted(true);

            // Reset form fields
            setFormName('');
            setFormEmail('');
            setFormCompany('');
            setFormProjectTopic('');
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-3 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto overscroll-contain"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 14 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative my-auto flex w-full max-w-4xl max-h-[calc(100dvh-2rem)] md:max-h-[min(90vh,680px)] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-2xl dark:border-amber-500/30 dark:bg-[#080e21]"
            >
                {/* Champagne Gold Specular Top Hairline */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none z-30" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 flex size-8 sm:size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-500 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-zinc-300 dark:hover:border-amber-400/40 dark:hover:bg-[#12214a] dark:hover:text-amber-300 cursor-pointer active:scale-95"
                    aria-label="Tutup modal"
                >
                    <X size={16} />
                </button>

                {/* Main Two-Column Structure */}
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-y-auto md:overflow-visible">
                    {/* Left Column: Direct Fast-Track Channels (5 cols - Anchored on desktop) */}
                    <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/80 bg-zinc-50/80 p-5 sm:p-6 md:p-7 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#091124] dark:to-[#070b1a] relative overflow-hidden shrink-0">
                        {/* Subtle background glow */}
                        <div className="absolute -top-16 -left-16 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                        <div className="space-y-4 sm:space-y-5 relative z-10">
                            {/* Availability Status Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-400 shadow-xs">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                                    Tersedia untuk Kolaborasi
                                </span>
                            </div>

                            {/* Title & Introduction */}
                            <div className="space-y-1.5">
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                                    Mari Bekerja Sama
                                    <Sparkles size={18} className="text-amber-500 dark:text-amber-400" />
                                </h3>
                                <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                                    Punya peluang karir, ide proyek untuk dikembangkan bersama, atau ingin berdiskusi teknis? Silakan kontak langsung atau kirim detail pesan.
                                </p>
                            </div>

                            {/* Direct Communication Channels */}
                            <div className="space-y-2.5 pt-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                                    Akses Instan & Langsung
                                </span>

                                {/* 1-Click Copy Email Pill */}
                                <div
                                    onClick={handleCopyEmail}
                                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200/90 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs dark:border-white/10 dark:bg-[#0c162f]/80 dark:hover:border-amber-400/40 dark:hover:bg-[#101e3e] active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                                            <Mail size={16} />
                                        </div>
                                        <div className="text-left truncate">
                                            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400/80 font-bold">Email Langsung</p>
                                            <p className="text-xs sm:text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 font-mono truncate">
                                                {profileEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] sm:text-[10.5px] font-mono font-medium transition-colors bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 group-hover:border-amber-400/30">
                                        {copiedEmail ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                                <Check size={11} /> Tersalin!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 group-hover:text-amber-500 dark:group-hover:text-amber-300">
                                                <Copy size={11} /> Salin
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Official WhatsApp Fast-Track with Authentic WhatsApp Icon */}
                                <a
                                    href={`https://wa.me/${normalizedWa}?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-3 sm:p-3.5 shadow-2xs transition-all hover:bg-emerald-50 hover:border-emerald-500/50 hover:shadow-xs dark:border-emerald-500/30 dark:bg-gradient-to-r dark:from-emerald-950/30 dark:via-[#091a22] dark:to-[#0a1824] dark:hover:border-emerald-400/60 dark:hover:shadow-[0_4px_20px_rgba(16,185,129,0.2)] active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                                            <SiWhatsapp size={18} />
                                        </div>
                                        <div className="text-left truncate">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">WhatsApp Fast-Track</p>
                                                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">Online</span>
                                            </div>
                                            <p className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight truncate">
                                                {displayPhone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
                                        <span className="hidden sm:inline text-[11px] font-mono">Chat</span>
                                        <ArrowUpRight size={15} />
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Trust Signals Footer */}
                        <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-white/10 space-y-2 relative z-10">
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <Clock size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                <span>Rata-rata respons: <strong className="text-zinc-900 dark:text-white">&lt; 4 jam</strong> (Prioritas Utama)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <MapPin size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                                <span>Tangerang Selatan, Banten • WIB (UTC+7)</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    LinkedIn ↗
                                </a>
                                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                >
                                    GitHub ↗
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form (7 cols - Independently scrollable on short screens) */}
                    <div className="md:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between bg-white dark:bg-[#080e21] relative md:max-h-[640px] md:overflow-y-auto">
                        {/* Ambient glow in dark mode */}
                        <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

                        {isSubmitted ? (
                            <div className="my-auto flex flex-col items-center justify-center py-10 px-4 text-center relative z-10">
                                <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                    Pesan Berhasil Terkirim!
                                </h4>
                                <p className="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                    Pesan Anda telah tersimpan dengan aman di inbox prioritas. Konfirmasi dan respon teknis akan dikirimkan ke email Anda dalam waktu <strong className="text-amber-600 dark:text-amber-400">&lt; 4 jam</strong>.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-[#0c162f] dark:text-zinc-300 dark:hover:border-amber-400/40 dark:hover:text-white transition-all cursor-pointer"
                                    >
                                        Kirim Pesan Lain
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:brightness-110 transition-all cursor-pointer shadow-md"
                                    >
                                        Selesai & Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
                                {/* Intent Switcher Tabs */}
                                <div className="pr-8 sm:pr-10">
                                    <label className="mb-1.5 block text-[10.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-amber-400/90 font-bold">
                                        Pilih Kategori Pesan
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-zinc-200/90 bg-zinc-100/80 p-1 dark:border-white/10 dark:bg-[#0c162f]/90">
                                        <button
                                            type="button"
                                            onClick={() => setIntent('project')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                                                intent === 'project'
                                                    ? 'bg-white text-zinc-900 shadow-2xs dark:bg-amber-400/15 dark:text-amber-300 dark:border dark:border-amber-400/40 dark:shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-transparent'
                                            }`}
                                        >
                                            <Briefcase size={13} className={intent === 'project' ? 'text-amber-500 dark:text-amber-400' : ''} />
                                            <span>Kolaborasi</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('hiring')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                                                intent === 'hiring'
                                                    ? 'bg-white text-zinc-900 shadow-2xs dark:bg-amber-400/15 dark:text-amber-300 dark:border dark:border-amber-400/40 dark:shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-transparent'
                                            }`}
                                        >
                                            <Building2 size={13} className={intent === 'hiring' ? 'text-amber-500 dark:text-amber-400' : ''} />
                                            <span>Rekrutmen</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('general')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                                                intent === 'general'
                                                    ? 'bg-white text-zinc-900 shadow-2xs dark:bg-amber-400/15 dark:text-amber-300 dark:border dark:border-amber-400/40 dark:shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-transparent'
                                            }`}
                                        >
                                            <Sparkles size={13} className={intent === 'general' ? 'text-amber-500 dark:text-amber-400' : ''} />
                                            <span>Diskusi</span>
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
                                        <AlertCircle size={15} className="shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Nama Lengkap <span className="text-amber-500 dark:text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Nama Anda"
                                            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Alamat Email <span className="text-amber-500 dark:text-amber-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="email@company.com"
                                            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d] dark:focus:ring-amber-400/20"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields: Project Collaboration Intent */}
                                {intent === 'project' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Topik / Nama Proyek
                                            </label>
                                            <input
                                                type="text"
                                                value={formProjectTopic}
                                                onChange={(e) => setFormProjectTopic(e.target.value)}
                                                placeholder="Contoh: Platform FinTech, MVP Startup, dsb."
                                                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Bentuk Kolaborasi
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formCollaborationType}
                                                    onChange={(e) => setFormCollaborationType(e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 pr-9 text-xs sm:text-sm text-zinc-900 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f] dark:text-white dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d] cursor-pointer"
                                                >
                                                    <option value="Partner Teknis / Co-Development" className="dark:bg-[#080e21]">Partner Teknis / Co-Development</option>
                                                    <option value="Backend & Database Engineering" className="dark:bg-[#080e21]">Backend & Database Engineering</option>
                                                    <option value="Frontend Modern (React + TypeScript)" className="dark:bg-[#080e21]">Frontend Modern (React + TypeScript)</option>
                                                    <option value="Riset / Proyek Open Source & AI" className="dark:bg-[#080e21]">Riset / Proyek Open Source & AI</option>
                                                    <option value="Konsultasi & Code Review" className="dark:bg-[#080e21]">Konsultasi & Code Review</option>
                                                    <option value="Kolaborasi Lainnya" className="dark:bg-[#080e21]">Kolaborasi Lainnya</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Fields: Hiring Intent */}
                                {intent === 'hiring' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Nama Perusahaan / Startup
                                            </label>
                                            <input
                                                type="text"
                                                value={formCompany}
                                                onChange={(e) => setFormCompany(e.target.value)}
                                                placeholder="PT Teknologi Unggul"
                                                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Tipe Posisi
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formRole}
                                                    onChange={(e) => setFormRole(e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 pr-9 text-xs sm:text-sm text-zinc-900 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f] dark:text-white dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d] cursor-pointer"
                                                >
                                                    <option value="Full-Time Remote" className="dark:bg-[#080e21]">Full-Time Remote</option>
                                                    <option value="Full-Time Hybrid / Onsite" className="dark:bg-[#080e21]">Full-Time Hybrid / Onsite</option>
                                                    <option value="Kontrak Rekayasa Software" className="dark:bg-[#080e21]">Kontrak Rekayasa Software</option>
                                                    <option value="Part-Time / Advisory" className="dark:bg-[#080e21]">Part-Time / Advisory</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Fields: General Intent */}
                                {intent === 'general' && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Topik Bahasan
                                        </label>
                                        <input
                                            type="text"
                                            value={formSubject}
                                            onChange={(e) => setFormSubject(e.target.value)}
                                            placeholder="Diskusi teknis arsitektur Laravel, React 19, optimasi database, atau networking..."
                                            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d]"
                                        />
                                    </div>
                                )}

                                {/* Message Textarea */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Isi Pesan <span className="text-amber-500 dark:text-amber-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formMessage}
                                        onChange={(e) => setFormMessage(e.target.value)}
                                        placeholder={
                                            intent === 'project'
                                                ? 'Ceritakan tentang ide proyek yang ingin dikembangkan atau tujuan kolaborasi teknis Anda...'
                                                : intent === 'hiring'
                                                ? 'Sebutkan gambaran peran kerja, tech stack, atau link informasi lowongan kerja...'
                                                : 'Tuliskan pesan atau pertanyaan teknis Anda secara jelas...'
                                        }
                                        className="w-full resize-none rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-[#0c162f]/80 dark:text-white dark:placeholder-zinc-500 dark:focus:border-amber-400/70 dark:focus:bg-[#101c3d]"
                                    />
                                </div>

                                {/* Luxury Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="luxury-btn-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="size-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                                            <span>Mengirimkan Pesan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            <span>
                                                {intent === 'project'
                                                    ? 'Kirim Pesan Kolaborasi'
                                                    : intent === 'hiring'
                                                    ? 'Kirim Informasi Peluang Kerja'
                                                    : 'Kirim Pesan Sekarang'}
                                            </span>
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
