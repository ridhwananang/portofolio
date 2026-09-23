import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import Heading from '@/components/heading';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center rounded-[1.6rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/10 via-indigo-500/10 to-blue-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-xs">
                <KeyRound className="size-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Belum ada Passkey terdaftar</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Tambahkan passkey (Touch ID, Face ID, Windows Hello) untuk masuk secara instan tanpa kata sandi.
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Passkeys & Biometrik"
                description="Kelola passkey perangkat Anda untuk login cepat dan aman tanpa mengetik kata sandi."
            />

            <div className="overflow-hidden rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 shadow-xs">
                {passkeys.length > 0 ? (
                    passkeys.map((passkey) => (
                        <PasskeyItem
                            key={passkey.id}
                            passkey={passkey}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>

            <PasskeyRegistration onSuccess={handleRegisterSuccess} />
        </div>
    );
}
