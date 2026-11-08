import {
    X,
    Send,
    CheckCircle2,
    Mail,
    MessageSquare,
    Copy,
    Check,
    Briefcase,
    Building2,
    Sparkles,
    ArrowUpRight,
    Clock,
    MapPin,
    Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileEmail?: string;
    linkedinUrl?: string;
    githubUrl?: string;
}

type IntentType = 'project' | 'hiring' | 'general';

export default function ContactModal({
    isOpen,
    onClose,
    profileEmail = 'ridhwananang@gmail.com',
    linkedinUrl = 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/',
    githubUrl = 'https://github.com/ridhwananang',
}: ContactModalProps) {
    const [intent, setIntent] = useState<IntentType>('project');
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formRole, setFormRole] = useState('Full-Time Remote');
    const [formService, setFormService] = useState('Fullstack Web Application');
    const [formBudget, setFormBudget] = useState('Rp 5 - 15 Juta');
    const [formSubject, setFormSubject] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);

    if (!isOpen) {
        return null;
    }

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(profileEmail);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const whatsappMessage = encodeURIComponent(
        intent === 'project'
            ? `Halo Ridhwan, saya ingin mendiskusikan pembuatan proyek web (${formService}) dengan estimasi budget ${formBudget}. Bisakah kita jadwalkan diskusi teknis?`
            : intent === 'hiring'
            ? `Halo Ridhwan, kami tertarik dengan profil Anda untuk peluang kerja di tim kami. Bisakah kita terhubung?`
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
            formattedSubject = `[PROYEK] ${formService} (${formBudget}) - ${formName.trim()}`;
            structuredMessage = `${formMessage.trim()}\n\n---\n📋 Ringkasan Kebutuhan Proyek:\n• Layanan: ${formService}\n• Estimasi Budget: ${formBudget}\n• Klien: ${formName.trim()} (${formEmail.trim()})`;
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-3 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-2xl dark:border-amber-500/30 dark:bg-[#0c152a]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 rounded-lg border border-zinc-200 bg-white/90 p-1.5 text-zinc-500 shadow-2xs transition-all hover:bg-zinc-100 hover:text-zinc-800 dark:border-blue-400/20 dark:bg-[#0f1b38] dark:text-zinc-300 dark:hover:text-amber-400 cursor-pointer"
                    aria-label="Tutup modal"
                >
                    <X size={16} />
                </button>

                {/* Main Two-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
                    {/* Left Column: Direct Fast-Track Channels (5 cols) */}
                    <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/80 bg-zinc-50/80 p-5 sm:p-7 dark:border-blue-400/15 dark:bg-[#080e22]">
                        <div className="space-y-5">
                            {/* Availability Status Badge */}
                            <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-600 dark:text-amber-300">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                                <span className="text-[10.5px] font-mono font-semibold tracking-wider uppercase">
                                    Tersedia untuk Kolaborasi
                                </span>
                            </div>

                            {/* Title & Introduction */}
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Mari Bekerja Sama
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    Punya ide proyek, kebutuhan sistem backend yang kokoh, atau ingin berdiskusi seputar peluang kerja sama?
                                </p>
                            </div>

                            {/* Direct Communication Channels */}
                            <div className="space-y-2.5 pt-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80 dark:text-amber-400/80 font-bold">
                                    Akses Instan & Langsung
                                </span>

                                {/* 1-Click Copy Email Pill */}
                                <div
                                    onClick={handleCopyEmail}
                                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200/90 bg-white p-3 shadow-2xs transition-all hover:border-amber-400 dark:border-blue-400/15 dark:bg-[#0c162f] dark:hover:border-amber-400/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-[#091126] dark:text-amber-400">
                                            <Mail size={15} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-400">Email Langsung</p>
                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                                                {profileEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded px-2 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-[#091126] dark:text-amber-300">
                                        {copiedEmail ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <Check size={11} /> Tersalin!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Copy size={11} /> Salin
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* WhatsApp Fast-Track */}
                                <a
                                    href={`https://wa.me/6281280628236?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-3 shadow-2xs transition-all hover:bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                                            <MessageSquare size={15} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">WhatsApp Fast-Track</p>
                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                Diskusi Cepat & Respon Kilat
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                                </a>
                            </div>
                        </div>

                        {/* Trust Signals Footer */}
                        <div className="mt-5 pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                <Clock size={12} className="text-zinc-400" />
                                <span>Rata-rata respons: <strong>&lt; 4 jam</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                <MapPin size={12} className="text-zinc-400" />
                                <span>Tangerang Selatan • WIB (UTC+7)</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1 text-xs">
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    LinkedIn ↗
                                </a>
                                <span>•</span>
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    GitHub ↗
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form (7 cols) */}
                    <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
                        {isSubmitted ? (
                            <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
                                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    Pesan Berhasil Terkirim!
                                </h4>
                                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    Pesan Anda telah tersimpan dengan aman di inbox prioritas. Anda akan menerima balasan email dalam kurun waktu kurang dari 4 jam.
                                </p>

                                <div className="mt-5 flex items-center gap-2">
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        Kirim Pesan Lain
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {/* Intent Switcher Tabs */}
                                <div>
                                    <label className="mb-1.5 block text-[10.5px] font-mono uppercase tracking-wider text-zinc-500">
                                        Pilih Kategori Pesan
                                    </label>
                                    <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200/90 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                                        <button
                                            type="button"
                                            onClick={() => setIntent('project')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                                                intent === 'project'
                                                    ? 'bg-amber-500/15 text-amber-600 font-bold shadow-2xs dark:bg-amber-400/20 dark:text-amber-300 dark:border dark:border-amber-400/30'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-200'
                                            }`}
                                        >
                                            <Briefcase size={12} />
                                            <span>Proyek</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('hiring')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                                                intent === 'hiring'
                                                    ? 'bg-amber-500/15 text-amber-600 font-bold shadow-2xs dark:bg-amber-400/20 dark:text-amber-300 dark:border dark:border-amber-400/30'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-200'
                                            }`}
                                        >
                                            <Building2 size={12} />
                                            <span>Rekrutmen</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('general')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                                                intent === 'general'
                                                    ? 'bg-amber-500/15 text-amber-600 font-bold shadow-2xs dark:bg-amber-400/20 dark:text-amber-300 dark:border dark:border-amber-400/30'
                                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-200'
                                            }`}
                                        >
                                            <Sparkles size={12} />
                                            <span>Diskusi</span>
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Nama Lengkap <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Alamat Email <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="john@company.com"
                                            className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields: Project Intent */}
                                {intent === 'project' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Estimasi Anggaran Proyek
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {[
                                                    '< Rp 5 Juta',
                                                    'Rp 5 - 15 Juta',
                                                    'Rp 15 - 30 Juta',
                                                    '> Rp 30 Juta',
                                                ].map((budget) => (
                                                    <button
                                                        key={budget}
                                                        type="button"
                                                        onClick={() => setFormBudget(budget)}
                                                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                                                            formBudget === budget
                                                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                                                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                                                        }`}
                                                    >
                                                        {budget}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Jenis Layanan
                                            </label>
                                            <select
                                                value={formService}
                                                onChange={(e) => setFormService(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                            >
                                                <option value="Fullstack Web Application">Fullstack Web App (Laravel + React SPA)</option>
                                                <option value="Backend REST API Engineering">Backend Architecture & RESTful API</option>
                                                <option value="Frontend SPA React Integration">Interactive React / TypeScript Frontend</option>
                                                <option value="Database & Performance Optimization">Database Architecture & Query Optimization</option>
                                                <option value="Custom Project / Konsultasi Teknis">Custom Engineering & Konsultasi</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Fields: Hiring Intent */}
                                {intent === 'hiring' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Nama Perusahaan / Startup
                                            </label>
                                            <input
                                                type="text"
                                                value={formCompany}
                                                onChange={(e) => setFormCompany(e.target.value)}
                                                placeholder="PT Teknologi Indonesia"
                                                className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Tipe Posisi
                                            </label>
                                            <select
                                                value={formRole}
                                                onChange={(e) => setFormRole(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                            >
                                                <option value="Full-Time Remote">Full-Time Remote</option>
                                                <option value="Full-Time Hybrid / Onsite">Full-Time Hybrid / Onsite</option>
                                                <option value="Contract / Project-Based">Contract / Project-Based</option>
                                                <option value="Part-Time / Advisory">Part-Time / Advisory</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Fields: General Intent */}
                                {intent === 'general' && (
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Subjek / Topik Bahasan
                                        </label>
                                        <input
                                            type="text"
                                            value={formSubject}
                                            onChange={(e) => setFormSubject(e.target.value)}
                                            placeholder="Pertanyaan seputar Laravel architecture atau kolaborasi..."
                                            className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                        />
                                    </div>
                                )}

                                {/* Message Textarea */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Isi Pesan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={intent === 'project' ? 3 : 4}
                                        value={formMessage}
                                        onChange={(e) => setFormMessage(e.target.value)}
                                        placeholder={
                                            intent === 'project'
                                                ? 'Deskripsikan kebutuhan sistem, fitur utama, dan target tanggal...'
                                                : intent === 'hiring'
                                                ? 'Sebutkan gambaran tim, teknologi yang digunakan, atau link job description...'
                                                : 'Tuliskan pesan Anda secara jelas...'
                                        }
                                        className="w-full resize-none rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2 text-xs sm:text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-zinc-600"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="luxury-btn-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-black active:scale-99 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-zinc-950 border-t-transparent"></div>
                                            <span>Mengirimkan Pesan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>
                                                {intent === 'project'
                                                    ? 'Kirim Permintaan Diskusi Proyek'
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
