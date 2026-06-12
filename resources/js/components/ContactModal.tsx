import {
    X,
    Send,
    CheckCircle2,
    Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName || !formEmail || !formMessage) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: formName,
                    email: formEmail,
                    subject: formSubject || undefined,
                    message: formMessage,
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

            setIsSubmitted(true);

            // Reset form
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2.2rem] border border-slate-150/40 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-950"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                            <Mail size={22} id="modal-mail-icon" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Hubungi Ridhwan
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Kirim pesan langsung ke inbox Ridhwan
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Tutup modal"
                    >
                        <X size={20} id="modal-close-icon" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isSubmitted ? (
                        <div className="animate-fade-in flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-950 dark:text-emerald-400">
                                <CheckCircle2
                                    size={36}
                                    id="success-checkmark-icon"
                                />
                            </div>
                            <h4 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                Pesan Berhasil Dikirim!
                            </h4>
                            <p className="mb-6 max-w-sm text-slate-600 dark:text-slate-400 text-sm">
                                Pesan Anda sudah disimpan dengan aman di database. Ridhwan akan membalas segera melalui email yang diberikan.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            >
                                Kirim Pesan Lain
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleFormSubmit}
                            className="space-y-4"
                        >
                            {errorMessage && (
                                <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-xs font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 animate-fade-in">
                                    {errorMessage}
                                </div>
                            )}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) =>
                                        setFormName(e.target.value)
                                    }
                                    placeholder="Robby Hartono"
                                    className="bg-slate-50/50 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Alamat Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formEmail}
                                    onChange={(e) =>
                                        setFormEmail(e.target.value)
                                    }
                                    placeholder="robby@perusahaan.com"
                                    className="bg-slate-50/50 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Subjek / Topik
                                </label>
                                <input
                                    type="text"
                                    value={formSubject}
                                    onChange={(e) =>
                                        setFormSubject(e.target.value)
                                    }
                                    placeholder="Penawaran Kolaborasi Projek"
                                    className="bg-slate-50/50 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Isi Pesan *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formMessage}
                                    onChange={(e) =>
                                        setFormMessage(e.target.value)
                                    }
                                    placeholder="Halo Ridhwan, saya tertarik untuk mendiskusikan pengembangan backend..."
                                    className="bg-slate-50/50 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900"></div>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            size={15}
                                            id="send-form-icon"
                                        />
                                        Kirim Pesan Sekarang
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
