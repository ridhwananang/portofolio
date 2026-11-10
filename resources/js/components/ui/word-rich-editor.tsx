import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Highlighter,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListTodo,
    Table,
    Quote,
    Code,
    Minus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    Maximize2,
    Minimize2,
    Sparkles,
    FileText,
    FileEdit,
    Eye,
    Columns2,
    Eraser,
    Check,
    Copy,
    CheckSquare,
    Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface WordRichEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    minHeight?: string;
    presetType?: 'objective' | 'scope' | 'background' | 'deliverables' | 'notes' | 'general';
    className?: string;
}

// Preset Templates
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
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [history, setHistory] = useState<string[]>([value || '']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [zoomLevel, setZoomLevel] = useState<'90%' | '100%' | '115%'>('100%');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    // Update history when external value changes drastically or upon initialization
    const pushHistory = useCallback(
        (newValue: string) => {
            setHistory((prev) => {
                const updated = prev.slice(0, historyIndex + 1);
                return [...updated, newValue];
            });
            setHistoryIndex((prev) => prev + 1);
            onChange(newValue);
        },
        [historyIndex, onChange]
    );

    // Undo / Redo handlers
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

    // Calculate word and character count
    const charCount = value ? value.length : 0;
    const wordCount = value && value.trim() ? value.trim().split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

    // Text formatting core helper
    const applyFormat = (type: string, payload?: any) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let replacement = '';
        let newCursorPos = start;

        switch (type) {
            case 'bold':
                replacement = selectedText ? `**${selectedText}**` : '**teks tebal**';
                break;
            case 'italic':
                replacement = selectedText ? `*${selectedText}*` : '*teks miring*';
                break;
            case 'underline':
                replacement = selectedText ? `<u>${selectedText}</u>` : '<u>teks garis bawah</u>';
                break;
            case 'strikethrough':
                replacement = selectedText ? `~~${selectedText}~~` : '~~teks coret~~';
                break;
            case 'highlight':
                replacement = selectedText
                    ? `<mark>${selectedText}</mark>`
                    : '<mark>teks sorotan</mark>';
                break;
            case 'code':
                replacement = selectedText ? `\`${selectedText}\`` : '`kode_variabel`';
                break;
            case 'clear':
                // Strip markdown formatting symbols
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
                replacement = selectedText ? `\n# ${selectedText}\n` : '\n# Judul Utama Dokumen\n';
                break;
            case 'h2':
                replacement = selectedText ? `\n## ${selectedText}\n` : '\n## Sub Judul Bagian\n';
                break;
            case 'h3':
                replacement = selectedText ? `\n### ${selectedText}\n` : '\n### Poin Rincian Spesifikasi\n';
                break;

            case 'bullet': {
                const lines = (selectedText || 'Poin rincian item').split('\n');
                replacement = lines.map((l) => (l.startsWith('* ') ? l : `* ${l}`)).join('\n');
                break;
            }
            case 'numbered': {
                const lines = (selectedText || 'Langkah pelaksanaan').split('\n');
                replacement = lines.map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '')}`).join('\n');
                break;
            }
            case 'checklist': {
                const lines = (selectedText || 'Tugas atau kriteria pengujian').split('\n');
                replacement = lines.map((l) => (l.startsWith('- [ ] ') || l.startsWith('- [x] ') ? l : `- [ ] ${l}`)).join('\n');
                break;
            }
            case 'quote': {
                const lines = (selectedText || 'Pernyataan sasaran penting atau kutipan arahan').split('\n');
                replacement = lines.map((l) => `> ${l}`).join('\n');
                break;
            }
            case 'table':
                replacement = `\n\n| Kategori / Aspek | Spesifikasi & Rincian | Status Capaian |\n| :--- | :--- | :--- |\n| Komponen Utama | Arsitektur microservices terdistribusi | Selesai |\n| Basis Data | PostgreSQL dengan replikasi multi-node | Direncanakan |\n| Kepatuhan Keamanan | Enkripsi AES-256 pada database | Sedang Berjalan |\n\n`;
                break;
            case 'divider':
                replacement = `\n\n---\n\n`;
                break;
            case 'codeblock':
                replacement = `\n\`\`\`typescript\n${selectedText || '// Tuliskan kode atau skrip konfigurasi di sini\nconst status = "success";'}\n\`\`\`\n`;
                break;
            case 'alignLeft':
                replacement = selectedText ? `<div align="left">\n${selectedText}\n</div>` : `<div align="left">\nTeks rata kiri\n</div>`;
                break;
            case 'alignCenter':
                replacement = selectedText ? `<div align="center">\n${selectedText}\n</div>` : `<div align="center">\nTeks rata tengah\n</div>`;
                break;
            case 'alignRight':
                replacement = selectedText ? `<div align="right">\n${selectedText}\n</div>` : `<div align="right">\nTeks rata kanan\n</div>`;
                break;

            case 'template':
                replacement = PRESET_TEMPLATES[presetType] || PRESET_TEMPLATES.general;
                if (value.trim()) {
                    setIsTemplateModalOpen(true);
                    return;
                }
                pushHistory(replacement);
                setViewMode(window.innerWidth >= 768 ? 'split' : 'preview');
                return;

            default:
                break;
        }

        const updated = value.substring(0, start) + replacement + value.substring(end);
        pushHistory(updated);

        // Maintain focus and set selection
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const targetPos = start + replacement.length;
                textareaRef.current.setSelectionRange(targetPos, targetPos);
            }
        }, 10);
    };

    // Keyboard shortcuts
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
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const updated = value.substring(0, start) + '  ' + value.substring(end);
            pushHistory(updated);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(start + 2, start + 2);
                }
            }, 10);
        }
    };

    // Interactive checklist toggle inside preview mode
    const handleToggleChecklist = (lineIndex: number) => {
        const lines = value.split('\n');
        let currentCheckIndex = 0;
        const newLines = lines.map((line) => {
            if (/^(\s*[-*]\s*)\[([ xX])\](.*)/.test(line)) {
                if (currentCheckIndex === lineIndex) {
                    const isChecked = line.includes('[x]') || line.includes('[X]');
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

    // Render formatted preview
    const renderWordPreview = () => {
        if (!value || !value.trim()) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="size-12 mb-3 opacity-30 stroke-[1.5]" />
                    <p className="text-sm font-semibold">Dokumen Word Kosong</p>
                    <p className="text-xs mt-1 max-w-sm text-slate-400">
                        Mulai mengetik atau gunakan tombol <strong>"Template Word Cepat"</strong> di bilah ribbon untuk menyusun dokumen terstruktur.
                    </p>
                </div>
            );
        }

        const lines = value.split('\n');
        const elements: React.ReactNode[] = [];
        let inCodeBlock = false;
        let codeContent: string[] = [];
        let inTable = false;
        let tableRows: string[][] = [];
        let checklistCounter = 0;

        const flushTable = (key: string) => {
            if (tableRows.length > 0) {
                const headerRow = tableRows[0];
                const dataRows = tableRows.slice(1).filter((r) => !r.every((cell) => /^:?-+:?$/.test(cell.trim())));

                elements.push(
                    <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-violet-50/90 dark:bg-violet-950/40 border-b border-violet-100 dark:border-violet-900/60 font-bold text-violet-950 dark:text-violet-200 tracking-wider">
                                    {headerRow.map((cell, cIdx) => (
                                        <th key={cIdx} className="p-3 font-bold border-r last:border-r-0 border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
                                            {formatInline(cell.trim())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                                {dataRows.map((row, rIdx) => {
                                    const isEven = rIdx % 2 === 0;
                                    return (
                                        <tr
                                            key={rIdx}
                                            className={`transition-colors ${
                                                isEven
                                                    ? 'bg-white dark:bg-slate-900 hover:bg-violet-50/30 dark:hover:bg-slate-800/60'
                                                    : 'bg-slate-50/80 dark:bg-slate-800/35 hover:bg-violet-50/50 dark:hover:bg-slate-800/70'
                                            }`}
                                        >
                                            {row.map((cell, cIdx) => {
                                                const trimmed = cell.trim();
                                                const isStatusBadge = /^(Siap Diserahkan|Selesai|Done|Completed|Passed|Direncanakan|Planned|Sedang Berjalan|In Progress|In-Progress|Dijadwalkan|Scheduled)$/i.test(trimmed);
                                                return (
                                                    <td key={cIdx} className="p-3 border-r last:border-r-0 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                                                        {isStatusBadge ? (
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                                    /^(Siap Diserahkan|Selesai|Done|Completed|Passed)$/i.test(trimmed)
                                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                                                        : /^(Sedang Berjalan|In Progress|In-Progress)$/i.test(trimmed)
                                                                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25'
                                                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                                                                }`}
                                                            >
                                                                {trimmed}
                                                            </span>
                                                        ) : (
                                                            formatInline(trimmed)
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
                tableRows = [];
                inTable = false;
            }
        };

        const flushCodeBlock = (key: string) => {
            if (codeContent.length > 0) {
                elements.push(
                    <div key={`code-${key}`} className="my-3.5 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                        <pre>{codeContent.join('\n')}</pre>
                    </div>
                );
                codeContent = [];
                inCodeBlock = false;
            }
        };

        lines.forEach((line, idx) => {
            // Check code block
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    flushCodeBlock(`cb-${idx}`);
                } else {
                    if (inTable) flushTable(`tbl-${idx}`);
                    inCodeBlock = true;
                }
                return;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                return;
            }

            // Check table row (| a | b |)
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                const cells = line
                    .trim()
                    .slice(1, -1)
                    .split('|')
                    .map((c) => c.trim());
                if (!inTable) inTable = true;
                tableRows.push(cells);
                return;
            } else if (inTable) {
                flushTable(`tbl-${idx}`);
            }

            // Headings
            if (line.startsWith('# ')) {
                elements.push(
                    <h1 key={idx} className="mt-5 mb-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white border-b border-violet-500/25 pb-2 flex items-center gap-2">
                        {formatInline(line.replace('# ', ''))}
                    </h1>
                );
                return;
            }
            if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={idx} className="mt-4 mb-2 text-base sm:text-lg font-extrabold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                        {formatInline(line.replace('## ', ''))}
                    </h2>
                );
                return;
            }
            if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={idx} className="mt-3 mb-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {formatInline(line.replace('### ', ''))}
                    </h3>
                );
                return;
            }
            if (line.startsWith('#### ')) {
                elements.push(
                    <h4 key={idx} className="mt-2.5 mb-1 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {formatInline(line.replace('#### ', ''))}
                    </h4>
                );
                return;
            }

            // Blockquote
            if (line.startsWith('> ')) {
                elements.push(
                    <blockquote key={idx} className="my-2.5 border-l-4 border-violet-500 bg-violet-50/70 dark:bg-violet-950/30 p-3.5 rounded-r-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic shadow-sm">
                        {formatInline(line.replace('> ', ''))}
                    </blockquote>
                );
                return;
            }

            // Horizontal Rule
            if (line.trim() === '---' || line.trim() === '***') {
                elements.push(
                    <hr key={idx} className="my-4 border-t border-slate-200 dark:border-slate-800" />
                );
                return;
            }

            // Checklist (- [ ] or - [x])
            const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\]\s*(.*)/);
            if (checkMatch) {
                const isChecked = checkMatch[2].toLowerCase() === 'x';
                const itemText = checkMatch[3];
                const currentIdx = checklistCounter;
                checklistCounter++;

                elements.push(
                    <div
                        key={idx}
                        onClick={() => handleToggleChecklist(currentIdx)}
                        className={`flex items-start gap-2.5 my-1.5 p-2 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm ${
                            isChecked
                                ? 'bg-violet-500/10 border-violet-500/30 text-slate-500 dark:text-slate-400 line-through'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-500/50 text-slate-800 dark:text-slate-200'
                        }`}
                        title="Klik untuk mengubah status centang"
                    >
                        <div className={`mt-0.5 size-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isChecked
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'border-slate-400 dark:border-slate-600 bg-transparent'
                        }`}>
                            {isChecked ? <Check className="size-3 stroke-[3]" /> : null}
                        </div>
                        <span className="flex-1">{formatInline(itemText)}</span>
                    </div>
                );
                return;
            }

            // Bullet list
            if (line.match(/^(\s*)[-*•]\s+(.*)/)) {
                const match = line.match(/^(\s*)[-*•]\s+(.*)/);
                elements.push(
                    <div key={idx} className="flex items-start gap-2.5 my-1 ml-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        <span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                        <span className="flex-1">{formatInline(match ? match[2] : line)}</span>
                    </div>
                );
                return;
            }

            // Numbered list
            if (line.match(/^(\s*)(\d+)\.\s+(.*)/)) {
                const match = line.match(/^(\s*)(\d+)\.\s+(.*)/);
                elements.push(
                    <div key={idx} className="flex items-start gap-2.5 my-1 ml-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        <span className="inline-flex items-center justify-center size-4.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 shrink-0">
                            {match ? match[2] : '•'}
                        </span>
                        <span className="flex-1">{formatInline(match ? match[3] : line)}</span>
                    </div>
                );
                return;
            }

            // Regular paragraph or empty line
            if (!line.trim()) {
                elements.push(<div key={idx} className="h-2.5" />);
            } else {
                elements.push(
                    <p key={idx} className="my-1.5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                        {formatInline(line)}
                    </p>
                );
            }
        });

        if (inTable) flushTable('end-table');
        if (inCodeBlock) flushCodeBlock('end-code');

        return elements;
    };

    // Inline formatting: bold, italic, underline, mark, code, links
    const formatInline = (text: string): React.ReactNode => {
        if (!text) return null;

        // Parse HTML tags like <mark>, <u>, <div align="...">
        const parts = text.split(/(<mark>.*?<\/mark>|<u>.*?<\/u>|`.*?`|\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g);

        return parts.map((part, index) => {
            if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
                return (
                    <mark key={index} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-medium">
                        {part.replace(/<\/?mark>/g, '')}
                    </mark>
                );
            }
            if (part.startsWith('<u>') && part.endsWith('</u>')) {
                return (
                    <span key={index} className="underline underline-offset-4 decoration-violet-500">
                        {part.replace(/<\/?u>/g, '')}
                    </span>
                );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700/60">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-slate-800 dark:text-slate-300">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
                return <del key={index} className="line-through text-slate-400">{part.slice(2, -2)}</del>;
            }
            return part;
        });
    };

    // Editor Core Canvas Component
    const renderEditorContent = () => (
        <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Split View */}
            {viewMode === 'split' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 flex-1 min-h-[300px]">
                    {/* Left: Raw Document Code */}
                    <div className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                            className="w-full flex-1 resize-y bg-transparent font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* Right: Real-time Word Page Preview */}
                    <div className="flex flex-col p-6 overflow-y-auto bg-white dark:bg-slate-900/90 max-h-[600px]">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                            <span>Pratinjau Lembar Word</span>
                            <span>Interaktif</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none space-y-1">
                            {renderWordPreview()}
                        </div>
                    </div>
                </div>
            ) : viewMode === 'preview' ? (
                /* Full Live Word Document A4 Canvas */
                <div className="p-6 sm:p-8 overflow-y-auto bg-white/95 dark:bg-slate-900/95 min-h-[300px] flex justify-center">
                    <div
                        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-lg shadow-slate-900/5 dark:shadow-black/40"
                        style={{
                            zoom: zoomLevel === '115%' ? 1.15 : zoomLevel === '90%' ? 0.9 : 1,
                        }}
                    >
                        {/* Word Page Header Ornament */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3 mb-6 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                            <span>Dokumen Cetak Biru PMS</span>
                            <span>Halaman 1 • {readingTimeMinutes} min baca</span>
                        </div>

                        {/* Document Content */}
                        <div className="space-y-1">{renderWordPreview()}</div>

                        {/* Word Page Footer Ornament */}
                        <div className="mt-12 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Studio Architecture Framework</span>
                            <span>Terverifikasi Digital</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Writing Mode (Clean & Fast) */
                <div className="p-4 bg-white dark:bg-slate-900 flex-1 flex flex-col">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => pushHistory(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        style={{ minHeight }}
                        className="w-full flex-1 resize-y bg-transparent text-sm leading-relaxed text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Header Title with Live Statistics */}
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
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

            {/* Word Editor Shell Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-md transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
                {/* 1. Microsoft Word Ribbon Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 px-2.5 py-2 backdrop-blur-md">
                    {/* Left Toolbar Tools */}
                    <div className="flex flex-wrap items-center gap-1">
                        {/* Font Formatting */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => applyFormat('bold')}
                                title="Tebal (Ctrl+B)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Bold className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('italic')}
                                title="Miring (Ctrl+I)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Italic className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('underline')}
                                title="Garis Bawah (Ctrl+U)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Underline className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('strikethrough')}
                                title="Coret (Ctrl+Shift+X)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Strikethrough className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('highlight')}
                                title="Sorot Warna / Stabilo"
                                className="size-7 rounded-md flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer"
                            >
                                <Highlighter className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('clear')}
                                title="Hapus Format Seleksi"
                                className="size-7 rounded-md flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                                <Eraser className="size-3.5" />
                            </button>
                        </div>

                        {/* Headings */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => applyFormat('h1')}
                                title="Judul Utama (H1)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold text-xs"
                            >
                                H1
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('h2')}
                                title="Sub Judul (H2)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold text-xs"
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('h3')}
                                title="Rincian (H3)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold text-xs"
                            >
                                H3
                            </button>
                        </div>

                        {/* Lists & Checklists */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => applyFormat('bullet')}
                                title="Daftar Poin (Bullet List)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <List className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('numbered')}
                                title="Daftar Nomor (Numbered List)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <ListOrdered className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('checklist')}
                                title="Daftar Centang / Checklist Tugas"
                                className="size-7 rounded-md flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 cursor-pointer"
                            >
                                <ListTodo className="size-3.5" />
                            </button>
                        </div>

                        {/* Insert Blocks: Table, Quote, Divider, Code */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => applyFormat('table')}
                                title="Sisipkan Tabel Word"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Table className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('quote')}
                                title="Kutipan / Blok Arahan"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Quote className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('divider')}
                                title="Garis Pembatas Dokumen"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Minus className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('codeblock')}
                                title="Blok Kode Teknis"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <Code className="size-3.5" />
                            </button>
                        </div>

                        {/* Alignment */}
                        <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => applyFormat('alignLeft')}
                                title="Rata Kiri"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <AlignLeft className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('alignCenter')}
                                title="Rata Tengah"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <AlignCenter className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('alignRight')}
                                title="Rata Kanan"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <AlignRight className="size-3.5" />
                            </button>
                        </div>

                        {/* History: Undo / Redo */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                title="Urungkan (Ctrl+Z)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            >
                                <Undo className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                title="Ulangi (Ctrl+Y)"
                                className="size-7 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            >
                                <Redo className="size-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Toolbar Tools: Templates, View Mode, Fullscreen */}
                    <div className="flex items-center gap-1.5 ml-auto">
                        {/* Word Template Preset */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('template')}
                            className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-violet-500/30 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                            title="Terapkan format template Word profesional"
                        >
                            <Sparkles className="size-3 text-violet-500" />
                            <span className="hidden sm:inline">Template Word</span>
                        </Button>

                        {/* View Mode Switcher (Prominent & Clear) */}
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 p-0.5 shadow-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('editor')}
                                title="Mode Ketik / Edit Teks Langsung"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    viewMode === 'editor'
                                        ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <FileEdit className="size-3.5" />
                                <span>Mode Ketik</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                title="Lihat Tampilan Dokumen Word Hasil Jadi"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    viewMode === 'preview'
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Eye className="size-3.5" />
                                <span>Hasil Dokumen Word</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('split')}
                                title="Tampilan Berdampingan (Editor di kiri, Lembar Word di kanan)"
                                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    viewMode === 'split'
                                        ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Columns2 className="size-3.5" />
                                <span>Split</span>
                            </button>
                        </div>

                        {/* Fullscreen Button */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            title="Buka Mode Layar Penuh (Word View)"
                            className="size-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
                        >
                            <Maximize2 className="size-3.5" />
                        </button>
                    </div>
                </div>

                {/* 2. Editor Canvas Body */}
                {renderEditorContent()}

                {/* 3. Word Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Lembar Word PMS
                        </span>
                        <span>•</span>
                        <span>{wordCount} Kata</span>
                        <span>•</span>
                        <span>{charCount} Karakter</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-violet-600 dark:text-violet-400 font-medium">
                            💡 Format (###, *, |) otomatis dirender menjadi dokumen visual Word yang rapi
                        </span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
                            title="Salin isi dokumen"
                        >
                            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                        </button>
                        <span>•</span>
                        <span className="font-mono text-[10px]">UTF-8 • Markdown / Rich Format</span>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN MODAL (WORD FOCUS MODE) */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-2xl p-2 sm:p-6 animate-in fade-in-0 duration-200">
                    <div className="flex flex-col flex-1 rounded-3xl border border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-w-6xl w-full mx-auto">
                        {/* Word Fullscreen Ribbon Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3.5">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/30">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        {label || 'Editor Dokumen Word'}
                                        <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-[10px]">
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
                                    className="rounded-xl h-9 px-4 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25"
                                >
                                    <Minimize2 className="size-3.5" />
                                    Tutup & Terapkan
                                </Button>
                            </div>
                        </div>

                        {/* Ribbon Toolbar inside Fullscreen */}
                        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 px-4 py-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('bold')}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                >
                                    <Bold className="size-3.5 mr-1" /> Tebal
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('italic')}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                >
                                    <Italic className="size-3.5 mr-1" /> Miring
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('underline')}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                >
                                    <Underline className="size-3.5 mr-1" /> Garis Bawah
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('highlight')}
                                    className="h-8 px-2.5 rounded-lg text-xs text-amber-600 dark:text-amber-400"
                                >
                                    <Highlighter className="size-3.5 mr-1" /> Sorot
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('table')}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                >
                                    <Table className="size-3.5 mr-1" /> Tabel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('checklist')}
                                    className="h-8 px-2.5 rounded-lg text-xs text-violet-600 dark:text-violet-400"
                                >
                                    <ListTodo className="size-3.5 mr-1" /> Checklist
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('quote')}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                >
                                    <Quote className="size-3.5 mr-1" /> Kutipan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFormat('template')}
                                    className="h-8 px-3 rounded-lg text-xs font-bold bg-violet-600/10 text-violet-700 dark:text-violet-300 border-violet-500/30"
                                >
                                    <Sparkles className="size-3.5 mr-1 text-violet-500" /> Template Cepat
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('editor')}
                                        className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
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
                                        className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
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
                                        className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
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

                        {/* Fullscreen Body */}
                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {renderEditorContent()}
                        </div>

                        {/* Fullscreen Footer */}
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-2.5 text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                                <span>Halaman 1</span>
                                <span>•</span>
                                <span>{wordCount} Kata</span>
                                <span>•</span>
                                <span>{charCount} Karakter</span>
                                <span>•</span>
                                <span>Estimasi baca: ~{readingTimeMinutes} menit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">Zoom:</span>
                                <div className="flex items-center gap-1">
                                    {(['90%', '100%', '115%'] as const).map((z) => (
                                        <button
                                            key={z}
                                            type="button"
                                            onClick={() => setZoomLevel(z)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                                                zoomLevel === z
                                                    ? 'bg-violet-600 text-white'
                                                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {z}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Dialog Konfirmasi Template Word (Tanpa Alert Browser!) */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="max-w-md rounded-3xl border border-slate-200/90 dark:border-violet-500/30 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl p-6">
                    <DialogHeader>
                        <div className="size-11 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
                            <Sparkles className="size-5" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Terapkan Template Word Standar?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                            Isi dokumen saat ini akan diperbarui dengan struktur template Word terstandarisasi.
                            Perubahan ini tetap dapat Anda batalkan (*Undo*) kapan saja melalui tombol Undo di bilah alat.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-2 mt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsTemplateModalOpen(false)}
                            className="rounded-xl h-10 px-4 text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                const templateStr = PRESET_TEMPLATES[presetType] || PRESET_TEMPLATES.general;
                                pushHistory(templateStr);
                                setViewMode(window.innerWidth >= 768 ? 'split' : 'preview');
                                setIsTemplateModalOpen(false);
                            }}
                            className="rounded-xl h-10 px-5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/25 gap-1.5"
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
            <div className={`p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic ${className}`}>
                Belum ada data dokumen terisi.
            </div>
        );
    }

    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    // Internal line formatter
    const formatInlineText = (text: string): React.ReactNode => {
        if (!text) return null;
        const parts = text.split(/(<mark>.*?<\/mark>|<u>.*?<\/u>|`.*?`|\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g);
        return parts.map((part, index) => {
            if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
                return (
                    <mark key={index} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-medium">
                        {part.replace(/<\/?mark>/g, '')}
                    </mark>
                );
            }
            if (part.startsWith('<u>') && part.endsWith('</u>')) {
                return (
                    <span key={index} className="underline underline-offset-4 decoration-violet-500">
                        {part.replace(/<\/?u>/g, '')}
                    </span>
                );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700/60">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-slate-800 dark:text-slate-300">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
                return <del key={index} className="line-through text-slate-400">{part.slice(2, -2)}</del>;
            }
            return part;
        });
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
        if (tableRows.length > 0) {
            const headerRow = tableRows[0];
            const dataRows = tableRows.slice(1).filter((r) => !r.every((cell) => /^:?-+:?$/.test(cell.trim())));
            elements.push(
                <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-violet-50/90 dark:bg-violet-950/40 border-b border-violet-100 dark:border-violet-900/60 font-bold text-violet-950 dark:text-violet-200 tracking-wider">
                                {headerRow.map((cell, cIdx) => (
                                    <th key={cIdx} className="p-3 font-bold border-r last:border-r-0 border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
                                        {formatInlineText(cell.trim())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                            {dataRows.map((row, rIdx) => {
                                const isEven = rIdx % 2 === 0;
                                return (
                                    <tr
                                        key={rIdx}
                                        className={`transition-colors ${
                                            isEven
                                                ? 'bg-white dark:bg-slate-900 hover:bg-violet-50/30 dark:hover:bg-slate-800/60'
                                                : 'bg-slate-50/80 dark:bg-slate-800/35 hover:bg-violet-50/50 dark:hover:bg-slate-800/70'
                                        }`}
                                    >
                                        {row.map((cell, cIdx) => {
                                            const trimmed = cell.trim();
                                            const isStatusBadge = /^(Siap Diserahkan|Selesai|Done|Completed|Passed|Direncanakan|Planned|Sedang Berjalan|In Progress|In-Progress|Dijadwalkan|Scheduled)$/i.test(trimmed);
                                            return (
                                                <td key={cIdx} className="p-3 border-r last:border-r-0 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                                                    {isStatusBadge ? (
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                                /^(Siap Diserahkan|Selesai|Done|Completed|Passed)$/i.test(trimmed)
                                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                                                    : /^(Sedang Berjalan|In Progress|In-Progress)$/i.test(trimmed)
                                                                    ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25'
                                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                                                            }`}
                                                        >
                                                            {trimmed}
                                                        </span>
                                                    ) : (
                                                        formatInlineText(trimmed)
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            inTable = false;
        }
    };

    const flushCodeBlock = (key: string) => {
        if (codeContent.length > 0) {
            elements.push(
                <div key={`code-${key}`} className="my-3.5 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                    <pre>{codeContent.join('\n')}</pre>
                </div>
            );
            codeContent = [];
            inCodeBlock = false;
        }
    };

    lines.forEach((line, idx) => {
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) flushCodeBlock(`cb-${idx}`);
            else {
                if (inTable) flushTable(`tbl-${idx}`);
                inCodeBlock = true;
            }
            return;
        }
        if (inCodeBlock) {
            codeContent.push(line);
            return;
        }

        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
            if (!inTable) inTable = true;
            tableRows.push(cells);
            return;
        } else if (inTable) {
            flushTable(`tbl-${idx}`);
        }

        if (line.startsWith('# ')) {
            elements.push(
                <h1 key={idx} className="mt-5 mb-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white border-b border-violet-500/25 pb-2 flex items-center gap-2">
                    {formatInlineText(line.replace('# ', ''))}
                </h1>
            );
            return;
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={idx} className="mt-4 mb-2 text-base sm:text-lg font-extrabold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                    {formatInlineText(line.replace('## ', ''))}
                </h2>
            );
            return;
        }
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={idx} className="mt-3 mb-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {formatInlineText(line.replace('### ', ''))}
                </h3>
            );
            return;
        }
        if (line.startsWith('#### ')) {
            elements.push(
                <h4 key={idx} className="mt-2.5 mb-1 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {formatInlineText(line.replace('#### ', ''))}
                </h4>
            );
            return;
        }

        if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={idx} className="my-2.5 border-l-4 border-violet-500 bg-violet-50/70 dark:bg-violet-950/30 p-3.5 rounded-r-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic shadow-sm">
                    {formatInlineText(line.replace('> ', ''))}
                </blockquote>
            );
            return;
        }

        if (line.trim() === '---' || line.trim() === '***') {
            elements.push(<hr key={idx} className="my-4 border-t border-slate-200 dark:border-slate-800" />);
            return;
        }

        const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\]\s*(.*)/);
        if (checkMatch) {
            const isChecked = checkMatch[2].toLowerCase() === 'x';
            const itemText = checkMatch[3];
            elements.push(
                <div
                    key={idx}
                    className={`flex items-start gap-2.5 my-1.5 p-2 rounded-xl border text-xs sm:text-sm ${
                        isChecked
                            ? 'bg-violet-500/10 border-violet-500/30 text-slate-500 dark:text-slate-400 line-through'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                >
                    <div className={`mt-0.5 size-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-400 dark:border-slate-600 bg-transparent'
                    }`}>
                        {isChecked ? <Check className="size-3 stroke-[3]" /> : null}
                    </div>
                    <span className="flex-1">{formatInlineText(itemText)}</span>
                </div>
            );
            return;
        }

        if (line.match(/^(\s*)[-*•]\s+(.*)/)) {
            const match = line.match(/^(\s*)[-*•]\s+(.*)/);
            elements.push(
                <div key={idx} className="flex items-start gap-2.5 my-1 ml-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    <span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                    <span className="flex-1">{formatInlineText(match ? match[2] : line)}</span>
                </div>
            );
            return;
        }

        if (line.match(/^(\s*)(\d+)\.\s+(.*)/)) {
            const match = line.match(/^(\s*)(\d+)\.\s+(.*)/);
            elements.push(
                <div key={idx} className="flex items-start gap-2.5 my-1 ml-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    <span className="inline-flex items-center justify-center size-4.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 shrink-0">
                        {match ? match[2] : '•'}
                    </span>
                    <span className="flex-1">{formatInlineText(match ? match[3] : line)}</span>
                </div>
            );
            return;
        }

        if (!line.trim()) {
            elements.push(<div key={idx} className="h-2.5" />);
        } else {
            elements.push(
                <p key={idx} className="my-1.5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {formatInlineText(line)}
                </p>
            );
        }
    });

    if (inTable) flushTable('end-table');
    if (inCodeBlock) flushCodeBlock('end-code');

    return (
        <div className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 w-full min-w-0 max-w-full overflow-hidden break-words ${className}`}>
            {label && (
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                        <FileText className="size-4" />
                        {label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                        {wordCount} kata • ~{readingTime} min baca
                    </span>
                </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-1">
                {elements}
            </div>
        </div>
    );
}
