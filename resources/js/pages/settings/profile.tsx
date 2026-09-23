import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';
import { Save, UserCheck, AlertCircle } from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Pengaturan Profil - Ridhwan Anang" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-8">
                <div>
                    <Heading
                        variant="small"
                        title="Profil Akun Pengembang"
                        description="Perbarui nama akun autentikasi dan alamat email utama Anda."
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Akun
                                    </Label>

                                    <Input
                                        id="name"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-1"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Alamat Email
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-1"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <AlertCircle className="size-4 shrink-0" />
                                                Alamat email Anda belum diverifikasi.
                                            </div>
                                            <p>
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="underline font-bold hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
                                                >
                                                    Klik di sini untuk mengirim ulang email verifikasi.
                                                </Link>
                                            </p>

                                            {status === 'verification-link-sent' && (
                                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="pt-2">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
                                    >
                                        <Save className="size-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/80">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
