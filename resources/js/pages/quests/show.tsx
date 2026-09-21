import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EscrowStepper } from '@/components/quests/escrow-stepper';
import { QuestStatusBadge } from '@/components/quests/quest-status-badge';
import type { Quest } from '@/types/quest';
import {
    ArrowLeft,
    CheckCircle2,
    Coins,
    ExternalLink,
    PlayCircle,
    Send,
    ShieldAlert,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';

interface Props {
    quest: Quest;
    authUserId: number;
    availableBanks: Array<{ code: string; name: string }>;
}

export default function QuestShow({ quest, authUserId, availableBanks }: Props) {
    const isPoster = quest.poster_id === authUserId;
    const isWorker = quest.worker_id === authUserId;

    // Form for submitting work (Worker)
    const {
        data: workData,
        setData: setWorkData,
        post: postWork,
        processing: submittingWork,
        errors: workErrors,
    } = useForm({
        work_notes: '',
    });

    // Form for approving & releasing escrow (Poster)
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const {
        data: approveData,
        setData: setApproveData,
        post: postApprove,
        processing: approvingEscrow,
        errors: approveErrors,
    } = useForm({
        bank_code: 'BCA',
        account_number: '1234567890',
        account_holder_name: quest.worker?.name || 'Worker Name',
    });

    // Form for dispute
    const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
    const {
        data: disputeData,
        setData: setDisputeData,
        post: postDispute,
        processing: disputing,
        errors: disputeErrors,
    } = useForm({
        dispute_reason: '',
    });

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    const handleTakeQuest = () => {
        if (confirm('Apakah Anda yakin ingin mengambil quest ini?')) {
            router.post(`/quests/${quest.id}/take`);
        }
    };

    const handleSubmitWork = (e: React.FormEvent) => {
        e.preventDefault();
        postWork(`/quests/${quest.id}/submit`);
    };

    const handleApproveAndRelease = (e: React.FormEvent) => {
        e.preventDefault();
        postApprove(`/quests/${quest.id}/approve`, {
            onSuccess: () => setApproveDialogOpen(false),
        });
    };

    const handleCancelQuest = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan quest dan mengembalikan dana rekber?')) {
            router.post(`/quests/${quest.id}/cancel`);
        }
    };

    const handleDispute = (e: React.FormEvent) => {
        e.preventDefault();
        postDispute(`/quests/${quest.id}/dispute`, {
            onSuccess: () => setDisputeDialogOpen(false),
        });
    };

    const invoiceUrl = quest.deposit_transaction?.payment_details?.invoice_url;

    return (
        <>
            <Head title={`Quest: ${quest.title} - Rekber Midtrans`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Back button & Title Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/quests">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {quest.title}
                                </h1>
                                <QuestStatusBadge status={quest.status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Dibuat oleh <strong className="text-foreground">{quest.poster?.name}</strong> • #{quest.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                            <Coins className="size-4" />
                            <span>{formatCurrency(quest.reward_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Escrow Stepper Visualizer */}
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            Status Siklus Rekber (Escrow Lifecycle)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EscrowStepper status={quest.status} />
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column (2 Cols): Detail & Actions */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Description Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Deskripsi & Tugas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                                    {quest.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Submission / Review Box */}
                        {quest.submitted_work_notes && (
                            <Card className="border-purple-500/30 bg-purple-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                            <Send className="size-4" />
                                            Hasil Pekerjaan Worker
                                        </span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {quest.submitted_at && new Date(quest.submitted_at).toLocaleString('id-ID')}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg bg-background p-3 text-sm text-foreground border border-border/60 whitespace-pre-line">
                                        {quest.submitted_work_notes}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interactive Role-Based Actions */}
                        <Card className="border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PlayCircle className="size-4 text-primary" />
                                    Aksi Tindakan
                                </CardTitle>
                                <CardDescription>
                                    Tindakan yang tersedia sesuai dengan peran dan status saat ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 1. Poster: Bayar Invoice Midtrans (jika pending_payment atau draft) */}
                                {isPoster && (quest.status === 'pending_payment' || quest.status === 'draft') && (
                                    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                                                Menunggu Pembayaran Rekber
                                            </div>
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                Dana hadiah belum ditahan di rekening rekber. Silakan buka invoice Midtrans Sandbox dan simulasikan pembayaran.
                                            </p>
                                        </div>
                                        {invoiceUrl ? (
                                            <Button asChild className="gap-2 bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                                                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                                                    <span>Buka Invoice Midtrans Sandbox</span>
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </Button>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">Menyiapkan invoice...</div>
                                        )}
                                    </div>
                                )}

                                {/* 2. Worker: Ambil Quest (jika open dan bukan poster) */}
                                {!isPoster && quest.status === 'open' && (
                                    <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                                                Quest Ini Terbuka & Dana Sudah Ditahan
                                            </div>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                                Dana hadiah telah aman dipegang oleh Rekber Midtrans. Anda dapat mengambil quest ini untuk mulai mengerjakan.
                                            </p>
                                        </div>
                                        <Button onClick={handleTakeQuest} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                                            <ShieldCheck className="size-4" />
                                            Ambil Quest Ini Sekarang
                                        </Button>
                                    </div>
                                )}

                                {/* 3. Worker: Submit Pekerjaan (jika in_progress dan user adalah worker) */}
                                {isWorker && quest.status === 'in_progress' && (
                                    <form onSubmit={handleSubmitWork} className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="work_notes">Kirim Bukti Hasil Pekerjaan</Label>
                                            <textarea
                                                id="work_notes"
                                                rows={4}
                                                placeholder="Tuliskan catatan hasil pengerjaan atau tautan repositori/Google Drive hasil tugas..."
                                                value={workData.work_notes}
                                                onChange={(e) => setWorkData('work_notes', e.target.value)}
                                                disabled={submittingWork}
                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                            {workErrors.work_notes && (
                                                <p className="text-xs text-destructive">{workErrors.work_notes}</p>
                                            )}
                                        </div>
                                        <Button type="submit" disabled={submittingWork} className="gap-2">
                                            <Send className="size-4" />
                                            {submittingWork ? 'Mengirim...' : 'Kirim untuk Di-review Poster'}
                                        </Button>
                                    </form>
                                )}

                                {/* 4. Poster: Approve & Release Escrow (jika under_review dan user adalah poster) */}
                                {isPoster && quest.status === 'under_review' && (
                                    <div className="flex flex-col gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-purple-800 dark:text-purple-300 text-sm">
                                                Pekerjaan Telah Disubmit oleh Worker
                                            </div>
                                            <p className="text-xs text-purple-700 dark:text-purple-400">
                                                Periksa hasil kerja di atas. Jika sudah sesuai, setujui untuk mencairkan dana rekber langsung ke rekening worker.
                                            </p>
                                        </div>

                                        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                                                    <CheckCircle2 className="size-4" />
                                                    Setujui & Rilis Dana Rekber
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Konfirmasi Pencairan Dana Rekber</DialogTitle>
                                                    <DialogDescription>
                                                        Sistem akan mengirim instruksi disbursement Midtrans sebesar{' '}
                                                        <strong>{formatCurrency(quest.reward_amount)}</strong> ke rekening worker.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <form onSubmit={handleApproveAndRelease} className="space-y-4 py-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bank_code">Bank / E-Wallet Tujuan</Label>
                                                        <Select
                                                            value={approveData.bank_code}
                                                            onValueChange={(val) => setApproveData('bank_code', val)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Bank" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableBanks.map((b) => (
                                                                    <SelectItem key={b.code} value={b.code}>
                                                                        {b.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="account_number">Nomor Rekening / No. E-Wallet</Label>
                                                        <Input
                                                            id="account_number"
                                                            value={approveData.account_number}
                                                            onChange={(e) => setApproveData('account_number', e.target.value)}
                                                        />
                                                        {approveErrors.account_number && (
                                                            <p className="text-xs text-destructive">{approveErrors.account_number}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="account_holder_name">Nama Pemilik Rekening</Label>
                                                        <Input
                                                            id="account_holder_name"
                                                            value={approveData.account_holder_name}
                                                            onChange={(e) => setApproveData('account_holder_name', e.target.value)}
                                                        />
                                                        {approveErrors.account_holder_name && (
                                                            <p className="text-xs text-destructive">{approveErrors.account_holder_name}</p>
                                                        )}
                                                    </div>

                                                    <DialogFooter className="pt-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setApproveDialogOpen(false)}
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button type="submit" disabled={approvingEscrow} className="gap-2">
                                                            {approvingEscrow ? 'Memproses Payout...' : 'Eksekusi Pencairan Dana'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}

                                {/* 5. Cancel (Poster jika Open) */}
                                {isPoster && quest.status === 'open' && (
                                    <div className="flex items-center justify-between border-t border-border pt-4">
                                        <div className="text-xs text-muted-foreground">
                                            Belum ada worker yang mengambil? Anda dapat membatalkan dan me-refund dana.
                                        </div>
                                        <Button onClick={handleCancelQuest} variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                            Batalkan & Refund
                                        </Button>
                                    </div>
                                )}

                                {/* 6. Dispute (Poster atau Worker jika in_progress atau under_review) */}
                                {(isPoster || isWorker) && ['in_progress', 'under_review'].includes(quest.status) && (
                                    <div className="flex items-center justify-between border-t border-border pt-4">
                                        <div className="text-xs text-muted-foreground">
                                            Terjadi kendala atau ketidaksesuaian hasil kerja?
                                        </div>
                                        <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-xs text-destructive gap-1">
                                                    <ShieldAlert className="size-3.5" />
                                                    Ajukan Sengketa (Dispute)
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Ajukan Sengketa Rekber</DialogTitle>
                                                    <DialogDescription>
                                                        Dana rekber akan dibekukan sementara hingga admin meninjau bukti dari kedua belah pihak.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleDispute} className="space-y-4 py-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="dispute_reason">Alasan Sengketa</Label>
                                                        <textarea
                                                            id="dispute_reason"
                                                            rows={4}
                                                            placeholder="Jelaskan alasan mengapa transaksi ini perlu ditengahi..."
                                                            value={disputeData.dispute_reason}
                                                            onChange={(e) => setDisputeData('dispute_reason', e.target.value)}
                                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                        />
                                                        {disputeErrors.dispute_reason && (
                                                            <p className="text-xs text-destructive">{disputeErrors.dispute_reason}</p>
                                                        )}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="button" variant="outline" onClick={() => setDisputeDialogOpen(false)}>
                                                            Tutup
                                                        </Button>
                                                        <Button type="submit" variant="destructive" disabled={disputing}>
                                                            {disputing ? 'Mengirim...' : 'Kirim Laporan Sengketa'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col): Rekber Ledger & Participants */}
                    <div className="space-y-6">
                        {/* Escrow Ledger Breakdown */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Coins className="size-4 text-emerald-500" />
                                    Buku Besar Rekber (Escrow Ledger)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Hadiah Worker</span>
                                    <span className="font-semibold text-foreground">{formatCurrency(quest.reward_amount)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Biaya Platform</span>
                                    <span className="font-semibold text-foreground">{formatCurrency(quest.fee_amount)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/50 font-bold text-sm">
                                    <span>Total Dana Disetor</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(quest.total_amount)}</span>
                                </div>

                                {quest.deposit_transaction && (
                                    <div className="pt-2 space-y-1 text-[11px] text-muted-foreground">
                                        <div>Ref Midtrans Deposit: <code className="text-foreground">{quest.deposit_transaction.xendit_external_id}</code></div>
                                        <div>Status Deposit: <strong className="text-foreground uppercase">{quest.deposit_transaction.status}</strong></div>
                                        {quest.deposit_transaction.paid_at && (
                                            <div>Waktu Deposit: {new Date(quest.deposit_transaction.paid_at).toLocaleString('id-ID')}</div>
                                        )}
                                    </div>
                                )}

                                {quest.payout_transaction && (
                                    <div className="pt-2 border-t border-border/50 space-y-1 text-[11px] text-muted-foreground">
                                        <div>Ref Midtrans Payout: <code className="text-foreground">{quest.payout_transaction.xendit_external_id}</code></div>
                                        <div>Status Payout: <strong className="text-foreground uppercase">{quest.payout_transaction.status}</strong></div>
                                        {quest.payout_transaction.released_at && (
                                            <div>Waktu Pencairan: {new Date(quest.payout_transaction.released_at).toLocaleString('id-ID')}</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Participants Card */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <UserIcon className="size-4 text-primary" />
                                    Pihak Terkait
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div>
                                    <div className="text-muted-foreground mb-1">Poster (Pemberi Tugas):</div>
                                    <div className="font-medium text-foreground">{quest.poster?.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{quest.poster?.email}</div>
                                </div>

                                <div className="border-t border-border/50 pt-3">
                                    <div className="text-muted-foreground mb-1">Worker (Pelaksana):</div>
                                    {quest.worker ? (
                                        <>
                                            <div className="font-medium text-foreground">{quest.worker.name}</div>
                                            <div className="text-[11px] text-muted-foreground">{quest.worker.email}</div>
                                        </>
                                    ) : (
                                        <div className="italic text-muted-foreground">Belum ada worker yang ditugaskan</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

QuestShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Rekber Quests',
            href: '/quests',
        },
        {
            title: 'Detail Quest',
            href: '/quests',
        },
    ],
};
