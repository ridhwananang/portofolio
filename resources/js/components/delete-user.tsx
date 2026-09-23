import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Hapus Akun Pengembang"
                description="Hapus akun Anda beserta seluruh data dan resource terkait secara permanen."
            />
            <div className="space-y-4 rounded-[1.6rem] border border-rose-200/80 bg-rose-50/50 p-6 dark:border-rose-950/60 dark:bg-rose-950/20">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                        <AlertTriangle className="size-4" />
                    </div>
                    <div className="space-y-1 text-rose-600 dark:text-rose-400">
                        <p className="font-bold text-xs uppercase tracking-wider">Zona Berbahaya</p>
                        <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                            Setelah akun Anda dihapus, semua data profil, proyek, pesanan, dan kredensial akan dimusnahkan secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="rounded-2xl text-xs font-bold shadow-xs hover:bg-rose-600 cursor-pointer"
                        >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Hapus Akun Permanen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
                        <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                            Apakah Anda yakin ingin menghapus akun?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Semua data dan resource akan dihapus secara permanen. Masukkan kata sandi Anda untuk mengonfirmasi penghapusan akun.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-5 pt-2"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            Konfirmasi Kata Sandi
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi Anda"
                                            autoComplete="current-password"
                                            className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2 pt-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                                className="rounded-xl text-xs font-bold cursor-pointer"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                            className="rounded-xl text-xs font-bold cursor-pointer"
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
