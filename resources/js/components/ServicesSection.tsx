import { useState } from 'react';
import {
    Calculator,
    CheckCircle2,
    Clock,
    CreditCard,
    Globe,
    Layers,
    Lock,
    Rocket,
    ShieldCheck,
    Sparkles,
    Zap,
    X,
    ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectType {
    id: string;
    title: string;
    description: string;
    basePrice: number;
    timeline: string;
    icon: any;
}

interface FeatureAddon {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: any;
}

const projectTypes: ProjectType[] = [
    {
        id: 'landing_page',
        title: 'Landing Page Modern',
        description: 'Single-page responsif, visual interaktif, copywriting terstruktur, dan konversi tinggi.',
        basePrice: 150000, // Nilai sandbox test mode
        timeline: '5-7 hari',
        icon: Globe,
    },
    {
        id: 'company_profile',
        title: 'Company Profile',
        description: 'Website profil perusahaan multi-halaman yang elegan, profesional, dan SEO-ready.',
        basePrice: 250000,
        timeline: '1-2 minggu',
        icon: Layers,
    },
    {
        id: 'web_app',
        title: 'Full-Stack Web App',
        description: 'Aplikasi web kompleks dengan Laravel + React/Inertia, database, dan arsitektur modular.',
        basePrice: 500000,
        timeline: '2-4 minggu',
        icon: Zap,
    },
    {
        id: 'ecommerce',
        title: 'E-Commerce / Toko Online',
        description: 'Katalog produk, keranjang belanja, checkout otomatis, dan manajemen pesanan.',
        basePrice: 400000,
        timeline: '2-3 minggu',
        icon: Rocket,
    },
];

const featureAddons: FeatureAddon[] = [
    {
        id: 'ai_gemini',
        name: 'Integrasi Google Gemini AI',
        description: 'Chatbot asisten pintar yang memahami data bisnis Anda.',
        price: 75000,
        icon: Sparkles,
    },
    {
        id: 'payment_gateway',
        name: 'Payment Gateway Xendit',
        description: 'Menerima pembayaran otomatis via QRIS, VA, dan E-Wallet.',
        price: 50000,
        icon: CreditCard,
    },
    {
        id: 'admin_cms',
        name: 'Dashboard Admin Panel (Filament)',
        description: 'Kemudahan mengelola konten, artikel, dan data secara mandiri.',
        price: 50000,
        icon: Layers,
    },
    {
        id: 'auth_security',
        name: 'Multi-Role Auth & 2FA',
        description: 'Sistem login aman dengan hak akses peran dan otentikasi ganda.',
        price: 40000,
        icon: Lock,
    },
];

export default function ServicesSection() {
    const [selectedType, setSelectedType] = useState<string>('web_app');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['payment_gateway', 'admin_cms']);
    const [isExpress, setIsExpress] = useState<boolean>(false);

    // Order modal state
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [projectNotes, setProjectNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const currentType = projectTypes.find((t) => t.id === selectedType) || projectTypes[0];

    // Calculate total
    const featuresTotal = selectedFeatures.reduce((acc, featId) => {
        const feat = featureAddons.find((f) => f.id === featId);
        return acc + (feat ? feat.price : 0);
    }, 0);

    const subtotal = currentType.basePrice + featuresTotal;
    const expressMultiplier = isExpress ? 1.2 : 1; // +20% for express
    const finalTotal = Math.round(subtotal * expressMultiplier);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const toggleFeature = (id: string) => {
        if (selectedFeatures.includes(id)) {
            setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
        } else {
            setSelectedFeatures([...selectedFeatures, id]);
        }
    };

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('/project-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    client_name: clientName,
                    client_email: clientEmail,
                    client_phone: clientPhone || undefined,
                    project_type: selectedType,
                    selected_features: selectedFeatures,
                    delivery_speed: isExpress ? 'express' : 'standard',
                    notes: projectNotes || undefined,
                    total_amount: finalTotal,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat pesanan proyek.');
            }

            // Alihkan klien ke halaman Digital Proposal & Project Tracker mereka
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            } else if (data.invoice_url) {
                window.location.href = data.invoice_url;
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pesanan.');
            setIsSubmitting(false);
        }
    };

    return (
        <section id="layanan" className="relative z-10 w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header Badge & Title */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Jasa Pembuatan Website & Aplikasi</span>
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">Garansi Rekber Xendit</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Bangun Website Impian Anda Bersama Ridhwan
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                    Kalkulasikan kebutuhan website Anda secara transparan. Dana Anda <strong>100% aman ditahan di Rekber Xendit</strong> dan hanya cair setelah Anda puas dengan hasilnya.
                </p>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Type & Addons Selection (7 Cols) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Step 1: Pilih Jenis Website */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">1</span>
                            Pilih Jenis Website
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {projectTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-violet-600 bg-violet-50/60 shadow-md shadow-violet-500/10 dark:border-violet-500 dark:bg-violet-950/30'
                                                : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`rounded-xl p-2.5 ${isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                                                {formatCurrency(type.basePrice)}
                                            </span>
                                        </div>
                                        <h4 className="mt-3 font-bold text-sm text-slate-900 dark:text-white">
                                            {type.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {type.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Pilih Fitur Tambahan (Add-ons) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">2</span>
                            Pilih Fitur Tambahan (Add-ons)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {featureAddons.map((addon) => {
                                const Icon = addon.icon;
                                const isChecked = selectedFeatures.includes(addon.id);
                                return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleFeature(addon.id)}
                                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex items-start gap-3 ${
                                            isChecked
                                                ? 'border-violet-600 bg-violet-50/60 shadow-xs dark:border-violet-500 dark:bg-violet-950/30'
                                                : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className={`mt-0.5 rounded-lg p-2 shrink-0 ${isChecked ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {addon.name}
                                                </span>
                                                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                                                    +{formatCurrency(addon.price)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                {addon.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 3: Kecepatan Pengerjaan */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">3</span>
                            Kecepatan Pengerjaan
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setIsExpress(false)}
                                className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                                    !isExpress
                                        ? 'border-violet-600 bg-violet-50/60 dark:border-violet-500 dark:bg-violet-950/30'
                                        : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-slate-600 dark:text-slate-400" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Standar</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Timeline normal ({currentType.timeline}) • Normal rate
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsExpress(true)}
                                className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                                    isExpress
                                        ? 'border-violet-600 bg-violet-50/60 dark:border-violet-500 dark:bg-violet-950/30'
                                        : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-amber-500" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Express Priority</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Pengerjaan kilat diprioritaskan (+20%)
                                </p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Cost Summary & Rekber Guarantee (5 Cols) */}
                <div className="lg:col-span-5 sticky top-28 space-y-4">
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Calculator size={18} className="text-violet-600" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Ringkasan Estimasi Biaya</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">Sandbox Mode</span>
                        </div>

                        {/* Breakdown items */}
                        <div className="py-4 space-y-2.5 text-xs">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Paket: {currentType.title}</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(currentType.basePrice)}</span>
                            </div>

                            {selectedFeatures.map((featId) => {
                                const feat = featureAddons.find((f) => f.id === featId);
                                if (!feat) return null;
                                return (
                                    <div key={featId} className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>+ {feat.name}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(feat.price)}</span>
                                    </div>
                                );
                            })}

                            {isExpress && (
                                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                                    <span>+ Express Priority Speed (20%)</span>
                                    <span>+{formatCurrency(Math.round(subtotal * 0.2))}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Total Estimasi</div>
                                    <div className="text-[11px] text-slate-500">Termasuk garansi penahanan dana rekber</div>
                                </div>
                                <div className="text-xl font-extrabold text-violet-600 dark:text-violet-400">
                                    {formatCurrency(finalTotal)}
                                </div>
                            </div>
                        </div>

                        {/* Escrow Guarantee Box */}
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                            <div className="flex items-center gap-2 font-bold">
                                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Garansi Keamanan Rekber Xendit</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                                Dana Anda tidak langsung masuk ke rekening pribadi Ridhwan. Dana disimpan aman di sistem escrow Xendit dan baru bisa dicairkan setelah Anda puas dengan hasil website.
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            type="button"
                            onClick={() => setIsOrderModalOpen(true)}
                            className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 active:scale-98"
                        >
                            <Sparkles size={16} />
                            <span>Buat Ringkasan Proyek & Dapatkan Estimasi</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Pemesanan Proyek
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Paket: <strong className="text-violet-600">{currentType.title}</strong> • {formatCurrency(finalTotal)}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOrderModalOpen(false)}
                                className="cursor-pointer rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Lengkap / Perusahaan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-violet-600"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Email Aktif (Untuk Menerima Link Tracking & Invoice) *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="budi@example.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-violet-600"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Nomor WhatsApp / Kontak (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="0812xxxxxxxx"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-violet-600"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Catatan Kebutuhan / Referensi Website (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tuliskan gambaran website yang Anda inginkan, warna preferensi, atau link referensi..."
                                    value={projectNotes}
                                    onChange={(e) => setProjectNotes(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-violet-600"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-violet-700 disabled:opacity-50"
                                >
                                    <Sparkles size={16} />
                                    <span>{isSubmitting ? 'Menyusun Proposal Proyek...' : 'Dapatkan Ringkasan Proposal & Invoice'}</span>
                                </button>
                                <p className="text-[11px] text-center text-slate-400 mt-2">
                                    Anda akan diarahkan ke halaman proposal resmi & pelacak proyek (tanpa potongan dana langsung).
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </section>
    );
}
