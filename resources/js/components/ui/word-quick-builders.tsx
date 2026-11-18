import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowUp,
    Check,
    Heading,
    List,
    ListOrdered,
    ListTodo,
    Plus,
    Quote,
    Sparkles,
    Table,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatInlineMarkdown } from './word-document-renderer';

/* -------------------------------------------------------------------------- */
/* 1. QUICK CALLOUT / BLOK PERNYATAAN BUILDER                                 */
/* -------------------------------------------------------------------------- */
const CALLOUT_LABEL_PRESETS = [
    'Pernyataan Tujuan',
    'PENTING',
    'Value Proposition',
    'Asumsi Teknis',
    'Catatan Klien',
    'Tanpa Label',
];

interface BuilderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (markdownSnippet: string) => void;
}

export function CalloutBuilderDialog({
    open,
    onOpenChange,
    onInsert,
}: BuilderDialogProps) {
    const [label, setLabel] = useState('Pernyataan Tujuan');
    const [body, setBody] = useState('');

    const trimmedLabel = label.trim();
    const effectiveLabel =
        trimmedLabel && trimmedLabel !== 'Tanpa Label' ? trimmedLabel : '';
    const trimmedBody = body.trim();

    const previewLine = effectiveLabel
        ? `**${effectiveLabel}:** ${trimmedBody || 'Tuliskan isi pernyataan atau poin penting di sini...'}`
        : trimmedBody || 'Tuliskan isi kutipan atau arahan di sini...';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!trimmedBody) {
            return;
        }

        const lines = trimmedBody.split('\n').map((l) => l.trim());
        const firstLine = effectiveLabel
            ? `> **${effectiveLabel}:** ${lines[0]}`
            : `> ${lines[0]}`;
        const restLines = lines.slice(1).map((l) => `> ${l}`);

        onInsert([firstLine, ...restLines].join('\n'));
        setBody('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-2xl rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95">
                <DialogHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-600/10 text-violet-600 dark:text-violet-400">
                        <Quote className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Sisipkan Blok Pernyataan (Callout Box)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Buat kotak sorotan elegan seperti <strong>Pernyataan Tujuan</strong> atau catatan penting tanpa menulis sintaks secara manual.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Label Sorotan (Opsional)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {CALLOUT_LABEL_PRESETS.map((preset) => {
                                const isSelected =
                                    (preset === 'Tanpa Label' &&
                                        !effectiveLabel) ||
                                    preset === label;

                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() =>
                                            setLabel(
                                                preset === 'Tanpa Label'
                                                    ? ''
                                                    : preset,
                                            )
                                        }
                                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                            isSelected
                                                ? 'bg-violet-600 text-white shadow-xs'
                                                : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                );
                            })}
                        </div>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Atau ketik label kustom (kosongkan jika tanpa label)..."
                            className="h-9 rounded-xl border-slate-200 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-950"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Isi Pernyataan
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Contoh: Mengakselerasi efisiensi operasional dan performa pemrosesan data sistem hingga 60%."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>

                    {/* Visual Live Preview */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            Pratinjau Tampilan:
                        </span>
                        <blockquote className="rounded-r-xl border-l-4 border-violet-500 bg-violet-50/80 p-3 text-xs text-slate-800 italic dark:bg-violet-950/30 dark:text-slate-200">
                            {formatInlineMarkdown(previewLine)}
                        </blockquote>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 rounded-xl text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!trimmedBody}
                            className="h-9 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700"
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Sisipkan ke Dokumen
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. QUICK LIST / BULLET / CHECKLIST BUILDER                                 */
/* -------------------------------------------------------------------------- */
interface ListItemDraft {
    id: number;
    title: string;
    detail: string;
    checked: boolean;
}

