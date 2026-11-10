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
            <div className="relative flex h-screen max-h-screen w-screen flex-col overflow-hidden bg-slate-100 text-zinc-900 transition-colors duration-300 selection:bg-violet-500 selection:text-white lg:flex-row dark:bg-slate-950 dark:text-white">
                {/* Left Showcase Section (55% on Desktop) */}
                <div className="relative hidden h-full flex-col justify-between overflow-hidden border-r border-slate-200 bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 p-8 text-zinc-900 transition-colors duration-300 lg:flex lg:w-[55%] xl:w-[58%] xl:p-12 dark:border-white/10 dark:from-slate-950 dark:via-zinc-900 dark:to-slate-900 dark:text-white">
                    {/* Ambient Glows */}
                    <div className="pointer-events-none absolute -top-32 -left-32 size-[500px] rounded-full bg-violet-400/20 blur-[130px] dark:bg-violet-600/20" />
                    <div className="pointer-events-none absolute -right-32 -bottom-32 size-[500px] rounded-full bg-indigo-400/20 blur-[130px] dark:bg-indigo-600/20" />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-[150px] dark:bg-blue-500/10" />

                    {/* Subtle Grid Lines Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />

                    {/* Top Branding */}
                    <div className="relative z-10">
                        <Link
                            href={home()}
                            className="group inline-flex items-center gap-3 transition-transform hover:translate-x-0.5"
                        >
                            <img
                                src="/images/anang-logo.png"
                                alt="Ridhwan Anang Logo"
                                className="size-10 rounded-xl border border-slate-200 shadow-lg dark:border-white/15"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                                        Ridhwan Anang
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                                    >
                                        Portal
                                    </Badge>
                                </div>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Admin & Services Management Gateway
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Center Hero Content */}
                    <div className="relative z-10 my-auto max-w-xl space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-700 shadow-xs backdrop-blur-md dark:text-violet-300">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
                            <span>Sistem Online • Standar Global OWASP</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl leading-tight font-black tracking-tight text-zinc-900 xl:text-5xl dark:text-white">
                                Kendali Penuh Portofolio & Layanan Klien.
                            </h1>
                            <p className="text-sm leading-relaxed text-zinc-600 xl:text-base dark:text-zinc-300">
                                Kelola karya proyek, riwayat pendidikan, tech
                                stacks, sertifikat, serta respon cepat pesan
                                masuk dan pelacak pesanan layanan klien dalam
                                satu dashboard terpadu.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
                                    <Cpu className="size-4" />
                                    <span>High Performance</span>
                                </div>
                                <p className="text-xs leading-normal text-zinc-600 dark:text-zinc-400">
                                    Inertia.js + React 19 dengan navigasi instan
                                    tanpa network waterfall.
                                </p>
                            </div>

                            <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                    <ShieldCheck className="size-4" />
                                    <span>Enterprise Security</span>
                                </div>
                                <p className="text-xs leading-normal text-zinc-600 dark:text-zinc-400">
                                    Session-based HttpOnly cookies, CSRF
                                    protection, dan Passkeys.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Footer */}
                    <div className="relative z-10 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                        <span>
                            © {new Date().getFullYear()} Ridhwan Anang Ma'ruf.
                        </span>
                        <div className="flex items-center gap-4">
                            <Link
                                href={home()}
                                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
                            >
                                Lihat Portofolio
                            </Link>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" /> Gateway
                                Siap
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Form Section (45% on Desktop, NO SCROLLBAR, Styled Elegantly) */}
                <div className="relative flex h-full max-h-screen w-full flex-col justify-between overflow-hidden bg-slate-50/60 p-6 transition-colors duration-300 sm:p-8 lg:w-[45%] xl:w-[42%] xl:p-12 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950">
                    {/* Ambient Glows on Right */}
                    <div className="pointer-events-none absolute top-1/4 right-0 size-80 rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-600/10" />
                    <div className="pointer-events-none absolute bottom-10 left-10 size-60 rounded-full bg-indigo-500/10 blur-[90px] dark:bg-indigo-600/10" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

                    {/* Form Card (Styled Glassmorphism Frame, Perfectly Fitted, Zero Scroll) */}
                    <div className="relative z-10 mx-auto my-auto w-full max-w-sm space-y-3.5 rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:max-w-md sm:space-y-4 sm:p-7 dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-2xl dark:shadow-black/80">
                        {/* Card Header Top: Icon / Mobile Brand & Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="inline-flex size-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 shadow-xs dark:border-violet-500/25 dark:bg-violet-500/15 dark:text-violet-400">
                                    <ShieldCheck className="size-4.5" />
                                </div>
                                {/* Mobile Branding (Only visible on mobile) */}
                                <div className="flex items-center gap-2 lg:hidden">
                                    <span className="text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
                                        Ridhwan Anang
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="border-violet-500/30 bg-violet-500/10 px-1.5 py-0 text-[10px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                                    >
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
                                    className="size-8 cursor-pointer rounded-full border border-slate-200 bg-slate-100 text-zinc-600 shadow-xs transition-all hover:bg-slate-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
                                    title={
                                        resolvedAppearance === 'dark'
                                            ? 'Beralih ke mode terang'
                                            : 'Beralih ke mode gelap'
                                    }
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
                                    className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-slate-300 hover:bg-slate-200 hover:text-zinc-900 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white"
                                >
                                    <ArrowLeft className="size-3.5 text-zinc-500 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white" />
                                    <span>Beranda</span>
                                </Link>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-0.5 text-center sm:text-left">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                                Masuk ke Akun
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Masukkan kredensial administrator Anda untuk
                                mengakses dashboard.
                            </p>
                        </div>

                        {/* Status Alert */}
                        {status && (
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
                                        <Label
                                            htmlFor="email"
                                            className="text-xs font-semibold text-zinc-700 dark:text-zinc-200"
                                        >
                                            Alamat Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@gmail.com"
                                                className="h-9.5 border-zinc-200 bg-slate-50 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-violet-500 focus-visible:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-white dark:placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs font-semibold text-zinc-700 dark:text-zinc-200"
                                            >
                                                Kata Sandi
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400 dark:hover:text-violet-300"
                                                    tabIndex={5}
                                                >
                                                    Lupa kata sandi?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-9.5 border-zinc-200 bg-slate-50 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-violet-500 focus-visible:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-white dark:placeholder:text-zinc-500"
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
                                            className="border-zinc-300 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 dark:border-zinc-700"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="cursor-pointer text-xs font-normal text-zinc-600 select-none dark:text-zinc-400"
                                        >
                                            Ingat saya di perangkat ini
                                        </Label>
                                    </div>

                                    {/* Modern Gradient Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-1 h-10 w-full cursor-pointer gap-2 border-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-600/40"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                <span>
                                                    Memverifikasi akun...
                                                </span>
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
                    <div className="relative z-10 py-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                        <span>
                            © {new Date().getFullYear()} Ridhwan Anang Ma'ruf.
                            All rights reserved.
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
