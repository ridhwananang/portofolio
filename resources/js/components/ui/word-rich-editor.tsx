import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Check,
    Code,
    Columns2,
    Copy,
    Eraser,
    Eye,
    FileEdit,
    FileText,
    Heading,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    ListTodo,
    Maximize2,
    Minimize2,
    Minus,
    Quote,
    Redo,
    Sparkles,
    Strikethrough,
    Table,
    Underline,
    Undo,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { renderWordDocumentNodes } from './word-document-renderer';
import {
    CalloutBuilderDialog,
    ListBuilderDialog,
    SectionBuilderDialog,
    TableBuilderDialog,
} from './word-quick-builders';

export interface WordRichEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    minHeight?: string;
    presetType?:
        | 'objective'
        | 'scope'
        | 'background'
        | 'deliverables'
        | 'notes'
        | 'general';
    className?: string;
}

const PRESET_TEMPLATES = {
    objective: `### 🎯 Sasaran Utama & Key Results (OKR Proyek)

#### 1. Sasaran Strategis Utama (Objective 1)
> **Pernyataan Tujuan:** Mengakselerasi efisiensi operasional dan performa pemrosesan data sistem hingga 60%.

* **Key Result 1.1:** Waktu muat dan eksekusi transaksi berkurang drastis dari 850ms menjadi < 150ms.
* **Key Result 1.2:** Tingkat ketersediaan layanan (*uptime SLA*) mencapai minimum 99.95%.
* **Key Result 1.3:** Mendukung konkurensi hingga 1,500 pengguna aktif bersamaan tanpa kendala memori.

#### 2. Sasaran Pengalaman Pengguna & Keamanan (Objective 2)
* **Key Result 2.1:** Onboarding pengguna baru selesai dalam waktu kurang dari 3 menit.
* **Key Result 2.2:** Lolos seluruh pengujian audit keamanan OWASP Top 10 dengan zero *critical vulnerabilities*.

#### 3. Matriks Indikator Capaian
| Parameter Metrik | Baseline Saat Ini | Target Capaian Akhir | PIC Penanggung Jawab |
| :--- | :--- | :--- | :--- |
| Kapasitas TPS | 45 TPS | 500 TPS | Tech Lead |
| Error Rate HTTP 5xx | 1.8% | < 0.05% | DevOps Engineer |
| User Satisfaction (CSAT) | 3.8 / 5.0 | 4.8 / 5.0 | Product Owner |`,

    scope: `### 📋 Batasan Ruang Lingkup Kerja (Scope of Work)

#### ✅ 1. Modul & Fitur yang Termasuk (In-Scope)
- [x] **Autentikasi & Akun:** Integrasi Single Sign-On (SSO), Two-Factor Authentication (2FA), dan proteksi sesi.
- [x] **Manajemen Pengguna Dinamis:** Role-Based Access Control (RBAC) tanpa batasan role statis.
- [x] **Dasbor & Analitik:** Grafik metrik interaktif, filter multi-kriteria, dan ringkasan eksekutif.
- [x] **Modul Ekspor & Pelaporan:** Pembuatan laporan berkala format PDF dan spreadsheet Excel.
- [x] **Audit Trail & Logging:** Pencatatan otomatis setiap aktivitas perubahan data penting.

#### 🚫 2. Batasan di Luar Kesepakatan (Out-of-Scope)
* Migrasi data arsip fisik sebelum tahun 2020 (dikerjakan pada proyek terpisah fase 2).
* Pengembangan aplikasi native khusus iOS/macOS (fokus saat ini adalah web responsif & PWA).
* Integrasi mesin kasir hardware pihak ketiga yang belum mendukung protokol standar open-API.

#### ⚠️ 3. Asumsi Teknis & Ketergantungan
> Lingkungan server cloud (VPS/Staging) dan kredensial domain utama disiapkan oleh pihak pemangku kepentingan selambatnya pada minggu kedua Sprint 1.`,

    background: `### 🏢 Latar Belakang Proyek & Rasional Bisnis

#### 1. Konteks Permasalahan Saat Ini
Proses kerja operasional saat ini masih bergantung pada lembar kerja spreadsheet terpisah dan komunikasi manual. Kondisi ini sering mengakibatkan inkonsistensi data, hilangnya jejak riwayat proyek, dan keterlambatan laporan hingga 4 hari kerja setiap akhir bulan.

#### 2. Titik Hambatan Utama (Key Pain Points)
1. **Data Terfragmentasi:** Informasi tersebar di berbagai dokumen tanpa satu sumber kebenaran (*single source of truth*).
2. **Keterbatasan Visibilitas:** Manajemen sulit memantau progres riil pengerjaan tim dan beban kerja personel secara real-time.
3. **Risiko Kesalahan Manusia (*Human Error*):** Angka ketidaksesuaian entri data mencapai rata-rata 7.5% pada musim beban puncak.

#### 3. Ekspektasi Nilai Solusi (Value Proposition)
> Platform digital terpusat ini dirancang untuk memotong waktu siklus pengerjaan hingga 65%, menghilangkan redundansi data, serta memberikan visibilitas metrik komprehensif bagi seluruh jajaran pemangku kepentingan.`,

    deliverables: `### 📦 Paket Luaran & Deliverables Resmi Proyek

#### 1. Repositori Kode Sumber & Dokumentasi Teknis
- [x] **Source Code Lengkap:** Seluruh source code backend & frontend berstandar Clean Architecture dengan riwayat commit rapi.
- [x] **Dokumen Arsitektur & ERD:** Diagram relasi basis data (ERD), kamus data, dan diagram alur sistem komprehensif.
- [x] **Dokumentasi API Terstruktur:** Spesifikasi OpenAPI / Postman Collection lengkap dengan contoh payload permintaan dan respons.

#### 2. Konfigurasi Lingkungan & Deployment
- [x] **Docker & Skrip Orkestrasi:** File Dockerfile dan docker-compose.yml untuk replikasi lingkungan produksi.
- [x] **CI/CD Pipeline Workflow:** Otomatisasi pengujian dan deployment otomatis ke staging/production via GitHub Actions.
- [x] **Konfigurasi Server Web:** Setup reverse proxy Nginx, sertifikat SSL HTTPS otomatis, dan proteksi firewall cloud.

#### 3. Panduan Penggunaan & Sesi Alih Pengetahuan (Handover)
| Item Deliverable | Format Dokumen | Media Serah Terima | Status Verifikasi |
| :--- | :--- | :--- | :--- |
| Manual Book Administrator | Dokumen PDF & Markdown | Tautan Google Drive / Repo | Siap Diserahkan |
| Panduan Pengguna Akhir | Video Tutorial & PDF | LMS / Portal Klien | Siap Diserahkan |
| Sesi Knowledge Transfer | Live Demo 2 Jam | Google Meet / Zoom | Dijadwalkan |`,

    notes: `### 📝 Catatan Teknis Tambahan & Konvensi Pengembangan

#### 1. Konvensi Git & Standar Kode
* **Branching Strategy:** Menggunakan GitFlow (main, develop, feature/*, hotfix/*).
* **Format Commit Message:** Mengikuti standar Conventional Commits (feat:, fix:, refactor:, docs:).
* **Linter & Code Formatter:** ESLint + Prettier untuk TypeScript/React, Laravel Pint untuk PHP.

#### 2. Variabel Lingkungan & Keamanan Data (Environment Variables)
> **PENTING:** Jangan pernah melakukan commit file .env atau kredensial database langsung ke repositori Git publik. Gunakan Secret Manager atau file .env.example terenkripsi.

#### 3. Parameter Staging & Akses Server
| Parameter Sistem | Nilai / Konfigurasi | Keterangan Akses |
| :--- | :--- | :--- |
| Target PHP Version | PHP 8.2+ (OPcache Enabled) | Production Server |
| Database Engine | PostgreSQL 16 / MySQL 8.0 | InnoDB / UTF8mb4 |
| Node.js Runtime | Node.js v22 LTS | Build Frontend |
| Redis Cache | Redis v7 (Port 6379) | Session & Queue Worker |

#### 4. Instruksi Khusus Tim
* Seluruh endpoint API yang menangani data sensitif wajib menggunakan HTTPS dan rate limiting 60 req/min.
* Pastikan queue worker (php artisan queue:work) berjalan via Supervisor pada server production.`,

    general: `### 📄 Dokumen Spesifikasi Teknis

#### 1. Ringkasan Eksekutif
Tuliskan ringkasan pokok mengenai inisiatif dokumen ini.

#### 2. Poin-Poin Utama
* **Poin 1:** Deskripsi rincian teknis.
* **Poin 2:** Pertimbangan arsitektur dan kapabilitas.

#### 3. Rencana Implementasi
| Tahapan | Deskripsi Tugas | Target Waktu |
| :--- | :--- | :--- |
| Fase 1 | Perancangan Arsitektur | Minggu 1-2 |
| Fase 2 | Pengembangan & QA | Minggu 3-6 |`,
};

