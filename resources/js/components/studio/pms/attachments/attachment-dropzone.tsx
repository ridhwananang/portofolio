import { Plus, Trash2, UploadCloud, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    MAX_ATTACHMENT_BYTES,
    formatAttachmentSize,
    getAttachmentExtension,
    getAttachmentStyleMeta,
} from './attachment-utils';

const MAX_FILES_PER_BATCH = 20;

interface AttachmentDropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    disabled?: boolean;
}

function getFileKey(file: File): string {
    return `${file.name}::${file.size}::${file.lastModified}`;
}

function QueuedFileCard({
    file,
    disabled,
    onRemove,
}: {
    file: File;
    disabled: boolean;
    onRemove: () => void;
}) {
    const styleMeta = useMemo(
        () => getAttachmentStyleMeta(file.name, file.type),
        [file.name, file.type],
    );

    const ext = useMemo(
        () => getAttachmentExtension(file.name, file.type).toUpperCase(),
        [file.name, file.type],
    );

    const fileKey = useMemo(() => getFileKey(file), [file]);
    const [previewSrc, setPreviewSrc] = useState<{ key: string; url: string } | null>(null);
    const [failedKey, setFailedKey] = useState<string | null>(null);

    useEffect(() => {
        if (styleMeta.category !== 'image') {
            return;
        }

        let cancelled = false;
        let activeUrl: string | null = null;

        queueMicrotask(() => {
            if (cancelled) {
                return;
            }

            activeUrl = URL.createObjectURL(file);
            setPreviewSrc({ key: fileKey, url: activeUrl });
        });

        return () => {
            cancelled = true;

            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [file, fileKey, styleMeta.category]);

    const thumbnailUrl =
        styleMeta.category === 'image' && previewSrc?.key === fileKey && failedKey !== fileKey
            ? previewSrc.url
            : null;

    return (
        <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xs min-w-0 group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {thumbnailUrl ? (
                    <div className="size-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shrink-0">
                        <img
                            src={thumbnailUrl}
                            alt={file.name}
                            onError={() => setFailedKey(fileKey)}
                            className="size-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className={`size-10 rounded-lg border flex items-center justify-center shrink-0 ${styleMeta.iconBgClass}`}
                    >
                        <styleMeta.Icon className="size-4.5" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <span
                        className="font-bold text-xs text-slate-900 dark:text-white block truncate"
                        title={file.name}
                    >
                        {file.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {ext && (
                            <span
                                className={`px-1.5 py-0.2 rounded border text-[9px] font-bold tracking-wider ${styleMeta.badgeClass}`}
                            >
                                {ext}
                            </span>
                        )}
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                            {formatAttachmentSize(file.size)}
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Hapus dari daftar unggahan"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}

export function AttachmentDropzone({
    files,
    onFilesChange,
    disabled = false,
}: AttachmentDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const totalSize = useMemo(
        () => files.reduce((acc, item) => acc + item.size, 0),
        [files],
    );

    const appendFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) {
            return;
        }

        const existingKeys = new Set(files.map(getFileKey));
        const nextFiles = [...files];
        let rejectedSizeCount = 0;

        for (const candidate of Array.from(fileList)) {
            if (candidate.size > MAX_ATTACHMENT_BYTES) {
                rejectedSizeCount += 1;
                continue;
            }

            const key = getFileKey(candidate);

            if (existingKeys.has(key)) {
                continue;
            }

            if (nextFiles.length >= MAX_FILES_PER_BATCH) {
                toast.warning(`Maksimal ${MAX_FILES_PER_BATCH} berkas dalam sekali unggah.`);
                break;
            }

            existingKeys.add(key);
            nextFiles.push(candidate);
        }

        if (rejectedSizeCount > 0) {
            toast.error(`${rejectedSizeCount} berkas dilewati karena melebihi batas 20MB per berkas.`);
        }

        if (inputRef.current) {
            inputRef.current.value = '';
        }

        onFilesChange(nextFiles);
    };

    const removeAt = (index: number) => {
        const nextFiles = files.filter((_, idx) => idx !== index);

        if (nextFiles.length === 0 && inputRef.current) {
            inputRef.current.value = '';
        }

        onFilesChange(nextFiles);
    };

    const clearAll = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }

        onFilesChange([]);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) {
            return;
        }

        dragCounterRef.current += 1;

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!disabled && e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);

        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragging(false);

        if (disabled) {
            return;
        }

        appendFiles(e.dataTransfer.files);
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative min-w-0"
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                disabled={disabled}
                onChange={(e) => appendFiles(e.target.files)}
                className="hidden"
            />

            {files.length > 0 ? (
                <div
                    className={`relative overflow-hidden rounded-2xl border p-3 sm:p-3.5 space-y-2.5 sm:space-y-3 transition-all duration-200 min-w-0 ${
                        isDragging
                            ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-500/10 scale-[1.01]'
                            : 'border-cyan-500/35 bg-gradient-to-br from-cyan-500/[0.06] via-slate-50/70 to-violet-500/[0.05] dark:from-cyan-500/[0.08] dark:via-slate-950/60 dark:to-violet-500/[0.07]'
                    }`}
                >
                    {/* Queue Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold">
                                {files.length} Berkas Dipilih
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Total {formatAttachmentSize(totalSize)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                disabled={disabled || files.length >= MAX_FILES_PER_BATCH}
                                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500/50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <Plus className="size-3 text-cyan-500" />
                                <span>Tambah</span>
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                disabled={disabled}
                                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-500/40 text-[11px] font-semibold text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                                <Trash2 className="size-3" />
                                <span>Kosongkan</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable File Queue */}
                    <div className="max-h-[36dvh] sm:max-h-56 overflow-y-auto space-y-2 pr-0.5">
                        {files.map((file, idx) => (
                            <QueuedFileCard
                                key={getFileKey(file)}
                                file={file}
                                disabled={disabled}
                                onRemove={() => removeAt(idx)}
                            />
                        ))}
                    </div>

                    <p className="text-[10.5px] text-center text-slate-400 leading-relaxed">
                        Seret berkas lain ke kotak ini untuk menambahkan lebih banyak lampiran (maks. {MAX_FILES_PER_BATCH} berkas)
                    </p>

                    {isDragging && (
                        <div className="absolute inset-0 bg-cyan-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none">
                            <UploadCloud className="size-8 text-cyan-300 animate-bounce" />
                            <span className="mt-1.5 text-xs font-bold">
                                Lepaskan untuk menambahkan ke antrean
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className={`relative w-full p-5 sm:p-6 rounded-2xl border-2 border-dashed text-center transition-all duration-200 cursor-pointer group min-w-0 overflow-hidden ${
                        isDragging
                            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/15 ring-4 ring-cyan-500/15 scale-[1.01]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950/70 dark:to-slate-900/70 hover:shadow-sm'
                    }`}
                >
                    <div
                        className={`mx-auto size-12 rounded-2xl border flex items-center justify-center transition-all duration-200 ${
                            isDragging
                                ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30 scale-110'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 group-hover:text-cyan-500 group-hover:border-cyan-500/40 group-hover:scale-105 shadow-xs'
                        }`}
                    >
                        <UploadCloud className={`size-6 ${isDragging ? 'animate-bounce' : ''}`} />
                    </div>

                    <span className="block mt-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {isDragging
                            ? 'Lepaskan berkas-berkas di sini...'
                            : 'Klik untuk memilih atau seret banyak berkas ke sini'}
                    </span>

                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Bisa pilih atau seret hingga {MAX_FILES_PER_BATCH} berkas sekaligus (maks. 20MB / berkas)
                    </span>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                        {['PDF', 'DOCX', 'XLSX', 'PNG / JPG', 'ZIP', 'MP4'].map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </button>
            )}
        </div>
    );
}
