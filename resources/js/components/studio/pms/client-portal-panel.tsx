import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    KeyRound,
    Lock,
    Mail,
    MessageSquareShare,
    RefreshCw,
    Save,
    Send,
    ShieldCheck,
    Sparkles,
    Unlock,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PmsProject } from '@/types/pms';

interface ClientPortalPanelProps {
    project: PmsProject;
    variant?: 'modal' | 'tab';
}

function generateNumericPin(): string {
    const num = Math.floor(100000 + Math.random() * 900000);

    return String(num);
}

function formatDateTimeId(value?: string | null): string | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsed);
}

function isValidEmailFormat(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ClientPortalPanel({
    project,
    variant = 'modal',
}: ClientPortalPanelProps) {
    const savedPin = (project.portal_pin ?? '').trim();
    const savedEmail = (project.client_email ?? '').trim();
    const isPortalActive = project.is_portal_active !== false;
    const token = project.portal_token ?? '';

    const [clientEmail, setClientEmail] = useState(savedEmail);
    const [pinEnabled, setPinEnabled] = useState<boolean>(Boolean(savedPin));
    const [pinDraft, setPinDraft] = useState(savedPin);
    const [showPin, setShowPin] = useState(false);

    const [isSavingPin, setIsSavingPin] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isTogglingPortal, setIsTogglingPortal] = useState(false);
    const [isConfirmingRegenerate, setIsConfirmingRegenerate] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [isSendingReport, setIsSendingReport] = useState(false);

    const [copiedPortalLink, setCopiedPortalLink] = useState(false);
    const [copiedInviteText, setCopiedInviteText] = useState(false);
    const [copiedPin, setCopiedPin] = useState(false);

    const portalUrl =
        typeof window !== 'undefined' && token
            ? `${window.location.origin}/portal/${token}`
            : `/portal/${token}`;

    const isLegacyRandomToken =
        Boolean(token) &&
        !token.includes('-') &&
        /^[A-Za-z0-9]{24,}$/.test(token);

    const effectivePin = pinEnabled ? pinDraft.trim() : '';
    const hasPinChanges = effectivePin !== savedPin;
    const hasEmailChanges = clientEmail.trim() !== savedEmail;

    const lastAccessedLabel = formatDateTimeId(project.portal_last_accessed_at);
    const lastEmailLabel = formatDateTimeId(project.portal_last_email_sent_at);

    const handleCopyPortalLink = () => {
        navigator.clipboard.writeText(portalUrl);
        setCopiedPortalLink(true);
        toast.success('Tautan portal klien berhasil disalin!');
        window.setTimeout(() => setCopiedPortalLink(false), 2000);
    };

    const handleCopyPin = () => {
        if (!pinDraft.trim()) {
            return;
        }

        navigator.clipboard.writeText(pinDraft.trim());
        setCopiedPin(true);
        toast.success('PIN akses berhasil disalin!');
        window.setTimeout(() => setCopiedPin(false), 2000);
    };

    const handleCopyInviteMessage = () => {
        const activePinForMessage = effectivePin || savedPin;
        const lines = [
            `Halo *${project.client}*,`,
            '',
            `Berikut tautan *Portal Pantau Proyek* untuk *${project.name}* (${project.code}):`,
            portalUrl,
        ];

        if (activePinForMessage) {
            lines.push(`PIN Akses: *${activePinForMessage}*`);
        }

        lines.push(
            '',
            'Melalui portal tersebut Anda dapat memantau progres sprint, rincian tugas tim, checklist deliverable, dan timeline jadwal pengerjaan secara langsung.',
        );

        navigator.clipboard.writeText(lines.join('\n'));
        setCopiedInviteText(true);
        toast.success('Format pesan undangan siap kirim berhasil disalin!');
        window.setTimeout(() => setCopiedInviteText(false), 2200);
    };

    const handleTogglePortal = () => {
        setIsTogglingPortal(true);
        router.post(
            `/studio/pms/projects/${project.id}/portal/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status akses portal berhasil diperbarui.');
                    setIsTogglingPortal(false);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status portal.');
                    setIsTogglingPortal(false);
                },
            },
        );
    };

    const handleRegeneratePortal = () => {
        setIsRegenerating(true);
        router.post(
            `/studio/pms/projects/${project.id}/portal/regenerate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Tautan portal klien baru dengan format slug telah dibuat.',
                    );
                    setIsConfirmingRegenerate(false);
                    setIsRegenerating(false);
                },
                onError: () => {
                    toast.error('Gagal memperbarui tautan portal.');
                    setIsRegenerating(false);
                },
            },
        );
    };

    const handleTogglePinSwitch = () => {
        if (pinEnabled) {
            setPinEnabled(false);
            setPinDraft('');
        } else {
            setPinEnabled(true);

            if (!pinDraft.trim()) {
                setPinDraft(generateNumericPin());
                setShowPin(true);
            }
        }
    };

    const handleSavePinSettings = () => {
        if (pinEnabled && pinDraft.trim().length < 4) {
            toast.error('PIN keamanan minimal terdiri dari 4 karakter.');

            return;
        }

        setIsSavingPin(true);
        router.put(
            `/studio/pms/projects/${project.id}/portal/settings`,
            {
                client_email: savedEmail || null,
                portal_pin: pinEnabled ? pinDraft.trim() : null,
                is_portal_active: isPortalActive,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        pinEnabled
                            ? 'Proteksi PIN portal berhasil disimpan.'
                            : 'Proteksi PIN portal berhasil dinonaktifkan.',
                    );
                    setIsSavingPin(false);
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal menyimpan pengaturan PIN.',
                    );
                    setIsSavingPin(false);
                },
            },
        );
    };

    const handleSaveEmail = () => {
        const trimmed = clientEmail.trim();

        if (trimmed && !isValidEmailFormat(trimmed)) {
            toast.error('Format alamat email klien tidak valid.');

            return;
        }

        setIsSavingEmail(true);
        router.put(
            `/studio/pms/projects/${project.id}/portal/settings`,
            {
                client_email: trimmed || null,
                portal_pin: savedPin || null,
                is_portal_active: isPortalActive,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Alamat email klien berhasil disimpan.');
                    setIsSavingEmail(false);
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal menyimpan alamat email.',
                    );
                    setIsSavingEmail(false);
                },
            },
        );
    };

    const handleSendInvite = () => {
        const trimmedEmail = clientEmail.trim();

        if (!isValidEmailFormat(trimmedEmail)) {
            toast.error('Harap masukkan alamat email klien yang valid.');

            return;
        }

        if (pinEnabled && pinDraft.trim().length < 4) {
            toast.error('PIN keamanan minimal terdiri dari 4 karakter.');

            return;
        }

        setIsSendingInvite(true);
        router.post(
            `/studio/pms/projects/${project.id}/portal/send-invite`,
            {
                client_email: trimmedEmail,
                sync_pin: true,
                portal_pin: pinEnabled ? pinDraft.trim() : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Undangan portal berhasil dikirim ke ${trimmedEmail}.`,
                    );
                    setIsSendingInvite(false);
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal mengirim undangan email.',
                    );
                    setIsSendingInvite(false);
                },
            },
        );
    };

    const handleSendReport = () => {
        const trimmedEmail = clientEmail.trim();

        if (!isValidEmailFormat(trimmedEmail)) {
            toast.error('Harap masukkan alamat email klien yang valid.');

            return;
        }

        setIsSendingReport(true);
        router.post(
            `/studio/pms/projects/${project.id}/portal/send-report`,
            {
                client_email: trimmedEmail,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Laporan progres berhasil dikirim ke ${trimmedEmail}.`,
                    );
                    setIsSendingReport(false);
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal mengirim laporan email.',
                    );
                    setIsSendingReport(false);
                },
            },
        );
    };

    return (
        <div className="space-y-3.5">
            {/* 1. Status & Tautan Portal */}
            <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/75 p-4 dark:border-white/[0.08] dark:bg-slate-950/60">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                'gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold',
                                isPortalActive
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                            )}
                        >
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    isPortalActive
                                        ? 'bg-emerald-500'
                                        : 'bg-rose-500',
                                )}
                            />
                            {isPortalActive ? 'Portal Aktif' : 'Nonaktif'}
                        </Badge>

                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                            {savedPin ? (
                                <>
                                    <Lock className="size-3 text-violet-500" />
                                    Wajib PIN
                                </>
                            ) : (
                                <>
                                    <Unlock className="size-3 text-cyan-500" />
                                    Akses Langsung
                                </>
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isPortalActive}
                            aria-label="Aktifkan atau nonaktifkan akses portal klien"
                            disabled={isTogglingPortal}
                            onClick={handleTogglePortal}
                            className={cn(
                                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 disabled:opacity-50',
                                isPortalActive
                                    ? 'border-emerald-500/40 bg-emerald-500'
                                    : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800',
                            )}
                        >
                            <span
                                className={cn(
                                    'inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                                    isPortalActive
                                        ? 'translate-x-5'
                                        : 'translate-x-0.5',
                                )}
                            />
                        </button>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isRegenerating}
                            onClick={() =>
                                setIsConfirmingRegenerate((prev) => !prev)
                            }
                            title="Buat ulang tautan portal format slug proyek"
                            className={cn(
                                'h-7.5 cursor-pointer rounded-lg px-2.5 text-[11px] font-semibold transition-colors',
                                isConfirmingRegenerate
                                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                    : 'border-slate-200/90 bg-white text-slate-600 hover:border-amber-400/50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white',
                            )}
                        >
                            <RefreshCw className="mr-1 size-3" />
                            Perbarui Tautan
                        </Button>
                    </div>
                </div>

                {/* Inline Luxury Confirmation Bar (Replaces Native Browser Confirm) */}
                {isConfirmingRegenerate && (
                    <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/90 p-3 text-xs animate-in fade-in-0 slide-in-from-top-1 duration-150 sm:flex-row sm:items-center dark:border-amber-500/25 dark:bg-amber-500/10">
                        <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="space-y-0.5">
                                <p className="font-bold">
                                    Perbarui Tautan Portal?
                                </p>
                                <p className="text-[11px] leading-snug text-amber-800/90 dark:text-amber-200/80">
                                    URL lama dan PIN aktif sebelumnya akan
                                    langsung dicabut dan diganti tautan slug
                                    baru.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-end gap-1.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isRegenerating}
                                onClick={() => setIsConfirmingRegenerate(false)}
                                className="h-7.5 cursor-pointer rounded-lg px-2.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-200/60 dark:text-amber-200 dark:hover:bg-amber-500/20"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={isRegenerating}
                                onClick={handleRegeneratePortal}
                                className="h-7.5 cursor-pointer rounded-lg bg-amber-600 px-3 text-[11px] font-bold text-white shadow-2xs hover:bg-amber-700"
                            >
                                {isRegenerating
                                    ? 'Memperbarui...'
                                    : 'Ya, Perbarui'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Full-width URL Share Box */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Input
                            readOnly
                            aria-label="Tautan Portal Klien"
                            value={portalUrl}
                            className="h-9.5 flex-1 rounded-xl border-slate-200 bg-white font-mono text-xs text-slate-700 shadow-2xs select-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCopyPortalLink}
                            className="h-9.5 shrink-0 cursor-pointer rounded-xl bg-violet-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700"
                        >
                            {copiedPortalLink ? (
                                <>
                                    <Check className="mr-1.5 size-3.5 text-emerald-300" />
                                    Tersalin
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-1.5 size-3.5" />
                                    Salin Link
                                </>
                            )}
                        </Button>
                    </div>

                    {isLegacyRandomToken && !isConfirmingRegenerate && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            Tautan ini masih menggunakan token acak lama. Klik{' '}
                            <button
                                type="button"
                                onClick={() => setIsConfirmingRegenerate(true)}
                                className="cursor-pointer font-semibold underline underline-offset-2"
                            >
                                Perbarui Tautan
                            </button>{' '}
                            untuk beralih ke URL slug proyek yang lebih ringkas.
                        </p>
                    )}

                    {/* Meta Engagement & Secondary Quick Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-cyan-500" />
                                Dibuka:{' '}
                                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                    {lastAccessedLabel ?? 'Belum pernah'}
                                </strong>
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Mail className="size-3 text-violet-500" />
                                Email:{' '}
                                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                    {lastEmailLabel ?? 'Belum pernah'}
                                </strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleCopyInviteMessage}
                                className="h-7 cursor-pointer rounded-lg px-2 text-[11px] font-semibold text-slate-600 hover:bg-white hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-violet-300"
                            >
                                {copiedInviteText ? (
                                    <>
                                        <Check className="mr-1 size-3 text-emerald-500" />
                                        Pesan Tersalin
                                    </>
                                ) : (
                                    <>
                                        <MessageSquareShare className="mr-1 size-3 text-violet-500" />
                                        Salin Chat Undangan
                                    </>
                                )}
                            </Button>

                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="h-7 cursor-pointer rounded-lg px-2 text-[11px] font-semibold text-cyan-700 hover:bg-white dark:text-cyan-300 dark:hover:bg-slate-900"
                            >
                                <a
                                    href={portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-1 size-3" />
                                    Pratinjau
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Proteksi PIN Opsional (Independen) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-white/[0.08] dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <KeyRound className="size-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    Proteksi PIN Keamanan
                                </span>
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9.5px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                                    Opsional
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {pinEnabled
                                    ? 'Klien wajib memasukkan PIN ini sebelum melihat data proyek.'
                                    : 'Nonaktif — klien dapat membuka portal langsung lewat tautan.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {!pinEnabled && hasPinChanges && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={isSavingPin}
                                onClick={handleSavePinSettings}
                                className="h-7.5 cursor-pointer rounded-lg bg-violet-600 px-3 text-[11px] font-semibold text-white hover:bg-violet-700"
                            >
                                <Save className="mr-1 size-3" />
                                {isSavingPin ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        )}
                        <button
                            type="button"
                            role="switch"
                            aria-checked={pinEnabled}
                            aria-label="Aktifkan atau nonaktifkan PIN portal"
                            onClick={handleTogglePinSwitch}
                            className={cn(
                                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200',
                                pinEnabled
                                    ? 'border-violet-500/40 bg-violet-600'
                                    : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800',
                            )}
                        >
                            <span
                                className={cn(
                                    'inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                                    pinEnabled
                                        ? 'translate-x-5'
                                        : 'translate-x-0.5',
                                )}
                            />
                        </button>
                    </div>
                </div>

                {pinEnabled && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/75 pt-3 sm:flex-row sm:items-center dark:border-slate-800/80">
                        <div className="relative flex-1">
                            <Input
                                id={`portal-pin-${variant}`}
                                type={showPin ? 'text' : 'password'}
                                minLength={4}
                                maxLength={20}
                                placeholder="PIN 4–20 karakter"
                                value={pinDraft}
                                onChange={(e) => setPinDraft(e.target.value)}
                                className="h-9 rounded-xl border-slate-200 bg-slate-50/70 pr-9 pl-3 font-mono text-xs tracking-widest dark:border-slate-800 dark:bg-slate-950/70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin((prev) => !prev)}
                                aria-label={
                                    showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'
                                }
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                {showPin ? (
                                    <EyeOff className="size-3.5" />
                                ) : (
                                    <Eye className="size-3.5" />
                                )}
                            </button>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setPinDraft(generateNumericPin());
                                    setShowPin(true);
                                }}
                                className="h-9 cursor-pointer rounded-xl border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900"
                            >
                                <Sparkles className="mr-1 size-3.5 text-violet-500" />
                                Buat PIN
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={!pinDraft.trim()}
                                onClick={handleCopyPin}
                                title="Salin PIN"
                                className="h-9 cursor-pointer rounded-xl border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900"
                            >
                                {copiedPin ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="size-3.5" />
                                )}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                disabled={isSavingPin || !hasPinChanges}
                                onClick={handleSavePinSettings}
                                className="h-9 cursor-pointer rounded-xl bg-violet-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 disabled:opacity-50"
                            >
                                <Save className="mr-1 size-3.5" />
                                {isSavingPin ? 'Menyimpan...' : 'Simpan PIN'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Email Penerima & Pengiriman Langsung */}
            <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-white/[0.08] dark:bg-slate-900/60">
                <div className="space-y-1.5">
                    <Label
                        htmlFor={`portal-email-${variant}`}
                        className="text-[11px] font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300"
                    >
                        Email Penerima Klien
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Input
                                id={`portal-email-${variant}`}
                                type="email"
                                placeholder="nama@perusahaan-klien.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pl-8.5 text-xs dark:border-slate-800 dark:bg-slate-950/70"
                            />
                            <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            variant={hasEmailChanges ? 'default' : 'outline'}
                            disabled={isSavingEmail || !hasEmailChanges}
                            onClick={handleSaveEmail}
                            className={cn(
                                'h-9.5 shrink-0 cursor-pointer rounded-xl px-3.5 text-xs font-semibold',
                                hasEmailChanges
                                    ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
                                    : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400',
                            )}
                        >
                            <Save className="mr-1.5 size-3.5" />
                            {isSavingEmail ? 'Menyimpan...' : 'Simpan Email'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                    <Button
                        type="button"
                        disabled={
                            isSendingInvite || !isValidEmailFormat(clientEmail)
                        }
                        onClick={handleSendInvite}
                        className="h-10 cursor-pointer justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700"
                    >
                        <Send className="mr-1.5 size-3.5" />
                        {isSendingInvite
                            ? 'Mengirim Undangan...'
                            : pinEnabled && pinDraft.trim()
                              ? 'Kirim Undangan (+ PIN)'
                              : 'Kirim Undangan Portal'}
                    </Button>

                    <Button
                        type="button"
                        disabled={
                            isSendingReport || !isValidEmailFormat(clientEmail)
                        }
                        onClick={handleSendReport}
                        className="h-10 cursor-pointer justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-cyan-500/20 hover:from-cyan-700 hover:to-blue-700"
                    >
                        <FileText className="mr-1.5 size-3.5" />
                        {isSendingReport
                            ? 'Mengirim Laporan...'
                            : 'Kirim Laporan Progres'}
                    </Button>
                </div>
            </div>

            {/* 4. Ringkasan Tampilan Portal (Tab View Only) */}
            {variant === 'tab' && (
                <div className="space-y-3 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-violet-500/5 p-5 dark:bg-slate-900/60">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <ShieldCheck className="size-4 text-cyan-500" />
                        Konten yang Dapat Dipantau Klien
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950/70">
                            <strong className="block text-slate-800 dark:text-slate-200">
                                Siklus Sprint &amp; Tugas
                            </strong>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Daftar tahapan pengerjaan, status progres, dan
                                penanggung jawab teknis.
                            </p>
                        </div>
                        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950/70">
                            <strong className="block text-slate-800 dark:text-slate-200">
                                Subtask &amp; Vault Berkas
                            </strong>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Checklist item terverifikasi, cetak biru teknis,
                                dan dokumen deliverable.
                            </p>
                        </div>
                        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950/70">
                            <strong className="block text-slate-800 dark:text-slate-200">
                                Timeline Jadwal Visual
                            </strong>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Peta waktu Gantt interaktif dari inisiasi hingga
                                target peluncuran.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
