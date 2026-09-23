import { Link } from '@inertiajs/react';
import { 
    Globe, 
    Layers, 
    ShoppingCart, 
    Zap, 
    CheckCircle2, 
    ShieldCheck, 
    Calculator, 
    MessageCircle,
    ArrowRight,
    Sparkles,
    Search,
    Rocket,
    Clock
} from 'lucide-react';

interface ServicesOverviewSectionProps {
    packages?: any[];
    onOpenTracking?: () => void;
}

const DEFAULT_PACKAGES = [
    {
        id: 1,
        slug: 'landing_page',
        title: 'Landing Page Modern',
        description: 'Single-page responsif, visual interaktif, copywriting terstruktur, dan optimasi konversi tinggi.',
        base_price: 150000,
        timeline: '5-7 hari',
        icon: 'Globe',
        is_popular: false,
        features_included: [
            'Desain Responsif & Mobile Friendly',
            'SEO Basic & Optimasi Meta Tag',
            'Animasi Halus & Interaktif',
            'Integrasi Form Kontak & WhatsApp',
        ],
    },
    {
        id: 2,
        slug: 'company_profile',
        title: 'Company Profile',
        description: 'Website profil perusahaan multi-halaman yang elegan, kredibel, profesional, dan siap tampil di Google.',
        base_price: 250000,
        timeline: '1-2 minggu',
        icon: 'Layers',
        is_popular: true,
        features_included: [
            'Multi-Halaman (Profil, Layanan, Kontak)',
            'Panel CMS / Kemudahan Update Konten',
            'Optimasi Kecepatan & SEO-Ready',
            'Setup Domain & Hosting Mandiri',
        ],
    },
    {
        id: 3,
        slug: 'ecommerce',
        title: 'E-Commerce / Toko Online',
        description: 'Solusi jualan online lengkap dengan katalog produk, keranjang belanja, checkout otomatis, dan manajemen pesanan.',
        base_price: 400000,
        timeline: '2-3 minggu',
        icon: 'ShoppingCart',
        is_popular: false,
        features_included: [
            'Katalog & Manajemen Stok Produk',
            'Keranjang Belanja & Checkout Otomatis',
            'Notifikasi Pesanan via WhatsApp/Email',
            'Terintegrasi Payment Gateway QRIS/VA',
        ],
    },
    {
        id: 4,
        slug: 'fullstack_app',
        title: 'Full-Stack Web App',
        description: 'Aplikasi web kustom skala menengah hingga kompleks dengan Laravel + React/Inertia, database relasional, dan arsitektur modular.',
        base_price: 5000000,
        timeline: '2-4 minggu',
        icon: 'Zap',
        is_popular: false,
        features_included: [
            'Arsitektur Modern Laravel + React/Inertia',
            'Multi-Role Auth & Hak Akses Berjenjang',
            'Integrasi API & Database Relasional',
            'Fitur Kustom Sesuai Kebutuhan Bisnis',
        ],
    },
];

const DEFAULT_SLUG_FEATURES: Record<string, string[]> = {
    landing_page: [
        'Desain Responsif & Mobile Friendly',
        'SEO Basic & Optimasi Meta Tag',
        'Animasi Halus & Interaktif',
        'Integrasi Form Kontak & WhatsApp',
    ],
    company_profile: [
        'Multi-Halaman (Profil, Layanan, Kontak)',
        'Panel CMS / Kemudahan Update Konten',
        'Optimasi Kecepatan & SEO-Ready',
        'Setup Domain & Hosting Mandiri',
    ],
    ecommerce: [
        'Katalog & Manajemen Stok Produk',
        'Keranjang Belanja & Checkout Otomatis',
        'Notifikasi Pesanan via WhatsApp/Email',
        'Terintegrasi Payment Gateway QRIS/VA',
    ],
    fullstack_app: [
        'Arsitektur Modern Laravel + React/Inertia',
        'Multi-Role Auth & Hak Akses Berjenjang',
        'Integrasi API & Database Relasional',
        'Fitur Kustom Sesuai Kebutuhan Bisnis',
    ],
};

const THEME_STYLES = [
    {
        color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400',
        accent: 'text-blue-500 dark:text-blue-400',
        badgeClass: 'border-blue-500/30 bg-blue-50/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        buttonHover: 'hover:border-blue-500 hover:bg-blue-600',
    },
    {
        color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-400',
        accent: 'text-violet-500 dark:text-violet-400',
        badgeClass: 'border-violet-500/30 bg-violet-50/80 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
        buttonHover: 'hover:border-violet-500 hover:bg-violet-600',
    },
    {
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
        accent: 'text-emerald-500 dark:text-emerald-400',
        badgeClass: 'border-emerald-500/30 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
        buttonHover: 'hover:border-emerald-500 hover:bg-emerald-600',
    },
    {
        color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
        accent: 'text-amber-500 dark:text-amber-400',
        badgeClass: 'border-amber-500/30 bg-amber-50/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
        buttonHover: 'hover:border-amber-500 hover:bg-amber-600',
    },
];

