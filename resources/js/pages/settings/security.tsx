import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import { Save, Lock, KeyRound } from 'lucide-react';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Pengaturan Keamanan - Ridhwan Anang" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-10">
                {/* Password Update Section */}
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Perbarui Kata Sandi"
                        description="Pastikan akun Anda menggunakan kata sandi yang panjang, acak, dan aman."
                    />

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="current_password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Kata Sandi Saat Ini
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi saat ini"
                                    />

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Kata Sandi Baru
                                    </Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                        autoComplete="new-password"
                                        placeholder="Masukkan kata sandi baru"
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Konfirmasi Kata Sandi Baru
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                        autoComplete="new-password"
                                        placeholder="Ulangi kata sandi baru"
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
                                    >
                                        <Save className="size-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* 2FA Section */}
                <div className="pt-8 border-t border-slate-200/70 dark:border-slate-800/80">
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </div>

                {/* Passkeys Section */}
                <div className="pt-8 border-t border-slate-200/70 dark:border-slate-800/80">
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </div>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Keamanan',
            href: edit(),
        },
    ],
};
