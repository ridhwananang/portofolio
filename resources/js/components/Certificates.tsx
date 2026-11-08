import { Award, ShieldCheck, Calendar, Eye, Clock, ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react';
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

    const ITEMS_PER_PAGE = 6;
    const [isExpanded, setIsExpanded] = useState(false);

    const safeCertificates = Array.isArray(certificates) ? certificates : [];
    const visibleCertificates = isExpanded ? safeCertificates : safeCertificates.slice(0, ITEMS_PER_PAGE);

    useEffect(() => {
        setIsExpanded(false);
    }, [safeCertificates.length]);

    const handlePreview = (cert: CertificateItem) => {
        setPreviewUrl(cert.file_url);
        setPreviewThumbnailUrl(cert.thumbnail_url || null);
        setPreviewTitle(cert.title);
        setIsPreviewOpen(true);
    };

    const totalHours = safeCertificates.reduce((sum, cert) => {
        const match = cert.duration ? cert.duration.match(/\d+/) : null;
        return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);

    return (
        <section id="sertifikat" className="w-full scroll-mt-28 border-t border-zinc-200/80 pt-8 dark:border-white/10">
            {/* Section Header */}
            <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Sertifikasi & Lisensi
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Kurikulum industri yang telah diselesaikan dan diverifikasi resmi
                    </p>
                </div>

                {!loading && safeCertificates.length > 0 && (
                    <div className="flex items-center gap-2.5 rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3.5 py-1 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs w-fit">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-emerald-500" />
                            {safeCertificates.length} Sertifikat Terverifikasi
                        </span>
                        {totalHours > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-violet-500" />
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
                            className="luxury-card h-52 w-full animate-pulse rounded-xl p-5"
                        />
                    ))}
                </div>
            ) : (
                /* Main certificates grid */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCertificates.map((cert) => {
                            const isAchievement =
                                cert.category.toLowerCase().includes('achievement') ||
                                cert.category.toLowerCase().includes('kelulusan') ||
                                cert.title.toLowerCase().includes('coding camp');

                            return (
                                <div
                                    key={cert.id}
                                    onClick={() => handlePreview(cert)}
                                    className={`luxury-card transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer select-none ${
                                        isAchievement
                                            ? 'border-amber-400/70 bg-gradient-to-b from-amber-50/30 via-white to-white dark:border-amber-500/40 dark:from-amber-950/20 dark:via-[#0c0f17] dark:to-[#0c0f17] shadow-[0_4px_24px_rgba(245,158,11,0.12)]'
                                            : 'hover:border-zinc-300 dark:hover:border-white/20'
                                    } group`}
                                >
                                    {/* Top Specular Rim Light */}
                                    <div className="specular-top" />

                                    <div className="space-y-3.5">
                                        {/* Certificate Static Thumbnail Preview */}
                                        <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-zinc-200/90 bg-zinc-950 dark:border-white/10 shadow-sm">
                                            <img
                                                src={cert.thumbnail_url || cert.file_url}
                                                alt={`Thumbnail ${cert.title}`}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                                                <span className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-md">
                                                    <Eye size={12} />
                                                    <span>Pratinjau Sertifikat</span>
                                                </span>
                                            </div>

                                            {isAchievement && (
                                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9.5px] font-mono font-bold text-white shadow-md">
                                                    <Sparkles size={10} />
                                                    <span>Kelulusan Utama</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span
                                                className={`uppercase font-bold tracking-wider ${
                                                    isAchievement
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-zinc-400 dark:text-zinc-500'
                                                }`}
                                            >
                                                {cert.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                                {cert.duration && (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {cert.duration}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>{cert.date}</span>
                                            </div>
                                        </div>

                                        {/* Title & Shield Stamp */}
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className={`mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-lg border shadow-xs ${
                                                    isAchievement
                                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400'
                                                }`}
                                            >
                                                <ShieldCheck size={15} />
                                            </div>
                                            <h4
                                                className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
                                                    isAchievement
                                                        ? 'text-zinc-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400'
                                                        : 'text-zinc-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400'
                                                }`}
                                            >
                                                {cert.title}
                                            </h4>
                                        </div>

                                        {/* Skills Tags */}
                                        {cert.skills && Array.isArray(cert.skills) && (
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {cert.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="rounded-md border border-zinc-200/70 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono font-medium text-zinc-600 dark:text-zinc-300 shadow-2xs"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Info / Issuer */}
                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200/70 dark:border-white/[0.07] pt-3 text-[10.5px] font-mono text-zinc-500 dark:text-zinc-400">
                                        <div className="truncate">
                                            {cert.credential_id ? (
                                                <span>
                                                    ID: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cert.credential_id}</span>
                                                </span>
                                            ) : (
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{cert.issuer}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
                                            <Eye size={12} />
                                            <span>Lihat</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeCertificates.length > ITEMS_PER_PAGE && (
                        <div className="mt-8 flex justify-center w-full">
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
                                className="luxury-btn-secondary flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
