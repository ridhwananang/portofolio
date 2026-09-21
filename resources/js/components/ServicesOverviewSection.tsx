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
    Sparkles
} from 'lucide-react';

export default function ServicesOverviewSection() {
    const packages = [
        {
            id: 'landing_page',
            title: 'Landing Page Modern',
            icon: Globe,
            price: 'Mulai Rp 150.000',
            badge: 'Paling Populer',
            description: 'Single-page responsif, visual interaktif, copywriting terstruktur, dan optimasi konversi tinggi.',
            features: [
                'Desain Responsif & Mobile Friendly',
                'SEO Basic & Optimasi Meta Tag',
                'Animasi Halus & Interaktif',
                'Integrasi Form Kontak & WhatsApp',
            ],
            color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400',
            accent: 'text-blue-500 dark:text-blue-400',
        },
        {
            id: 'company_profile',
            title: 'Company Profile',
            icon: Layers,
            price: 'Mulai Rp 250.000',
            badge: 'Kredibilitas Bisnis',
            description: 'Website profil perusahaan multi-halaman yang elegan, kredibel, profesional, dan siap tampil di Google.',
            features: [
                'Multi-Halaman (Profil, Layanan, Kontak)',
                'Panel CMS / Kemudahan Update Konten',
                'Optimasi Kecepatan & SEO-Ready',
                'Setup Domain & Hosting Mandiri',
            ],
            color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-400',
            accent: 'text-violet-500 dark:text-violet-400',
        },
        {
            id: 'ecommerce',
            title: 'E-Commerce / Toko Online',
            icon: ShoppingCart,
            price: 'Mulai Rp 400.000',
            badge: 'Siap Jualan',
            description: 'Solusi jualan online lengkap dengan katalog produk, keranjang belanja, checkout otomatis, dan manajemen pesanan.',
            features: [
                'Katalog & Manajemen Stok Produk',
                'Keranjang Belanja & Checkout Otomatis',
                'Notifikasi Pesanan via WhatsApp/Email',
                'Terintegrasi Payment Gateway QRIS/VA',
            ],
            color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
            accent: 'text-emerald-500 dark:text-emerald-400',
        },
        {
            id: 'fullstack_app',
            title: 'Full-Stack Web App',
            icon: Zap,
            price: 'Mulai Rp 500.000',
            badge: 'Sistem Kustom',
            description: 'Aplikasi web kustom skala menengah hingga kompleks dengan Laravel + React/Inertia, database relasional, dan arsitektur modular.',
            features: [
                'Arsitektur Modern Laravel + React/Inertia',
                'Multi-Role Auth & Hak Akses Berjenjang',
                'Integrasi API & Database Relasional',
                'Fitur Kustom Sesuai Kebutuhan Bisnis',
            ],
            color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
            accent: 'text-amber-500 dark:text-amber-400',
        },
    ];

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
                            Garansi Rekber Midtrans
                        </span>
                    </div>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Layanan Pembuatan Website Profesional
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-650 sm:text-base dark:text-slate-350">
                        Bangun website berkualitas tinggi dengan arsitektur modern, performa cepat, dan keamanan transaksi terjamin melalui sistem Rekber (Escrow).
                    </p>
                </div>

                {/* 4 Packages Grid */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {packages.map((pkg) => {
                        const Icon = pkg.icon;
                        return (
                            <div
                                key={pkg.id}
                                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-violet-500/50"
                            >
                                <div>
                                    {/* Top badge & Icon */}
                                    <div className="flex items-center justify-between">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${pkg.color}`}>
                                            <Icon className={`h-5 w-5 ${pkg.accent}`} />
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {pkg.badge}
                                        </span>
                                    </div>

                                    {/* Package Title & Price */}
                                    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                        {pkg.title}
                                    </h3>
                                    <div className="mt-1">
                                        <span className={`text-base font-extrabold ${pkg.accent}`}>
                                            {pkg.price}
                                        </span>
                                    </div>
                                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                        {pkg.description}
                                    </p>

                                    {/* Feature List */}
                                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                                        {pkg.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Link to Calculator with pre-selected package */}
                                <div className="mt-6 pt-3">
                                    <Link
                                        href={`/layanan?type=${pkg.id}`}
                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:bg-violet-950/30 dark:hover:text-violet-300"
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
                <div className="mt-10 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-slate-950/90 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                        <div className="space-y-2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400">
                                <Calculator className="h-4 w-4" />
                                <span>Kalkulator Biaya Transparan & Instan</span>
                            </div>
                            <h3 className="text-xl font-bold text-white sm:text-2xl">
                                Ingin Menghitung Estimasi Biaya & Fitur Kustom?
                            </h3>
                            <p className="max-w-xl text-xs text-slate-300 sm:text-sm">
                                Sesuaikan kebutuhan website Anda (Add-ons AI, Payment Gateway, Admin Dashboard), lihat estimasi harga seketika, dan dapatkan proposal digital resmi tanpa biaya tersembunyi.
                            </p>
                            <div className="flex items-center justify-center gap-4 pt-1 text-xs text-emerald-400 lg:justify-start">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    Rekber Escrow Midtrans
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
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-600/50"
                            >
                                <Calculator className="h-4 w-4" />
                                <span>Kalkulasikan & Pesan Website</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="https://wa.me/6289602520330?text=Halo%20Ridhwan,%20saya%20tertarik%20untuk%20konsultasi%20pembuatan%20website"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-emerald-400"
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
