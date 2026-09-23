import React, { useState, useEffect, useMemo, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
} from '@/components/ui/dialog';
import {
    Search,
    LayoutDashboard,
    Briefcase,
    Layers,
    Award,
    Mail,
    ShoppingBag,
    User,
    PlusCircle,
    ExternalLink,
    Calculator,
    Moon,
    Sun,
    ArrowRight,
    Command,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ElementType;
    group: 'Navigasi Studio' | 'Aksi Cepat' | 'Preferensi';
    keywords: string[];
    action: () => void;
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { appearance, updateAppearance } = useAppearance();
    const inputRef = useRef<HTMLInputElement>(null);

    const items: CommandItem[] = useMemo(
        () => [
            // Navigasi Studio
            {
                id: 'nav-dashboard',
                title: 'Dashboard Cockpit',
                description: 'Ringkasan metrik, pipeline order, dan studio hub',
                icon: LayoutDashboard,
                group: 'Navigasi Studio',
                keywords: ['dashboard', 'home', 'overview', 'ringkasan', 'metrik'],
                action: () => router.visit('/admin'),
            },
            {
                id: 'nav-projects',
                title: 'Portofolio Proyek',
                description: 'Kelola galeri karya, mockup, dan screenshot proyek',
                icon: Briefcase,
                group: 'Navigasi Studio',
                keywords: ['proyek', 'projects', 'portfolio', 'karya', 'showcase'],
                action: () => router.visit('/admin/projects'),
            },
            {
                id: 'nav-tech-stacks',
                title: 'Tech Stacks Matrix',
                description: 'Kelola bahasa pemrograman, framework, dan tools',
                icon: Layers,
                group: 'Navigasi Studio',
                keywords: ['tech', 'stack', 'teknologi', 'skills', 'keahlian'],
                action: () => router.visit('/admin/tech-stacks'),
            },
            {
                id: 'nav-certificates',
                title: 'Sertifikat & Lisensi',
                description: 'Dokumen kelulusan, lisensi, dan sertifikasi keahlian',
                icon: Award,
                group: 'Navigasi Studio',
                keywords: ['sertifikat', 'certificates', 'lisensi', 'kursus', 'dicoding'],
                action: () => router.visit('/admin/certificates'),
            },
            {
                id: 'nav-messages',
                title: 'Pesan Masuk & Kontak',
                description: 'Inbox pesan klien dan formulir kontak portofolio',
                icon: Mail,
                group: 'Navigasi Studio',
                keywords: ['pesan', 'messages', 'inbox', 'kontak', 'email'],
                action: () => router.visit('/admin/messages'),
            },
            {
                id: 'nav-orders',
                title: 'Order Layanan & Tracker',
                description: 'Pantau pesanan klien, progres, dan staging URL',
                icon: ShoppingBag,
                group: 'Navigasi Studio',
                keywords: ['order', 'pesanan', 'layanan', 'tracking', 'klien', 'staging'],
                action: () => router.visit('/admin/orders'),
            },
            {
                id: 'nav-profile',
                title: 'Profil Portofolio',
                description: 'Ubah bio, foto avatar, dan riwayat pendidikan',
                icon: User,
                group: 'Navigasi Studio',
                keywords: ['profil', 'profile', 'bio', 'pendidikan', 'avatar'],
                action: () => router.visit('/admin/profile'),
            },

            // Aksi Cepat
            {
                id: 'action-new-project',
                title: 'Tambah Proyek Baru',
                description: 'Unggah portofolio karya baru ke dalam galeri',
                icon: PlusCircle,
                group: 'Aksi Cepat',
                keywords: ['tambah', 'buat', 'new', 'project', 'proyek'],
                action: () => router.visit('/admin/projects/create'),
            },
            {
                id: 'action-new-cert',
                title: 'Tambah Sertifikat Baru',
                description: 'Unggah berkas sertifikat atau lisensi kursus baru',
                icon: PlusCircle,
                group: 'Aksi Cepat',
                keywords: ['tambah', 'sertifikat', 'certificate', 'lisensi'],
                action: () => router.visit('/admin/certificates/create'),
            },
            {
                id: 'action-view-public',
                title: 'Buka Web Portofolio Publik',
                description: 'Lihat tampilan portofolio langsung yang dilihat pengunjung',
                icon: ExternalLink,
                group: 'Aksi Cepat',
                keywords: ['public', 'web', 'portofolio', 'depan', 'lihat'],
                action: () => window.open('/', '_blank'),
            },
            {
                id: 'action-calculator',
                title: 'Buka Kalkulator Layanan',
                description: 'Pratinjau kalkulator estimasi biaya jasa pembuatan software',
                icon: Calculator,
                group: 'Aksi Cepat',
                keywords: ['kalkulator', 'layanan', 'jasa', 'harga', 'estimasi'],
                action: () => window.open('/layanan', '_blank'),
            },

            // Preferensi
            {
                id: 'pref-theme-toggle',
                title: appearance === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)',
                description: 'Sesuaikan kontras dan tampilan antarmuka studio',
                icon: appearance === 'dark' ? Sun : Moon,
                group: 'Preferensi',
                keywords: ['tema', 'dark', 'light', 'mode', 'gelap', 'terang'],
                action: () => updateAppearance(appearance === 'dark' ? 'light' : 'dark'),
            },
        ],
        [appearance, updateAppearance]
    );

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.keywords.some((k) => k.toLowerCase().includes(q))
        );
    }, [items, search]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    filteredItems[selectedIndex].action();
                    onOpenChange(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, filteredItems, selectedIndex, onOpenChange]);

    const handleSelect = (item: CommandItem) => {
        item.action();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogContent className="fixed top-[20%] left-[50%] z-50 w-full max-w-2xl translate-x-[-50%] p-0 rounded-2xl border border-sidebar-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    {/* Header search bar */}
                    <div className="flex items-center px-4 py-3.5 border-b border-sidebar-border/60 bg-muted/20 gap-3">
                        <Search className="size-5 text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Ketik perintah, nama halaman, atau aksi cepat..."
                            className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground text-foreground"
                            autoFocus
                        />
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-muted border border-sidebar-border text-muted-foreground">
                            ESC
                        </kbd>
                    </div>

                    {/* Results list */}
                    <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-sidebar-border/40">
                        {filteredItems.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Tidak ada perintah atau modul yang cocok dengan "{search}".
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredItems.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                                                isSelected
                                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                                                    : 'hover:bg-muted/40 text-foreground'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`p-2 rounded-lg shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-muted text-muted-foreground group-hover:text-foreground'
                                                    }`}
                                                >
                                                    <Icon className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p
                                                        className={`text-sm font-semibold truncate ${
                                                            isSelected ? 'text-white' : 'text-foreground'
                                                        }`}
                                                    >
                                                        {item.title}
                                                    </p>
                                                    {item.description && (
                                                        <p
                                                            className={`text-xs truncate ${
                                                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span
                                                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                                        isSelected
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.group}
                                                </span>
                                                <ArrowRight
                                                    className={`size-3.5 transition-transform ${
                                                        isSelected
                                                            ? 'translate-x-0.5 text-white'
                                                            : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground'
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer HUD info */}
                    <div className="px-4 py-2.5 border-t border-sidebar-border/60 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1">
                                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-sidebar-border text-[10px]">↑↓</kbd> Navigasi
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-sidebar-border text-[10px]">↵</kbd> Pilih
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-sidebar-border text-[10px]">ESC</kbd> Batal
                            </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Command className="size-3" />
                            <span>Ridhwan Studio</span>
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
