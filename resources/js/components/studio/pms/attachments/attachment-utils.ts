import {
    FileArchive,
    FileCode2,
    FileSpreadsheet,
    FileText,
    Film,
    Image as ImageIcon,
    Music,
    Paperclip,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PmsAttachment } from '@/types/pms';

export type AttachmentCategory =
    | 'image'
    | 'pdf'
    | 'video'
    | 'audio'
    | 'spreadsheet'
    | 'document'
    | 'archive'
    | 'code'
    | 'other';

export interface AttachmentStyleMeta {
    category: AttachmentCategory;
    label: string;
    Icon: LucideIcon;
    badgeClass: string;
    iconBgClass: string;
    bannerClass: string;
    canInlinePreview: boolean;
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif']);
const PDF_EXTS = new Set(['pdf']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogg']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'aac', 'flac', 'm4a', 'oga']);
const SPREADSHEET_EXTS = new Set(['xls', 'xlsx', 'csv', 'ods']);
const DOCUMENT_EXTS = new Set(['doc', 'docx', 'odt', 'rtf', 'ppt', 'pptx']);
const ARCHIVE_EXTS = new Set(['zip', 'rar', '7z', 'tar', 'gz']);
const CODE_EXTS = new Set(['json', 'txt', 'md', 'markdown', 'yaml', 'yml', 'xml', 'sql', 'log', 'html', 'css', 'ts', 'tsx', 'js', 'php']);

const STYLE_MAP: Record<AttachmentCategory, AttachmentStyleMeta> = {
    image: {
        category: 'image',
        label: 'Gambar',
        Icon: ImageIcon,
        badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        iconBgClass: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
        bannerClass: 'from-cyan-500/15 via-sky-500/10 to-indigo-500/15',
        canInlinePreview: true,
    },
    pdf: {
        category: 'pdf',
        label: 'Dokumen PDF',
        Icon: FileText,
        badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        iconBgClass: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 border-rose-500/25',
        bannerClass: 'from-rose-500/15 via-pink-500/10 to-amber-500/10',
        canInlinePreview: true,
    },
    video: {
        category: 'video',
        label: 'Video',
        Icon: Film,
        badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
        iconBgClass: 'bg-violet-500/12 text-violet-600 dark:text-violet-400 border-violet-500/25',
        bannerClass: 'from-violet-500/15 via-purple-500/10 to-indigo-500/15',
        canInlinePreview: true,
    },
    audio: {
        category: 'audio',
        label: 'Audio',
        Icon: Music,
        badgeClass: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
        iconBgClass: 'bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/25',
        bannerClass: 'from-fuchsia-500/15 via-pink-500/10 to-violet-500/15',
        canInlinePreview: true,
    },
    spreadsheet: {
        category: 'spreadsheet',
        label: 'Spreadsheet / Data',
        Icon: FileSpreadsheet,
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        iconBgClass: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        bannerClass: 'from-emerald-500/15 via-teal-500/10 to-cyan-500/10',
        canInlinePreview: false,
    },
    document: {
        category: 'document',
        label: 'Dokumen Office',
        Icon: FileText,
        badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        iconBgClass: 'bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25',
        bannerClass: 'from-blue-500/15 via-indigo-500/10 to-cyan-500/10',
        canInlinePreview: false,
    },
    archive: {
        category: 'archive',
        label: 'Arsip Terkompresi',
        Icon: FileArchive,
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        iconBgClass: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
        bannerClass: 'from-amber-500/15 via-orange-500/10 to-yellow-500/10',
        canInlinePreview: false,
    },
    code: {
        category: 'code',
        label: 'Teks / Konfigurasi',
        Icon: FileCode2,
        badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        iconBgClass: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
        bannerClass: 'from-indigo-500/15 via-violet-500/10 to-slate-500/10',
        canInlinePreview: true,
    },
    other: {
        category: 'other',
        label: 'Berkas Proyek',
        Icon: Paperclip,
        badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
        iconBgClass: 'bg-slate-500/12 text-slate-600 dark:text-slate-400 border-slate-500/25',
        bannerClass: 'from-slate-500/15 via-slate-400/10 to-slate-600/10',
        canInlinePreview: false,
    },
};

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 20MB

export function resolveAttachmentUrl(att: Pick<PmsAttachment, 'preview_url' | 'file_url' | 'file_path'>): string {
    if (att.preview_url) {
        return att.preview_url;
    }

    if (att.file_url) {
        return att.file_url;
    }

    if (att.file_path?.startsWith('http://') || att.file_path?.startsWith('https://') || att.file_path?.startsWith('/')) {
        return att.file_path;
    }

    return `/storage/${att.file_path}`;
}

export function resolveAttachmentDownloadUrl(att: Pick<PmsAttachment, 'download_url' | 'preview_url' | 'file_url' | 'file_path'>): string {
    if (att.download_url) {
        return att.download_url;
    }

    return resolveAttachmentUrl(att);
}

export function getAttachmentExtension(fileName?: string | null, fileType?: string | null): string {
    if (fileName && fileName.includes('.')) {
        const ext = fileName.split('.').pop()?.trim().toLowerCase();

        if (ext) {
            return ext;
        }
    }

    return (fileType ?? '').replace(/^\./, '').trim().toLowerCase();
}

export function getAttachmentCategory(fileName?: string | null, fileType?: string | null): AttachmentCategory {
    const ext = getAttachmentExtension(fileName, fileType);

    if (IMAGE_EXTS.has(ext)) {
        return 'image';
    }

    if (PDF_EXTS.has(ext)) {
        return 'pdf';
    }

    if (VIDEO_EXTS.has(ext)) {
        return 'video';
    }

    if (AUDIO_EXTS.has(ext)) {
        return 'audio';
    }

    if (SPREADSHEET_EXTS.has(ext)) {
        return 'spreadsheet';
    }

    if (DOCUMENT_EXTS.has(ext)) {
        return 'document';
    }

    if (ARCHIVE_EXTS.has(ext)) {
        return 'archive';
    }

    if (CODE_EXTS.has(ext)) {
        return 'code';
    }

    return 'other';
}

export function getAttachmentStyleMeta(fileName?: string | null, fileType?: string | null): AttachmentStyleMeta {
    const category = getAttachmentCategory(fileName, fileType);

    return STYLE_MAP[category];
}

export function formatAttachmentSize(bytes?: number | null): string {
    if (!bytes || bytes <= 0) {
        return '0 KB';
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
