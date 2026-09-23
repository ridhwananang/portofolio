import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import {
    ArrowLeft,
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
    MessageCircle,
    Search,
    FileText,
    Moon,
    Sun,
    ExternalLink,
    ShoppingBag,
    Laptop,
    Code2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServicePackage, ServiceAddon, ServiceSettingsMap } from '@/types/admin';
import TrackingModal from '@/components/TrackingModal';

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

const ICON_MAP: Record<string, any> = {
    globe: Globe,
    layers: Layers,
    zap: Zap,
    rocket: Rocket,
    shoppingbag: ShoppingBag,
    laptop: Laptop,
    code2: Code2,
    sparkles: Sparkles,
    creditcard: CreditCard,
    lock: Lock,
    shieldcheck: ShieldCheck,
};

const projectTypes: ProjectType[] = [
    {
        id: 'landing_page',
        title: 'Landing Page Modern',
        description: 'Single-page responsif, visual interaktif, copywriting terstruktur, dan konversi tinggi.',
        basePrice: 150000,
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
        id: 'fullstack_app',
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
        name: 'Payment Gateway Otomatis (QRIS, VA, E-Wallet)',
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

interface ServicesCalculatorProps {
    initialPackages?: ServicePackage[];
    initialAddons?: ServiceAddon[];
    initialSettings?: ServiceSettingsMap;
}

export default function ServicesCalculator({ initialPackages, initialAddons, initialSettings }: ServicesCalculatorProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDarkMode = resolvedAppearance === 'dark';

    const resolvedPackages: ProjectType[] = initialPackages && initialPackages.length > 0
        ? initialPackages.map((p) => ({
            id: p.slug,
            title: p.title,
            description: p.description || '',
            basePrice: Number(p.base_price),
            timeline: p.timeline,
            icon: ICON_MAP[p.icon?.toLowerCase()] || Globe,
        }))
        : projectTypes;

    const resolvedAddons: FeatureAddon[] = initialAddons && initialAddons.length > 0
        ? initialAddons.map((a) => ({
            id: a.slug,
            name: a.name,
            description: a.description || '',
            price: Number(a.price),
            icon: ICON_MAP[a.icon?.toLowerCase()] || Sparkles,
        }))
        : featureAddons;

    const expressRateMultiplier = Number(initialSettings?.express_multiplier) || 1.20;
    const expressSurchargePct = Math.round((expressRateMultiplier - 1) * 100);
    const consultationPhone = initialSettings?.consultation_phone || '6289602520330';
    const guaranteeBadge = initialSettings?.guarantee_badge_text || initialSettings?.guarantee_badge || '100% Garansi Rekber Escrow';
    const dpPercentage = Number(initialSettings?.default_dp_percentage) || 50;

    const [selectedType, setSelectedType] = useState<string>(resolvedPackages[0]?.id || 'landing_page');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
        resolvedAddons.slice(0, 2).map((a) => a.id)
    );
    const [isExpress, setIsExpress] = useState<boolean>(false);
    const [paymentScheme, setPaymentScheme] = useState<'down_payment' | 'full_payment'>('down_payment');

    // Order modal state
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [projectNotes, setProjectNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Tracking Lookup Modal state
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    useEffect(() => {
        // Read URL query params to auto-select package if provided
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeParam = params.get('type');
            if (typeParam && resolvedPackages.some(t => t.id === typeParam)) {
                setSelectedType(typeParam);
            }
        }
    }, []);

    const toggleTheme = () => {
        const nextMode = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextMode);
        localStorage.setItem('theme', nextMode);
    };

    const currentType = resolvedPackages.find((t) => t.id === selectedType) || resolvedPackages[0];

    // Calculate totals
    const featuresTotal = selectedFeatures.reduce((acc, featId) => {
        const feat = resolvedAddons.find((f) => f.id === featId);
        return acc + (feat ? feat.price : 0);
    }, 0);

    const subtotal = (currentType?.basePrice || 0) + featuresTotal;
    const expressMultiplier = isExpress ? expressRateMultiplier : 1;
    const finalTotal = Math.round(subtotal * expressMultiplier);

    const dpAmount = Math.round((finalTotal * dpPercentage) / 100);
    const remainingAmount = finalTotal - dpAmount;
    const initialDueAmount = paymentScheme === 'down_payment' ? dpAmount : finalTotal;

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
                    payment_scheme: paymentScheme,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat pesanan proyek.');
            }

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

    // Pre-filled WhatsApp consultation message
    const waText = encodeURIComponent(
        `Halo Ridhwan, saya tertarik untuk mendiskusikan pembuatan website:\n` +
        `- Paket: ${currentType?.title || ''}\n` +
        `- Add-ons: ${selectedFeatures.length > 0 ? selectedFeatures.map(f => resolvedAddons.find(a => a.id === f)?.name).filter(Boolean).join(', ') : 'Tidak ada'}\n` +
        `- Kecepatan: ${isExpress ? `Express Priority (+${expressSurchargePct}%)` : 'Standar'}\n` +
        `- Estimasi Biaya: ${formatCurrency(finalTotal)}\n\n` +
        `Bisa kita diskusikan lebih lanjut? Terima kasih!`
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <Head title="Kalkulator Biaya & Pemesanan Website | Ridhwan Anang Ma'ruf" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/#layanan"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Portofolio</span>
                        </Link>
                        <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                        <Link href="/" className="hidden text-sm font-bold tracking-tight text-slate-900 sm:block dark:text-white">
                            Ridhwan Anang Ma'ruf
                        </Link>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setIsTrackingModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-500/20 dark:text-violet-300"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>Lacak Proyek Saya</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Dynamic Background Mesh Accents */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/10"></div>
                <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10"></div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Title */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Kalkulator Interaktif & Pemesanan</span>
                        <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">{guaranteeBadge}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                        Bangun Website Impian Anda Bersama Ridhwan
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-350">
                        Kalkulasikan kebutuhan website Anda secara transparan. Dana Anda <strong>100% aman ditahan di Rekening Bersama (Escrow)</strong> dan hanya cair setelah Anda puas dengan hasilnya.
                    </p>
                </div>

                {/* Single Column Calculator Container (No Sidebar) */}
                <div className="mx-auto mt-12 max-w-4xl space-y-10">
                    {/* Step 1: Pilih Jenis Website */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-white">
                            <span className="flex size-6 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-black text-white shadow-xs">1</span>
                            <span>Pilih Jenis Website</span>
                        </label>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            {resolvedPackages.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                                            isSelected
                                                ? 'border-violet-600 bg-white/95 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-slate-900/90 dark:ring-violet-500/30'
                                                : 'border-slate-200/80 bg-white/70 hover:border-violet-400/50 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`rounded-2xl p-3 transition-transform duration-300 group-hover:scale-105 ${isSelected ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                                                {formatCurrency(type.basePrice)}
                                            </span>
                                        </div>
                                        <h4 className="mt-3.5 text-sm font-bold text-slate-900 dark:text-white">
                                            {type.title}
                                        </h4>
                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            {type.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Pilih Fitur Tambahan (Add-ons) */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-white">
                            <span className="flex size-6 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-black text-white shadow-xs">2</span>
                            <span>Pilih Fitur Tambahan (Add-ons)</span>
                        </label>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            {resolvedAddons.map((feat) => {
                                const Icon = feat.icon;
                                const isChecked = selectedFeatures.includes(feat.id);
                                return (
                                    <div
                                        key={feat.id}
                                        onClick={() => toggleFeature(feat.id)}
                                        className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                                            isChecked
                                                ? 'border-violet-600 bg-white/95 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-slate-900/90 dark:ring-violet-500/30'
                                                : 'border-slate-200/80 bg-white/70 hover:border-violet-400/50 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-2xl p-3 transition-transform duration-300 group-hover:scale-105 ${isChecked ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {feat.name}
                                                    </h4>
                                                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                        {feat.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs font-black text-violet-600 dark:text-violet-400">
                                                +{formatCurrency(feat.price)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 3: Kecepatan Pengerjaan */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-white">
                            <span className="flex size-6 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-black text-white shadow-xs">3</span>
                            <span>Kecepatan Pengerjaan</span>
                        </label>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <div
                                onClick={() => setIsExpress(false)}
                                className={`cursor-pointer rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                                    !isExpress
                                        ? 'border-violet-600 bg-white/95 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-slate-900/90 dark:ring-violet-500/30'
                                        : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Clock size={16} className="text-slate-500 dark:text-slate-400" />
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Standar</h4>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    Timeline normal ({currentType.timeline}) • Normal rate
                                </p>
                            </div>

                            <div
                                onClick={() => setIsExpress(true)}
                                className={`cursor-pointer rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                                    isExpress
                                        ? 'border-violet-600 bg-white/95 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-slate-900/90 dark:ring-violet-500/30'
                                        : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Zap size={16} className="text-amber-500" />
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Express Priority</h4>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    Pengerjaan kilat diprioritaskan (+{expressSurchargePct}%)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Ringkasan & Total Estimasi Biaya (Unified Full-Width Card) */}
                    <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/90 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
                        {/* Summary Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Calculator className="text-violet-600 dark:text-violet-400" size={20} />
                                <h3 className="font-extrabold text-slate-900 dark:text-white">Ringkasan & Total Estimasi Biaya</h3>
                            </div>
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 text-[11px] font-bold text-violet-600 dark:text-violet-300">
                                Transparan & Resmi
                            </span>
                        </div>

                        {/* Breakdown and Total Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Left: Itemized Breakdown */}
                            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 text-xs dark:border-slate-800 dark:bg-slate-950/80">
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Paket: <strong className="font-bold text-slate-900 dark:text-white">{currentType.title}</strong></span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(currentType.basePrice)}</span>
                                </div>

                                {selectedFeatures.map((featId) => {
                                    const feat = resolvedAddons.find((f) => f.id === featId);
                                    if (!feat) return null;
                                    return (
                                        <div key={feat.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                                            <span>+ {feat.name}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">+{formatCurrency(feat.price)}</span>
                                        </div>
                                    );
                                })}

                                {isExpress && (
                                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                        <span>+ Express Delivery Priority ({expressSurchargePct}%)</span>
                                        <span className="font-bold">+{formatCurrency(Math.round(subtotal * (expressRateMultiplier - 1)))}</span>
                                    </div>
                                )}

                                <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck size={14} />
                                        <span>{guaranteeBadge}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Total Price & Actions */}
                            <div className="flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Total Biaya Proyek
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            Sistem 2 Termin
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                                            {formatCurrency(finalTotal)}
                                        </span>
                                    </div>

                                    {/* Two-stage payment pills */}
                                    <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-3 dark:border-violet-500/30 dark:bg-violet-950/20">
                                        <div>
                                            <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                                                <span className="size-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                                                <span>Uang Muka (DP {dpPercentage}%)</span>
                                            </div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                {formatCurrency(dpAmount)}
                                            </div>
                                            <div className="text-[9.5px] text-slate-500 dark:text-slate-400">
                                                Dibayar saat ini untuk mulai
                                            </div>
                                        </div>

                                        <div className="border-l border-violet-500/20 pl-2.5 dark:border-violet-500/30">
                                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                                <span>Pelunasan Akhir</span>
                                            </div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                {formatCurrency(remainingAmount)}
                                            </div>
                                            <div className="text-[9.5px] text-slate-500 dark:text-slate-400">
                                                Dibayar setelah demo disetujui
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Dana diamankan di <strong>Rekening Bersama (Escrow Resmi)</strong>. Tim mulai pengerjaan setelah DP terverifikasi, dan sisa pelunasan dibayar saat kesepakatan akhir tercapai.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2.5 pt-2">
                                    <button
                                        onClick={() => setIsOrderModalOpen(true)}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        <Sparkles size={16} />
                                        <span>Mulai Proyek dengan DP ({formatCurrency(dpAmount)})</span>
                                    </button>

                                    <a
                                        href={`https://wa.me/${consultationPhone}?text=${waText}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 py-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
                                    >
                                        <MessageCircle size={15} className="text-emerald-500" />
                                        <span>Konsultasi Estimasi via WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Legal & Compliance */}
            <footer className="mt-16 border-t border-slate-200/80 bg-white/50 py-10 backdrop-blur-md dark:border-slate-855 dark:bg-slate-950/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-md shadow-violet-500/20">
                                R
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    Ridhwan Anang • Web Development Services
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Transaksi escrow aman terenkripsi & tersertifikasi resmi
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
                            <Link
                                href="/terms-and-conditions"
                                className="transition hover:text-violet-600 dark:hover:text-violet-400"
                            >
                                Syarat & Ketentuan (T&C)
                            </Link>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <Link
                                href="/privacy-policy"
                                className="transition hover:text-violet-600 dark:hover:text-violet-400"
                            >
                                Kebijakan Privasi
                            </Link>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <Link
                                href="/"
                                className="transition hover:text-violet-600 dark:hover:text-violet-400"
                            >
                                Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Modal: Input Data Klien & Buat Proposal Digital */}
            <AnimatePresence>
                {isOrderModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
                        >
                            <button
                                onClick={() => setIsOrderModalOpen(false)}
                                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Data Proyek & Proposal Digital
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Masukkan data Anda untuk membuat invoice rekber resmi.
                                    </p>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleOrderSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap / Perusahaan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Contoh: Budi Santoso / PT Maju Jaya"
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Email Aktif <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            placeholder="email@domain.com"
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            No. WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            placeholder="081234567890"
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Catatan / Kebutuhan Tambahan
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={projectNotes}
                                        onChange={(e) => setProjectNotes(e.target.value)}
                                        placeholder="Ceritakan gambaran singkat fitur atau referensi website yang Anda inginkan..."
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                {/* Skema Pembayaran: DP vs Full */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Skema Pembayaran Rekber
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div
                                            onClick={() => setPaymentScheme('down_payment')}
                                            className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                                                paymentScheme === 'down_payment'
                                                    ? 'border-violet-600 bg-violet-50/70 ring-1 ring-violet-500 dark:border-violet-500 dark:bg-violet-950/40'
                                                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                                                    DP ({dpPercentage}%)
                                                </span>
                                                <span className="text-[10px] font-extrabold uppercase rounded-full bg-violet-600/10 px-2 py-0.5 text-violet-600 dark:text-violet-400">
                                                    Rekomendasi
                                                </span>
                                            </div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(dpAmount)}
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Sisa {formatCurrency(remainingAmount)} dibayar setelah demo disetujui
                                            </p>
                                        </div>

                                        <div
                                            onClick={() => setPaymentScheme('full_payment')}
                                            className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                                                paymentScheme === 'full_payment'
                                                    ? 'border-violet-600 bg-violet-50/70 ring-1 ring-violet-500 dark:border-violet-500 dark:bg-violet-950/40'
                                                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Bayar Penuh 100%
                                            </div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(finalTotal)}
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                100% lunas langsung di awal
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary in modal */}
                                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5 text-xs dark:border-violet-500/30 dark:bg-violet-950/30 space-y-1.5">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Total Nilai Proyek:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(finalTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white pt-1 border-t border-violet-500/20">
                                        <span>Tagihan yang Harus Dibayar Saat Ini:</span>
                                        <span className="text-base text-violet-600 dark:text-violet-400">
                                            {formatCurrency(initialDueAmount)}
                                        </span>
                                    </div>
                                    <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
                                        <ShieldCheck size={13} />
                                        <span>100% Garansi Rekening Bersama (Escrow) • Aman & Terverifikasi</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span>Memproses...</span>
                                        ) : (
                                            <>
                                                <span>Bayar Tagihan Awal ({formatCurrency(initialDueAmount)})</span>
                                                <ExternalLink size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Lacak Proyek Saya (Lookup Tracking Code) */}
            <TrackingModal
                isOpen={isTrackingModalOpen}
                onClose={() => setIsTrackingModalOpen(false)}
            />
        </div>
    );
}
