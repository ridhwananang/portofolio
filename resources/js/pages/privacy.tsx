import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, Lock, Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function PrivacyPolicy() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDarkMode = resolvedAppearance === 'dark';

    const toggleTheme = () => {
        const nextMode = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextMode);
        localStorage.setItem('theme', nextMode);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <Head title="Kebijakan Privasi (Privacy Policy) | Ridhwan Anang Ma'ruf" />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Portofolio</span>
                        </Link>
                        <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                        <Link href="/" className="hidden text-sm font-bold tracking-tight text-slate-900 sm:block dark:text-white">
                            Ridhwan Anang Ma'ruf
                        </Link>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/terms-and-conditions"
                            className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                        >
                            Syarat & Ketentuan
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Dynamic Background Mesh Accents */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/10"></div>
                <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10"></div>
            </div>

            {/* Content Container */}
            <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Title Card */}
                <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                        <Lock size={14} />
                        <span>Kebijakan Perlindungan Data Pribadi</span>
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Kebijakan Privasi (Privacy Policy)
                    </h1>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Terakhir diperbarui: 22 September 2026 • Komitmen perlindungan privasi pengguna oleh Ridhwan Anang Ma'ruf.
                    </p>

                    {/* Privacy Body */}
                    <div className="prose prose-slate mt-10 max-w-none space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300 border-t border-slate-100 pt-8 dark:border-slate-800/80">
                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                1. Komitmen Privasi Kami
                            </h2>
                            <p>
                                Privasi Anda sangat penting bagi Kami. <strong>Ridhwan Anang Ma'ruf</strong> berkomitmen penuh untuk menjaga keamanan dan kerahasiaan setiap data pribadi yang Anda berikan saat menggunakan layanan atau memesan jasa pembuatan website di situs ini. Kami menjamin bahwa data Anda tidak akan disalahgunakan, diperjualbelikan, atau disebarluaskan kepada pihak ketiga mana pun tanpa persetujuan Anda.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                2. Data yang Kami Kumpulkan
                            </h2>
                            <p>
                                Saat Anda menggunakan kalkulator pemesanan website atau menghubungi Kami, Kami dapat mengumpulkan informasi berikut:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Informasi Identitas & Kontak:</strong> Nama lengkap, alamat email aktif, dan nomor telepon / WhatsApp.</li>
                                <li><strong>Rincian Proyek:</strong> Paket website yang dipilih, fitur tambahan (add-ons), catatan kebutuhan teknis, dan preferensi linimasa pengerjaan.</li>
                                <li><strong>Informasi Teknis Otomatis:</strong> Alamat IP, jenis peramban (*browser*), dan data analitik interaksi situs web yang dikumpulkan demi peningkatan performa situs.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                3. Tujuan Penggunaan Informasi
                            </h2>
                            <p>
                                Informasi pribadi yang Anda berikan hanya digunakan secara khusus untuk keperluan:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Menerbitkan proposal digital resmi dan estimasi biaya proyek.</li>
                                <li>Menghubungi Anda perihal konfirmasi pemesanan, koordinasi teknis, dan evaluasi hasil pengerjaan website.</li>
                                <li>Memproses transaksi pembayaran aman melalui sistem payment gateway resmi terenkripsi.</li>
                                <li>Mengirimkan tautan pelacakan progres pengerjaan proyek secara real-time.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                4. Keamanan Transaksi & Pembayaran (Payment Gateway)
                            </h2>
                            <p>
                                Kami tidak pernah menyimpan informasi sensitif perbankan (seperti nomor kartu kredit, PIN, atau kata sandi perbankan) di server Kami. Seluruh proses pembayaran dialihkan dan diamankan oleh sistem gerbang pembayaran resmi menggunakan standar enkripsi perbankan industri terkemuka (PCI-DSS Compliance).
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                5. Hak Anda atas Data Pribadi
                            </h2>
                            <p>
                                Anda memiliki hak untuk meminta rincian data Anda yang Kami simpan, meminta pembaruan jika terdapat data yang tidak akurat, atau meminta penghapusan data kontak Anda dari basis data Kami setelah proyek selesai diserahterimakan.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                6. Kontak Kebijakan Privasi
                            </h2>
                            <p>
                                Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin mengajukan permohonan terkait data pribadi Anda, silakan hubungi:
                            </p>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1 text-xs">
                                <div className="font-bold text-slate-900 dark:text-white">Ridhwan Anang Ma'ruf</div>
                                <div>Email Resmi: <a href="mailto:ridhwananang@gmail.com" className="text-violet-600 underline dark:text-violet-400">ridhwananang@gmail.com</a></div>
                                <div>Tangerang Selatan, Indonesia</div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
