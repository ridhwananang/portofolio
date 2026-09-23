import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    ExternalLink,
    Eye,
    EyeOff,
    FileCode,
    FileText,
    Globe,
    KeyRound,
    Lock,
    Mail,
    MessageSquare,
    Monitor,
    Package,
    Printer,
    Send,
    Share2,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Unlock,
    User,
    X,
    Zap,
} from 'lucide-react';
import { ProjectOrder, ProjectMilestone, ClientRevision, HandoverData } from '@/types/admin';

interface Props {
    order: ProjectOrder;
}

export default function ProjectTracker({ order }: Props) {
    const [stagingInput, setStagingInput] = useState(order.staging_url || '');
    const [isUpdatingStaging, setIsUpdatingStaging] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Staging preview viewport state
    const [showStagingPreview, setShowStagingPreview] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    // Certificate / Invoice print modal
    const [showCertificate, setShowCertificate] = useState(false);
    const [activeInvoiceTab, setActiveInvoiceTab] = useState<'dp' | 'final'>(
        order.payment_stage === 'fully_paid' || order.status === 'completed' ? 'final' : 'dp'
    );

    // Revision submission form state
    const [revisionText, setRevisionText] = useState('');
    const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

    // Password visibility toggle in Handover Vault
    const [showHandoverPassword, setShowHandoverPassword] = useState(false);

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    const projectTypeName = order.project_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleApprove = () => {
        if (
            confirm(
                'Apakah Anda puas dengan hasil pengerjaan website dan ingin merilis dana rekber ke Ridhwan Anang Ma\'ruf? Akses repositori dan kredensial CMS akan langsung terbuka.'
            )
        ) {
            setIsApproving(true);
            router.post(
                `/track-project/${order.tracking_code}/approve`,
                {},
                {
                    onFinish: () => setIsApproving(false),
                }
            );
        }
    };

    const handleRevisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!revisionText.trim()) return;

        setIsSubmittingRevision(true);
        router.post(
            `/track-project/${order.tracking_code}/revision`,
            { revision_text: revisionText },
            {
                onSuccess: () => {
                    setRevisionText('');
                },
                onFinish: () => setIsSubmittingRevision(false),
            }
        );
    };

    const [isRequestingSettlement, setIsRequestingSettlement] = useState(false);
    const [settlementInvoiceUrl, setSettlementInvoiceUrl] = useState<string | null>(
        order.final_transaction?.payment_details?.invoice_url
        || order.quest?.final_deposit_transaction?.payment_details?.invoice_url
        || null
    );

    const handleRequestSettlement = async () => {
        setIsRequestingSettlement(true);
        try {
            const res = await fetch(`/track-project/${order.tracking_code}/settle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Gagal menerbitkan tagihan pelunasan.');
            }
            if (data.invoice_url) {
                setSettlementInvoiceUrl(data.invoice_url);
                window.location.href = data.invoice_url;
            }
        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan saat memproses pelunasan.');
        } finally {
            setIsRequestingSettlement(false);
        }
    };

    const dpInvoiceUrl = order.dp_transaction?.payment_details?.invoice_url
        || order.quest?.dp_deposit_transaction?.payment_details?.invoice_url
        || order.quest?.deposit_transaction?.payment_details?.invoice_url;

    const finalInvoiceUrl = settlementInvoiceUrl
        || order.final_transaction?.payment_details?.invoice_url
        || order.quest?.final_deposit_transaction?.payment_details?.invoice_url;

    const dpPercentage = Number(order.dp_percentage) || 50;
    const totalAmount = Number(order.total_amount) || 0;

    const computedDpAmount = Number(order.dp_amount) > 0
        ? Number(order.dp_amount)
        : (order.payment_scheme === 'down_payment' || !order.payment_scheme
            ? Math.round((totalAmount * dpPercentage) / 100)
            : totalAmount);

    const computedRemainingAmount = Number(order.remaining_amount) > 0
        ? Number(order.remaining_amount)
        : (order.payment_scheme === 'down_payment' || !order.payment_scheme
            ? Math.max(0, totalAmount - computedDpAmount)
            : 0);

    const isDpPaid = order.payment_stage === 'dp_paid'
        || order.payment_stage === 'awaiting_final'
        || order.payment_stage === 'fully_paid'
        || Boolean(order.dp_paid_at)
        || order.dp_transaction?.status === 'held'
        || order.dp_transaction?.status === 'released'
        || order.quest?.dp_deposit_transaction?.status === 'held'
        || order.quest?.deposit_transaction?.status === 'held';

    const isFullyPaid = order.payment_stage === 'fully_paid'
        || Boolean(order.final_paid_at)
        || order.status === 'completed'
        || order.final_transaction?.status === 'held'
        || order.final_transaction?.status === 'released'
        || order.quest?.final_deposit_transaction?.status === 'held';

    // Client-safe tracker URL for WhatsApp link to avoid SSR hydration mismatch
    const [trackerUrl, setTrackerUrl] = useState(`https://ridhwananang.id/track-project/${order.tracking_code}`);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTrackerUrl(window.location.href);
        }
    }, []);

    // WhatsApp Message
    const waText = encodeURIComponent(
        `Halo Ridhwan, saya ingin mendiskusikan proyek website ${order.tracking_code} (${projectTypeName}):\n\n` +
        `• Klien: ${order.client_name}\n` +
        `• Status: ${order.status.replace(/_/g, ' ')}\n` +
        `• Nilai Kontrak: ${formatCurrency(totalAmount)}\n` +
        `• Link Tracker: ${trackerUrl}`
    );
    const waUrl = `https://wa.me/6281284567890?text=${waText}`;

    const featureLabels: Record<string, string> = {
        ai_gemini: 'Integrasi Google Gemini AI Chatbot',
        ai_chatbot: 'Integrasi AI Chatbot Pintar',
        payment_gateway: 'Payment Gateway Otomatis (QRIS, VA, E-Wallet)',
        admin_cms: 'Dashboard Admin Panel CMS (Filament / Custom)',
        auth_security: 'Multi-Role Auth & 2FA / Passkeys',
        seo_speed: 'Optimasi Performa Web & SEO Premium',
        multilanguage: 'Multi-bahasa (ID / EN)',
    };
    const featureNames = featureLabels;

    // Calculate progress percentage based on 5 milestones with strict validation against payment status
    const rawMilestones: ProjectMilestone[] = order.milestone_progress && order.milestone_progress.length > 0
        ? order.milestone_progress
        : [
            {
                id: 'deposit',
                title: 'DP Terverifikasi (Uang Muka)',
                description: 'Pembayaran DP telah diamankan di Rekening Bersama (Escrow) untuk memulai pengerjaan.',
                status: isDpPaid ? 'completed' : 'pending',
                updated_at: order.dp_paid_at || order.created_at,
            },
            {
                id: 'design',
                title: 'Perancangan UI/UX & Arsitektur',
                description: 'Penyusunan mockup tata letak visual, skema warna, dan arsitektur data.',
                status: ['in_review', 'completed'].includes(order.status)
                    ? 'completed'
                    : order.status === 'in_progress'
                    ? 'in_progress'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'development',
                title: 'Pengembangan Sistem & Fitur',
                description: 'Pengkodean frontend, modul backend, dan integrasi fitur interaktif.',
                status: ['in_review', 'completed'].includes(order.status)
                    ? 'completed'
                    : order.status === 'in_progress'
                    ? 'in_progress'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'staging',
                title: 'Preview Staging Live & Uji Coba Klien',
                description: 'Website aktif di server preview agar klien dapat menguji coba langsung.',
                status: order.status === 'completed'
                    ? 'completed'
                    : order.status === 'in_review'
                    ? 'in_progress'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'handover',
                title: 'Persetujuan Final & Serah Terima Aset',
                description: 'Pencairan dana rekber dan penyerahan repositori serta kredensial admin.',
                status: order.status === 'completed' ? 'completed' : 'pending',
                updated_at: null,
            },
        ];

    const milestones = rawMilestones.map((m) => {
        let desc = m.description || '';
        desc = desc.replace(/Rekber Midtrans Escrow/gi, 'Rekening Bersama (Escrow)');
        desc = desc.replace(/Midtrans Escrow/gi, 'Rekening Bersama (Escrow)');
        desc = desc.replace(/Midtrans/gi, 'Rekening Bersama (Escrow)');
        if (m.id === 'deposit') {
            return {
                ...m,
                description: desc,
                status: isDpPaid ? 'completed' : 'pending',
            };
        }
        return {
            ...m,
            description: desc,
        };
    });

    const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
    const progressPercent = Math.round((completedMilestones / milestones.length) * 100);

    return (
        <>
            <Head title={`Client Project Portal: #${order.tracking_code} (${projectTypeName}) - Ridhwan Anang`} />

            {/* Print Styles for Escrow Guarantee Certificate */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-certificate, #print-certificate * {
                        visibility: visible;
                    }
                    #print-certificate {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 2rem !important;
                        z-index: 999999;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="relative min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 dark:bg-[#070A14] text-slate-900 dark:text-slate-100 transition-colors duration-300">
                {/* Background Ambient Glows */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
                    <div className="absolute -top-24 right-10 size-[32rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_70%)] blur-3xl" />
                    <div className="absolute top-1/2 -left-20 size-[30rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)] blur-3xl" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800/80">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                                    <Sparkles size={20} />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                        Client Project Portal
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Jasa Pembuatan Website & Aplikasi • Ridhwan Anang Ma'ruf
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {(isDpPaid || isFullyPaid) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveInvoiceTab(isFullyPaid ? 'final' : 'dp');
                                        setShowCertificate(true);
                                    }}
                                    className="cursor-pointer flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-850 transition-all"
                                >
                                    <FileText size={14} className="text-violet-500" />
                                    <span>Cetak Invoice Resmi</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="cursor-pointer flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-850 transition-all"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                <span>{copied ? 'Tersalin!' : 'Bagikan Link'}</span>
                            </button>

                            <span className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-mono font-black text-violet-700 dark:text-violet-300">
                                #{order.tracking_code}
                            </span>
                        </div>
                    </div>

                    {/* 1. Pending DP Payment Alert Banner */}
                    {order.status === 'pending_payment' && (
                        <div className="rounded-[2.2rem] border border-violet-500/30 bg-gradient-to-r from-violet-500/15 via-violet-500/5 to-transparent p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                                        <Sparkles size={13} />
                                        <span>Menunggu Pembayaran Uang Muka (DP)</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        Proposal Proyek: {projectTypeName}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                        Rincian spesifikasi website Anda telah tercatat. Cukup bayar <strong>Uang Muka (DP {dpPercentage}%)</strong> sebesar <strong>{formatCurrency(computedDpAmount)}</strong> untuk memulai pengerjaan. Sisa pelunasan sebesar <strong>{formatCurrency(computedRemainingAmount)}</strong> baru dibayar setelah website selesai diuji coba. Pembayaran diamankan 100% menggunakan <strong>Rekening Bersama (Escrow Resmi)</strong>.
                                    </p>
                                </div>

                                <div className="text-right sm:border-l sm:border-slate-200/80 sm:pl-6 dark:sm:border-slate-800 shrink-0 space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tagihan DP ({dpPercentage}%) Saat Ini</div>
                                    <div className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">
                                        {formatCurrency(computedDpAmount)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Total Kontrak: {formatCurrency(totalAmount)}
                                    </div>
                                    {computedRemainingAmount > 0 && (
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Sisa Pelunasan Nanti: {formatCurrency(computedRemainingAmount)}
                                        </div>
                                    )}
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center justify-end gap-1">
                                        <ShieldCheck size={13} />
                                        <span>Garansi Rekber Escrow</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                {dpInvoiceUrl && (
                                    <a
                                        href={dpInvoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-98 transition-all"
                                    >
                                        <CreditCard size={15} />
                                        <span>Bayar Uang Muka (DP {dpPercentage}%) — {formatCurrency(computedDpAmount)}</span>
                                        <ExternalLink size={13} />
                                    </a>
                                )}

                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300 transition-all hover:scale-[1.01] active:scale-98"
                                >
                                    <MessageSquare size={15} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>Konsultasikan via WhatsApp</span>
                                    <ExternalLink size={13} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 2. In-Progress Status Banner (DP Paid, Under Development) */}
                    {order.status === 'in_progress' && (
                        <div className="rounded-[2.2rem] border border-blue-500/30 bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-600/10 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                                        <CheckCircle2 size={13} />
                                        <span>Uang Muka (DP) Terverifikasi • Pengembangan Aktif</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        Website Sedang Dalam Tahap Pengerjaan
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                        Uang muka (DP) sebesar <strong>{formatCurrency(computedDpAmount)}</strong> telah diamankan di Rekening Bersama (Escrow). Pengembang sedang melakukan implementasi fitur dan arsitektur visual. Sisa pelunasan sebesar <strong>{formatCurrency(computedRemainingAmount)}</strong> baru akan ditagihkan saat website telah selesai dan siap diuji coba.
                                    </p>
                                </div>

                                <div className="text-right sm:border-l sm:border-slate-200/80 sm:pl-6 dark:sm:border-slate-800 shrink-0 space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Pelunasan Nanti</div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300">
                                        {formatCurrency(computedRemainingAmount)}
                                    </div>
                                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                                        Dibayar setelah demo disetujui
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. In-Review Status Banner (Staging is Ready for Approval & Settlement) */}
                    {order.status === 'in_review' && (
                        <div className="rounded-[2.2rem] border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                                        <Globe size={13} />
                                        <span>Website Siap Diuji Coba • Tahap Kesepakatan Akhir</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        Hasil Pengerjaan Siap Direview
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                        Silakan uji coba langsung seluruh fitur pada link staging demo di bawah. Jika masih ada bagian yang perlu disesuaikan, kirimkan catatan revisi. Jika hasil website telah memenuhi ekspektasi Anda (*kesepakatan akhir tercapai*), silakan lakukan pembayaran pelunasan sisa tagihan untuk membuka seluruh akses kredensial dan source code repositori.
                                    </p>
                                </div>

                                <div className="text-right sm:border-l sm:border-slate-200/80 sm:pl-6 dark:sm:border-slate-800 shrink-0 space-y-1">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Pelunasan</div>
                                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                                        {formatCurrency(computedRemainingAmount)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        DP Terbayar: {formatCurrency(computedDpAmount)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                {!isFullyPaid && computedRemainingAmount > 0 ? (
                                    <>
                                        {finalInvoiceUrl ? (
                                            <a
                                                href={finalInvoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-98 transition-all"
                                            >
                                                <CreditCard size={16} />
                                                <span>Bayar Pelunasan Akhir ({formatCurrency(computedRemainingAmount)})</span>
                                                <ExternalLink size={13} />
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleRequestSettlement}
                                                disabled={isRequestingSettlement}
                                                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-98 disabled:opacity-50 transition-all"
                                            >
                                                <CheckCircle2 size={16} />
                                                <span>{isRequestingSettlement ? 'Menerbitkan Invoice...' : `Kesepakatan Akhir Tercapai: Bayar Pelunasan (${formatCurrency(computedRemainingAmount)})`}</span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-98 disabled:opacity-50 transition-all"
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>{isApproving ? 'Memproses...' : 'Setujui Hasil & Buka Akses Handover'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Completed Project Banner */}
                    {order.status === 'completed' && (
                        <div className="rounded-[2.2rem] border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-8 space-y-3 shadow-xl backdrop-blur-xl">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 size={16} />
                                <span>Proyek Selesai & Lunas Sepenuhnya (DP + Pelunasan)</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                Serah Terima Aset & Kredensial Telah Dibuka
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                Terima kasih atas kepercayaan Anda bermitra dengan Ridhwan Anang Ma'ruf. Seluruh kredensial administratif CMS dan tautan source code repositori telah terbuka di bagian <strong>Handover Vault</strong> di bawah.
                            </p>
                        </div>
                    )}

                    {/* 5-Stage Progressive Milestone Tracker */}
                    <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock size={18} className="text-violet-600 dark:text-violet-400" />
                                    <span>Milestone Progress (Tahapan Pengerjaan)</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    5 tahapan standar industri untuk transparansi dan kepastian kualitas
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-[11px] font-bold text-slate-400">Progres Keseluruhan:</span>
                                    <div className="font-mono text-sm font-black text-violet-600 dark:text-violet-400">
                                        {progressPercent}%
                                    </div>
                                </div>
                                <div className="h-2 w-24 sm:w-32 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-700"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Milestone Timeline Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                            {milestones.map((m, idx) => {
                                const isDone = m.status === 'completed';
                                const isInProgress = m.status === 'in_progress';
                                return (
                                    <div
                                        key={m.id || idx}
                                        className={`rounded-2xl border p-4 transition-all duration-300 relative flex flex-col justify-between ${
                                            isDone
                                                ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                                                : isInProgress
                                                ? 'border-violet-600 bg-violet-50/80 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-violet-950/30 dark:ring-violet-500/30'
                                                : 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`flex size-6 items-center justify-center rounded-xl text-[11px] font-black ${
                                                        isDone
                                                            ? 'bg-emerald-600 text-white'
                                                            : isInProgress
                                                            ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xs'
                                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                    }`}
                                                >
                                                    {isDone ? '✓' : idx + 1}
                                                </div>

                                                <span
                                                    className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                                        isDone
                                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                            : isInProgress
                                                            ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 animate-pulse'
                                                            : 'bg-slate-200/50 text-slate-400 dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {isDone ? 'Selesai' : isInProgress ? 'Aktif' : 'Antrean'}
                                                </span>
                                            </div>

                                            <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                                                {m.title}
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                {m.description}
                                            </p>
                                        </div>

                                        {m.updated_at && (
                                            <div suppressHydrationWarning className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px] text-slate-400 font-mono">
                                                {new Date(m.updated_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Staging Live Preview Interactive Section (If staging_url set) */}
                    {order.staging_url && (
                        <div className="rounded-[2.2rem] border border-violet-500/30 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Globe size={18} className="text-violet-600 dark:text-violet-400" />
                                        <span>Staging Live Preview</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Uji coba langsung responsivitas dan fitur website pada server staging
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowStagingPreview(!showStagingPreview)}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-violet-300 dark:border-violet-700/60 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-all"
                                    >
                                        <Monitor size={14} />
                                        <span>{showStagingPreview ? 'Sembunyikan Embed' : 'Tampilkan Embed Preview'}</span>
                                    </button>

                                    <a
                                        href={order.staging_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 text-xs font-bold hover:opacity-90 transition-all"
                                    >
                                        <span>Buka di Tab Baru</span>
                                        <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>

                            {/* Embedded Viewport (Optional Toggle) */}
                            {showStagingPreview && (
                                <div className="space-y-3 pt-3">
                                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewDevice('desktop')}
                                                className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                                    previewDevice === 'desktop'
                                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                <Monitor size={14} />
                                                <span>Desktop View</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setPreviewDevice('mobile')}
                                                className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                                    previewDevice === 'mobile'
                                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                <Smartphone size={14} />
                                                <span>Mobile Frame (375px)</span>
                                            </button>
                                        </div>

                                        <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                                            {order.staging_url}
                                        </div>
                                    </div>

                                    <div className="flex justify-center bg-slate-200/50 dark:bg-slate-950/80 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <iframe
                                            src={order.staging_url}
                                            title="Live Staging Preview"
                                            className={`rounded-2xl border border-slate-300 dark:border-slate-700 bg-white transition-all shadow-xl ${
                                                previewDevice === 'mobile'
                                                    ? 'w-[375px] h-[640px]'
                                                    : 'w-full h-[600px]'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scope of Work & Escrow Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Scope of Work & Client Revisions (2 cols) */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Scope of Work Breakdown */}
                            <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Package size={16} className="text-violet-600 dark:text-violet-400" />
                                    <span>Rincian Lingkup Pekerjaan (Scope of Work)</span>
                                </h3>

                                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    <div className="py-3 flex justify-between">
                                        <span className="text-slate-500">Tipe Paket Website:</span>
                                        <strong className="text-slate-900 dark:text-white">{projectTypeName}</strong>
                                    </div>

                                    <div className="py-3 flex justify-between">
                                        <span className="text-slate-500">Kecepatan Pengerjaan:</span>
                                        <span className="font-bold capitalize text-slate-900 dark:text-white">
                                            {order.delivery_speed === 'express' ? '⚡ Express Priority (+20%)' : 'Standar'}
                                        </span>
                                    </div>

                                    <div className="py-3 space-y-1.5">
                                        <span className="text-slate-500 block">Fitur Tambahan yang Dipilih:</span>
                                        {order.selected_features && order.selected_features.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                {order.selected_features.map((featKey) => (
                                                    <div
                                                        key={featKey}
                                                        className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50/80 px-3 py-2 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-semibold text-xs"
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
                                        <div className="py-3 space-y-1.5">
                                            <span className="text-slate-500 block">Catatan & Kebutuhan Klien:</span>
                                            <p className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                                                {order.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Revision & Feedback Box (Available during in_progress or in_review) */}
                            {['in_progress', 'in_review'].includes(order.status) && (
                                <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            <MessageSquare size={16} className="text-violet-600 dark:text-violet-400" />
                                            <span>Kirim Catatan Revisi / Penyesuaian</span>
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-400">
                                            Garansi Revisi Aktif
                                        </span>
                                    </div>

                                    <form onSubmit={handleRevisionSubmit} className="space-y-3">
                                        <textarea
                                            rows={3}
                                            value={revisionText}
                                            onChange={(e) => setRevisionText(e.target.value)}
                                            placeholder="Tuliskan bagian mana yang perlu disesuaikan (misal: warna tombol hero diubah, penambahan teks di footer, dsb)..."
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 leading-relaxed"
                                        />

                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] text-slate-400">
                                                Ridhwan akan langsung menerima notifikasi dan memperbarui progress tracker.
                                            </p>

                                            <button
                                                type="submit"
                                                disabled={isSubmittingRevision || !revisionText.trim()}
                                                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
                                            >
                                                <Send size={13} />
                                                <span>{isSubmittingRevision ? 'Mengirim...' : 'Kirim Catatan'}</span>
                                            </button>
                                        </div>
                                    </form>

                                    {/* History of Submitted Revisions */}
                                    {order.revision_notes && order.revision_notes.length > 0 && (
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                            <span className="text-xs font-bold text-slate-500 block">Riwayat Catatan Revisi:</span>
                                            <div className="space-y-2">
                                                {order.revision_notes.map((rev, idx) => (
                                                    <div
                                                        key={rev.id || idx}
                                                        className="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40 space-y-1"
                                                    >
                                                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                            <span>Revisi #{idx + 1}</span>
                                                            <span suppressHydrationWarning className="font-mono">
                                                                {new Date(rev.created_at).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                                                            {rev.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Handover Vault Card (Source code, live URL, CMS admin credentials) */}
                            <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
                                        {order.status === 'completed' ? (
                                            <Unlock size={18} className="text-emerald-500" />
                                        ) : (
                                            <Lock size={18} className="text-slate-400" />
                                        )}
                                        <span>Handover Vault (Aset & Kredensial Website)</span>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            order.status === 'completed'
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                        }`}
                                    >
                                        {order.status === 'completed' ? 'Aset Terbuka' : 'Terkunci'}
                                    </span>
                                </div>

                                {order.status === 'completed' ? (
                                    <div className="space-y-3 pt-1 text-xs">
                                        <p className="text-slate-500 text-[11px]">
                                            Berikut adalah repositori dan akses login administratif website Anda:
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Repository URL */}
                                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                                                <span className="text-[11px] text-slate-400 block">Source Code Repository:</span>
                                                {order.handover_data?.repository_url ? (
                                                    <a
                                                        href={order.handover_data.repository_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-bold"
                                                    >
                                                        <span className="truncate">{order.handover_data.repository_url}</span>
                                                        <ExternalLink size={12} className="shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic">Diserahkan via email/zip</span>
                                                )}
                                            </div>

                                            {/* Live Domain URL */}
                                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                                                <span className="text-[11px] text-slate-400 block">Domain Produksi:</span>
                                                {order.handover_data?.live_domain_url ? (
                                                    <a
                                                        href={order.handover_data.live_domain_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                                                    >
                                                        <span className="truncate">{order.handover_data.live_domain_url}</span>
                                                        <ExternalLink size={12} className="shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sesuai domain pesanan</span>
                                                )}
                                            </div>

                                            {/* CMS Admin URL */}
                                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                                                <span className="text-[11px] text-slate-400 block">URL Admin Panel (CMS):</span>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white truncate">
                                                    {order.handover_data?.cms_admin_url || '/admin'}
                                                </div>
                                            </div>

                                            {/* CMS Credentials */}
                                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                                                <span className="text-[11px] text-slate-400 block">Username / Password CMS:</span>
                                                <div className="flex items-center justify-between font-mono text-xs">
                                                    <span>{order.handover_data?.cms_admin_username || order.client_email}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                                                            {showHandoverPassword
                                                                ? order.handover_data?.cms_admin_password || 'Admin#2026'
                                                                : '••••••••'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowHandoverPassword(!showHandoverPassword)}
                                                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                                        >
                                                            {showHandoverPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {order.handover_data?.documentation_url && (
                                            <div className="pt-2">
                                                <a
                                                    href={order.handover_data.documentation_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-bold hover:underline"
                                                >
                                                    <span>Buka Buku Panduan Penggunaan Website</span>
                                                    <ExternalLink size={13} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-500 space-y-2">
                                        <p>
                                            Kredensial login CMS, akses hosting, dan source code repositori akan otomatis dibuka secara aman di sini setelah Anda menyetujui hasil demo staging website.
                                        </p>
                                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-[11px]">
                                            <ShieldCheck size={14} />
                                            <span>Aman & Transparan via Rekening Bersama (Escrow)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Escrow Guarantee & Contacts (1 col) */}
                        <div className="space-y-6">
                            {/* Escrow Status Card */}
                            <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    <span>Status Rekening Bersama (2 Termin)</span>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Total Nilai Kontrak</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                                    </div>

                                    {/* Termin 1: DP */}
                                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Termin 1: DP ({dpPercentage}%)</span>
                                            <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                                isDpPaid
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {isDpPaid ? 'LUNAS (HELD)' : 'MENUNGGU DP'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white">
                                            {formatCurrency(computedDpAmount)}
                                        </div>
                                        {order.dp_paid_at && (
                                            <div suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                                                Lunas: {new Date(order.dp_paid_at).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Termin 2: Pelunasan */}
                                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Termin 2: Pelunasan</span>
                                            <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                                isFullyPaid
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {isFullyPaid ? 'LUNAS (HELD)' : 'MENUNGGU KESEPAKATAN'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white">
                                            {formatCurrency(computedRemainingAmount)}
                                        </div>
                                        {order.final_paid_at && (
                                            <div suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                                                Lunas: {new Date(order.final_paid_at).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 leading-relaxed space-y-2">
                                    <p>
                                        {order.status === 'completed'
                                            ? 'Seluruh dana (DP + Pelunasan) telah disetujui klien dan dicairkan ke pengembang.'
                                            : isDpPaid
                                            ? 'Dana DP Anda tersimpan aman di Rekening Bersama (Escrow). Sisa pelunasan dibayar saat kesepakatan akhir tercapai.'
                                            : 'Menunggu pembayaran DP dari klien (QRIS, Virtual Account, Transfer Bank, dsb) untuk memulai pengerjaan.'}
                                    </p>
                                </div>
                            </div>

                            {/* Client & Developer Info */}
                            <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 space-y-4 text-xs">
                                <div>
                                    <div className="text-slate-400 text-[11px] mb-1 font-bold">Klien Pemesan:</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{order.client_name}</div>
                                    <div className="text-slate-500 font-mono">{order.client_email}</div>
                                    {order.client_phone && <div className="text-slate-500 font-mono">{order.client_phone}</div>}
                                </div>

                                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <div className="text-slate-400 text-[11px] mb-1 font-bold">Developer / Penyedia Jasa:</div>
                                    <div className="font-bold text-slate-900 dark:text-white">Ridhwan Anang Ma'ruf</div>
                                    <div className="text-slate-500 font-mono">ridhwananang@gmail.com</div>
                                </div>

                                <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center gap-2">
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                    >
                                        <MessageSquare size={14} />
                                        <span>Chat WhatsApp Pengembang</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Legal & Compliance */}
                    <div className="border-t border-slate-200 pt-6 text-center dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>Sistem Rekening Bersama (Escrow) Resmi & Terverifikasi</span>
                            <span>•</span>
                            <Link href="/terms-and-conditions" className="hover:text-violet-600 dark:hover:text-violet-400">
                                Syarat & Ketentuan (T&C)
                            </Link>
                            <span>•</span>
                            <Link href="/privacy-policy" className="hover:text-violet-600 dark:hover:text-violet-400">
                                Kebijakan Privasi
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Printable Digital Invoicing Modal (Global Standard A4 - DP & Final Settlement) */}
                {showCertificate && (
                    <div
                        id="print-modal-container"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
                    >
                        <div className="relative w-full max-w-3xl rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden my-auto border border-slate-200">
                            {/* Top Control Bar (NO PRINT) */}
                            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
                                {/* Left: 2-Invoice Tab Switcher */}
                                <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setActiveInvoiceTab('dp')}
                                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            activeInvoiceTab === 'dp'
                                                ? 'bg-violet-600 text-white shadow-sm font-extrabold'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        <FileText size={13} />
                                        <span>Invoice DP (Termin 1)</span>
                                        <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/25 text-emerald-300">
                                            {isDpPaid ? 'LUNAS' : 'MENUNGGU'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveInvoiceTab('final')}
                                        disabled={!isDpPaid}
                                        className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                            activeInvoiceTab === 'final'
                                                ? 'bg-violet-600 text-white shadow-sm font-extrabold'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        <FileText size={13} />
                                        <span>Invoice Pelunasan (Termin 2)</span>
                                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                            isFullyPaid
                                                ? 'bg-emerald-500/25 text-emerald-300'
                                                : 'bg-amber-500/25 text-amber-300'
                                        }`}>
                                            {isFullyPaid ? 'LUNAS' : 'MENUNGGU'}
                                        </span>
                                    </button>
                                </div>

                                {/* Right: Action Controls */}
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-98 transition-all"
                                    >
                                        <Printer size={14} />
                                        <span>Cetak Dokumen (A4)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCertificate(false)}
                                        className="cursor-pointer p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Tutup"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* PRINTABLE INVOICE SHEET (Isolated with id="print-invoice-sheet") */}
                            <div id="print-invoice-sheet" className="p-7 sm:p-9 bg-white text-slate-900 space-y-4">
                                {/* Header: Studio Identity & Document Header */}
                                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                                    {/* Left: Brand Identity & Logo */}
                                    <div className="flex items-start gap-3.5">
                                        <img
                                            src="/images/anang-logo.png"
                                            alt="Ridhwan Anang Logo"
                                            className="size-13 rounded-2xl object-contain border border-slate-200/80 shadow-xs"
                                        />
                                        <div className="space-y-0.5">
                                            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-snug">
                                                RIDHWAN ANANG MA'RUF
                                            </h1>
                                            <p className="text-[11px] font-bold text-violet-700">
                                                Software Engineer & Web Development Studio
                                            </p>
                                            <div className="text-[10px] text-slate-500 leading-tight space-y-0.5 pt-0.5">
                                                <p>Tangerang Selatan, Banten, Indonesia</p>
                                                <p>
                                                    Email: <span className="font-mono text-slate-700">ridhwananang@gmail.com</span> • Web: <span className="font-mono text-slate-700">ridhwananang.id</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Document Identity & Official Stamp Badge */}
                                    <div className="text-right space-y-1.5">
                                        <div className="inline-block border-2 border-emerald-600 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl text-center transform -rotate-1 shadow-xs">
                                            <span className="block text-[9.5px] font-black tracking-widest uppercase">
                                                {activeInvoiceTab === 'dp'
                                                    ? (isDpPaid ? '★ LUNAS / PAID (ESCROW) ★' : '★ MENUNGGU DP ★')
                                                    : (isFullyPaid ? '★ LUNAS 100% / PAID IN FULL ★' : '★ TAGIHAN PELUNASAN ★')}
                                            </span>
                                            <span className="block text-[8.5px] font-mono font-bold text-emerald-700">
                                                {activeInvoiceTab === 'dp'
                                                    ? (isDpPaid ? 'REKENING BERSAMA TERVERIFIKASI' : 'GERBANG PEMBAYARAN RESMI')
                                                    : (isFullyPaid ? 'SERAH TERIMA ASET TERBUKA' : 'MENUNGGU KESEPAKATAN')}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-base font-black tracking-tight text-slate-900 uppercase">
                                                {activeInvoiceTab === 'dp'
                                                    ? 'INVOICE PEMBAYARAN UANG MUKA (DP)'
                                                    : 'INVOICE PELUNASAN AKHIR'}
                                            </div>
                                            <div className="font-mono text-[11px] font-extrabold text-violet-700">
                                                {activeInvoiceTab === 'dp'
                                                    ? `INV/DP/${new Date(order.created_at).getFullYear()}/${order.tracking_code}`
                                                    : `INV/FINAL/${new Date(order.final_paid_at || order.updated_at || order.created_at).getFullYear()}/${order.tracking_code}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Client & Project Metadata Bar (2 Columns) */}
                                <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">
                                            DITAGIHKAN KEPADA:
                                        </span>
                                        <div className="text-xs font-black text-slate-900">{order.client_name}</div>
                                        <div className="text-slate-600 font-mono text-[10.5px]">{order.client_email}</div>
                                        {order.client_phone && (
                                            <div className="text-slate-500 font-mono text-[10px]">{order.client_phone}</div>
                                        )}
                                    </div>

                                    <div className="space-y-0.5 text-right">
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">
                                            DETAIL KONTRAK & TANGGAL:
                                        </span>
                                        <div className="text-slate-800">
                                            <span className="text-slate-500">Ref Pesanan: </span>
                                            <strong className="font-mono text-violet-700">#{order.tracking_code}</strong>
                                        </div>
                                        <div className="text-slate-800">
                                            <span className="text-slate-500">Tanggal Diterbitkan: </span>
                                            <span suppressHydrationWarning className="font-medium">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-slate-800">
                                            <span className="text-slate-500">Tanggal Dibayar: </span>
                                            <span suppressHydrationWarning className="font-bold text-emerald-700">
                                                {activeInvoiceTab === 'dp'
                                                    ? (order.dp_paid_at
                                                        ? new Date(order.dp_paid_at).toLocaleDateString('id-ID', {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          })
                                                        : (isDpPaid ? 'Lunas' : 'Belum Dibayar'))
                                                    : (order.final_paid_at
                                                        ? new Date(order.final_paid_at).toLocaleDateString('id-ID', {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          })
                                                        : (isFullyPaid ? 'Lunas' : 'Menunggu Pelunasan'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Itemized Table: Scope of Work & Deliverables */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <span>Rincian Lingkup Proyek</span>
                                        <span className="font-mono lowercase text-slate-400">skema: {order.payment_scheme === 'full_payment' ? 'pembayaran penuh' : `2 termin (dp ${dpPercentage}% + pelunasan)`}</span>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                                        <table className="w-full text-left text-[11px] border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                                                    <th className="py-2 px-3 w-10 text-center">No</th>
                                                    <th className="py-2 px-3">Layanan & Spesifikasi Pengerjaan</th>
                                                    <th className="py-2 px-3 w-28 text-center">Kategori</th>
                                                    <th className="py-2 px-3 text-right w-32">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {/* Main Package */}
                                                <tr>
                                                    <td className="py-2 px-3 text-center font-mono text-slate-400">01</td>
                                                    <td className="py-2 px-3">
                                                        <div className="font-bold text-slate-900">
                                                            Pembuatan Aplikasi Web: {projectTypeName}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 leading-tight">
                                                            Arsitektur fullstack terstruktur, UI/UX modern responsif, optimasi performa tinggi, dan integrasi sistem.
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 text-center text-slate-600 font-medium">Paket Utama</td>
                                                    <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">Tercakup</td>
                                                </tr>

                                                {/* Add-ons List if any */}
                                                {order.selected_features && order.selected_features.length > 0 && order.selected_features.map((featKey, idx) => (
                                                    <tr key={featKey}>
                                                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                                                            {String(idx + 2).padStart(2, '0')}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <div className="font-bold text-slate-900">
                                                                {featureLabels[featKey] || featKey.replace(/_/g, ' ')}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 leading-tight">
                                                                Modul fungsional terintegrasi sesuai kebutuhan spesifik sistem.
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center text-slate-600 font-medium">Add-on Fitur</td>
                                                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">Tercakup</td>
                                                    </tr>
                                                ))}

                                                {/* Express Delivery if applicable */}
                                                {order.delivery_speed === 'express' && (
                                                    <tr>
                                                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                                                            {String((order.selected_features?.length || 0) + 2).padStart(2, '0')}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <div className="font-bold text-slate-900">
                                                                Prioritas Pengerjaan Kilat (Express Delivery)
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 leading-tight">
                                                                Alokasi waktu pengembangan prioritas tinggi untuk percepatan rilis staging preview.
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center text-slate-600 font-medium">Prioritas</td>
                                                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">Tercakup</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Financial Computation Summary (Tailored specifically to active invoice tab) */}
                                {activeInvoiceTab === 'dp' ? (
                                    <div className="rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/90 space-y-1.5 text-[11px]">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Nilai Kontrak Proyek Keseluruhan:</span>
                                            <span className="font-mono font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Alokasi Termin Pembayaran:</span>
                                            <span className="font-semibold text-slate-800">
                                                {order.payment_scheme === 'full_payment' ? '100% Pembayaran Penuh' : `Termin 1: Uang Muka (DP ${dpPercentage}%)`}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-200/90 pt-1.5 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-black text-slate-900">
                                                    TOTAL DITAGIHKAN & DIBAYAR (INVOICE INI):
                                                </div>
                                                <div className="text-[10px] text-emerald-700 font-medium">
                                                    {isDpPaid ? '✓ Pembayaran DP telah diterima & diamankan di Rekening Bersama (Escrow)' : 'Menunggu penyetoran pembayaran DP'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-black font-mono text-emerald-600">
                                                    {formatCurrency(computedDpAmount)}
                                                </div>
                                                <span className="inline-block text-[9.5px] font-bold font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                                    {isDpPaid ? 'LUNAS (ESCROW)' : 'MENUNGGU DP'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t border-dashed border-slate-200/90 pt-1.5 flex justify-between items-center text-[10.5px] text-slate-500">
                                            <span>Sisa Tagihan Kontrak Selanjutnya (Termin 2):</span>
                                            <span className="font-mono font-bold text-slate-700">{formatCurrency(computedRemainingAmount)}</span>
                                        </div>
                                        <div className="text-[9.5px] text-slate-400 italic">
                                            * Sisa pelunasan Termin 2 baru akan ditagihkan setelah hasil preview staging selesai diuji coba dan disetujui oleh Klien.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/90 space-y-1.5 text-[11px]">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Nilai Kontrak Proyek Keseluruhan:</span>
                                            <span className="font-mono font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-700">
                                            <span>Pembayaran Termin 1 (DP {dpPercentage}% - Telah Lunas):</span>
                                            <span className="font-mono font-bold">- {formatCurrency(computedDpAmount)}</span>
                                        </div>
                                        <div className="border-t border-slate-200/90 pt-1.5 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-black text-slate-900">
                                                    TOTAL DITAGIHKAN & DIBAYAR (INVOICE INI):
                                                </div>
                                                <div className="text-[10px] text-emerald-700 font-medium">
                                                    {isFullyPaid ? '✓ Pembayaran pelunasan telah terkonfirmasi lunas 100%' : 'Menunggu penyelesaian pembayaran pelunasan'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-black font-mono text-emerald-600">
                                                    {formatCurrency(computedRemainingAmount)}
                                                </div>
                                                <span className="inline-block text-[9.5px] font-bold font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                                    {isFullyPaid ? 'LUNAS PENUH (100%)' : 'MENUNGGU PELUNASAN'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t border-dashed border-slate-200/90 pt-1.5 flex justify-between items-center text-[10.5px] text-slate-700 font-bold">
                                            <span>Sisa Tagihan Kontrak Akhir:</span>
                                            <span className="font-mono text-emerald-600 font-black">Rp 0 (LUNAS PENUH)</span>
                                        </div>
                                        <div className="text-[9.5px] text-slate-500">
                                            * Invoice ini mengonfirmasi serah terima penuh seluruh repositori source code, kredensial CMS, dan pembukaan akses Handover Vault.
                                        </div>
                                    </div>
                                )}

                                {/* Audit Trail & Digital Signature Row */}
                                <div className="grid grid-cols-2 gap-4 text-[10px] pt-1 border-t border-slate-200">
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">
                                            BUKTI TRANSAKSI & PROTEKSI REKENING BERSAMA
                                        </span>
                                        <div className="text-slate-600">
                                            <span>Metode: </span>
                                            <strong className="text-slate-800">
                                                Transfer Bank / Virtual Account / QRIS Resmi
                                            </strong>
                                        </div>
                                        <div className="text-slate-600 truncate">
                                            <span>ID Referensi: </span>
                                            <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">
                                                {activeInvoiceTab === 'dp'
                                                    ? (order.dp_transaction?.xendit_external_id || order.quest?.deposit_transaction?.xendit_external_id || `ESC-DP-${order.tracking_code}`)
                                                    : (order.final_transaction?.xendit_external_id || order.quest?.final_deposit_transaction?.xendit_external_id || `ESC-FINAL-${order.tracking_code}`)}
                                            </code>
                                        </div>
                                        <div className="text-slate-600">
                                            <span>Sistem Proteksi: </span>
                                            <span className="text-emerald-700 font-medium">Rekening Bersama Resmi (Escrow Terverifikasi)</span>
                                        </div>
                                    </div>

                                    {/* Digital Signature */}
                                    <div className="text-right space-y-0.5">
                                        <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">
                                            PENYEDIA JASA / PENGEMBANG
                                        </span>
                                        <div className="font-serif italic text-sm text-slate-900 font-black pt-0.5">
                                            Ridhwan Anang Ma'ruf
                                        </div>
                                        <div className="text-[9.5px] text-slate-500">
                                            Fullstack Software Engineer
                                        </div>
                                        <div className="font-mono text-[8.5px] text-slate-400">
                                            Digital Verified Invoice • #{order.tracking_code}
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Legal & Warranty Note at bottom */}
                                <div className="text-[9px] text-slate-400 leading-tight border-t border-slate-100 pt-2">
                                    <strong>Ketentuan Resmi:</strong> Dokumen ini merupakan bukti tagihan dan kuitansi digital resmi dari Ridhwan Anang Web Studio. Pembayaran dilindungi sistem Rekening Bersama (Escrow) berstandar enkripsi industri terkemuka. Kredensial finansial perbankan tidak disimpan di server kami.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
