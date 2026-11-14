import {
    Award,
    ShieldCheck,
    Calendar,
    Eye,
    Clock,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Sparkles,
    ExternalLink,
    Trophy,
    GraduationCap,
} from 'lucide-react';
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

const CATEGORY_TABS = [
    { key: 'all', label: 'Semua Modul' },
    { key: 'backend', label: 'Backend & SQL' },
    { key: 'frontend', label: 'Frontend & React' },
    { key: 'cloud_ai', label: 'Cloud & AI' },
    { key: 'foundations', label: 'Dasar & Manajemen' },
];

export default function Certificates({ certificates, loading }: CertificatesProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const ITEMS_PER_PAGE = 6;
    const [isExpanded, setIsExpanded] = useState(false);

    const safeCertificates = Array.isArray(certificates) ? certificates : [];

    // Distinctly separate Achievement / Milestone (e.g. Coding Camp 2026 DBS Foundation) from Modular Courses
    const achievementCert = safeCertificates.find(
        (c) =>
            c.category.toLowerCase().includes('achievement') ||
            c.category.toLowerCase().includes('kelulusan') ||
            c.title.toLowerCase().includes('coding camp')
    );

    const courseCertificates = achievementCert
        ? safeCertificates.filter((c) => c.id !== achievementCert.id)
        : safeCertificates;

    const filteredCourseCertificates = courseCertificates.filter((cert) => {
        if (activeCategory === 'all') return true;
        const cat = cert.category.toLowerCase();
        if (activeCategory === 'backend') {
            return cat.includes('backend') || cat.includes('database') || cat.includes('sql');
        }
        if (activeCategory === 'frontend') {
            return cat.includes('frontend') || cat.includes('react') || cat.includes('web');
        }
        if (activeCategory === 'cloud_ai') {
            return cat.includes('cloud') || cat.includes('ai') || cat.includes('data');
        }
        if (activeCategory === 'foundations') {
            return (
                cat.includes('programming') ||
                cat.includes('project') ||
                cat.includes('soft') ||
                cat.includes('finance') ||
                cat.includes('dasar')
            );
        }
        return true;
    });

    const visibleCourseCertificates = isExpanded
        ? filteredCourseCertificates
        : filteredCourseCertificates.slice(0, ITEMS_PER_PAGE);

    useEffect(() => {
        setIsExpanded(false);
    }, [safeCertificates.length, activeCategory]);

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
        <section id="sertifikat" className="w-full space-y-6">
            {/* Section Header */}
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>Pencapaian & Sertifikasi</span>
                        <Sparkles size={18} className="text-amber-500 fill-amber-500/20" />
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Kompilasi pencapaian beasiswa intensif, kelulusan program, dan lisensi kompetensi kurikulum resmi
                    </p>
                </div>

                {!loading && safeCertificates.length > 0 && (
                    <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 shadow-2xs w-fit">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-emerald-500" />
                            {safeCertificates.length} Kredensial Resmi
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
                <div className="luxury-card h-64 w-full animate-pulse rounded-2xl p-6" />
            ) : (
                <>
                    {/* 1. HERO SPOTLIGHT: PENCAPAIAN & KELULUSAN UTAMA (e.g. Coding Camp 2026 DBS Foundation) */}
                    {achievementCert && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider text-amber-700 dark:text-amber-400 uppercase">
                                <Trophy size={13} className="text-amber-500" />
                                <span>Pencapaian & Prestasi Terbesar (Major Milestone)</span>
                            </div>

                            <div
                                onClick={() => handlePreview(achievementCert)}
                                className="luxury-card luxury-card-interactive transform-gpu relative overflow-hidden rounded-2xl p-5 sm:p-7 transition-all duration-300 cursor-pointer select-none group border-amber-500/40 dark:border-amber-500/35 bg-gradient-to-br from-amber-500/5 via-white dark:via-[#091126] to-amber-600/10 shadow-[0_10px_35px_-5px_rgba(245,158,11,0.12)]"
                            >
                                {/* Specular Rim */}
                                <div className="specular-top" />

                                {/* Radiant Golden Ambient Hairline */}
                                <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-90" />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-7 items-center">
                                    {/* Left: Certificate Visual Mockup */}
                                    <div className="md:col-span-5 relative">
                                        <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-xl border border-amber-500/30 bg-zinc-100 dark:bg-[#060b19] shadow-lg shadow-amber-500/10">
                                            <img
                                                src={achievementCert.thumbnail_url || achievementCert.file_url}
                                                alt={achievementCert.title}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover:opacity-100">
                                                <span className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-xl">
                                                    <Eye size={13} />
                                                    <span>Buka Sertifikat Resolusi Penuh</span>
                                                </span>
                                            </div>

                                            {/* Flagship Badge */}
                                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[10px] font-mono font-black text-white shadow-md">
                                                <Trophy size={11} className="text-yellow-200" />
                                                <span>Pencapaian Utama</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Credential Engineering Dossier */}
                                    <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono">
                                                <span className="inline-flex items-center gap-1 uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                    <GraduationCap size={12} />
                                                    {achievementCert.category}
                                                </span>
                                                <span className="text-zinc-400">•</span>
                                                <span className="text-zinc-700 dark:text-zinc-200 font-semibold">
                                                    {achievementCert.issuer}
                                                </span>
                                                {achievementCert.duration && (
                                                    <>
                                                        <span className="text-zinc-400">•</span>
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                            <Clock size={11} />
                                                            {achievementCert.duration}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <h4 className="mt-2 text-lg sm:text-xl font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                                                {achievementCert.title}
                                            </h4>

                                            {achievementCert.credential_id && (
                                                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                                    <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                                                    <span>ID Kredensial Resmi:</span>
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 select-all">
                                                        {achievementCert.credential_id}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Skills / Curriculum Highlights */}
                                        {achievementCert.skills && Array.isArray(achievementCert.skills) && (
                                            <div>
                                                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                                                    Kurikulum & Cakupan Keahlian Teruji:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {achievementCert.skills.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10.5px] font-mono font-bold text-amber-800 dark:text-amber-300 shadow-2xs"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                            <button
                                                type="button"
                                                className="luxury-btn-primary flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                                            >
                                                <Eye size={13} />
                                                <span>Lihat Sertifikat Resolusi Penuh</span>
                                            </button>

                                            <a
                                                href="https://www.dicoding.com/users/riedmarf12/academies"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="luxury-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                                            >
                                                <span>Profil Pembelajaran Dicoding</span>
                                                <ExternalLink size={11} className="opacity-70" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. SUBSECTION: MODULAR COURSE CERTIFICATIONS & SKILL LICENSES */}
                    {courseCertificates.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-zinc-200/60 dark:border-white/[0.06]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                                        <span>Lisensi & Sertifikasi Keahlian Modular</span>
                                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300">
                                            {courseCertificates.length} Modul Resmi
                                        </span>
                                    </h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Kelulusan kurikulum teknis spesifik untuk backend, frontend, database, dan cloud computing
                                    </p>
                                </div>

                                {/* Category Tabs */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {CATEGORY_TABS.map((tab) => {
                                        const count =
                                            tab.key === 'all'
                                                ? courseCertificates.length
                                                : courseCertificates.filter((cert) => {
                                                      const cat = cert.category.toLowerCase();
                                                      if (tab.key === 'backend') {
                                                          return (
                                                              cat.includes('backend') ||
                                                              cat.includes('database') ||
                                                              cat.includes('sql')
                                                          );
                                                      }
                                                      if (tab.key === 'frontend') {
                                                          return (
                                                              cat.includes('frontend') ||
                                                              cat.includes('react') ||
                                                              cat.includes('web')
                                                          );
                                                      }
                                                      if (tab.key === 'cloud_ai') {
                                                          return (
                                                              cat.includes('cloud') ||
                                                              cat.includes('ai') ||
                                                              cat.includes('data')
                                                          );
                                                      }
                                                      if (tab.key === 'foundations') {
                                                          return (
                                                              cat.includes('programming') ||
                                                              cat.includes('project') ||
                                                              cat.includes('soft') ||
                                                              cat.includes('finance') ||
                                                              cat.includes('dasar')
                                                          );
                                                      }
                                                      return true;
                                                  }).length;

                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => {
                                                    setActiveCategory(tab.key);
                                                    setIsExpanded(false);
                                                }}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    activeCategory === tab.key
                                                        ? 'bg-zinc-900 text-white dark:bg-amber-400 dark:text-zinc-950 font-bold shadow-xs'
                                                        : 'bg-zinc-100/90 text-zinc-600 dark:bg-white/[0.04] dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/[0.08]'
                                                }`}
                                            >
                                                <span>{tab.label}</span>
                                                <span
                                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                                        activeCategory === tab.key
                                                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950'
                                                            : 'bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-500 dark:text-zinc-400'
                                                    }`}
                                                >
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3-Column Grid for Course Certificates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {visibleCourseCertificates.map((cert) => (
                                    <div
                                        key={cert.id}
                                        onClick={() => handlePreview(cert)}
                                        className="luxury-card luxury-card-interactive transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-4.5 transition-all duration-300 cursor-pointer select-none dark:border-blue-400/15 group"
                                    >
                                        {/* Specular Rim */}
                                        <div className="specular-top" />

                                        <div>
                                            {/* Thumbnail Preview */}
                                            <div className="relative mb-3 aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-zinc-200/90 dark:border-blue-400/20 bg-zinc-100 dark:bg-[#091126] shadow-xs">
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
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex items-center justify-between text-[9.5px] font-mono">
                                                <span className="uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
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
                                            <h4 className="mt-1.5 text-xs sm:text-sm font-bold leading-snug transition-colors text-zinc-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
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
                                ))}
                            </div>

                            {/* Expand/Collapse Button */}
                            {!loading && filteredCourseCertificates.length > ITEMS_PER_PAGE && (
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
                                        className="luxury-btn-secondary flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-xs"
                                    >
                                        <span>
                                            {isExpanded
                                                ? 'Tampilkan Lebih Sedikit'
                                                : `Tampilkan Semua (${filteredCourseCertificates.length} Sertifikat)`}
                                        </span>
                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                </div>
                            )}
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
