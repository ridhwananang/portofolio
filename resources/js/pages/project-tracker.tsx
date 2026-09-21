import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    ExternalLink,
    FileCode,
    Globe,
    Layers,
    Mail,
    MessageSquare,
    Package,
    Rocket,
    Share2,
    ShieldCheck,
    Sparkles,
    User,
    Zap,
} from 'lucide-react';

interface Props {
    order: {
        id: number;
        tracking_code: string;
        client_name: string;
        client_email: string;
        client_phone: string | null;
        project_type: string;
        selected_features: string[];
        delivery_speed: string;
        notes: string | null;
        total_amount: string;
        currency: string;
        status: string; // pending_payment, in_progress, in_review, completed, cancelled
        staging_url: string | null;
        created_at: string;
        quest?: {
            id: number;
            status: string;
            deposit_transaction?: {
                id: number;
                status: string;
                xendit_external_id: string;
                payment_details?: {
                    invoice_url?: string;
                };
                paid_at: string | null;
            } | null;
            payout_transaction?: {
                id: number;
                status: string;
                xendit_external_id: string;
                released_at: string | null;
            } | null;
        } | null;
    };
}

export default function ProjectTracker({ order }: Props) {
    const [stagingInput, setStagingInput] = useState(order.staging_url || '');
    const [isUpdatingStaging, setIsUpdatingStaging] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    const projectTypeName = ucwords(order.project_type.replace('_', ' '));

    function ucwords(str: string) {
        return str.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleApprove = () => {
        if (confirm('Apakah Anda puas dengan hasil website dan ingin merilis pembayaran rekber ke Ridhwan?')) {
            setIsApproving(true);
            router.post(`/track-project/${order.tracking_code}/approve`, {}, {
                onFinish: () => setIsApproving(false),
            });
        }
    };

    const handleStagingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingStaging(true);
        router.post(
            `/track-project/${order.tracking_code}/staging`,
            { staging_url: stagingInput },
            { onFinish: () => setIsUpdatingStaging(false) }
        );
    };

    const invoiceUrl = order.quest?.deposit_transaction?.payment_details?.invoice_url;

    // WhatsApp Message
    const waText = encodeURIComponent(
        `Halo Ridhwan, saya ingin mendiskusikan proposal proyek ${order.tracking_code} (${projectTypeName}) yang baru saja saya buat di website Anda:\n\n` +
        `• Klien: ${order.client_name}\n` +
        `• Paket: ${projectTypeName}\n` +
        `• Estimasi Biaya: ${formatCurrency(order.total_amount)}\n` +
        `• Link Proposal: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    const waUrl = `https://wa.me/6281284567890?text=${waText}`; // fallback WA contact

    const steps = [
        {
            title: 'Proposal & Rekber',
            description: 'Penawaran dibuat & dana siap disetor',
            isDone: ['in_progress', 'in_review', 'completed'].includes(order.status),
            isCurrent: order.status === 'pending_payment',
        },
        {
            title: 'Pengembangan',
            description: 'Ridhwan coding website Anda',
            isDone: ['in_review', 'completed'].includes(order.status),
            isCurrent: order.status === 'in_progress',
        },
        {
            title: 'Review Demo Staging',
            description: 'Klien uji coba hasil website live',
            isDone: order.status === 'completed',
            isCurrent: order.status === 'in_review',
        },
        {
            title: 'Selesai & Handover',
            description: 'Persetujuan & serah terima berkas',
            isDone: order.status === 'completed',
            isCurrent: order.status === 'completed',
        },
    ];

    const featureNames: Record<string, string> = {
        ai_gemini: 'Integrasi Google Gemini AI Chatbot',
        payment_gateway: 'Payment Gateway Xendit (QRIS, VA, E-Wallet)',
        admin_cms: 'Dashboard Admin Panel (Filament v3)',
        auth_security: 'Multi-Role Auth & 2FA / Passkeys',
        seo_speed: 'Optimasi Performa & SEO Premium',
    };

    return (
        <>
            <Head title={`Proposal & Pelacak Proyek: ${order.tracking_code} - Ridhwan Anang`} />

            <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-xl bg-violet-600 p-2 text-white shadow-md">
                                    <Sparkles size={18} />
                                </span>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Digital Proposal & Pelacak Proyek
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Jasa Pembuatan Website & Aplikasi • Ridhwan Anang Ma'ruf
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                <span>{copied ? 'Link Tersalin!' : 'Salin Link Proposal'}</span>
                            </button>

                            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                {order.tracking_code}
                            </span>
                        </div>
                    </div>

                    {/* Status Callout Banner */}
                    {order.status === 'pending_payment' && (
                        <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent p-6 sm:p-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/10 px-3 py-0.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                                        <Sparkles size={13} />
                                        <span>Draft Penawaran Resmi Siap</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        Proposal Proyek: {projectTypeName}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                        Rincian kebutuhan website Anda telah dirangkum di bawah. Anda dapat <strong>berdiskusi terlebih dahulu</strong> dengan Ridhwan atau langsung <strong>mengamankan jadwal pengerjaan</strong> dengan menyetor dana ke Rekber Xendit.
                                    </p>
                                </div>

                                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 dark:sm:border-slate-800 shrink-0">
                                    <div className="text-xs text-slate-500">Total Estimasi</div>
                                    <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
                                        {formatCurrency(order.total_amount)}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                        ✓ Garansi Rekber Xendit
                                    </div>
                                </div>
                            </div>

                            {/* Flexible Action Buttons for Client */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                {invoiceUrl && (
                                    <a
                                        href={invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-violet-700 transition-all active:scale-98"
                                    >
                                        <CreditCard size={15} />
                                        <span>Kunci Slot & Bayar via Rekber Xendit</span>
                                        <ExternalLink size={13} />
                                    </a>
                                )}

                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300 transition-all"
                                >
                                    <MessageSquare size={15} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>Konsultasikan via WhatsApp</span>
                                    <ExternalLink size={13} />
                                </a>

                                <a
                                    href={`mailto:ridhwananang@gmail.com?subject=Diskusi Proyek ${order.tracking_code}&body=Halo Ridhwan, saya ingin mendiskusikan proposal proyek ${order.tracking_code}...`}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <Mail size={15} />
                                    <span>Kirim Email</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Progress Stepper */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={16} className="text-violet-600" />
                                Tahapan Pengerjaan Proyek
                            </h3>
                            <span className="text-xs font-bold uppercase text-violet-600">
                                Status: {order.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            {steps.map((s, idx) => (
                                <div
                                    key={s.title}
                                    className={`rounded-2xl border p-3.5 transition-all ${
                                        s.isDone
                                            ? 'border-emerald-500/30 bg-emerald-500/5'
                                            : s.isCurrent
                                            ? 'border-violet-600 bg-violet-50/50 dark:border-violet-500 dark:bg-violet-950/30'
                                            : 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                                            s.isDone
                                                ? 'bg-emerald-600 text-white'
                                                : s.isCurrent
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                            {s.isDone ? '✓' : idx + 1}
                                        </div>
                                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                            {s.title}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                                        {s.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scope of Work & Order Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Scope of Work (2 cols) */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Staging Preview Card (If available) */}
                            {order.staging_url && (
                                <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold text-sm text-purple-700 dark:text-purple-300">
                                            <Globe size={18} />
                                            <span>Link Preview Demo Staging</span>
                                        </div>
                                        <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                            Siap Diuji Coba
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Website hasil pengerjaan Ridhwan telah aktif di server uji coba. Silakan klik tautan di bawah untuk mencoba:
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={order.staging_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-between rounded-xl border border-purple-300 bg-white px-4 py-2.5 text-xs font-mono text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300"
                                        >
                                            <span className="truncate">{order.staging_url}</span>
                                            <ExternalLink size={14} className="shrink-0 ml-2" />
                                        </a>

                                        {order.status === 'in_review' && (
                                            <button
                                                type="button"
                                                onClick={handleApprove}
                                                disabled={isApproving}
                                                className="cursor-pointer shrink-0 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {isApproving ? 'Memproses...' : 'Setujui & Selesaikan Proyek'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Scope of Work Details */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Package size={16} className="text-violet-600" />
                                    Rincian Lingkup Pekerjaan (Scope of Work)
                                </h3>

                                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500">Tipe Paket Website:</span>
                                        <strong className="text-slate-900 dark:text-white">{projectTypeName}</strong>
                                    </div>

                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500">Kecepatan Pengerjaan:</span>
                                        <span className="font-semibold capitalize text-slate-900 dark:text-white">
                                            {order.delivery_speed === 'express' ? '⚡ Express Priority (+20%)' : 'Standar'}
                                        </span>
                                    </div>

                                    <div className="py-2.5 space-y-1.5">
                                        <span className="text-slate-500 block">Fitur Tambahan yang Dipilih:</span>
                                        {order.selected_features && order.selected_features.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                {order.selected_features.map((featKey) => (
                                                    <div
                                                        key={featKey}
                                                        className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium"
                                                    >
                                                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                                        <span>{featureNames[featKey] || featKey}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Paket standar tanpa add-on</span>
                                        )}
                                    </div>

                                    {order.notes && (
                                        <div className="py-2.5 space-y-1">
                                            <span className="text-slate-500 block">Catatan & Kebutuhan Klien:</span>
                                            <p className="rounded-xl bg-slate-50 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                                {order.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Developer Staging Box (Admin only) */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileCode size={16} className="text-violet-600" />
                                    Input Staging URL (Khusus Developer / Ridhwan)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Unggah link preview demo staging agar klien dapat menguji coba hasil website:
                                </p>
                                <form onSubmit={handleStagingSubmit} className="flex gap-2">
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://preview-client.vercel.app"
                                        value={stagingInput}
                                        onChange={(e) => setStagingInput(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isUpdatingStaging}
                                        className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
                                    >
                                        {isUpdatingStaging ? 'Menyimpan...' : 'Update Staging'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right: Escrow Guarantee & Contacts (1 col) */}
                        <div className="space-y-6">
                            {/* Escrow Status Card */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    <span>Status Rekber Xendit</span>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Total Biaya</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Status Dana</span>
                                        <span className="font-bold uppercase text-emerald-600">
                                            {order.quest?.deposit_transaction?.status || 'PENDING'}
                                        </span>
                                    </div>
                                    {order.quest?.deposit_transaction?.paid_at && (
                                        <div className="text-[11px] text-slate-400">
                                            Waktu Masuk: {new Date(order.quest.deposit_transaction.paid_at).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 leading-relaxed">
                                    Dana disimpan aman di sistem escrow Xendit. Tidak ada uang riil yang dipotong pada mode simulasi Sandbox.
                                </div>
                            </div>

                            {/* Client & Developer Info */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
                                <div>
                                    <div className="text-slate-400 text-[11px] mb-1">Klien Pemesan:</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{order.client_name}</div>
                                    <div className="text-slate-500">{order.client_email}</div>
                                    {order.client_phone && <div className="text-slate-500">{order.client_phone}</div>}
                                </div>

                                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <div className="text-slate-400 text-[11px] mb-1">Developer / Penyedia Jasa:</div>
                                    <div className="font-bold text-slate-900 dark:text-white">Ridhwan Anang Ma'ruf</div>
                                    <div className="text-slate-500">ridhwananang@gmail.com</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
