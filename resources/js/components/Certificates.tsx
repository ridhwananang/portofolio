import { Award, ShieldCheck, Calendar, Eye, Clock, ChevronDown, ChevronUp, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';
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
        <section id="sertifikat" className="w-full">
            {/* Section Header */}
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Sertifikasi & Lisensi
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Kurikulum industri resmi yang telah diselesaikan dan diverifikasi
                    </p>
                </div>

                {!loading && safeCertificates.length > 0 && (
                    <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 shadow-2xs w-fit">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-emerald-500" />
                            {safeCertificates.length} Sertifikat Resmi
                        </span>
                        {totalHours > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-amber-500" />
                                    {totalHours} Jam Belajar
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="luxury-card h-56 w-full animate-pulse rounded-xl p-5" />
            ) : safeCertificates.length === 1 ? (
                /* Single Featured Master Credential Dossier (Prevents Empty Space!) */
                (() => {
                    const cert = safeCertificates[0];
                    return (
                        <div
                            onClick={() => handlePreview(cert)}
                            className="luxury-card luxury-card-interactive transform-gpu relative overflow-hidden rounded-xl p-5 sm:p-6 transition-all duration-300 cursor-pointer select-none group border-amber-500/30 dark:border-amber-500/30 shadow-[0_4px_24px_rgba(245,158,11,0.08)]"
                        >
                            {/* Specular Rim */}
                            <div className="specular-top" />

                            {/* Radiant Golden Ambient Line */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-80" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
                                {/* Left: Certificate Visual Mockup */}
                                <div className="md:col-span-5 relative">
                                    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-amber-500/30 bg-zinc-950 shadow-md">
                                        <img
                                            src={cert.thumbnail_url || cert.file_url}
                                            alt={cert.title}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                                            loading="lazy"
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                                            <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-md">
                                                <Eye size={12} />
                                                <span>Buka Sertifikat Resolusi Penuh</span>
                                            </span>
                                        </div>

                                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9.5px] font-mono font-bold text-white shadow-md">
                                            <Sparkles size={10} />
                                            <span>Kelulusan Utama</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Credential Engineering Dossier */}
                                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                                            <span className="uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                                                {cert.category}
                                            </span>
                                            <span className="text-zinc-400">•</span>
                                            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                                                {cert.issuer}
                                            </span>
                                            {cert.duration && (
                                                <>
                                                    <span className="text-zinc-400">•</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {cert.duration}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <h4 className="mt-1.5 text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                                            {cert.title}
                                        </h4>

                                        {cert.credential_id && (
                                            <p className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                                ID Kredensial Resmi:{' '}
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {cert.credential_id}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Skills / Syllabus breakdown */}
                                    {cert.skills && Array.isArray(cert.skills) && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {cert.skills.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-700 dark:text-amber-300"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action bar */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            className="luxury-btn-primary flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold"
                                        >
                                            <Eye size={12} />
                                            <span>Lihat Sertifikat Asli</span>
                                        </button>

                                        <a
                                            href="https://www.dicoding.com/users/riedmarf12/academies"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="luxury-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                                        >
                                            <span>Profil Akademi</span>
                                            <ExternalLink size={11} className="opacity-70" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()
            ) : (
                /* Multiple Certificates Grid */
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
                                    className={`luxury-card luxury-card-interactive transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-4.5 transition-all duration-300 cursor-pointer select-none ${
                                        isAchievement
                                            ? 'border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                                            : 'dark:border-blue-400/15'
                                    } group`}
                                >
                                    {/* Specular Rim */}
                                    <div className="specular-top" />

                                    <div>
                                        {/* Thumbnail Preview */}
                                        <div className="relative mb-3 aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-zinc-200/90 dark:border-blue-400/20 bg-zinc-950 shadow-xs">
                                            <img
                                                src={cert.thumbnail_url || cert.file_url}
                                                alt={cert.title}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                                                <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-zinc-900 shadow-md">
                                                    <Eye size={12} />
                                                    <span>Pratinjau</span>
                                                </span>
                                            </div>

                                            {isAchievement && (
                                                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-amber-500 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-white shadow-md">
                                                    <Sparkles size={9} />
                                                    <span>Utama</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center justify-between text-[9.5px] font-mono">
                                            <span
                                                className={`uppercase font-bold tracking-wider ${
                                                    isAchievement
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-zinc-500 dark:text-zinc-400'
                                                }`}
                                            >
                                                {cert.category}
                                            </span>
                                            <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                                                {cert.duration && (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {cert.duration}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>{cert.date}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h4
                                            className={`mt-1.5 text-xs sm:text-sm font-bold leading-snug transition-colors ${
                                                isAchievement
                                                    ? 'text-zinc-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400'
                                                    : 'text-zinc-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400'
                                            }`}
                                        >
                                            {cert.title}
                                        </h4>

                                        {/* Skills */}
                                        {cert.skills && Array.isArray(cert.skills) && (
                                            <div className="mt-2.5 flex flex-wrap gap-1">
                                                {cert.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="rounded-md border border-zinc-200/70 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.025] px-1.5 py-0.5 text-[8.5px] font-mono font-medium text-zinc-600 dark:text-zinc-300"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Issuer / ID */}
                                    <div className="mt-3.5 flex items-center justify-between border-t border-zinc-200/70 dark:border-white/[0.06] pt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                                        <span className="truncate max-w-[180px] font-medium">
                                            {cert.credential_id ? `ID: ${cert.credential_id}` : cert.issuer}
                                        </span>
                                        <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                                            <Eye size={11} /> Lihat
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse */}
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
                                className="luxury-btn-secondary flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Certificate High-Res Modal */}
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
