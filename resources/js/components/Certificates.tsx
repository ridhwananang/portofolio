import { Award, ShieldCheck, Calendar, Eye, Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
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
    thumbnail_url?: string;
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

    // Expand State
    const ITEMS_PER_PAGE = 6;
    const [isExpanded, setIsExpanded] = useState(false);

    const safeCertificates = Array.isArray(certificates) ? certificates : [];
    const visibleCertificates = isExpanded ? safeCertificates : safeCertificates.slice(0, ITEMS_PER_PAGE);

    // Reset expand when certificates change
    useEffect(() => {
        setIsExpanded(false);
    }, [safeCertificates.length]);

    const handlePreview = (cert: CertificateItem) => {
        setPreviewUrl(cert.file_url);
        setPreviewThumbnailUrl(cert.thumbnail_url || null);
        setPreviewTitle(cert.title);
        setIsPreviewOpen(true);
    };

    const getStyleForCategory = (category: string) => {
        const cat = category.toLowerCase();

        if (cat.includes('achievement') || cat.includes('kelulusan')) {
            return {
                color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                dot: 'bg-amber-500',
            };
        }

        if (cat.includes('backend')) {
            return {
                color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                dot: 'bg-emerald-500',
            };
        }

        if (cat.includes('frontend')) {
            return {
                color: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
                dot: 'bg-sky-500',
            };
        }

        if (cat.includes('cloud')) {
            return {
                color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                dot: 'bg-cyan-500',
            };
        }

        if (cat.includes('database') || cat.includes('sql') || cat.includes('query')) {
            return {
                color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
                dot: 'bg-blue-500',
            };
        }

        return {
            color: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400',
            dot: 'bg-violet-500',
        };
    };

    const totalHours = safeCertificates.reduce((sum, cert) => {
        const match = cert.duration ? cert.duration.match(/\d+/) : null;
        return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);

    return (
        <section id="sertifikat" className="w-full scroll-mt-28 border-t border-slate-200/50 pt-10 dark:border-white/10">
            {/* Section Header */}
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 text-violet-600 shadow-2xs dark:border-white/10 dark:bg-slate-900 dark:text-violet-400">
                        <Award
                            size={22}
                            id="certificates-title-icon"
                            strokeWidth={2.2}
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Sertifikasi &{' '}
                            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                Kelulusan
                            </span>
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Kurikulum industri yang telah diselesaikan dan diverifikasi resmi
                        </p>
                    </div>
                </div>

                {!loading && safeCertificates.length > 0 && (
                    <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-slate-100/80 px-4 py-1.5 text-xs font-mono font-bold text-slate-650 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 w-fit">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-500" />
                            {safeCertificates.length} Sertifikat Terverifikasi
                        </span>
                        {totalHours > 0 && (
                            <>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={13} className="text-violet-500" />
                                    {totalHours} Jam Belajar
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card h-64 w-full animate-pulse rounded-[2.2rem] border border-slate-200/60 p-6 dark:border-slate-800/50"
                        />
                    ))}
                </div>
            ) : (
                /* Main certificates grid */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCertificates.map((cert, index) => {
                            const style = getStyleForCategory(cert.category);
                            const isAchievement =
                                cert.category.toLowerCase().includes('achievement') ||
                                cert.category.toLowerCase().includes('kelulusan') ||
                                cert.title.toLowerCase().includes('coding camp');

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: index * 0.04, duration: 0.35 }}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    key={cert.id}
                                    onClick={() => handlePreview(cert)}
                                    className={`glass-card transform-gpu relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 shadow-2xs transition-all duration-300 hover:shadow-xl cursor-pointer group select-none ${
                                        isAchievement
                                            ? 'border-2 border-amber-400/70 bg-gradient-to-b from-amber-50/40 via-white/95 to-white/95 shadow-amber-500/10 hover:border-amber-500 dark:border-amber-500/40 dark:from-amber-950/20 dark:via-slate-900/80 dark:to-slate-900/80'
                                            : 'border border-slate-200/80 bg-white/80 hover:border-violet-500/50 hover:bg-white dark:border-white/10 dark:bg-slate-900/65 dark:hover:border-violet-400/40 dark:hover:bg-slate-900/90'
                                    }`}
                                >
                                    {/* Ambient Glow Accent */}
                                    <div
                                        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-150 ${
                                            isAchievement
                                                ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/20'
                                                : 'bg-gradient-to-tr from-violet-500/15 to-indigo-500/15'
                                        }`}
                                    ></div>

                                    <div className="space-y-4">
                                        {/* Certificate Static Thumbnail Preview */}
                                        <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 dark:border-white/10 dark:bg-slate-950">
                                            <img
                                                src={cert.thumbnail_url || cert.file_url}
                                                alt={`Thumbnail ${cert.title}`}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            {/* Hover overlay hint */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                                                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                                                    <Eye size={13} />
                                                    <span>Pratinjau Sertifikat</span>
                                                </span>
                                            </div>

                                            {isAchievement && (
                                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9.5px] font-black tracking-wide text-white shadow-md">
                                                    <Sparkles size={11} />
                                                    <span>Kelulusan Utama</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Top Metadata */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-[10px] font-mono font-extrabold tracking-widest uppercase ${
                                                    isAchievement
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-slate-400 dark:text-slate-500'
                                                }`}
                                            >
                                                {cert.category}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                                {cert.duration && (
                                                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <Clock size={10} />
                                                        {cert.duration}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {cert.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title & Shield Stamp */}
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex flex-shrink-0 items-center justify-center rounded-xl border p-2.5 ${style.color}`}
                                            >
                                                <ShieldCheck size={18} strokeWidth={2.2} />
                                            </div>
                                            <h4
                                                className={`text-sm font-black leading-snug transition-colors duration-200 ${
                                                    isAchievement
                                                        ? 'text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400'
                                                        : 'text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400'
                                                }`}
                                            >
                                                {cert.title}
                                            </h4>
                                        </div>

                                        {/* Skills Tag List */}
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {cert.skills &&
                                                Array.isArray(cert.skills) &&
                                                cert.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="rounded-md border border-slate-200/70 bg-slate-100/70 px-2 py-0.5 text-[9px] font-semibold text-slate-650 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Bottom Info / Issuer */}
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 text-[10.5px] dark:border-slate-800/70">
                                        <div className="text-slate-500 dark:text-slate-400">
                                            {cert.credential_id ? (
                                                <span>
                                                    ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cert.credential_id}</span>
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{cert.issuer}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye size={12} />
                                            <span>Lihat</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeCertificates.length > ITEMS_PER_PAGE && (
                        <div className="mt-10 flex justify-center w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isExpanded) {
                                        document.getElementById('sertifikat')?.scrollIntoView({ behavior: 'smooth' });
                                        setTimeout(() => setIsExpanded(false), 100);
                                    } else {
                                        setIsExpanded(true);
                                    }
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all hover:border-violet-500 hover:text-violet-600 active:scale-95 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-violet-400 dark:hover:text-violet-400"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Certificate High-Res Lightbox Modal */}
            <CertificatePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title={previewTitle || ''}
                fileUrl={previewUrl || ''}
                thumbnailUrl={previewThumbnailUrl || undefined}
            />
        </section>
    );
}
