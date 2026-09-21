import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, ShieldCheck, ArrowLeft, Info } from 'lucide-react';

interface Props {
    platformFeeFixed: number;
}

export default function QuestCreate({ platformFeeFixed }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        reward_amount: '100000',
    });

    const rewardNum = parseFloat(data.reward_amount) || 0;
    const totalAmount = rewardNum + platformFeeFixed;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/quests');
    };

    return (
        <>
            <Head title="Buat Quest Baru - Rekber Midtrans" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
                {/* Back button & Title */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/quests">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Buat Quest Baru
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tentukan tugas dan dana hadiah yang akan ditahan secara aman di Rekber Midtrans Sandbox.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Form (2 cols) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Rincian Tugas</CardTitle>
                            <CardDescription>
                                Jelaskan dengan jelas kriteria dan instruksi tugas untuk worker.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Quest</Label>
                                    <Input
                                        id="title"
                                        placeholder="Contoh: Buatkan Desain Landing Page Portofolio"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        disabled={processing}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi & Kriteria Penyelesaian</Label>
                                    <textarea
                                        id="description"
                                        rows={6}
                                        placeholder="Deskripsikan pekerjaan, deliverables yang diharapkan, format pengiriman, serta deadline..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reward_amount">Nominal Hadiah Worker (IDR)</Label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            id="reward_amount"
                                            type="number"
                                            min="10000"
                                            step="1000"
                                            placeholder="100000"
                                            value={data.reward_amount}
                                            onChange={(e) => setData('reward_amount', e.target.value)}
                                            disabled={processing}
                                            className="pl-9"
                                        />
                                    </div>
                                    {errors.reward_amount && (
                                        <p className="text-xs text-destructive">{errors.reward_amount}</p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        Minimal Rp 10.000. Dana ini akan diterima penuh oleh worker saat disetujui.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={processing} className="w-full gap-2">
                                        <ShieldCheck className="size-4" />
                                        {processing ? 'Memproses Invoice Rekber...' : 'Lanjut ke Pembayaran Rekber'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right Summary Card (1 col) */}
                    <div className="space-y-4">
                        <Card className="border-primary/30 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Coins className="size-4 text-emerald-500" />
                                    Ringkasan Biaya Rekber
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Hadiah Worker</span>
                                    <span className="font-medium text-foreground">{formatCurrency(rewardNum)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Biaya Platform (Escrow Fee)</span>
                                    <span className="font-medium text-foreground">{formatCurrency(platformFeeFixed)}</span>
                                </div>
                                <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                                    <span>Total Bayar</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-700 dark:text-blue-300">
                            <Info className="size-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <div className="font-semibold">Simulasi Non-Real (Sandbox)</div>
                                <p className="text-[11px] leading-relaxed opacity-90">
                                    Setelah formulir dikirim, Anda akan mendapatkan invoice Midtrans Sandbox. Anda dapat mensimulasikan pembayaran tanpa menggunakan uang asli.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

QuestCreate.layout = {
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
            title: 'Buat Baru',
            href: '/quests/create',
        },
    ],
};