export function ListBuilderDialog({
    open,
    onOpenChange,
    onInsert,
}: BuilderDialogProps) {
    const [listType, setListType] = useState<
        'bullet' | 'numbered' | 'checklist'
    >('bullet');
    const [sectionHeading, setSectionHeading] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [showBulkPaste, setShowBulkPaste] = useState(false);
    const [nextId, setNextId] = useState(4);
    const [items, setItems] = useState<ListItemDraft[]>([
        { id: 1, title: '', detail: '', checked: true },
        { id: 2, title: '', detail: '', checked: true },
    ]);

    const addRow = () => {
        setItems((prev) => [
            ...prev,
            { id: nextId, title: '', detail: '', checked: true },
        ]);
        setNextId((n) => n + 1);
    };

    const removeRow = (id: number) => {
        if (items.length <= 1) {
            return;
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const moveRow = (index: number, delta: -1 | 1) => {
        const target = index + delta;

        if (target < 0 || target >= items.length) {
            return;
        }

        setItems((prev) => {
            const copy = [...prev];
            const [moved] = copy.splice(index, 1);
            copy.splice(target, 0, moved);

            return copy;
        });
    };

    const updateRow = (
        id: number,
        field: keyof ListItemDraft,
        val: string | boolean,
    ) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: val } : item,
            ),
        );
    };

    const handleImportBulk = () => {
        const rawLines = bulkText
            .split('\n')
            .map((l) => l.trim().replace(/^[-*•]\s+|^\d+\.\s+/, ''))
            .filter(Boolean);

        if (rawLines.length === 0) {
            return;
        }

        let idCounter = nextId;
        const parsed: ListItemDraft[] = rawLines.map((line) => {
            const colonIdx = line.indexOf(':');
            const currentId = idCounter++;

            if (colonIdx > 0 && colonIdx < 45) {
                return {
                    id: currentId,
                    title: line.slice(0, colonIdx).replace(/\*\*/g, '').trim(),
                    detail: line.slice(colonIdx + 1).trim(),
                    checked: true,
                };
            }

            return {
                id: currentId,
                title: '',
                detail: line,
                checked: true,
            };
        });

        setNextId(idCounter);
        setItems(parsed);
        setBulkText('');
        setShowBulkPaste(false);
    };

    const validItems = items.filter((i) => i.title.trim() || i.detail.trim());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validItems.length === 0) {
            return;
        }

        const formattedLines = validItems.map((item, idx) => {
            const t = item.title.trim();
            const d = item.detail.trim();
            const bodyText =
                t && d ? `**${t}:** ${d}` : t ? `**${t}**` : d;

            if (listType === 'numbered') {
                return `${idx + 1}. ${bodyText}`;
            }

            if (listType === 'checklist') {
                return `- [${item.checked ? 'x' : ' '}] ${bodyText}`;
            }

            return `* ${bodyText}`;
        });

        const prefix = sectionHeading.trim()
            ? `#### ${sectionHeading.trim()}\n`
            : '';
        onInsert(`${prefix}${formattedLines.join('\n')}`);

        // Reset clean state for next quick entry
        setSectionHeading('');
        setItems([
            { id: nextId + 1, title: '', detail: '', checked: true },
            { id: nextId + 2, title: '', detail: '', checked: true },
        ]);
        setNextId((n) => n + 3);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-4xl overflow-y-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95">
                <DialogHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-600/10 text-violet-600 dark:text-violet-400">
                        <ListTodo className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Pembuat Daftar Cepat (Bullet / Nomor / Checklist)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Isi poin satu per satu atau tempel daftar baris sekaligus. Kata kunci otomatis dibuat tebal rapi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    {/* List Type Switcher */}
                    <div className="grid grid-cols-3 gap-2">
                        {(
                            [
                                {
                                    key: 'bullet',
                                    label: 'Bullet Poin',
                                    icon: List,
                                },
                                {
                                    key: 'numbered',
                                    label: 'Daftar Bernomor',
                                    icon: ListOrdered,
                                },
                                {
                                    key: 'checklist',
                                    label: 'Checklist Fitur',
                                    icon: ListTodo,
                                },
                            ] as const
                        ).map((opt) => {
                            const Icon = opt.icon;
                            const active = listType === opt.key;

                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setListType(opt.key)}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                                        active
                                            ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                    }`}
                                >
                                    <Icon className="size-3.5" />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional Sub-heading */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Judul Daftar (Opsional)
                            </label>
                            <Input
                                value={sectionHeading}
                                onChange={(e) =>
                                    setSectionHeading(e.target.value)
                                }
                                placeholder="Misal: 1. Modul & Fitur Termasuk (In-Scope)"
                                className="h-9 rounded-xl border-slate-200 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-950"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBulkPaste(!showBulkPaste)}
                            className="h-9 shrink-0 rounded-xl text-xs font-semibold"
                        >
                            {showBulkPaste
                                ? 'Tutup Import Teks'
                                : 'Tempel Banyak Baris'}
                        </Button>
                    </div>

                    {showBulkPaste && (
                        <div className="space-y-2 rounded-2xl border border-violet-500/25 bg-violet-50/50 p-3.5 dark:bg-violet-950/20">
                            <span className="block text-[11px] font-bold text-violet-700 dark:text-violet-300">
                                Tempel daftar (1 poin per baris, format opsional &ldquo;Judul: Keterangan&rdquo;):
                            </span>
                            <textarea
                                rows={4}
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                placeholder={
                                    'Autentikasi: Integrasi login aman & role akses\nManajemen Stok: Pencatatan barang masuk & keluar'
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleImportBulk}
                                className="h-8 rounded-lg bg-violet-600 text-xs font-bold text-white"
                            >
                                Konversi ke Baris Input
                            </Button>
                        </div>
                    )}

                    {/* Dynamic Rows */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            <span>Butir Poin ({items.length})</span>
                            <button
                                type="button"
                                onClick={addRow}
                                className="inline-flex cursor-pointer items-center gap-1 font-bold text-violet-600 hover:underline dark:text-violet-400"
                            >
                                <Plus className="size-3.5" />
                                Tambah Baris
                            </button>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 sm:flex-nowrap dark:border-slate-800 dark:bg-slate-950/60"
                                >
                                    {listType === 'checklist' ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateRow(
                                                    item.id,
                                                    'checked',
                                                    !item.checked,
                                                )
                                            }
                                            title="Status Centang"
                                            className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border ${
                                                item.checked
                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                    : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
                                            }`}
                                        >
                                            {item.checked && (
                                                <Check className="size-3.5" />
                                            )}
                                        </button>
                                    ) : (
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-200/70 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {listType === 'numbered'
                                                ? idx + 1
                                                : '•'}
                                        </span>
                                    )}

                                    <Input
                                        value={item.title}
                                        onChange={(e) =>
                                            updateRow(
                                                item.id,
                                                'title',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Judul tebal (opsional)"
                                        className="h-8.5 w-full rounded-lg border-slate-200 bg-white text-xs sm:w-44 dark:border-slate-800 dark:bg-slate-900"
                                    />

                                    <Input
                                        value={item.detail}
                                        onChange={(e) =>
                                            updateRow(
                                                item.id,
                                                'detail',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Deskripsi atau keterangan item..."
                                        className="h-8.5 flex-1 rounded-lg border-slate-200 bg-white text-xs dark:border-slate-800 dark:bg-slate-900"
                                    />

                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => moveRow(idx, -1)}
                                            disabled={idx === 0}
                                            className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 dark:hover:text-slate-200"
                                            title="Pindah ke atas"
                                        >
                                            <ArrowUp className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveRow(idx, 1)}
                                            disabled={idx === items.length - 1}
                                            className="cursor-pointer rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 dark:hover:text-slate-200"
                                            title="Pindah ke bawah"
                                        >
                                            <ArrowDown className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(item.id)}
                                            disabled={items.length <= 1}
                                            className="cursor-pointer rounded p-1 text-slate-400 hover:text-rose-500 disabled:opacity-25"
                                            title="Hapus baris"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 rounded-xl text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={validItems.length === 0}
                            className="h-9 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700"
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Sisipkan Daftar ({validItems.length} Item)
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. QUICK DYNAMIC TABLE BUILDER                                             */
/* -------------------------------------------------------------------------- */
const STATUS_QUICK_CHIPS = [
    'Selesai',
    'Sedang Berjalan',
    'Direncanakan',
    'Siap Diserahkan',
    'Dijadwalkan',
];

const TABLE_PRESETS = [
    {
        label: 'Matriks Indikator KPI',
        headers: ['Parameter Metrik', 'Baseline Saat Ini', 'Target Capaian', 'PIC'],
        rows: [
            ['Kecepatan Muat Halaman', '1.2 detik', '< 300 ms', 'Frontend Lead'],
            ['Akurasi Stok Barang', 'Manual Bon', 'Real-time 100%', 'Backend Lead'],
        ],
    },
    {
        label: 'Paket Deliverables',
        headers: ['Item Deliverable', 'Format Dokumen', 'Media Serah Terima', 'Status Verifikasi'],
        rows: [
            ['Source Code & Database', 'Repositori + SQL', 'Server Staging / Cloud', 'Sedang Berjalan'],
            ['Panduan Penggunaan Sistem', 'Dokumen PDF', 'Portal Klien', 'Dijadwalkan'],
        ],
    },
    {
        label: 'Jadwal Milestone',
        headers: ['Tahap / Fase', 'Fokus Pengerjaan', 'Target Waktu', 'Status'],
        rows: [
            ['Fase 1', 'Perancangan Database & UI', 'Minggu 1–2', 'Selesai'],
            ['Fase 2', 'Pengembangan Modul Kasir & Stok', 'Minggu 3–4', 'Sedang Berjalan'],
        ],
    },
    {
        label: 'Tabel Kosong 3×2',
        headers: ['Kolom 1', 'Kolom 2', 'Kolom 3'],
        rows: [
            ['', '', ''],
            ['', '', ''],
        ],
    },
];

export function TableBuilderDialog({
    open,
    onOpenChange,
    onInsert,
}: BuilderDialogProps) {
    const [headers, setHeaders] = useState<string[]>([
        'Aspek / Item',
        'Rincian Spesifikasi',
        'Status',
    ]);
    const [colAligns, setColAligns] = useState<('left' | 'center' | 'right')[]>(
        ['left', 'left', 'left'],
    );
    const [rows, setRows] = useState<string[][]>([
        ['', '', 'Direncanakan'],
        ['', '', 'Sedang Berjalan'],
    ]);
    const [focusedCell, setFocusedCell] = useState<{
        r: number;
        c: number;
    } | null>(null);

    const applyPreset = (presetIdx: number) => {
        const p = TABLE_PRESETS[presetIdx];
        setHeaders([...p.headers]);
        setColAligns(p.headers.map(() => 'left'));
        setRows(p.rows.map((r) => [...r]));
        setFocusedCell(null);
    };

    const addColumn = () => {
        if (headers.length >= 6) {
            return;
        }

        setHeaders((prev) => [...prev, `Kolom ${prev.length + 1}`]);
        setColAligns((prev) => [...prev, 'left']);
        setRows((prev) => prev.map((r) => [...r, '']));
    };

    const removeColumn = () => {
        if (headers.length <= 2) {
            return;
        }

        setHeaders((prev) => prev.slice(0, -1));
        setColAligns((prev) => prev.slice(0, -1));
        setRows((prev) => prev.map((r) => r.slice(0, -1)));
    };

    const addRow = () => {
        if (rows.length >= 15) {
            return;
        }

        setRows((prev) => [...prev, headers.map(() => '')]);
    };

    const removeRow = (rowIdx: number) => {
        if (rows.length <= 1) {
            return;
        }

        setRows((prev) => prev.filter((_, idx) => idx !== rowIdx));
    };

    const cycleAlign = (colIdx: number) => {
        setColAligns((prev) =>
            prev.map((a, idx) => {
                if (idx !== colIdx) {
                    return a;
                }

                if (a === 'left') {
                    return 'center';
                }

                if (a === 'center') {
                    return 'right';
                }

                return 'left';
            }),
        );
    };

    const updateHeader = (colIdx: number, val: string) => {
        setHeaders((prev) => prev.map((h, i) => (i === colIdx ? val : h)));
    };

    const updateCell = (rowIdx: number, colIdx: number, val: string) => {
        setRows((prev) =>
            prev.map((row, r) =>
                r === rowIdx
                    ? row.map((cell, c) => (c === colIdx ? val : cell))
                    : row,
            ),
        );
    };

    const insertStatusChip = (badgeText: string) => {
        if (!focusedCell) {
            return;
        }

        updateCell(focusedCell.r, focusedCell.c, badgeText);
    };

    const escapePipe = (val: string) => val.replace(/\|/g, '\\|').trim();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const headerLine = `| ${headers.map((h, i) => escapePipe(h) || `Kolom ${i + 1}`).join(' | ')} |`;
        const sepLine = `| ${colAligns
            .map((a) => (a === 'center' ? ':---:' : a === 'right' ? '---:' : ':---'))
            .join(' | ')} |`;
        const bodyLines = rows.map(
            (r) =>
                `| ${headers.map((_, cIdx) => escapePipe(r[cIdx] ?? '') || '-').join(' | ')} |`,
        );

        onInsert([headerLine, sepLine, ...bodyLines].join('\n'));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-6xl overflow-y-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95">
                <DialogHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-600/10 text-violet-600 dark:text-violet-400">
                        <Table className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Pembuat Tabel Word Dinamis
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Atur jumlah kolom dan baris, lalu ketik isi tabel langsung di grid. Gunakan status cepat untuk menghasilkan badge warna otomatis.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    {/* Presets & Dimension Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                                Struktur Cepat:
                            </span>
                            {TABLE_PRESETS.map((p, idx) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => applyPreset(idx)}
                                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-violet-500/40 hover:text-violet-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeColumn}
                                disabled={headers.length <= 2}
                                className="h-7.5 rounded-lg px-2 text-[11px]"
                            >
                                - Kolom
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addColumn}
                                disabled={headers.length >= 6}
                                className="h-7.5 rounded-lg px-2 text-[11px]"
                            >
                                + Kolom
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                disabled={rows.length >= 15}
                                className="h-7.5 rounded-lg border-violet-500/30 px-2.5 text-[11px] font-bold text-violet-600 dark:text-violet-400"
                            >
                                + Baris
                            </Button>
                        </div>
                    </div>

                    {/* Editable Grid */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[540px] border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-violet-50/80 dark:border-slate-800 dark:bg-violet-950/30">
                                    <th className="w-9 border-r border-slate-200/80 p-2 text-center text-[10px] font-bold text-slate-400 dark:border-slate-800">
                                        #
                                    </th>
                                    {headers.map((header, cIdx) => {
                                        const align = colAligns[cIdx];

                                        return (
                                            <th
                                                key={cIdx}
                                                className="border-r border-slate-200/80 p-2 last:border-r-0 dark:border-slate-800"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        value={header}
                                                        onChange={(e) =>
                                                            updateHeader(
                                                                cIdx,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Judul Kolom ${cIdx + 1}`}
                                                        className="h-8 rounded-lg border-violet-200 bg-white text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cycleAlign(cIdx)
                                                        }
                                                        title={`Perataan kolom: ${align}`}
                                                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900"
                                                    >
                                                        {align === 'center' ? (
                                                            <AlignCenter className="size-3.5" />
                                                        ) : align === 'right' ? (
                                                            <AlignRight className="size-3.5" />
                                                        ) : (
                                                            <AlignLeft className="size-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="w-10 p-2" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.map((row, rIdx) => (
                                    <tr
                                        key={rIdx}
                                        className="bg-white dark:bg-slate-900"
                                    >
                                        <td className="border-r border-slate-100 p-2 text-center font-mono text-[10px] font-bold text-slate-400 dark:border-slate-800">
                                            {rIdx + 1}
                                        </td>
                                        {headers.map((_, cIdx) => (
                                            <td
                                                key={cIdx}
                                                className="border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800"
                                            >
                                                <Input
                                                    value={row[cIdx] ?? ''}
                                                    onFocus={() =>
                                                        setFocusedCell({
                                                            r: rIdx,
                                                            c: cIdx,
                                                        })
                                                    }
                                                    onChange={(e) =>
                                                        updateCell(
                                                            rIdx,
                                                            cIdx,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Isi sel..."
                                                    className="h-8 rounded-lg border-slate-200/80 bg-slate-50/70 text-xs dark:border-slate-800 dark:bg-slate-950"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(rIdx)}
                                                disabled={rows.length <= 1}
                                                className="cursor-pointer rounded p-1 text-slate-400 hover:text-rose-500 disabled:opacity-25"
                                                title="Hapus baris"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick Status Badge Helper for Active Cell */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                            Isi cepat sel aktif
                            {focusedCell
                                ? ` (Baris ${focusedCell.r + 1}, Kolom ${focusedCell.c + 1})`
                                : ' (klik salah satu kotak)'}
                            :
                        </span>
                        {STATUS_QUICK_CHIPS.map((chip) => (
                            <button
                                key={chip}
                                type="button"
                                disabled={!focusedCell}
                                onClick={() => insertStatusChip(chip)}
                                className="cursor-pointer rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-700 hover:border-violet-500/40 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 rounded-xl text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="h-9 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700"
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Sisipkan Tabel ({headers.length}×{rows.length})
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. QUICK HEADING / SECTION BUILDER                                         */
/* -------------------------------------------------------------------------- */
const SECTION_EMOJIS = ['🎯', '📋', '🏢', '📦', '📝', '✅', '🚫', '⚠️', 'Tanpa Ikon'];

export function SectionBuilderDialog({
    open,
    onOpenChange,
    onInsert,
}: BuilderDialogProps) {
    const [level, setLevel] = useState<'##' | '###' | '####'>('###');
    const [emoji, setEmoji] = useState('🎯');
    const [title, setTitle] = useState('');
    const [introParagraph, setIntroParagraph] = useState('');

    const effectiveEmoji = emoji && emoji !== 'Tanpa Ikon' ? `${emoji} ` : '';
    const trimmedTitle = title.trim();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!trimmedTitle) {
            return;
        }

        const headingLine = `${level} ${effectiveEmoji}${trimmedTitle}`;
        const snippet = introParagraph.trim()
            ? `${headingLine}\n${introParagraph.trim()}`
            : headingLine;

        onInsert(snippet);
        setTitle('');
        setIntroParagraph('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-2xl rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95">
                <DialogHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-600/10 text-violet-600 dark:text-violet-400">
                        <Heading className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Sisipkan Judul Bagian / Sub-Bab
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Tambahkan heading terstruktur lengkap dengan ikon dan paragraf pengantar opsional.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Ukuran Heading
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(
                                [
                                    { key: '##', label: 'Sub-Bab (H2)' },
                                    { key: '###', label: 'Bagian (H3)' },
                                    { key: '####', label: 'Poin Seksi (H4)' },
                                ] as const
                            ).map((lvl) => (
                                <button
                                    key={lvl.key}
                                    type="button"
                                    onClick={() => setLevel(lvl.key)}
                                    className={`cursor-pointer rounded-xl border py-2 text-xs font-bold transition-all ${
                                        level === lvl.key
                                            ? 'border-violet-600 bg-violet-600 text-white shadow-xs'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                    }`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Ikon Bagian (Opsional)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {SECTION_EMOJIS.map((em) => (
                                <button
                                    key={em}
                                    type="button"
                                    onClick={() =>
                                        setEmoji(em === 'Tanpa Ikon' ? '' : em)
                                    }
                                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                                        (em === 'Tanpa Ikon' && !emoji) ||
                                        em === emoji
                                            ? 'border-violet-600 bg-violet-600 text-white'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                    }`}
                                >
                                    {em}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Judul Bagian
                        </label>
                        <Input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: 1. Sasaran Strategis Utama (Objective 1)"
                            className="h-9 rounded-xl border-slate-200 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-950"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Paragraf Pengantar (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={introParagraph}
                            onChange={(e) => setIntroParagraph(e.target.value)}
                            placeholder="Tambahkan ringkasan singkat di bawah judul jika diperlukan..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 rounded-xl text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!trimmedTitle}
                            className="h-9 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700"
                        >
                            <Sparkles className="mr-1.5 size-3.5" />
                            Sisipkan Bagian
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
