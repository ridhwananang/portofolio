import { ExternalLink, Maximize2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProjectItem {
    title: string;
    description: string;
    tags: string[];
    mockup_type: string;
    image: string;
    link?: string;
}

interface ProjectPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectItem | null;
}

export default function ProjectPreviewModal({
    isOpen,
    onClose,
    project,
}: ProjectPreviewModalProps) {
    if (!project) {
        return null;
    }

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '/images/finverra.png';
        return imagePath;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[90vh] w-[95vw] sm:max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/98 p-0 shadow-2xl backdrop-blur-xl md:rounded-[1.75rem] dark:border-blue-400/25 dark:bg-[#080e21]/98">
                <DialogDescription className="sr-only">
                    Pratinjau layar penuh proyek {project.title}
                </DialogDescription>

                {/* Top Specular Rim */}
                <div className="specular-top" />

                {/* Subtle Radiant Top Line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-500 opacity-90 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />

                {/* Header Section */}
                <div className="relative z-10 flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-5 py-3.5 dark:border-blue-400/15 dark:bg-[#0c162f]/80">
                    <div className="flex items-center gap-3 min-w-0 pr-8">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                                {project.title}
                            </DialogTitle>
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Full-Screen Visual Display */}
                <div className="relative flex w-full flex-1 items-center justify-center overflow-auto p-3 sm:p-5 bg-zinc-100/60 dark:bg-[#050a18]">
                    <img
                        src={getImageUrl(project.image)}
                        alt={project.title}
                        className="max-h-full max-w-full rounded-xl border border-zinc-200/80 object-contain shadow-2xl dark:border-blue-400/20"
                    />
                </div>

                {/* Footer Section */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 bg-white px-5 py-3 dark:border-blue-400/15 dark:bg-[#0c162f]/90">
                    <p className="max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {project.description}
                    </p>

                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="luxury-btn-primary flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold"
                        >
                            <span>Kunjungi Proyek</span>
                            <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
