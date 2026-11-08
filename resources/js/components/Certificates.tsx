import { Award, ShieldCheck, Calendar, Eye, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
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
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Sertifikasi & Lisensi
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Kurikulum industri yang telah diselesaikan dan diverifikasi resmi
                    </p>
                </div>

                {!loading && safeCertificates.length > 0 && (
                    <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 w-fit">
                        <span className="flex items-center gap-1">
                            <CheckCircle size={11} className="text-emerald-500" />
                            {safeCertificates.length} Sertifikat
                        </span>
                        {totalHours > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={11} className="text-violet-500" />
                                    {totalHours} Jam
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card h-48 w-full animate-pulse rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                        />
                    ))}
                </div>
            ) : (
                /* Main certificates grid */
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleCertificates.map((cert) => {
                            const isAchievement =
                                cert.category.toLowerCase().includes('achievement') ||
                                cert.category.toLowerCase().includes('kelulusan') ||
                                cert.title.toLowerCase().includes('coding camp');

                            return (
                                <div
                                    key={cert.id}
                                    onClick={() => handlePreview(cert)}
                                    className={`glass-card transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-zinc-300 hover:shadow-xs cursor-pointer select-none ${
                                        isAchievement
                                            ? 'border-amber-400/80 bg-white dark:border-amber-500/40 dark:bg-[#0f1117]'
                                            : 'border-zinc-200/90 bg-white dark:border-white/10 dark:bg-[#0f1117]'
                                    } group`}
                                >
                                    <div className="space-y-3">
                                        {/* Certificate Static Thumbnail Preview */}
                                        <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                                            <img
                                                src={cert.thumbnail_url || cert.file_url}
                                                alt={`Thumbnail ${cert.title}`}
                                                className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-103"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm">
                                                    <Eye size={11} />
                                                    <span>Pratinjau</span>
                                                </span>
                                            </div>

                                            {isAchievement && (
                                                <div className="absolute top-2 left-2 rounded bg-amber-500 px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-xs">
                                                    Kelulusan Utama
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="uppercase text-zinc-400 dark:text-zinc-500">
                                                {cert.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                                {cert.duration && (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                        {cert.duration}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>{cert.date}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 flex-shrink-0 text-zinc-400 dark:text-zinc-500">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug transition-colors group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
                                                {cert.title}
                                            </h4>
                                        </div>

                                        {/* Skills Tags */}
                                        {cert.skills && Array.isArray(cert.skills) && (
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {cert.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="rounded border border-zinc-200/60 bg-zinc-50 px-1.5 py-0.2 text-[9px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Info / Issuer */}
                                    <div className="mt-3.5 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-[10px] font-mono text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                                        <div className="truncate">
                                            {cert.credential_id ? (
                                                <span>
                                                    ID: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cert.credential_id}</span>
                                                </span>
                                            ) : (
                                                <span>{cert.issuer}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
                                            <Eye size={11} />
                                            <span>Lihat</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeCertificates.length > ITEMS_PER_PAGE && (
                        <div className="mt-6 flex justify-center w-full">
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
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-all hover:bg-zinc-50 active:scale-98 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
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
