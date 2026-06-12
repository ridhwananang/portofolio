import { ExternalLink, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface CertificatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string | null;
    title: string | null;
}

export default function CertificatePreviewModal({
    isOpen,
    onClose,
    fileUrl,
    title,
}: CertificatePreviewModalProps) {
    if (!fileUrl) {
        return null;
    }

    // Detect if the file is a PDF
    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[92vh] w-[120vh] flex-col overflow-hidden rounded-2xl border-slate-200/50 bg-white/95 p-0 shadow-2xl backdrop-blur-md md:rounded-[2rem] dark:border-slate-800/80 dark:bg-slate-950/95">
                {/* Header Section */}
                <div className="dark:border-slate-850 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                        <div className="text-violet-650 rounded-xl bg-violet-100 p-2 dark:bg-violet-950/50 dark:text-violet-400">
                            <Eye size={18} />
                        </div>
                        <DialogTitle className="max-w-[50vw] truncate text-sm font-extrabold text-slate-900 md:max-w-[60vw] md:text-base dark:text-white">
                            Preview: {title}
                        </DialogTitle>
                    </div>

                    {/* Action buttons (Download, Open in New Tab) */}
                    <div className="mr-8 flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download
                            className="hover:bg-slate-150/60 flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Unduh Sertifikat"
                        >
                            <Download size={16} />
                        </a>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-slate-150/60 flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Buka di Tab Baru"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>

                {/* Main Preview Container */}
                <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-slate-100/50 dark:bg-slate-900/30">
                    {isPdf ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0&navpanes=0`}
                            className="h-full w-full border-0 bg-white dark:bg-slate-900"
                            title={`Sertifikat ${title}`}
                        />
                    ) : (
                        <div className="flex h-full max-h-full w-full items-center justify-center overflow-auto p-6">
                            <img
                                src={fileUrl}
                                alt={`Sertifikat ${title}`}
                                className="max-h-full max-w-full rounded-lg border border-slate-200/50 object-contain shadow-md dark:border-slate-800"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
