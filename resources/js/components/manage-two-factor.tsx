import { Form } from '@inertiajs/react';
import { ShieldCheck, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    variant="small"
                    title="Autentikasi Dua Faktor (2FA)"
                    description="Tingkatkan keamanan akun Anda dengan verifikasi kode dinamis (TOTP)."
                />
                {twoFactorEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        2FA Aktif
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Belum Aktif
                    </span>
                )}
            </div>

            {twoFactorEnabled ? (
                <div className="space-y-4 p-5 rounded-[1.6rem] border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Akun Anda dilindungi dengan autentikasi dua faktor. Setiap kali masuk, Anda akan dimintai kode PIN 6 digit dari aplikasi autentikator (seperti Google Authenticator).
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                        <Form {...disable.form()}>
                            {({ processing }) => (
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl text-xs font-bold shadow-xs cursor-pointer"
                                >
                                    Nonaktifkan 2FA
                                </Button>
                            )}
                        </Form>

                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4 p-5 rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Saat mengaktifkan 2FA, Anda akan memindai kode QR menggunakan aplikasi autentikator pilihan Anda untuk menghasilkan PIN keamanan berkala.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button
                                onClick={() => setShowSetupModal(true)}
                                className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
                            >
                                <ShieldCheck className="size-4 mr-1.5" />
                                Lanjutkan Penyiapan 2FA
                            </Button>
                        ) : (
                            <Form
                                {...enable.form()}
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
                                    >
                                        <ShieldCheck className="size-4 mr-1.5" />
                                        Aktifkan 2FA Sekarang
                                    </Button>
                                )}
                            </Form>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
