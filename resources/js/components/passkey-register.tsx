import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Plus } from 'lucide-react';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;

        const browser = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'].find(
            (browser) => new RegExp(browser).test(ua),
        );

        const os = ['iPhone', 'iPad', 'Android', 'Mac', 'Windows'].find((os) =>
            new RegExp(os).test(ua),
        );

        return [browser, os].filter(Boolean).join(' on ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <div className="text-xs text-slate-500 dark:text-slate-400">
                Passkeys tidak didukung pada browser ini.
            </div>
        );
    }

    if (!showForm) {
        return (
            <Button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
            >
                <Plus className="size-4 mr-1.5" />
                Tambah Passkey Baru
            </Button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5"
        >
            <div className="space-y-1.5">
                <Label htmlFor="passkey-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Passkey
                </Label>
                <Input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="cth: MacBook Pro Touch ID, iPhone Face ID"
                    className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                    autoFocus
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nama membantu Anda mengenali perangkat ini nantinya saat login.
                </p>
            </div>

            {error && <InputError message={error} />}

            <div className="flex gap-2 pt-1">
                <Button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                    {isLoading ? 'Mendaftarkan...' : 'Daftarkan Passkey'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                    Batal
                </Button>
            </div>
        </form>
    );
}
