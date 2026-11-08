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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-950"
            >
                {/* Close Button Floating */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 rounded-full border border-slate-200/60 bg-white/80 p-2 text-slate-500 shadow-xs backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                    aria-label="Tutup modal"
                >
                    <X size={18} />
                </button>

                {/* Main Two-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
                    {/* Left Column: Direct Fast-Track Channels & Trust Signals (5 cols) */}
                    <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/70 bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100/60 p-6 sm:p-8 dark:border-slate-800/80 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-950">
                        <div className="space-y-6">
                            {/* Availability Status Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3 py-1 text-emerald-700 shadow-xs dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-bold tracking-wider uppercase">
                                    Tersedia untuk Kolaborasi
                                </span>
                            </div>

                            {/* Title & Introduction */}
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Mari Bekerja{' '}
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent italic dark:from-violet-400 dark:to-indigo-400">
                                        Sama
                                    </span>
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                                    Punya ide proyek, kebutuhan sistem backend yang kokoh, atau ingin berdiskusi seputar peluang kerja sama?
                                </p>
                            </div>

                            {/* Direct Communication Channels */}
                            <div className="space-y-3 pt-2">
                                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                    Akses Instan & Langsung
                                </span>

                                {/* 1-Click Copy Email Pill */}
                                <div
                                    onClick={handleCopyEmail}
                                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs transition-all hover:border-violet-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-violet-500/40"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                                            <Mail size={17} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Email Utama</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                {profileEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {copiedEmail ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <Check size={13} /> Tersalin!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Copy size={12} /> Salin
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* WhatsApp Fast-Track */}
                                <a
                                    href={`https://wa.me/6281280628236?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-3.5 shadow-xs transition-all hover:border-emerald-500/40 hover:bg-emerald-50 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                                            <MessageSquare size={17} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">WhatsApp Fast-Track</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Diskusi Cepat & Respon Kilat
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-emerald-400" />
                                </a>
                            </div>
                        </div>

                        {/* Trust Signals Footer in Left Panel */}
                        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Clock size={13} className="text-violet-500" />
                                <span>Rata-rata respons: <strong>&lt; 4 jam</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <MapPin size={13} className="text-violet-500" />
                                <span>Tangerang Selatan • WIB (UTC+7)</span>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    LinkedIn ↗
                                </a>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                >
                                    GitHub ↗
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Smart Intent-Based Contact Form (7 cols) */}
                    <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                        {isSubmitted ? (
                            <div className="my-auto flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-950 dark:text-emerald-400">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                    Pesan Berhasil Terkirim!
                                </h4>
                                <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                                    Pesan Anda telah tersimpan dengan aman di inbox prioritas Ridhwan. Anda akan menerima balasan melalui email dalam kurun waktu kurang dari 4 jam kerja.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-all"
                                    >
                                        Kirim Pesan Lain
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 cursor-pointer transition-all"
                                    >
                                        Selesai & Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                {/* Intent Switcher Tabs */}
                                <div>
                                    <label className="mb-2 block text-xs font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Pilih Tujuan Pesan
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60">
                                        <button
                                            type="button"
                                            onClick={() => setIntent('project')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                                                intent === 'project'
                                                    ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-400'
                                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }`}
                                        >
                                            <Briefcase size={14} />
                                            <span>Proyek</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('hiring')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                                                intent === 'hiring'
                                                    ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-400'
                                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }`}
                                        >
                                            <Building2 size={14} />
                                            <span>Rekrutmen</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntent('general')}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                                                intent === 'general'
                                                    ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-400'
                                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }`}
                                        >
                                            <Sparkles size={14} />
                                            <span>Diskusi</span>
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-semibold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Nama Lengkap <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400 dark:focus:bg-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Alamat Email <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            placeholder="john@company.com"
                                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400 dark:focus:bg-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields: Project Intent */}
                                {intent === 'project' && (
                                    <div className="space-y-3.5 animate-fade-in">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Estimasi Anggaran Proyek
                                            </label>
                                            <div className="flex flex-wrap gap-2">
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
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                                            formBudget === budget
                                                                ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/60 dark:text-violet-300'
                                                                : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {budget}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Jenis Layanan yang Dibutuhkan
                                            </label>
                                            <select
                                                value={formService}
                                                onChange={(e) => setFormService(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Nama Perusahaan / Startup
                                            </label>
                                            <input
                                                type="text"
                                                value={formCompany}
                                                onChange={(e) => setFormCompany(e.target.value)}
                                                placeholder="PT Teknologi Indonesia"
                                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Tipe Posisi / Kontrak
                                            </label>
                                            <select
                                                value={formRole}
                                                onChange={(e) => setFormRole(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400"
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
                                    <div className="animate-fade-in">
                                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Subjek / Topik Bahasan
                                        </label>
                                        <input
                                            type="text"
                                            value={formSubject}
                                            onChange={(e) => setFormSubject(e.target.value)}
                                            placeholder="Pertanyaan seputar Laravel architecture atau kolaborasi..."
                                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400"
                                        />
                                    </div>
                                )}

                                {/* Message Textarea */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Isi Pesan / Penjelasan Kebutuhan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={intent === 'project' ? 3 : 4}
                                        value={formMessage}
                                        onChange={(e) => setFormMessage(e.target.value)}
                                        placeholder={
                                            intent === 'project'
                                                ? 'Deskripsikan gambaran sistem yang ingin dibangun, fitur utama, dan target tanggal peluncuran...'
                                                : intent === 'hiring'
                                                ? 'Sebutkan gambaran tim, teknologi yang digunakan, atau link job description...'
                                                : 'Tuliskan pesan Anda secara jelas...'
                                        }
                                        className="w-full resize-none rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:border-violet-400"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>Mengirimkan Pesan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
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