export default function ServicesOverviewSection({ packages: propPackages, onOpenTracking }: ServicesOverviewSectionProps) {
    // Determine active packages: prioritize live dynamic packages from database
    const resolvedPackages = propPackages && propPackages.length > 0 ? propPackages : DEFAULT_PACKAGES;

    const formatPrice = (priceVal: number | string) => {
        const num = Number(priceVal);
        if (!num || isNaN(num)) return 'Hubungi Kami';
        return 'Mulai ' + new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    const getPackageIcon = (iconName?: string, slug?: string) => {
        const iconKey = (iconName || slug || '').toLowerCase();
        if (iconKey.includes('globe') || iconKey.includes('landing')) return Globe;
        if (iconKey.includes('layer') || iconKey.includes('company')) return Layers;
        if (iconKey.includes('cart') || iconKey.includes('shop') || iconKey.includes('ecom')) return ShoppingCart;
        if (iconKey.includes('rocket')) return Rocket;
        if (iconKey.includes('zap') || iconKey.includes('fullstack') || iconKey.includes('app')) return Zap;
        return Globe;
    };

    return (
        <section className="relative py-16">
            {/* Background glow effects */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl dark:bg-violet-600/15" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Jasa Pembuatan Website & Aplikasi</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Garansi Rekber Escrow
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Layanan Pembuatan Website Profesional
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                        Bangun website berkualitas tinggi dengan arsitektur modern, performa cepat, dan keamanan transaksi terjamin melalui sistem Rekening Bersama (Escrow Resmi).
                    </p>
                </div>

                {/* Dynamic Packages Grid */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {resolvedPackages.map((pkg, idx) => {
                        const Icon = getPackageIcon(pkg.icon, pkg.slug);
                        const theme = THEME_STYLES[idx % THEME_STYLES.length];
                        const features: string[] = (Array.isArray(pkg.features_included) && pkg.features_included.length > 0)
                            ? pkg.features_included
                            : (DEFAULT_SLUG_FEATURES[pkg.slug] || [
                                'Desain Responsif & Modern',
                                'Optimasi SEO & Performa Cepat',
                                'Integrasi Form & WhatsApp',
                                'Garansi Pengerjaan & Dukungan',
                            ]);

                        const badgeLabel = pkg.is_popular
                            ? 'Paling Populer'
                            : (pkg.timeline ? `Pengerjaan ${pkg.timeline}` : 'Pilihan Rekomendasi');

                        return (
                            <div
                                key={pkg.id || pkg.slug || idx}
                                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-violet-500/50"
                            >
                                <div>
                                    {/* Top badge & Icon */}
                                    <div className="flex items-center justify-between">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.color} transition-transform duration-300 group-hover:scale-110`}>
                                            <Icon className={`h-5 w-5 ${theme.accent}`} />
                                        </div>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                            pkg.is_popular
                                                ? 'border-violet-500/40 bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300'
                                                : 'border-slate-200/60 bg-slate-100/80 text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300'
                                        }`}>
                                            {badgeLabel}
                                        </span>
                                    </div>

                                    {/* Package Title & Dynamic Base Price */}
                                    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                        {pkg.title}
                                    </h3>
                                    <div className="mt-1">
                                        <span className={`text-base font-black ${theme.accent}`}>
                                            {formatPrice(pkg.base_price)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                        {pkg.description}
                                    </p>

                                    {/* Timeline indicator if available */}
                                    {pkg.timeline && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            <Clock size={12} className="text-slate-400" />
                                            <span>Estimasi: {pkg.timeline}</span>
                                        </div>
                                    )}

                                    {/* Feature List */}
                                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                                        {features.map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Link to Calculator with pre-selected package slug */}
                                <div className="mt-6 pt-3">
                                    <Link
                                        href={`/layanan?type=${pkg.slug || pkg.id}`}
                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 py-3 text-xs font-bold text-slate-700 transition-all duration-200 hover:border-violet-500 hover:bg-violet-600 hover:text-white dark:border-slate-750 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-violet-600 dark:hover:text-white"
                                    >
                                        <span>Pilih Paket Ini</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Interactive CTA Card */}
                <div className="mt-12 overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-slate-900/90 to-slate-950/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                        <div className="space-y-2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400">
                                <Calculator className="h-4 w-4" />
                                <span>Kalkulator Biaya Transparan & Instan</span>
                            </div>
                            <h3 className="text-xl font-black text-white sm:text-2xl">
                                Ingin Menghitung Estimasi Biaya & Fitur Kustom?
                            </h3>
                            <p className="max-w-xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Sesuaikan kebutuhan website Anda (Add-ons AI, Payment Gateway, Admin Dashboard), lihat estimasi harga seketika, dan dapatkan proposal digital resmi tanpa biaya tersembunyi.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-emerald-400 lg:justify-start font-medium">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    Rekening Bersama (Escrow)
                                </span>
                                <span className="text-slate-600">•</span>
                                <span>Tanpa Registrasi / Akun Rumit</span>
                                <span className="text-slate-600">•</span>
                                <span>Revisi & Garansi Kepuasan</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            <Link
                                href="/layanan"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Calculator className="h-4 w-4" />
                                <span>Kalkulasikan & Pesan Website</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            {onOpenTracking && (
                                <button
                                    onClick={onOpenTracking}
                                    type="button"
                                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-950/40 px-5 py-3.5 text-xs font-bold text-violet-300 transition-all duration-200 hover:bg-violet-900/50 hover:text-white"
                                >
                                    <Search className="h-4 w-4 text-violet-400" />
                                    <span>Lacak Proyek Aktif</span>
                                </button>
                            )}

                            <a
                                href="https://wa.me/6289602520330?text=Halo%20Ridhwan,%20saya%20tertarik%20untuk%20konsultasi%20pembuatan%20website"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/80 px-5 py-3.5 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300"
                            >
                                <MessageCircle className="h-4 w-4 text-emerald-400" />
                                <span>Konsultasi WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
