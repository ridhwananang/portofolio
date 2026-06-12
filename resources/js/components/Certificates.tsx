import { Award, ShieldCheck, Calendar, Eye, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import CertificatePreviewModal from './CertificatePreviewModal';

interface CertificateItem {
    id: number;
    title: string;
    category: string;
    issuer: string;
    credential_id?: string;
    date: string;
    duration: string;
    skills: string[];
    file_path: string;
    file_url: string;
}

interface CertificatesProps {
    certificates: CertificateItem[];
    loading: boolean;
}

export default function Certificates({ certificates, loading }: CertificatesProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (cert: CertificateItem) => {
        setPreviewUrl(cert.file_url);
        setPreviewThumbnailUrl(cert.thumbnail_url);
        setPreviewTitle(cert.title);
        setIsPreviewOpen(true);
    };

    const getStyleForCategory = (category: string) => {
        const cat = category.toLowerCase();

        if (cat.includes('backend')) {
            return {
                color: 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
                dot: 'bg-emerald-500',
            };
        }

        if (cat.includes('frontend')) {
            return {
                color: 'border-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400',
                dot: 'bg-sky-550',
            };
        }

        if (cat.includes('database') || cat.includes('sql') || cat.includes('query')) {
            return {
                color: 'border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400',
                dot: 'bg-amber-500',
            };
        }

        return {
            color: 'border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
            dot: 'bg-indigo-500',
        };
    };

    const totalHours = certificates.reduce((sum, cert) => {
        const match = cert.duration ? cert.duration.match(/\d+/) : null;

        return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);

    return (
        <section id="sertifikat" className="w-full scroll-mt-28 border-t border-slate-200/40 pt-8 dark:border-slate-800/20">
            {/* Section Header */}
            <div className="mb-11 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/50 bg-white p-2.5 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                        <Award
                            size={22}
                            id="certificates-title-icon"
                            strokeWidth={2.2}
                        />
                    </div>
                    <div>
                        <h3 className="flex items-baseline text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Sertifikasi &{' '}
                            <span className="ml-2 bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                Kelulusan
                            </span>
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Kurikulum industri yang telah diselesaikan dan diverifikasi
                        </p>
                    </div>
                </div>

                {!loading && certificates.length > 0 && (
                    <div className="flex gap-4 rounded-xl bg-slate-100/80 px-4 py-2 text-xs font-semibold text-slate-650 dark:bg-slate-900/60 dark:text-slate-400 w-fit">
                        <span className="flex items-center gap-1">
                            {certificates.length} Sertifikat
                        </span>
                        <span className="text-slate-300 dark:text-slate-800">•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} className="text-emerald-500" /> {totalHours} Jam Belajar
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card h-56 w-full animate-pulse rounded-[2rem] border border-slate-200/50 p-6 dark:border-slate-800/40"
                        />
                    ))}
                </div>
            ) : (
                /* Main certificates grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert, index) => {
                        const style = getStyleForCategory(cert.category);

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                whileHover={{ y: -4, scale: 1.01 }}
                                key={cert.id}
                                onClick={() => handlePreview(cert)}
                                className="glass-card flex flex-col justify-between gap-5 rounded-[2rem] border border-slate-200/50 bg-white p-6 shadow-sm hover:border-violet-500/40 hover:shadow-md dark:border-slate-800/45 dark:bg-slate-950 dark:hover:border-violet-500/45 transition-all duration-300 cursor-pointer group select-none relative overflow-hidden"
                            >
                                {/* Glow Accent Effect */}
                                <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 blur-lg transition-all group-hover:scale-150"></div>

                                <div className="space-y-3.5">
                                    {/* Certificate Static Thumbnail Preview */}
                                    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-xl border border-slate-200/40 bg-slate-50 dark:border-slate-800/60 dark:bg-slate-950 pointer-events-none select-none">
                                        <img
                                            src={cert.thumbnail_url || cert.file_url}
                                            alt={`Thumbnail ${cert.title}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        {/* Light overlay on hover */}
                                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/[0.02] transition-colors duration-300"></div>
                                    </div>

                                    {/* Top Metadata */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                            {cert.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Calendar size={11} />
                                            {cert.date}
                                        </div>
                                    </div>

                                    {/* Title & Shield stamp */}
                                    <div className="flex items-start gap-3">
                                        <div className={`flex flex-shrink-0 items-center justify-center rounded-xl border p-2.5 ${style.color}`}>
                                            <ShieldCheck size={18} strokeWidth={2.2} />
                                        </div>
                                        <h4 className="text-sm font-extrabold leading-snug text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 transition-colors duration-250">
                                            {cert.title}
                                        </h4>
                                    </div>

                                    {/* Skills tag list */}
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {cert.skills && Array.isArray(cert.skills) && cert.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="dark:text-slate-400 rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-650 dark:border-slate-800/80 dark:bg-slate-900/60"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Info / Click to action */}
                                <div className="mt-2 flex items-center justify-between border-t border-slate-100/70 pt-3.5 text-[10px] dark:border-slate-800/60">
                                    <div className="text-slate-500">
                                        {cert.credential_id ? (
                                            <span>
                                                ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-350">{cert.credential_id}</span>
                                            </span>
                                        ) : (
                                            <span>{cert.issuer}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-violet-650 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Eye size={12} />
                                        <span>Preview</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <CertificatePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileUrl={previewUrl}
                thumbnailUrl={previewThumbnailUrl}
                title={previewTitle}
            />
        </section>
    );
}
