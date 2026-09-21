import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, FileText, Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function TermsAndConditions() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDarkMode = resolvedAppearance === 'dark';

    const toggleTheme = () => {
        const nextMode = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextMode);
        localStorage.setItem('theme', nextMode);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <Head title="Syarat & Ketentuan Layanan (Terms & Conditions) | Ridhwan Anang Ma'ruf" />

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
                            href="/privacy-policy"
                            className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                        >
                            Kebijakan Privasi
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

            {/* Content Container */}
            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Title */}
                <div className="border-b border-slate-200 pb-8 dark:border-slate-800">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                        <FileText size={14} />
                        <span>Dokumen Resmi & Kepatuhan Layanan</span>
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Syarat & Ketentuan Layanan (Terms & Conditions)
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Terakhir diperbarui: 22 September 2026 • Berlaku untuk seluruh layanan pengembangan website dan aplikasi digital oleh Ridhwan Anang Ma'ruf.
                    </p>
                </div>

                {/* Terms Body */}
                <div className="prose prose-slate mt-10 max-w-none space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300">
                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            1. Conditions of Use (Ketentuan Penggunaan)
                        </h2>
                        <p>
                            Layanan Jasa Pembuatan Website & Pengembangan Aplikasi Digital ini disediakan oleh <strong>Ridhwan Anang Ma'ruf</strong> ("Penyedia Jasa" / "Kami") kepada Anda ("Klien" / "Pengguna"), dengan ketentuan Anda menerima seluruh syarat, ketentuan, pemberitahuan, dan kebijakan yang termaktub di dalam dokumen ini serta dokumen perjanjian terkait lainnya.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            2. Overview (Gambaran Umum Layanan)
                        </h2>
                        <p>
                            Penggunaan situs web ini (<code>https://ridhwananang.laravel.cloud/</code>) serta pemesanan jasa melalui kalkulator interaktif merupakan bentuk persetujuan mengikat Anda terhadap seluruh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda dipersilakan untuk tidak melanjutkan penggunaan situs web atau pemesanan layanan.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            3. Modification of the Site and These Terms (Perubahan Situs & Ketentuan)
                        </h2>
                        <p>
                            Penyedia Jasa berhak untuk mengubah, memperbarui, menambah, atau menghentikan sebagian atau seluruh fitur, paket harga layanan, materi informasi, dan Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan oleh Klien setelah adanya perubahan merupakan bentuk persetujuan atas syarat yang telah diperbarui.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            4. Copyrights & Intellectual Property (Hak Cipta & Kekayaan Intelektual)
                        </h2>
                        <p>
                            Seluruh materi dalam situs web ini (termasuk teks, logo, desain grafis, kode sumber, dan dokumentasi) dilindungi oleh undang-undang hak cipta Republik Indonesia.
                        </p>
                        <p>
                            Untuk proyek pesanan website klien: Seluruh hak kepemilikan kode sumber (*source code*), aset desain khusus, dan hak akses server akan diserahterimakan secara penuh kepada Klien setelah seluruh kewajiban pembayaran dinyatakan lunas.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            5. Orders & Client Identification (Pemesanan & Identifikasi Klien)
                        </h2>
                        <p>
                            Untuk melakukan pemesanan layanan, Klien diminta mengisi data identitas yang akurat (Nama Lengkap, Alamat Email aktif, dan Nomor WhatsApp). Klien bertanggung jawab penuh atas keabsahan informasi kontak yang diberikan guna penerbitan proposal digital, penagihan, dan koordinasi pengerjaan proyek.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            6. Electronic Communications (Komunikasi Elektronik)
                        </h2>
                        <p>
                            Dengan memesan layanan atau menghubungi Kami, Klien menyetujui bahwa seluruh korespondensi, persetujuan kerja, revisi, dan faktur penagihan dapat disampaikan melalui media elektronik (Email: <code>ridhwananang@gmail.com</code> atau WhatsApp resmi Penyedia Jasa).
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            7. Services Descriptions & Scope of Work (Deskripsi Layanan & Lingkup Kerja)
                        </h2>
                        <p>
                            Penyedia Jasa berupaya menyajikan rincian fitur, estimasi biaya, dan linimasa pengerjaan seakurat mungkin melalui kalkulator biaya interaktif. Pengerjaan proyek mencakup:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Pengembangan website sesuai paket terpilih (Landing Page, Company Profile, E-Commerce, atau Full-Stack Web App).</li>
                            <li>Penyediaan tautan demo uji coba (*staging preview*) untuk ditinjau oleh Klien sebelum rilis produksi.</li>
                            <li>Revisi minor sesuai dengan kesepakatan penawaran kerja sebelum serah terima final.</li>
                        </ul>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            8. Payment, Escrow & Refund Policy (Ketentuan Pembayaran & Pengembalian Dana)
                        </h2>
                        <p>
                            Seluruh transaksi pembayaran diproses secara aman melalui gerbang pembayaran resmi <strong>Midtrans</strong> (mendukung QRIS, Virtual Account bank nasional, kartu debit/kredit, dan e-wallet).
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Jaminan Penahanan Dana (Escrow):</strong> Pembayaran yang disetorkan Klien disimpan secara aman dan terenkripsi, serta baru dicairkan setelah Klien melakukan konfirmasi persetujuan (*approval*) terhadap hasil demo proyek.</li>
                            <li><strong>Kebijakan Pengembalian Dana (Refund):</strong> Jika Penyedia Jasa terbukti tidak dapat menyelesaikan pengerjaan proyek sesuai spesifikasi yang disepakati, Klien berhak mengajukan permohonan pengembalian dana (*refund*) sesuai mekanisme rekber yang berlaku.</li>
                        </ul>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            9. Indemnity (Ganti Rugi & Pelepasan Tuntutan)
                        </h2>
                        <p>
                            Klien setuju untuk membebaskan dan melindungi Penyedia Jasa dari segala bentuk klaim, kerugian, kewajiban hukum, atau biaya (termasuk biaya pengacara) yang timbul akibat penyalahgunaan situs web oleh Klien, pelanggaran hak pihak ketiga atas materi konten yang disediakan oleh Klien, atau pelanggaran terhadap ketentuan hukum yang berlaku.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            10. Disclaimer (Batasan Tanggung Jawab)
                        </h2>
                        <p>
                            Penyedia Jasa berdedikasi memberikan hasil kode program berkualitas tinggi dan teruji. Namun demikian, Kami tidak bertanggung jawab atas gangguan layanan yang diakibatkan oleh penyedia pihak ketiga di luar kendali langsung Kami (seperti gangguan jaringan hosting eksternal, perubahan kebijakan API pihak ketiga, atau bencana alam).
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            11. Applicable Laws (Hukum yang Berlaku)
                        </h2>
                        <p>
                            Syarat dan Ketentuan ini diatur dan ditafsirkan sepenuhnya berdasarkan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            12. Questions and Feedback (Kontak & Pertanyaan)
                        </h2>
                        <p>
                            Apabila Anda memiliki pertanyaan, saran, atau masukan mengenai Syarat & Ketentuan Layanan ini, silakan hubungi kontak resmi Kami:
                        </p>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1 text-xs">
                            <div className="font-bold text-slate-900 dark:text-white">Ridhwan Anang Ma'ruf</div>
                            <div>Penyedia Jasa Pembuatan Website & Pengembangan Aplikasi</div>
                            <div>Email: <a href="mailto:ridhwananang@gmail.com" className="text-violet-600 underline dark:text-violet-400">ridhwananang@gmail.com</a></div>
                            <div>Lokasi: Tangerang Selatan, Banten, Indonesia</div>
                            <div>Website Resmi: <a href="https://ridhwananang.laravel.cloud/" className="text-violet-600 underline dark:text-violet-400">https://ridhwananang.laravel.cloud/</a></div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
