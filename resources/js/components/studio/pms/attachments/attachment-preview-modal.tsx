import {
    Calendar,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    FolderKanban,
    Maximize2,
    Minimize2,
    User,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { PmsTask } from '@/types/pms';
import {
    formatAttachmentSize,
    getAttachmentExtension,
    getAttachmentStyleMeta,
    resolveAttachmentDownloadUrl,
    resolveAttachmentUrl,
} from './attachment-utils';

export interface PreviewableAttachment {
    id: number;
    task_id?: number | null;
    task_title?: string | null;
    file_name: string;
    file_path: string;
    file_url?: string | null;
    preview_url?: string | null;
    download_url?: string | null;
    file_size: number;
    file_type?: string | null;
    uploader?: { name?: string | null } | null;
    uploader_name?: string | null;
    task?: { id: number; title: string } | null;
    created_at?: string | null;
}

interface AttachmentPreviewModalProps {
    attachment: PreviewableAttachment | null;
    attachments?: PreviewableAttachment[];
    tasks?: Pick<PmsTask, 'id' | 'title'>[];
    onClose: () => void;
    onSelectAttachment?: (attachment: any) => void;
}

interface AttachmentPreviewBodyProps {
    attachment: PreviewableAttachment;
    attachments: PreviewableAttachment[];
    tasks: Pick<PmsTask, 'id' | 'title'>[];
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onSelectAttachment?: (attachment: any) => void;
}

function AttachmentPreviewBody({
    attachment,
    attachments,
    tasks,
    isExpanded,
    onToggleExpanded,
    onSelectAttachment,
}: AttachmentPreviewBodyProps) {
    const [zoomScale, setZoomScale] = useState(1);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const [textState, setTextState] = useState<{
        id: number;
        content: string | null;
    } | null>(null);

    const url = useMemo(() => resolveAttachmentUrl(attachment), [attachment]);
    const downloadUrl = useMemo(() => resolveAttachmentDownloadUrl(attachment), [attachment]);

    const styleMeta = useMemo(
        () => getAttachmentStyleMeta(attachment.file_name, attachment.file_type),
        [attachment.file_name, attachment.file_type],
    );

    const ext = useMemo(
        () => getAttachmentExtension(attachment.file_name, attachment.file_type).toUpperCase(),
        [attachment.file_name, attachment.file_type],
    );

    const matchingTask = useMemo(() => {
        if (!attachment.task_id) {
            return null;
        }

        return (
            tasks.find((t) => t.id === attachment.task_id) ||
            attachment.task ||
            (attachment.task_title
                ? { id: attachment.task_id, title: attachment.task_title }
                : null)
        );
    }, [attachment, tasks]);

    const currentIndex = useMemo(() => {
        if (attachments.length === 0) {
            return -1;
        }

        return attachments.findIndex((item) => item.id === attachment.id);
    }, [attachment.id, attachments]);

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < attachments.length - 1;

    const shouldLoadText =
        styleMeta.category === 'code' && Boolean(url) && attachment.file_size <= 512 * 1024;
    const isLoadingText = shouldLoadText && textState?.id !== attachment.id;
    const textPreview = textState?.id === attachment.id ? textState.content : null;

    useEffect(() => {
        if (!shouldLoadText) {
            return;
        }

        const controller = new AbortController();

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to load text preview');
                }

                return res.text();
            })
            .then((content) => {
                setTextState({ id: attachment.id, content });
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setTextState({ id: attachment.id, content: null });
                }
            });

        return () => controller.abort();
    }, [attachment.id, shouldLoadText, url]);

    useEffect(() => {
        if (!onSelectAttachment || attachments.length <= 1) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && hasPrev) {
                onSelectAttachment(attachments[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && hasNext) {
                onSelectAttachment(attachments[currentIndex + 1]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [attachments, currentIndex, hasNext, hasPrev, onSelectAttachment]);

    return (
        <>
            {/* Luxury Header */}
            <DialogHeader className="w-full min-w-0 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 text-left pr-11 sm:pr-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                            className={`size-9 sm:size-10 rounded-xl border flex items-center justify-center shrink-0 ${styleMeta.iconBgClass}`}
                        >
                            <styleMeta.Icon className="size-4.5 sm:size-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider ${styleMeta.badgeClass}`}
                                >
                                    {ext || styleMeta.label}
                                </span>
                                {matchingTask ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold max-w-[200px] sm:max-w-[260px] truncate">
                                        <CheckSquare className="size-2.5 shrink-0" />
                                        <span className="truncate">
                                            Tiket #{matchingTask.id}: {matchingTask.title}
                                        </span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                        <FolderKanban className="size-2.5" />
                                        Dokumen Umum Proyek
                                    </span>
                                )}
                            </div>

                            <DialogTitle
                                className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate pr-2"
                                title={attachment.file_name}
                            >
                                {attachment.file_name}
                            </DialogTitle>

                            <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{formatAttachmentSize(attachment.file_size)}</span>
                                <span className="inline-flex items-center gap-1">
                                    <User className="size-3" />
                                    {attachment.uploader?.name ?? attachment.uploader_name ?? 'Tim Studio'}
                                </span>
                                {attachment.created_at && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {new Date(attachment.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-start lg:justify-end gap-1.5 shrink-0 pt-1 lg:pt-0">
                        {styleMeta.category === 'image' && !imageLoadFailed && (
                            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setZoomScale((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                                    className="size-8 sm:size-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                                    title="Perkecil"
                                >
                                    <ZoomOut className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomScale(1)}
                                    className="px-2 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                                    title="Reset zoom"
                                >
                                    {Math.round(zoomScale * 100)}%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomScale((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                                    className="size-8 sm:size-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                                    title="Perbesar"
                                >
                                    <ZoomIn className="size-3.5" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onToggleExpanded}
                                className="hidden md:inline-flex rounded-xl h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 cursor-pointer"
                                title={isExpanded ? 'Ukuran Normal' : 'Perluas Pratinjau'}
                            >
                                {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 sm:h-8 px-2.5 sm:px-3 text-xs font-semibold border-slate-200 dark:border-slate-700 gap-1.5"
                            >
                                <a href={url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="size-3.5" />
                                    <span className="hidden sm:inline">Buka Tab Baru</span>
                                </a>
                            </Button>

                            <Button
                                asChild
                                size="sm"
                                className="rounded-xl h-9 sm:h-8 px-3 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-sm gap-1.5"
                            >
                                <a href={downloadUrl} download={attachment.file_name}>
                                    <Download className="size-3.5" />
                                    <span>Unduh</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            {/* Adaptive Preview Viewport */}
            <div className="flex-1 min-h-0 overflow-auto bg-slate-100/80 dark:bg-[#060B16] p-2.5 sm:p-5 flex items-center justify-center">
                {styleMeta.category === 'image' && !imageLoadFailed ? (
                    <div className="w-full h-full min-h-[240px] sm:min-h-[380px] overflow-auto rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] p-2.5 sm:p-4 flex">
                        <img
                            src={url}
                            alt={attachment.file_name}
                            onError={() => setImageLoadFailed(true)}
                            style={
                                zoomScale === 1
                                    ? undefined
                                    : {
                                          width: `${zoomScale * 100}%`,
                                          maxWidth: 'none',
                                      }
                            }
                            className={`m-auto rounded-xl object-contain shadow-xl transition-all duration-200 ${
                                zoomScale === 1 ? 'max-h-[58dvh] sm:max-h-[65dvh] max-w-full' : ''
                            }`}
                        />
                    </div>
                ) : styleMeta.category === 'pdf' ? (
                    <div className="w-full h-full flex flex-col gap-2">
                        <iframe
                            title={attachment.file_name}
                            src={`${url}#view=FitH`}
                            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-inner ${
                                isExpanded ? 'h-[68dvh]' : 'h-[52dvh] sm:h-[62dvh]'
                            }`}
                        />
                        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                            Jika pratinjau PDF tidak tampil pada browser mobile, klik <strong>Buka Tab Baru</strong> atau <strong>Unduh</strong> di atas.
                        </p>
                    </div>
                ) : styleMeta.category === 'video' ? (
                    <video
                        controls
                        playsInline
                        src={url}
                        className="w-full max-h-[64vh] rounded-2xl bg-black shadow-2xl border border-white/10"
                    />
                ) : styleMeta.category === 'audio' ? (
                    <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-4">
                        <div className={`mx-auto size-16 rounded-2xl border flex items-center justify-center ${styleMeta.iconBgClass}`}>
                            <styleMeta.Icon className="size-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {attachment.file_name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Pemutar Audio Langsung</p>
                        </div>
                        <audio controls src={url} className="w-full" />
                    </div>
                ) : styleMeta.category === 'code' && (isLoadingText || textPreview !== null) ? (
                    <div className="w-full h-full min-h-[260px] max-h-[62vh] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono text-xs leading-relaxed shadow-inner">
                        {isLoadingText ? (
                            <span className="text-slate-400">Memuat pratinjau berkas teks...</span>
                        ) : (
                            <pre className="whitespace-pre-wrap break-words">{textPreview}</pre>
                        )}
                    </div>
                ) : (
                    <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-lg text-center space-y-4">
                        <div
                            className={`mx-auto size-16 rounded-2xl border flex items-center justify-center shadow-xs ${styleMeta.iconBgClass}`}
                        >
                            <styleMeta.Icon className="size-8" />
                        </div>
                        <div className="space-y-1">
                            <span
                                className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styleMeta.badgeClass}`}
                            >
                                {styleMeta.label} • {ext || 'FILE'}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white break-all pt-1">
                                {attachment.file_name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Pratinjau langsung tidak tersedia untuk format {ext || 'berkas ini'}. Silakan unduh atau buka langsung berkasnya.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                            <Button
                                asChild
                                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs gap-1.5"
                            >
                                <a href={downloadUrl} download={attachment.file_name}>
                                    <Download className="size-3.5" />
                                    Unduh Berkas ({formatAttachmentSize(attachment.file_size)})
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-1.5"
                            >
                                <a href={url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="size-3.5" />
                                    Buka di Tab Baru
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Carousel Navigation Footer when multiple attachments exist */}
            {attachments.length > 1 && onSelectAttachment && currentIndex >= 0 && (
                <div className="px-4 py-2.5 sm:px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between text-xs shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!hasPrev}
                        onClick={() => hasPrev && onSelectAttachment(attachments[currentIndex - 1])}
                        className="rounded-xl h-8 px-3 text-xs font-semibold gap-1 cursor-pointer"
                    >
                        <ChevronLeft className="size-3.5" />
                        Sebelumnya
                    </Button>

                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        Berkas {currentIndex + 1} / {attachments.length}
                    </span>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!hasNext}
                        onClick={() => hasNext && onSelectAttachment(attachments[currentIndex + 1])}
                        className="rounded-xl h-8 px-3 text-xs font-semibold gap-1 cursor-pointer"
                    >
                        Berikutnya
                        <ChevronRight className="size-3.5" />
                    </Button>
                </div>
            )}
        </>
    );
}

export function AttachmentPreviewModal({
    attachment,
    attachments = [],
    tasks = [],
    onClose,
    onSelectAttachment,
}: AttachmentPreviewModalProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Dialog
            open={Boolean(attachment)}
            onOpenChange={(open) => {
                if (!open) {
                    setIsExpanded(false);
                    onClose();
                }
            }}
        >
            <DialogContent
                className={`p-0 gap-0 overflow-hidden flex flex-col border border-slate-200/90 dark:border-white/[0.12] bg-white/95 dark:bg-[#0B1222]/95 backdrop-blur-2xl shadow-2xl text-slate-900 dark:text-slate-100 transition-all duration-200 min-w-0 ${
                    isExpanded
                        ? 'w-[calc(100vw-1rem)] sm:w-[96vw] sm:max-w-6xl h-[92dvh] max-h-[92dvh] rounded-2xl sm:rounded-3xl'
                        : 'w-[calc(100vw-1rem)] sm:w-[92vw] sm:max-w-4xl max-h-[92dvh] rounded-2xl sm:rounded-3xl'
                }`}
            >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent z-20" />

                {attachment && (
                    <AttachmentPreviewBody
                        key={attachment.id}
                        attachment={attachment}
                        attachments={attachments}
                        tasks={tasks}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => setIsExpanded((prev) => !prev)}
                        onSelectAttachment={onSelectAttachment}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
