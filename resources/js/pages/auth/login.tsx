import React from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import {
    ArrowLeft,
    Mail,
    Lock,
    ShieldCheck,
    CheckCircle2,
    LockKeyhole,
    Cpu,
    Sun,
    Moon,
} from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleAppearance = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <Head title="Masuk - Portal Administrator" />

            {/* True Full Screen Edge-to-Edge Canvas (NO Scroll on Entire Page) */}
            <div className="relative w-screen h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-100 dark:bg-slate-950 text-zinc-900 dark:text-white selection:bg-violet-500 selection:text-white transition-colors duration-300">
                {/* Left Showcase Section (55% on Desktop) */}
                <div className="relative hidden lg:flex lg:w-[55%] xl:w-[58%] h-full flex-col justify-between p-8 xl:p-12 bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 dark:from-slate-950 dark:via-zinc-900 dark:to-slate-900 text-zinc-900 dark:text-white overflow-hidden border-r border-slate-200 dark:border-white/10 transition-colors duration-300">
                    {/* Ambient Glows */}
                    <div className="absolute -top-32 -left-32 size-[500px] rounded-full bg-violet-400/20 dark:bg-violet-600/20 blur-[130px] pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[130px] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-[150px] pointer-events-none" />

                    {/* Subtle Grid Lines Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

                    {/* Top Branding */}
                    <div className="relative z-10">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 group transition-transform hover:translate-x-0.5"
                        >
                            <img
                                src="/images/anang-logo.png"
                                alt="Ridhwan Anang Logo"
                                className="size-10 rounded-xl shadow-lg border border-slate-200 dark:border-white/15"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                                        Ridhwan Anang
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-[11px] font-semibold border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/10 dark:bg-violet-500/15 px-2 py-0.5"
                                    >
                                        Portal
                                    </Badge>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    Admin & Services Management Gateway
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Center Hero Content */}
                    <div className="relative z-10 space-y-5 my-auto max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 backdrop-blur-md shadow-xs">
                            <span className="size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span>Sistem Online • Standar Global OWASP</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl xl:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                                Kendali Penuh Portofolio & Layanan Klien.
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-300 text-sm xl:text-base leading-relaxed">
                                Kelola karya proyek, riwayat pendidikan, tech stacks, sertifikat, serta respon cepat pesan masuk dan pelacak pesanan layanan klien dalam satu dashboard terpadu.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-xs space-y-1.5">
                                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs uppercase tracking-wider">
                                    <Cpu className="size-4" />
                                    <span>High Performance</span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                                    Inertia.js + React 19 dengan navigasi instan tanpa network waterfall.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-xs space-y-1.5">
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                    <ShieldCheck className="size-4" />
                                    <span>Enterprise Security</span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                                    Session-based HttpOnly cookies, CSRF protection, dan Passkeys.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Footer */}
                    <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>© {new Date().getFullYear()} Ridhwan Anang Ma'ruf.</span>
                        <div className="flex items-center gap-4">
                            <Link href={home()} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Lihat Portofolio
                            </Link>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                <CheckCircle2 className="size-3.5" /> Gateway Siap
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Form Section (45% on Desktop, NO SCROLLBAR, Styled Elegantly) */}
                <div className="relative w-full lg:w-[45%] xl:w-[42%] h-full max-h-screen flex flex-col justify-between p-6 sm:p-8 xl:p-12 overflow-hidden bg-slate-50/60 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950 transition-colors duration-300">
                    {/* Ambient Glows on Right */}
                    <div className="absolute top-1/4 right-0 size-80 rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-10 left-10 size-60 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[90px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

                    {/* Form Card (Styled Glassmorphism Frame, Perfectly Fitted, Zero Scroll) */}
                    <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto my-auto p-5 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/80 space-y-3.5 sm:space-y-4">
                        {/* Card Header Top: Icon / Mobile Brand & Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="inline-flex items-center justify-center size-9 rounded-xl bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25 shadow-xs">
                                    <ShieldCheck className="size-4.5" />
                                </div>
                                {/* Mobile Branding (Only visible on mobile) */}
                                <div className="lg:hidden flex items-center gap-2">
                                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">Ridhwan Anang</span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/10 dark:bg-violet-500/15">
                                        Portal
                                    </Badge>
                                </div>
                            </div>

                            {/* Action Buttons: Theme Switcher & Back to Home */}
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleAppearance}
                                    className="size-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xs cursor-pointer"
                                    title={resolvedAppearance === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
                                >
                                    {resolvedAppearance === 'dark' ? (
                                        <Sun className="size-3.5 text-amber-400" />
                                    ) : (
                                        <Moon className="size-3.5 text-violet-600" />
                                    )}
                                    <span className="sr-only">Ganti Tema</span>
                                </Button>

                                <Link
                                    href={home()}
                                    className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-full px-3 py-1.5 backdrop-blur-md transition-all duration-200 shadow-xs hover:shadow-sm"
                                >
                                    <ArrowLeft className="size-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-transform duration-200 group-hover:-translate-x-0.5" />
                                    <span>Beranda</span>
                                </Link>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-0.5 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Masuk ke Akun
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Masukkan kredensial administrator Anda untuk mengakses dashboard.
                            </p>
                        </div>

                        {/* Status Alert */}
                        {status && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium">
                                {status}
                            </div>
                        )}

                        {/* Passkey Verification */}
                        <PasskeyVerify />

                        {/* Main Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Input */}
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                                            Alamat Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="ridhwananang@gmail.com"
                                                className="pl-9 h-9.5 text-sm bg-slate-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                                                Kata Sandi
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline font-medium"
                                                    tabIndex={5}
                                                >
                                                    Lupa kata sandi?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500 pointer-events-none z-10" />
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="pl-9 h-9.5 text-sm bg-slate-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className="flex items-center space-x-2 pt-0.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer font-normal select-none"
                                        >
                                            Ingat saya di perangkat ini
                                        </Label>
                                    </div>

                                    {/* Modern Gradient Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-10 font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/25 hover:shadow-violet-600/40 transition-all gap-2 mt-1 border-0 cursor-pointer"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                <span>Memverifikasi akun...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LockKeyhole className="size-4" />
                                                <span>Masuk ke Dashboard</span>
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Bottom Status on Form Side */}
                    <div className="relative z-10 text-center text-[11px] text-zinc-400 dark:text-zinc-500 py-1">
                        <span>© {new Date().getFullYear()} Ridhwan Anang Ma'ruf. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </>
    );
}
