import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80 p-4 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-xs">
                    <KeyRound className="size-5" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 uppercase">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ditambahkan {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="mx-1 text-slate-300 dark:text-slate-700">
                                    •
                                </span>
                                Terakhir digunakan {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Hapus Passkey</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                        Hapus Passkey
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Apakah Anda yakin ingin menghapus passkey "{passkey.name}"? Anda tidak lagi dapat menggunakannya untuk masuk.
                    </DialogDescription>
                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button variant="secondary" className="rounded-xl text-xs font-bold cursor-pointer">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl text-xs font-bold cursor-pointer"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
