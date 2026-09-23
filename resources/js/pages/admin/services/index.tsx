import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Calculator,
    Layers,
    Plus,
    Edit2,
    Trash2,
    ExternalLink,
    CheckCircle2,
    Sparkles,
    CreditCard,
    Lock,
    Globe,
    Zap,
    Rocket,
    ShoppingBag,
    Laptop,
    Code2,
    ShieldCheck,
    Check,
    SlidersHorizontal,
    X,
    Eye,
    Star,
    Percent,
    Phone,
    HelpCircle,
    RotateCcw,
} from 'lucide-react';
import { ServicePackage, ServiceAddon, ServiceSettingsMap } from '@/types/admin';
import { toast } from 'sonner';

interface ServicesIndexProps {
    packages: ServicePackage[];
    addons: ServiceAddon[];
    settings: ServiceSettingsMap;
}

const AVAILABLE_ICONS = [
    { label: 'Globe', icon: Globe },
    { label: 'Layers', icon: Layers },
    { label: 'Zap', icon: Zap },
    { label: 'Rocket', icon: Rocket },
    { label: 'ShoppingBag', icon: ShoppingBag },
    { label: 'Laptop', icon: Laptop },
    { label: 'Code2', icon: Code2 },
    { label: 'Sparkles', icon: Sparkles },
    { label: 'CreditCard', icon: CreditCard },
    { label: 'Lock', icon: Lock },
    { label: 'ShieldCheck', icon: ShieldCheck },
];