export function WordRichEditor({
    value = '',
    onChange,
    label,
    placeholder = 'Ketik dokumen terstruktur ala Microsoft Word di sini...',
    minHeight = '240px',
    presetType = 'general',
    className = '',
}: WordRichEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>(
        'editor',
    );
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [history, setHistory] = useState<string[]>([value || '']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [zoomLevel, setZoomLevel] = useState<'90%' | '100%' | '115%'>('100%');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    // Quick Access Builders State
    const [activeBuilder, setActiveBuilder] = useState<
        'callout' | 'list' | 'table' | 'section' | null
    >(null);

    const pushHistory = useCallback(
        (newValue: string) => {
            setHistory((prev) => {
                const updated = prev.slice(0, historyIndex + 1);

                return [...updated, newValue];
            });
            setHistoryIndex((prev) => prev + 1);
            onChange(newValue);
        },
        [historyIndex, onChange],
    );

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            onChange(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            onChange(history[newIndex]);
        }
    };

    const charCount = value ? value.length : 0;
    const wordCount =
        value && value.trim() ? value.trim().split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

    /**
     * Inserts a multi-line Markdown block cleanly at the cursor position
     * (or appends cleanly at the end when preview mode is active).
     */
    const insertBlockSnippet = (snippet: string) => {
        const cleanSnippet = snippet.trim();

        if (!cleanSnippet) {
            return;
        }

        const textarea = textareaRef.current;

        if (!textarea) {
            const separator = value.trim() ? '\n\n' : '';
            pushHistory(`${value.trimEnd()}${separator}${cleanSnippet}\n`);

            return;
        }

        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;
        const before = value.substring(0, start);
        const after = value.substring(end);

        const leadingGap =
            before.length === 0
                ? ''
                : before.endsWith('\n\n')
                  ? ''
                  : before.endsWith('\n')
                    ? '\n'
                    : '\n\n';
        const trailingGap =
            after.length === 0
                ? '\n'
                : after.startsWith('\n\n')
                  ? ''
                  : after.startsWith('\n')
                    ? '\n'
                    : '\n\n';

        const inserted = `${leadingGap}${cleanSnippet}${trailingGap}`;
        const updated = `${before}${inserted}${after}`;
        pushHistory(updated);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const targetPos = start + inserted.length;
                textareaRef.current.setSelectionRange(targetPos, targetPos);
            }
        }, 15);
    };

    const applyFormat = (type: string) => {
        if (type === 'template') {
            const replacement =
                PRESET_TEMPLATES[presetType] || PRESET_TEMPLATES.general;

            if (value.trim()) {
                setIsTemplateModalOpen(true);

                return;
            }

            pushHistory(replacement);
            setViewMode(window.innerWidth >= 768 ? 'split' : 'preview');

            return;
        }

        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let replacement = '';

        switch (type) {
            case 'bold':
                replacement = selectedText
                    ? `**${selectedText}**`
                    : '**teks tebal**';
                break;
            case 'italic':
                replacement = selectedText
                    ? `*${selectedText}*`
                    : '*teks miring*';
                break;
            case 'underline':
                replacement = selectedText
                    ? `<u>${selectedText}</u>`
                    : '<u>teks garis bawah</u>';
                break;
            case 'strikethrough':
                replacement = selectedText
                    ? `~~${selectedText}~~`
                    : '~~teks coret~~';
                break;
            case 'highlight':
                replacement = selectedText
                    ? `<mark>${selectedText}</mark>`
                    : '<mark>teks sorotan</mark>';
                break;
            case 'code':
                replacement = selectedText
                    ? `\`${selectedText}\``
                    : '`kode_variabel`';
                break;
            case 'clear':
                replacement = selectedText
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/~~/g, '')
                    .replace(/<u>|<\/u>/g, '')
                    .replace(/<mark>|<\/mark>/g, '')
                    .replace(/`/g, '')
                    .replace(/^#+\s/gm, '')
                    .replace(/^[-*•]\s/gm, '')
                    .replace(/^\d+\.\s/gm, '')
                    .replace(/^-\s\[[ xX]\]\s/gm, '');
                break;
            case 'h1':
                replacement = selectedText
                    ? `\n# ${selectedText}\n`
                    : '\n# Judul Utama Dokumen\n';
                break;
            case 'h2':
                replacement = selectedText
                    ? `\n## ${selectedText}\n`
                    : '\n## Sub Judul Bagian\n';
                break;
            case 'h3':
                replacement = selectedText
                    ? `\n### ${selectedText}\n`
                    : '\n### Poin Rincian Spesifikasi\n';
                break;
            case 'bullet': {
                const lines = (selectedText || 'Poin rincian item').split('\n');
                replacement = lines
                    .map((l) => (l.startsWith('* ') ? l : `* ${l}`))
                    .join('\n');
                break;
            }
            case 'numbered': {
                const lines = (selectedText || 'Langkah pelaksanaan').split(
                    '\n',
                );
                replacement = lines
                    .map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '')}`)
                    .join('\n');
                break;
            }
            case 'checklist': {
                const lines = (
                    selectedText || 'Tugas atau kriteria pengujian'
                ).split('\n');
                replacement = lines
                    .map((l) =>
                        l.startsWith('- [ ] ') || l.startsWith('- [x] ')
                            ? l
                            : `- [ ] ${l}`,
                    )
                    .join('\n');
                break;
            }
            case 'quote': {
                const lines = (
                    selectedText ||
                    'Pernyataan sasaran penting atau kutipan arahan'
                ).split('\n');
                replacement = lines.map((l) => `> ${l}`).join('\n');
                break;
            }
            case 'divider':
                replacement = `\n\n---\n\n`;
                break;
            case 'codeblock':
                replacement = `\n\`\`\`typescript\n${selectedText || '// Tuliskan kode atau skrip konfigurasi di sini\nconst status = "success";'}\n\`\`\`\n`;
                break;
            case 'alignLeft':
                replacement = selectedText
                    ? `<div align="left">\n${selectedText}\n</div>`
                    : `<div align="left">\nTeks rata kiri\n</div>`;
                break;
            case 'alignCenter':
                replacement = selectedText
                    ? `<div align="center">\n${selectedText}\n</div>`
                    : `<div align="center">\nTeks rata tengah\n</div>`;
                break;
            case 'alignRight':
                replacement = selectedText
                    ? `<div align="right">\n${selectedText}\n</div>`
                    : `<div align="right">\nTeks rata kanan\n</div>`;
                break;
            default:
                break;
        }

        const updated =
            value.substring(0, start) + replacement + value.substring(end);
        pushHistory(updated);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const targetPos = start + replacement.length;
                textareaRef.current.setSelectionRange(targetPos, targetPos);
            }
        }, 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            if (e.key.toLowerCase() === 'b') {
                e.preventDefault();
                applyFormat('bold');
            } else if (e.key.toLowerCase() === 'i') {
                e.preventDefault();
                applyFormat('italic');
            } else if (e.key.toLowerCase() === 'u') {
                e.preventDefault();
                applyFormat('underline');
            } else if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key.toLowerCase() === 'x') {
                e.preventDefault();
                applyFormat('strikethrough');
            } else if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                handleRedo();
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = textareaRef.current;

            if (!textarea) {
                return;
            }

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const updated =
                value.substring(0, start) + '  ' + value.substring(end);
            pushHistory(updated);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(start + 2, start + 2);
                }
            }, 10);
        }
    };

    const handleToggleChecklist = (lineIndex: number) => {
        const lines = value.split('\n');
        let currentCheckIndex = 0;
        const newLines = lines.map((line) => {
            if (/^(\s*[-*]\s*)\[([ xX])\](.*)/.test(line)) {
                if (currentCheckIndex === lineIndex) {
                    const isChecked =
                        line.includes('[x]') || line.includes('[X]');
                    const toggled = isChecked
                        ? line.replace(/\[[xX]\]/, '[ ]')
                        : line.replace(/\[\s\]/, '[x]');
                    currentCheckIndex++;

                    return toggled;
                }

                currentCheckIndex++;
            }

            return line;
        });
        pushHistory(newLines.join('\n'));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderWordPreview = () => {
        if (!value || !value.trim()) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="mb-3 size-12 stroke-[1.5] opacity-30" />
                    <p className="text-sm font-semibold">Dokumen Word Kosong</p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                        Mulai mengetik, gunakan bilah{' '}
                        <strong>&ldquo;Sisipkan Cepat&rdquo;</strong>, atau klik{' '}
                        <strong>&ldquo;Template Word&rdquo;</strong> di toolbar atas.
                    </p>
                </div>
            );
        }

        return renderWordDocumentNodes(value, handleToggleChecklist);
    };

    const renderQuickAccessBar = () => (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 bg-violet-50/40 px-2.5 py-1.5 dark:border-slate-800/80 dark:bg-violet-950/15">
            <span className="mr-1 inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wider text-violet-700 uppercase dark:text-violet-300">
                <Sparkles className="size-3" />
                Sisipkan Cepat:
            </span>

            <button
                type="button"
                onClick={() => setActiveBuilder('callout')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 shadow-2xs transition-colors hover:bg-violet-50 dark:border-violet-500/30 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/50"
                title="Buat blok sorotan seperti Pernyataan Tujuan / Catatan Penting"
            >
                <Quote className="size-3" />
                <span>+ Blok Pernyataan</span>
            </button>

            <button
                type="button"
                onClick={() => setActiveBuilder('list')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:border-violet-500/30 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-violet-300"
                title="Buat daftar Bullet, Nomor, atau Checklist melalui form input"
            >
                <ListTodo className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>+ Daftar / Checklist</span>
            </button>

            <button
                type="button"
                onClick={() => setActiveBuilder('table')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:border-violet-500/30 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-violet-300"
                title="Buat tabel kustom dengan grid input dinamis"
            >
                <Table className="size-3 text-sky-600 dark:text-sky-400" />
                <span>+ Buat Tabel</span>
            </button>

            <button
                type="button"
                onClick={() => setActiveBuilder('section')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:border-violet-500/30 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-violet-300"
                title="Tambahkan sub-bab heading berikon dan paragraf"
            >
                <Heading className="size-3 text-amber-600 dark:text-amber-400" />
                <span>+ Sub-Bab / Judul</span>
            </button>
        </div>
    );

    const renderEditorContent = () => (
        <div className="relative flex min-h-0 flex-1 flex-col">
            {viewMode === 'split' ? (
                <div className="grid min-h-[300px] flex-1 grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-slate-800">
                    <div className="flex flex-col bg-slate-50/50 p-4 dark:bg-slate-950/40">
                        <div className="mb-2 flex items-center justify-between border-b border-slate-200/80 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:border-slate-800">
                            <span>Markdown Editor Source</span>
                            <span>{wordCount} kata</span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => pushHistory(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            style={{ minHeight }}
                            className="w-full flex-1 resize-y bg-transparent font-mono text-xs leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex max-h-[600px] flex-col overflow-y-auto bg-white p-6 dark:bg-slate-900/90">
                        <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2 text-[11px] font-bold tracking-wider text-violet-600 uppercase dark:border-slate-800 dark:text-violet-400">
                            <span>Pratinjau Lembar Word</span>
                            <span>Interaktif</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none space-y-1">
                            {renderWordPreview()}
                        </div>
                    </div>
                </div>
            ) : viewMode === 'preview' ? (
                <div className="flex min-h-[300px] justify-center overflow-y-auto bg-white/95 p-6 sm:p-8 dark:bg-slate-900/95">
                    <div
                        className="w-full max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/40"
                        style={{
                            zoom:
                                zoomLevel === '115%'
                                    ? 1.15
                                    : zoomLevel === '90%'
                                      ? 0.9
                                      : 1,
                        }}
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:border-slate-800">
                            <span>Dokumen Cetak Biru PMS</span>
                            <span>Halaman 1 • {readingTimeMinutes} min baca</span>
                        </div>

                        <div className="space-y-1">{renderWordPreview()}</div>

                        <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 dark:border-slate-800/80">
                            <span>Studio Architecture Framework</span>
                            <span>Terverifikasi Digital</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col bg-white p-4 dark:bg-slate-900">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => pushHistory(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        style={{ minHeight }}
                        className="w-full flex-1 resize-y bg-transparent text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                        <FileText className="size-3.5 text-violet-500" />
                        {label}
                    </label>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <span>{charCount} karakter</span>
                        <span>•</span>
                        <span>{wordCount} kata</span>
                        <span>•</span>
                        <span>~{readingTimeMinutes} min baca</span>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-slate-700/80 dark:bg-slate-900">
                {/* 1. Primary Word Formatting Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 bg-slate-50/90 px-2.5 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex flex-wrap items-center gap-1">
                        {/* Font Formatting */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={() => applyFormat('bold')}
                                title="Tebal (Ctrl+B)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Bold className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('italic')}
                                title="Miring (Ctrl+I)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Italic className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('underline')}
                                title="Garis Bawah (Ctrl+U)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Underline className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('strikethrough')}
                                title="Coret (Ctrl+Shift+X)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Strikethrough className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('highlight')}
                                title="Sorot Warna / Stabilo"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
                            >
                                <Highlighter className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('clear')}
                                title="Hapus Format Seleksi"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                            >
                                <Eraser className="size-3.5" />
                            </button>
                        </div>

                        {/* Headings */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={() => applyFormat('h1')}
                                title="Judul Utama (H1)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                H1
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('h2')}
                                title="Sub Judul (H2)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('h3')}
                                title="Rincian (H3)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                H3
                            </button>
                        </div>

                        {/* Quick Selection Lists */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={() => applyFormat('bullet')}
                                title="Ubah Seleksi Jadi Bullet List"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <List className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('numbered')}
                                title="Ubah Seleksi Jadi Daftar Nomor"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ListOrdered className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('checklist')}
                                title="Ubah Seleksi Jadi Checklist"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
                            >
                                <ListTodo className="size-3.5" />
                            </button>
                        </div>

                        {/* Blocks: Dynamic Table, Quote, Divider, Code */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={() => setActiveBuilder('table')}
                                title="Pembuat Tabel Dinamis"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Table className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveBuilder('callout')}
                                title="Sisipkan Blok Pernyataan (Callout)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Quote className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('divider')}
                                title="Garis Pembatas Dokumen"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Minus className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('codeblock')}
                                title="Blok Kode Teknis"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Code className="size-3.5" />
                            </button>
                        </div>

                        {/* Alignment */}
                        <div className="hidden items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs sm:flex dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={() => applyFormat('alignLeft')}
                                title="Rata Kiri"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <AlignLeft className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('alignCenter')}
                                title="Rata Tengah"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <AlignCenter className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('alignRight')}
                                title="Rata Kanan"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <AlignRight className="size-3.5" />
                            </button>
                        </div>

                        {/* Undo / Redo */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                title="Urungkan (Ctrl+Z)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Undo className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                title="Ulangi (Ctrl+Y)"
                                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Redo className="size-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Ribbon Controls */}
                    <div className="ml-auto flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('template')}
                            className="h-7 gap-1.5 rounded-lg border-violet-500/30 px-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40"
                            title="Terapkan format template Word profesional penuh"
                        >
                            <Sparkles className="size-3 text-violet-500" />
                            <span className="hidden sm:inline">
                                Template Word
                            </span>
                        </Button>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
                            <button
                                type="button"
                                onClick={() => setViewMode('editor')}
                                title="Mode Ketik / Edit Teks Langsung"
                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                    viewMode === 'editor'
                                        ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <FileEdit className="size-3.5" />
                                <span>Mode Ketik</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                title="Lihat Tampilan Dokumen Word Hasil Jadi"
                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                    viewMode === 'preview'
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <Eye className="size-3.5" />
                                <span>Hasil Dokumen Word</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('split')}
                                title="Tampilan Berdampingan (Editor di kiri, Lembar Word di kanan)"
                                className={`hidden cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all lg:flex ${
                                    viewMode === 'split'
                                        ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <Columns2 className="size-3.5" />
                                <span>Split</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            title="Buka Mode Layar Penuh (Word View)"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Maximize2 className="size-3.5" />
                        </button>
                    </div>
                </div>

                {/* 2. Quick Access Component Builders Strip */}
                {renderQuickAccessBar()}

                {/* 3. Editor Canvas Body */}
                {renderEditorContent()}

                {/* 4. Word Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Lembar Word PMS
                        </span>
                        <span>•</span>
                        <span>{wordCount} Kata</span>
                        <span>•</span>
                        <span>{charCount} Karakter</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden font-medium text-violet-600 sm:inline dark:text-violet-400">
                            Gunakan &ldquo;Sisipkan Cepat&rdquo; di atas untuk menyusun blok pernyataan, poin &amp; tabel instan
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex cursor-pointer items-center gap-1 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                            title="Salin isi dokumen"
                        >
                            {copied ? (
                                <Check className="size-3 text-emerald-500" />
                            ) : (
                                <Copy className="size-3" />
                            )}
                            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                        </button>
                        <span>•</span>
                        <span className="font-mono text-[10px]">
                            UTF-8 • Markdown / Rich Format
                        </span>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN MODAL (WORD FOCUS MODE) */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 p-2 backdrop-blur-2xl animate-in duration-200 fade-in-0 sm:p-6">
                    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-2xl dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/30">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 sm:text-base dark:text-white">
                                        {label || 'Editor Dokumen Word'}
                                        <Badge className="border-violet-500/30 bg-violet-500/15 text-[10px] text-violet-700 dark:text-violet-300">
                                            Word Focus Mode
                                        </Badge>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Lingkungan penulisan dokumen profesional tanpa distraksi.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsFullscreen(false)}
                                    className="h-9 gap-1.5 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-700"
                                >
                                    <Minimize2 className="size-3.5" />
                                    Tutup &amp; Terapkan
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 bg-slate-100/70 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/60">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('bold')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Bold className="mr-1 size-3.5" /> Tebal
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('italic')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Italic className="mr-1 size-3.5" /> Miring
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('underline')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Underline className="mr-1 size-3.5" /> Garis Bawah
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('highlight')}
                                    className="h-8 rounded-lg px-2.5 text-xs text-amber-600 dark:text-amber-400"
                                >
                                    <Highlighter className="mr-1 size-3.5" /> Sorot
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveBuilder('table')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Table className="mr-1 size-3.5" /> + Tabel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveBuilder('list')}
                                    className="h-8 rounded-lg px-2.5 text-xs text-violet-600 dark:text-violet-400"
                                >
                                    <ListTodo className="mr-1 size-3.5" /> + Daftar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveBuilder('callout')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Quote className="mr-1 size-3.5" /> + Blok Pernyataan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveBuilder('section')}
                                    className="h-8 rounded-lg px-2.5 text-xs"
                                >
                                    <Heading className="mr-1 size-3.5" /> + Sub-Bab
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('template')}
                                    className="h-8 rounded-lg border-violet-500/30 bg-violet-600/10 px-3 text-xs font-bold text-violet-700 dark:text-violet-300"
                                >
                                    <Sparkles className="mr-1 size-3.5 text-violet-500" />{' '}
                                    Template Cepat
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('editor')}
                                        className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold ${
                                            viewMode === 'editor'
                                                ? 'bg-violet-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('split')}
                                        className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold ${
                                            viewMode === 'split'
                                                ? 'bg-violet-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Split
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('preview')}
                                        className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold ${
                                            viewMode === 'preview'
                                                ? 'bg-violet-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Dokumen Word
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col overflow-y-auto">
                            {renderEditorContent()}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-4">
                                <span>Halaman 1</span>
                                <span>•</span>
                                <span>{wordCount} Kata</span>
                                <span>•</span>
                                <span>{charCount} Karakter</span>
                                <span>•</span>
                                <span>
                                    Estimasi baca: ~{readingTimeMinutes} menit
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">
                                    Zoom:
                                </span>
                                <div className="flex items-center gap-1">
                                    {(['90%', '100%', '115%'] as const).map(
                                        (z) => (
                                            <button
                                                key={z}
                                                type="button"
                                                onClick={() => setZoomLevel(z)}
                                                className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-semibold ${
                                                    zoomLevel === z
                                                        ? 'bg-violet-600 text-white'
                                                        : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {z}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Access Builder Dialogs */}
            <CalloutBuilderDialog
                open={activeBuilder === 'callout'}
                onOpenChange={(o) => setActiveBuilder(o ? 'callout' : null)}
                onInsert={insertBlockSnippet}
            />
            <ListBuilderDialog
                open={activeBuilder === 'list'}
                onOpenChange={(o) => setActiveBuilder(o ? 'list' : null)}
                onInsert={insertBlockSnippet}
            />
            <TableBuilderDialog
                open={activeBuilder === 'table'}
                onOpenChange={(o) => setActiveBuilder(o ? 'table' : null)}
                onInsert={insertBlockSnippet}
            />
            <SectionBuilderDialog
                open={activeBuilder === 'section'}
                onOpenChange={(o) => setActiveBuilder(o ? 'section' : null)}
                onInsert={insertBlockSnippet}
            />

            {/* Modal Dialog Konfirmasi Template Word */}
            <Dialog
                open={isTemplateModalOpen}
                onOpenChange={setIsTemplateModalOpen}
            >
                <DialogContent className="max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-violet-500/30 dark:bg-slate-900/95">
                    <DialogHeader>
                        <div className="mb-2 flex size-11 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 text-violet-600 dark:text-violet-400">
                            <Sparkles className="size-5" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Terapkan Template Word Standar?
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            Isi dokumen saat ini akan diperbarui dengan struktur
                            template Word terstandarisasi. Perubahan ini tetap
                            dapat Anda batalkan (*Undo*) kapan saja melalui
                            tombol Undo di bilah alat.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-5 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsTemplateModalOpen(false)}
                            className="h-10 rounded-xl px-4 text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                const templateStr =
                                    PRESET_TEMPLATES[presetType] ||
                                    PRESET_TEMPLATES.general;
                                pushHistory(templateStr);
                                setViewMode(
                                    window.innerWidth >= 768
                                        ? 'split'
                                        : 'preview',
                                );
                                setIsTemplateModalOpen(false);
                            }}
                            className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                        >
                            <Sparkles className="size-3.5" />
                            Gunakan Template Word
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * Standalone Read-Only Word Document Viewer
 * Renders structured markdown content as a pristine, executive Microsoft Word document sheet.
 */
export function WordDocumentViewer({
    content = '',
    label,
    className = '',
}: {
    content: string;
    label?: string;
    className?: string;
}) {
    if (!content || !content.trim()) {
        return (
            <div
                className={`rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 italic dark:border-slate-800 ${className}`}
            >
                Belum ada data dokumen terisi.
            </div>
        );
    }

    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    return (
        <div
            className={`w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 break-words shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900 ${className}`}
        >
            {label && (
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold tracking-wider text-violet-700 uppercase dark:border-slate-800 dark:text-violet-300">
                    <span className="flex items-center gap-2">
                        <FileText className="size-4" />
                        {label}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                        {wordCount} kata • ~{readingTime} min baca
                    </span>
                </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-1">
                {renderWordDocumentNodes(content)}
            </div>
        </div>
    );
}