export default function ServicesIndex({ packages, addons, settings }: ServicesIndexProps) {
    const [activeTab, setActiveTab] = useState<'packages' | 'addons' | 'settings' | 'simulator'>('packages');

    // Editing states
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
    const [isCreatingPackage, setIsCreatingPackage] = useState(false);

    const [editingAddon, setEditingAddon] = useState<ServiceAddon | null>(null);
    const [isCreatingAddon, setIsCreatingAddon] = useState(false);

    // Package Form
    const packageForm = useForm({
        title: '',
        slug: '',
        description: '',
        base_price: 150000,
        timeline: '5-7 hari',
        icon: 'Globe',
        is_popular: false,
        is_active: true,
        sort_order: 1,
    });

    // Addon Form
    const addonForm = useForm({
        name: '',
        slug: '',
        description: '',
        price: 50000,
        icon: 'Sparkles',
        is_active: true,
        sort_order: 1,
    });

    // Global Settings Form
    const settingsForm = useForm({
        express_multiplier: settings.express_multiplier || '1.20',
        consultation_phone: settings.consultation_phone || '6281284567890',
        guarantee_badge_text: settings.guarantee_badge_text || '100% Garansi Rekening Bersama (Escrow)',
        default_dp_percentage: settings.default_dp_percentage || '50',
    });

    // Live Simulator State
    const [simPackage, setSimPackage] = useState<string>(packages[0]?.slug || 'landing_page');
    const [simAddons, setSimAddons] = useState<string[]>([]);
    const [simExpress, setSimExpress] = useState<boolean>(false);

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    const getIconComponent = (iconName: string) => {
        const found = AVAILABLE_ICONS.find((item) => item.label.toLowerCase() === iconName.toLowerCase());
        return found ? found.icon : Globe;
    };

    // --- Package Handlers ---
    const startCreatePackage = () => {
        setEditingPackage(null);
        setIsCreatingPackage(true);
        packageForm.setData({
            title: '',
            slug: '',
            description: '',
            base_price: 200000,
            timeline: '1-2 minggu',
            icon: 'Globe',
            is_popular: false,
            is_active: true,
            sort_order: packages.length + 1,
        });
    };

    const startEditPackage = (pkg: ServicePackage) => {
        setIsCreatingPackage(false);
        setEditingPackage(pkg);
        packageForm.setData({
            title: pkg.title,
            slug: pkg.slug,
            description: pkg.description || '',
            base_price: Number(pkg.base_price),
            timeline: pkg.timeline,
            icon: pkg.icon || 'Globe',
            is_popular: Boolean(pkg.is_popular),
            is_active: Boolean(pkg.is_active),
            sort_order: pkg.sort_order,
        });
    };

    const cancelPackageForm = () => {
        setIsCreatingPackage(false);
        setEditingPackage(null);
    };

    const handlePackageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPackage) {
            packageForm.put(`/admin/services/packages/${editingPackage.id}`, {
                onSuccess: () => {
                    toast.success('Paket layanan berhasil diperbarui.');
                    cancelPackageForm();
                },
                onError: () => toast.error('Gagal memperbarui paket.'),
            });
        } else {
            packageForm.post('/admin/services/packages', {
                onSuccess: () => {
                    toast.success('Paket layanan baru berhasil ditambahkan.');
                    cancelPackageForm();
                },
                onError: () => toast.error('Gagal menambahkan paket.'),
            });
        }
    };

    const handleTogglePackage = (pkg: ServicePackage) => {
        router.patch(`/admin/services/packages/${pkg.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status ${pkg.title} berhasil diubah.`),
        });
    };

    const handleDeletePackage = (pkg: ServicePackage) => {
        if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.title}"?`)) {
            router.delete(`/admin/services/packages/${pkg.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Paket ${pkg.title} berhasil dihapus.`),
            });
        }
    };

    // --- Addon Handlers ---
    const startCreateAddon = () => {
        setEditingAddon(null);
        setIsCreatingAddon(true);
        addonForm.setData({
            name: '',
            slug: '',
            description: '',
            price: 50000,
            icon: 'Sparkles',
            is_active: true,
            sort_order: addons.length + 1,
        });
    };

    const startEditAddon = (addon: ServiceAddon) => {
        setIsCreatingAddon(false);
        setEditingAddon(addon);
        addonForm.setData({
            name: addon.name,
            slug: addon.slug,
            description: addon.description || '',
            price: Number(addon.price),
            icon: addon.icon || 'Sparkles',
            is_active: Boolean(addon.is_active),
            sort_order: addon.sort_order,
        });
    };

    const cancelAddonForm = () => {
        setIsCreatingAddon(false);
        setEditingAddon(null);
    };

    const handleAddonSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddon) {
            addonForm.put(`/admin/services/addons/${editingAddon.id}`, {
                onSuccess: () => {
                    toast.success('Fitur add-on berhasil diperbarui.');
                    cancelAddonForm();
                },
                onError: () => toast.error('Gagal memperbarui add-on.'),
            });
        } else {
            addonForm.post('/admin/services/addons', {
                onSuccess: () => {
                    toast.success('Fitur add-on baru berhasil ditambahkan.');
                    cancelAddonForm();
                },
                onError: () => toast.error('Gagal menambahkan add-on.'),
            });
        }
    };

    const handleToggleAddon = (addon: ServiceAddon) => {
        router.patch(`/admin/services/addons/${addon.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status ${addon.name} berhasil diubah.`),
        });
    };

    const handleDeleteAddon = (addon: ServiceAddon) => {
        if (confirm(`Apakah Anda yakin ingin menghapus add-on "${addon.name}"?`)) {
            router.delete(`/admin/services/addons/${addon.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Add-on ${addon.name} berhasil dihapus.`),
            });
        }
    };

    // --- Settings Handler ---
    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post('/admin/services/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan global layanan berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan pengaturan.'),
        });
    };

    // --- Live Simulator Calculation ---
    const activeSelectedPkg = packages.find((p) => p.slug === simPackage) || packages[0];
    const baseSimPrice = activeSelectedPkg ? Number(activeSelectedPkg.base_price) : 0;
    const addonsSimPrice = simAddons.reduce((sum, slug) => {
        const ad = addons.find((a) => a.slug === slug);
        return sum + (ad ? Number(ad.price) : 0);
    }, 0);
    const subtotalSim = baseSimPrice + addonsSimPrice;
    const multiplierVal = Number(settingsForm.data.express_multiplier) || 1.20;
    const totalSim = simExpress ? Math.round(subtotalSim * multiplierVal) : subtotalSim;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio Cockpit', href: '/admin' },
                { title: 'Katalog & Penentuan Harga Layanan', href: '/admin/services' },
            ]}
        >
            <Head title="Kelola Katalog Layanan & Pricing Engine - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
                {/* 1. Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-600 dark:text-violet-400 shadow-xs">
                            <Calculator size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Katalog Layanan &{' '}
                                <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text font-mono font-extrabold text-transparent">
                                    Pricing Engine
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Kelola paket website, fitur add-on, tarif prioritas express, dan parameter biaya yang tampil di kalkulator publik
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/layanan"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
                        >
                            <ExternalLink size={13} className="text-violet-500" />
                            <span>Buka Halaman /layanan Publik</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Top Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Paket Layanan</span>
                            <Layers size={16} className="text-violet-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {packages.filter((p) => p.is_active).length}
                            <span className="text-xs text-slate-400 font-normal ml-1">/ {packages.length} aktif</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500">Tampil di kalkulator</div>
                    </div>

                    <div className="p-4 rounded-3xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-blue-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Fitur Add-on</span>
                            <Sparkles size={16} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                            {addons.filter((a) => a.is_active).length}
                            <span className="text-xs text-blue-500/70 font-normal ml-1">/ {addons.length} aktif</span>
                        </div>
                        <div className="text-[10.5px] text-blue-600/70 dark:text-blue-400/70">Opsi fitur tambahan</div>
                    </div>

                    <div className="p-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-amber-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Express Surcharge</span>
                            <Zap size={16} className="text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            +{Math.round((Number(settingsForm.data.express_multiplier) - 1) * 100)}%
                        </div>
                        <div className="text-[10.5px] text-amber-600/70 dark:text-amber-400/70">
                            Multiplier: x{settingsForm.data.express_multiplier}
                        </div>
                    </div>

                    <div className="p-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Proteksi Rekber</span>
                            <ShieldCheck size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400 truncate mt-1">
                            Rekening Bersama (Escrow)
                        </div>
                        <div className="text-[10.5px] text-emerald-600/70 dark:text-emerald-400/70">Garansi Klien 100%</div>
                    </div>
                </div>

                {/* 3. Navigation Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 max-w-2xl overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('packages')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'packages'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        📦 Paket Layanan ({packages.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('addons')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'addons'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        ⚡ Fitur Add-on ({addons.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'settings'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        ⚙️ Pengaturan Global
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('simulator')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'simulator'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Eye size={13} />
                        <span>Simulasi Live</span>
                    </button>
                </div>

                {/* TAB 1: PAKET LAYANAN */}
                {activeTab === 'packages' && (
                    <div className="space-y-6">
                        {/* Action Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Daftar Paket Website & Layanan
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Paket-paket utama yang dapat dipilih klien di kalkulator biaya
                                </p>
                            </div>

                            {!isCreatingPackage && !editingPackage && (
                                <Button
                                    size="sm"
                                    onClick={startCreatePackage}
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Tambah Paket Baru</span>
                                </Button>
                            )}
                        </div>

                        {/* Inline Create / Edit Form */}
                        {(isCreatingPackage || editingPackage) && (
                            <div className="p-6 sm:p-7 rounded-[2.2rem] border border-violet-500/40 bg-white/95 dark:bg-slate-900/90 shadow-xl space-y-5 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <SlidersHorizontal size={15} className="text-violet-500" />
                                        <span>{editingPackage ? `Edit Paket: ${editingPackage.title}` : 'Buat Paket Layanan Baru'}</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={cancelPackageForm}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handlePackageSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Judul Paket
                                            </Label>
                                            <Input
                                                required
                                                value={packageForm.data.title}
                                                onChange={(e) => packageForm.setData('title', e.target.value)}
                                                placeholder="Contoh: Landing Page Modern"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Slug / Identifier
                                            </Label>
                                            <Input
                                                value={packageForm.data.slug}
                                                onChange={(e) => packageForm.setData('slug', e.target.value)}
                                                placeholder="landing_page"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Harga Dasar (IDR)
                                            </Label>
                                            <Input
                                                type="number"
                                                required
                                                min={0}
                                                value={packageForm.data.base_price}
                                                onChange={(e) => packageForm.setData('base_price', Number(e.target.value))}
                                                placeholder="150000"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Estimasi Timeline
                                            </Label>
                                            <Input
                                                required
                                                value={packageForm.data.timeline}
                                                onChange={(e) => packageForm.setData('timeline', e.target.value)}
                                                placeholder="5-7 hari"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Ikon Visual
                                            </Label>
                                            <select
                                                value={packageForm.data.icon}
                                                onChange={(e) => packageForm.setData('icon', e.target.value)}
                                                className="w-full h-10 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                                            >
                                                {AVAILABLE_ICONS.map((item) => (
                                                    <option key={item.label} value={item.label}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Urutan Tampil (Sort Order)
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={packageForm.data.sort_order}
                                                onChange={(e) => packageForm.setData('sort_order', Number(e.target.value))}
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Deskripsi Layanan Singkat
                                            </Label>
                                            <Textarea
                                                rows={2}
                                                value={packageForm.data.description}
                                                onChange={(e) => packageForm.setData('description', e.target.value)}
                                                placeholder="Jelaskan value proposition dan kecocokan paket ini..."
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-6 pt-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={packageForm.data.is_popular}
                                                    onChange={(e) => packageForm.setData('is_popular', e.target.checked)}
                                                    className="size-4 rounded text-violet-600"
                                                />
                                                <span>Tandai sebagai Paket Rekomendasi / Populer</span>
                                            </label>

                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={packageForm.data.is_active}
                                                    onChange={(e) => packageForm.setData('is_active', e.target.checked)}
                                                    className="size-4 rounded text-emerald-600"
                                                />
                                                <span>Status Aktif (Tampil di Kalkulator Publik)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={cancelPackageForm}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                        <Button
                                            type="submit"
                                            disabled={packageForm.processing}
                                            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-violet-500/25"
                                        >
                                            {packageForm.processing ? 'Menyimpan...' : 'Simpan Paket'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Packages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {packages.map((pkg) => {
                                const IconCmp = getIconComponent(pkg.icon);

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden ${
                                            pkg.is_active
                                                ? 'border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm hover:border-violet-500/40'
                                                : 'border-slate-200/40 bg-slate-100/40 dark:border-slate-800/40 dark:bg-slate-950/40 opacity-60'
                                        }`}
                                    >
                                        {pkg.is_popular && (
                                            <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase shadow-xs">
                                                <Star size={10} fill="currentColor" />
                                                <span>Rekomendasi</span>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                                    <IconCmp size={22} />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                                                            {pkg.title}
                                                        </h4>
                                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                            #{pkg.slug}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                                        <span>⏱️ {pkg.timeline}</span>
                                                        <span>·</span>
                                                        <span>Urutan: {pkg.sort_order}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {pkg.description || 'Tidak ada deskripsi'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                                    Harga Dasar
                                                </span>
                                                <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                                                    {formatCurrency(pkg.base_price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTogglePackage(pkg)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                                        pkg.is_active
                                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                    }`}
                                                >
                                                    {pkg.is_active ? '● Aktif' : '○ Nonaktif'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => startEditPackage(pkg)}
                                                    className="size-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-violet-600 hover:border-violet-500 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Edit Paket"
                                                >
                                                    <Edit2 size={13} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePackage(pkg)}
                                                    className="size-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-500 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Hapus Paket"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: FITUR ADD-ON */}
                {activeTab === 'addons' && (
                    <div className="space-y-6">
                        {/* Action Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Katalog Fitur Tambahan (Add-on Modules)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Modul tambahan opsional yang dapat dipilih klien untuk meningkatkan fungsionalitas website
                                </p>
                            </div>

                            {!isCreatingAddon && !editingAddon && (
                                <Button
                                    size="sm"
                                    onClick={startCreateAddon}
                                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Tambah Add-on Baru</span>
                                </Button>
                            )}
                        </div>

                        {/* Inline Create / Edit Addon Form */}
                        {(isCreatingAddon || editingAddon) && (
                            <div className="p-6 sm:p-7 rounded-[2.2rem] border border-blue-500/40 bg-white/95 dark:bg-slate-900/90 shadow-xl space-y-5 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Sparkles size={15} className="text-blue-500" />
                                        <span>{editingAddon ? `Edit Add-on: ${editingAddon.name}` : 'Buat Fitur Add-on Baru'}</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={cancelAddonForm}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddonSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Nama Fitur Add-on
                                            </Label>
                                            <Input
                                                required
                                                value={addonForm.data.name}
                                                onChange={(e) => addonForm.setData('name', e.target.value)}
                                                placeholder="Contoh: Integrasi Google Gemini AI"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Slug / Key
                                            </Label>
                                            <Input
                                                value={addonForm.data.slug}
                                                onChange={(e) => addonForm.setData('slug', e.target.value)}
                                                placeholder="ai_gemini"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Tarif Biaya Tambahan (IDR)
                                            </Label>
                                            <Input
                                                type="number"
                                                required
                                                min={0}
                                                value={addonForm.data.price}
                                                onChange={(e) => addonForm.setData('price', Number(e.target.value))}
                                                placeholder="50000"
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Ikon Visual
                                            </Label>
                                            <select
                                                value={addonForm.data.icon}
                                                onChange={(e) => addonForm.setData('icon', e.target.value)}
                                                className="w-full h-10 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                                            >
                                                {AVAILABLE_ICONS.map((item) => (
                                                    <option key={item.label} value={item.label}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Urutan Tampil (Sort Order)
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={addonForm.data.sort_order}
                                                onChange={(e) => addonForm.setData('sort_order', Number(e.target.value))}
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1.5 flex items-end">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer h-10">
                                                <input
                                                    type="checkbox"
                                                    checked={addonForm.data.is_active}
                                                    onChange={(e) => addonForm.setData('is_active', e.target.checked)}
                                                    className="size-4 rounded text-emerald-600"
                                                />
                                                <span>Status Aktif di Kalkulator</span>
                                            </label>
                                        </div>

                                        <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Deskripsi Manfaat Fitur
                                            </Label>
                                            <Textarea
                                                rows={2}
                                                value={addonForm.data.description}
                                                onChange={(e) => addonForm.setData('description', e.target.value)}
                                                placeholder="Jelaskan apa yang didapatkan klien jika memilih add-on ini..."
                                                className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={cancelAddonForm}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                        <Button
                                            type="submit"
                                            disabled={addonForm.processing}
                                            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25"
                                        >
                                            {addonForm.processing ? 'Menyimpan...' : 'Simpan Add-on'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Addons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {addons.map((addon) => {
                                const IconCmp = getIconComponent(addon.icon);

                                return (
                                    <div
                                        key={addon.id}
                                        className={`rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between gap-4 ${
                                            addon.is_active
                                                ? 'border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs hover:border-blue-500/40'
                                                : 'border-slate-200/40 bg-slate-100/40 dark:border-slate-800/40 dark:bg-slate-950/40 opacity-60'
                                        }`}
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                    <IconCmp size={18} />
                                                </div>

                                                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    #{addon.slug}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                    {addon.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                    {addon.description || 'Tidak ada deskripsi'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                                    Tarif Add-on
                                                </span>
                                                <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                    +{formatCurrency(addon.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAddon(addon)}
                                                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all ${
                                                        addon.is_active
                                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                    }`}
                                                >
                                                    {addon.is_active ? 'Aktif' : 'Mati'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => startEditAddon(addon)}
                                                    className="size-7 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Edit2 size={12} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAddon(addon)}
                                                    className="size-7 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: PENGATURAN GLOBAL LAYANAN */}
                {activeTab === 'settings' && (
                    <div className="p-6 sm:p-8 rounded-[2.2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs space-y-6 max-w-3xl">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                Pengaturan Global Kalkulator Layanan
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Konfigurasi parameter pengerjaan express, nomor konsultasi WhatsApp, dan teks garansi
                            </p>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Express Delivery Multiplier (Faktor Pengali Biaya Prioritas Kilat)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        step="0.05"
                                        min="1"
                                        max="3"
                                        required
                                        value={settingsForm.data.express_multiplier}
                                        onChange={(e) => settingsForm.setData('express_multiplier', e.target.value)}
                                        className="max-w-xs rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                                    />
                                    <span className="text-xs text-slate-500 font-bold">
                                        = +{Math.round((Number(settingsForm.data.express_multiplier) - 1) * 100)}% dari subtotal
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Contoh: nilai <code>1.20</code> berarti penambahan 20% untuk pengerjaan jalur ekspres.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nomor WhatsApp Konsultasi Resmi
                                </Label>
                                <Input
                                    required
                                    value={settingsForm.data.consultation_phone}
                                    onChange={(e) => settingsForm.setData('consultation_phone', e.target.value)}
                                    placeholder="6281284567890"
                                    className="max-w-xs rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Gunakan format kode negara tanpa simbol + (misal: <code>6281284567890</code>).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Teks Badge Garansi Rekber
                                </Label>
                                <Input
                                    required
                                    value={settingsForm.data.guarantee_badge_text}
                                    onChange={(e) => settingsForm.setData('guarantee_badge_text', e.target.value)}
                                    placeholder="100% Garansi Rekening Bersama (Escrow)"
                                    className="rounded-2xl border-slate-200 dark:border-slate-800 text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Default Down Payment (DP) Persentase (%)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        step="1"
                                        min="10"
                                        max="100"
                                        required
                                        value={settingsForm.data.default_dp_percentage}
                                        onChange={(e) => settingsForm.setData('default_dp_percentage', e.target.value)}
                                        className="max-w-xs rounded-2xl border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                                    />
                                    <span className="text-xs text-slate-500 font-bold">
                                        % Nilai Kontrak Awal Proyek
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Besaran uang muka (Termin 1) standar yang dibayarkan klien saat checkout melalui portal pembayaran resmi. Sisa tagihan (Termin 2) ditagihkan setelah demo staging disetujui. Default: <code>50%</code>.
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-violet-500/25 cursor-pointer"
                                >
                                    {settingsForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan Global'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 4: SIMULASI KALKULATOR LIVE */}
                {activeTab === 'simulator' && (
                    <div className="p-6 sm:p-8 rounded-[2.2rem] border border-violet-500/30 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Eye size={18} className="text-violet-500" />
                                    <span>Simulasi Interaktif Kalkulator Publik</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Uji coba langsung bagaimana kombinasi paket dan add-on Anda dihitung secara real-time
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSimPackage(packages[0]?.slug || '');
                                    setSimAddons([]);
                                    setSimExpress(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                            >
                                <RotateCcw size={12} />
                                <span>Reset Simulasi</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Controls (2 cols) */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Package Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        1. Pilih Paket Website:
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {packages.filter((p) => p.is_active).map((p) => (
                                            <button
                                                key={p.slug}
                                                type="button"
                                                onClick={() => setSimPackage(p.slug)}
                                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                                    simPackage === p.slug
                                                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                                                        {p.title}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">⏱️ {p.timeline}</div>
                                                </div>
                                                <div className="font-mono text-xs font-black text-violet-600 dark:text-violet-400">
                                                    {formatCurrency(p.base_price)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Addons Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        2. Pilih Fitur Add-on:
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {addons.filter((a) => a.is_active).map((ad) => {
                                            const isChecked = simAddons.includes(ad.slug);
                                            return (
                                                <button
                                                    key={ad.slug}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isChecked) {
                                                            setSimAddons(simAddons.filter((s) => s !== ad.slug));
                                                        } else {
                                                            setSimAddons([...simAddons, ad.slug]);
                                                        }
                                                    }}
                                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                                                        isChecked
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`size-4 rounded flex items-center justify-center text-[10px] ${
                                                                isChecked
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'border border-slate-300 dark:border-slate-700'
                                                            }`}
                                                        >
                                                            {isChecked && '✓'}
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {ad.name}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        +{formatCurrency(ad.price)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Speed Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        3. Kecepatan Pengerjaan:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSimExpress(false)}
                                            className={`p-3 rounded-2xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                                !simExpress
                                                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            ⏱️ Kecepatan Standar (+0%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSimExpress(true)}
                                            className={`p-3 rounded-2xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                                simExpress
                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            ⚡ Express Priority (+{Math.round((Number(settingsForm.data.express_multiplier) - 1) * 100)}%)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Summary Card (1 col) */}
                            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                        <span className="text-xs font-bold text-slate-500">Estimasi Total Biaya</span>
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Paket:</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                {formatCurrency(baseSimPrice)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-slate-500">
                                            <span>Add-ons ({simAddons.length}):</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                +{formatCurrency(addonsSimPrice)}
                                            </span>
                                        </div>

                                        {simExpress && (
                                            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                                                <span>Express Priority:</span>
                                                <span>+{Math.round((Number(settingsForm.data.express_multiplier) - 1) * 100)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase text-slate-400 block">
                                            Total Nilai Kontrak Proyek:
                                        </span>
                                        <div className="font-mono text-2xl font-black text-violet-600 dark:text-violet-400">
                                            {formatCurrency(totalSim)}
                                        </div>
                                    </div>

                                    {/* Termin Breakdown */}
                                    <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-bold">
                                            <span>Termin 1 (DP {settingsForm.data.default_dp_percentage}%):</span>
                                            <span className="font-mono text-violet-700 dark:text-violet-300">
                                                {formatCurrency(Math.round((totalSim * (Number(settingsForm.data.default_dp_percentage) || 50)) / 100))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500 text-[11px]">
                                            <span>Termin 2 (Pelunasan):</span>
                                            <span className="font-mono font-semibold">
                                                {formatCurrency(totalSim - Math.round((totalSim * (Number(settingsForm.data.default_dp_percentage) || 50)) / 100))}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[10.5px] text-slate-400 leading-tight">
                                        Klien membayar DP di awal via Rekening Bersama (Escrow). Pelunasan ditagihkan setelah demo staging disetujui.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
