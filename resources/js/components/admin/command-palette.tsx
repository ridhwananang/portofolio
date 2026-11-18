import { router, usePage } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    ArrowRight,
    Award,
    BarChart3,
    Briefcase,
    Calculator,
    CalendarDays,
    CheckSquare,
    Code2,
    Coins,
    Command,
    CornerDownLeft,
    FolderKanban,
    Globe,
    History,
    Laptop,
    LayoutDashboard,
    Mail,
    Moon,
    PlusCircle,
    Search,
    ShoppingBag,
    Sparkles,
    Sun,
    UserCheck,
    Users,
    X,
    Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn, resolvePublicWebUrl } from '@/lib/utils';
import type { Auth } from '@/types';

type CommandGroup =
    | 'Project Management (PMS)'
    | 'Navigasi Studio'
    | 'Aksi Cepat'
    | 'Preferensi';

type GroupFilter = 'Semua' | CommandGroup;

interface CommandItem {
    id: string;
    title: string;
    description: string;
    pathHint?: string;
    matchPath?: string;
    icon: React.ElementType;
    group: CommandGroup;
    keywords: string[];
    action: () => void;
    actionLabel?: string;
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const GROUP_META: Record<
    CommandGroup,
    {
        shortLabel: string;
        dotClass: string;
        iconClass: string;
        badgeClass: string;
    }
> = {
    'Project Management (PMS)': {
        shortLabel: 'PMS Suite',
        dotClass: 'bg-cyan-500',
        iconClass:
            'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/25',
        badgeClass:
            'text-cyan-700 bg-cyan-50 border-cyan-200/80 dark:text-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-400/20',
    },
    'Navigasi Studio': {
        shortLabel: 'Studio Hub',
        dotClass: 'bg-violet-500',
        iconClass:
            'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/25',
        badgeClass:
            'text-violet-700 bg-violet-50 border-violet-200/80 dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-400/20',
    },
    'Aksi Cepat': {
        shortLabel: 'Aksi Cepat',
        dotClass: 'bg-emerald-500',
        iconClass:
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
        badgeClass:
            'text-emerald-700 bg-emerald-50 border-emerald-200/80 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-400/20',
    },
    Preferensi: {
        shortLabel: 'Preferensi',
        dotClass: 'bg-amber-500',
        iconClass:
            'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/25',
        badgeClass:
            'text-amber-700 bg-amber-50 border-amber-200/80 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-400/20',
    },
};

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
    const clean = query.trim();

    if (!clean) {
        return <>{text}</>;
    }

    const regex = new RegExp(`(${escapeRegExp(clean)})`, 'ig');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, idx) =>
                part.toLowerCase() === clean.toLowerCase() ? (
                    <mark
                        key={idx}
                        className="rounded-sm bg-violet-500/18 px-0.5 font-semibold text-violet-700 dark:bg-violet-400/25 dark:text-violet-200"
                    >
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                ),
            )}
        </>
    );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const page = usePage<{ auth?: Auth; mainWebUrl?: string }>();
    const isAdmin = Boolean(page.props.auth?.user?.is_admin);
    const mainWebUrl = page.props.mainWebUrl;
    const currentPath = (page.url || '').split('?')[0];

    const [search, setSearch] = useState('');
    const [activeGroup, setActiveGroup] = useState<GroupFilter>('Semua');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { appearance, resolvedAppearance, updateAppearance } = useAppearance();
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const handleClose = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const handleDialogOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setSearch('');
                setActiveGroup('Semua');
                setSelectedIndex(0);
            }

            onOpenChange(nextOpen);
        },
        [onOpenChange],
    );

    const items: CommandItem[] = useMemo(() => {
        const pmsItems: CommandItem[] = isAdmin
            ? [
                  {
                      id: 'nav-pms-dashboard',
                      title: 'PMS Cockpit & Health',
                      description:
                          'Pusat komando metrik proyek, progres sprint, & status workload',
                      pathHint: '/studio/pms',
                      matchPath: '/studio/pms',
                      icon: BarChart3,
                      group: 'Project Management (PMS)',
                      keywords: [
                          'pms',
                          'cockpit',
                          'health',
                          'overview',
                          'metrik',
                      ],
                      action: () => router.visit('/studio/pms'),
                  },
                  {
                      id: 'nav-pms-projects',
                      title: 'Manajemen Proyek PMS',
                      description:
                          'Daftar proyek aktif, cetak biru teknis, portal klien, & deliverables',
                      pathHint: '/studio/pms/projects',
                      matchPath: '/studio/pms/projects',
                      icon: FolderKanban,
                      group: 'Project Management (PMS)',
                      keywords: [
                          'proyek',
                          'projects',
                          'managed',
                          'client',
                          'blueprint',
                      ],
                      action: () => router.visit('/studio/pms/projects'),
                  },
                  {
                      id: 'nav-pms-sprints',
                      title: 'Siklus Sprint (Sprint Cycles)',
                      description:
                          'Atur periode sprint, backlog target, & ritme rilis tim',
                      pathHint: '/studio/pms/sprints',
                      matchPath: '/studio/pms/sprints',
                      icon: Zap,
                      group: 'Project Management (PMS)',
                      keywords: ['sprint', 'cycles', 'iterasi', 'milestone'],
                      action: () => router.visit('/studio/pms/sprints'),
                  },
                  {
                      id: 'nav-pms-tasks',
                      title: 'Kanban Board & Tugas',
                      description:
                          'Papan tugas agile, status workflow, PIC, & checklist subtask',
                      pathHint: '/studio/pms/tasks',
                      matchPath: '/studio/pms/tasks',
                      icon: CheckSquare,
                      group: 'Project Management (PMS)',
                      keywords: [
                          'kanban',
                          'tasks',
                          'tugas',
                          'board',
                          'subtask',
                      ],
                      action: () => router.visit('/studio/pms/tasks'),
                  },
                  {
                      id: 'nav-pms-timeline',
                      title: 'Interactive Timeline (Gantt)',
                      description:
                          'Visualisasi roadmap proyek, jadwal sprint, & dependensi tanggal',
                      pathHint: '/studio/pms/timeline',
                      matchPath: '/studio/pms/timeline',
                      icon: CalendarDays,
                      group: 'Project Management (PMS)',
                      keywords: [
                          'timeline',
                          'gantt',
                          'roadmap',
                          'jadwal',
                          'schedule',
                      ],
                      action: () => router.visit('/studio/pms/timeline'),
                  },
                  {
                      id: 'nav-pms-finances',
                      title: 'Keuangan & Anggaran Proyek',
                      description:
                          'Catatan termin masuk, margin proyek, & pengeluaran operasional',
                      pathHint: '/studio/pms/finances',
                      matchPath: '/studio/pms/finances',
                      icon: Coins,
                      group: 'Project Management (PMS)',
                      keywords: [
                          'finance',
                          'keuangan',
                          'budget',
                          'anggaran',
                          'termin',
                          'expense',
                      ],
                      action: () => router.visit('/studio/pms/finances'),
                  },
                  {
                      id: 'nav-pms-team',
                      title: 'Tim & Pengguna Dinamis',
                      description:
                          'Kelola anggota tim, role engineering, dan hak akses studio',
                      pathHint: '/studio/users',
                      matchPath: '/studio/users',
                      icon: Users,
                      group: 'Project Management (PMS)',
                      keywords: ['users', 'tim', 'anggota', 'role', 'pengguna'],
                      action: () => router.visit('/studio/users'),
                  },
                  {
                      id: 'nav-pms-logs',
                      title: 'Audit & Log Aktivitas',
                      description:
                          'Jejak riwayat perubahan task, sprint, proyek, & file',
                      pathHint: '/studio/pms/activity-logs',
                      matchPath: '/studio/pms/activity-logs',
                      icon: History,
                      group: 'Project Management (PMS)',
                      keywords: ['audit', 'activity', 'log', 'riwayat'],
                      action: () => router.visit('/studio/pms/activity-logs'),
                  },
              ]
            : [
                  {
                      id: 'member-pms-cockpit',
                      title: 'PMS Cockpit',
                      description:
                          'Ringkasan workspace & tugas proyek yang ditugaskan',
                      pathHint: '/studio',
                      matchPath: '/studio',
                      icon: BarChart3,
                      group: 'Project Management (PMS)',
                      keywords: ['cockpit', 'dashboard', 'home', 'pms'],
                      action: () => router.visit('/studio'),
                  },
                  {
                      id: 'member-pms-projects',
                      title: 'Proyek Saya',
                      description:
                          'Daftar workspace proyek aktif & detail cetak biru tim',
                      pathHint: '/studio/pms/projects',
                      matchPath: '/studio/pms/projects',
                      icon: FolderKanban,
                      group: 'Project Management (PMS)',
                      keywords: ['proyek', 'projects', 'workspace'],
                      action: () => router.visit('/studio/pms/projects'),
                  },
                  {
                      id: 'member-pms-tasks',
                      title: 'Jobdesk & Tugas',
                      description:
                          'Papan kanban tugas, checklist subtask, & unggah bukti kerja',
                      pathHint: '/studio/pms/tasks',
                      matchPath: '/studio/pms/tasks',
                      icon: CheckSquare,
                      group: 'Project Management (PMS)',
                      keywords: ['kanban', 'tasks', 'jobdesk', 'tugas'],
                      action: () => router.visit('/studio/pms/tasks'),
                  },
                  {
                      id: 'member-pms-sprints',
                      title: 'Siklus Sprint',
                      description:
                          'Pantau periode sprint aktif & progres penyelesaian target',
                      pathHint: '/studio/pms/sprints',
                      matchPath: '/studio/pms/sprints',
                      icon: Zap,
                      group: 'Project Management (PMS)',
                      keywords: ['sprint', 'cycles', 'target'],
                      action: () => router.visit('/studio/pms/sprints'),
                  },
                  {
                      id: 'member-pms-timeline',
                      title: 'Interactive Timeline',
                      description:
                          'Visualisasi jadwal proyek & roadmap Gantt tim',
                      pathHint: '/studio/pms/timeline',
                      matchPath: '/studio/pms/timeline',
                      icon: CalendarDays,
                      group: 'Project Management (PMS)',
                      keywords: ['timeline', 'gantt', 'jadwal'],
                      action: () => router.visit('/studio/pms/timeline'),
                  },
                  {
                      id: 'member-pms-logs',
                      title: 'Audit & Log Aktivitas',
                      description:
                          'Riwayat perubahan progres & aktivitas di workspace Anda',
                      pathHint: '/studio/pms/activity-logs',
                      matchPath: '/studio/pms/activity-logs',
                      icon: History,
                      group: 'Project Management (PMS)',
                      keywords: ['audit', 'log', 'aktivitas'],
                      action: () => router.visit('/studio/pms/activity-logs'),
                  },
              ];

        const studioNavItems: CommandItem[] = isAdmin
            ? [
                  {
                      id: 'nav-dashboard',
                      title: 'Studio Cockpit',
                      description:
                          'Ringkasan metrik studio, pipeline order, & performa utama',
                      pathHint: '/studio',
                      matchPath: '/studio',
                      icon: LayoutDashboard,
                      group: 'Navigasi Studio',
                      keywords: [
                          'dashboard',
                          'cockpit',
                          'home',
                          'overview',
                          'ringkasan',
                      ],
                      action: () => router.visit('/studio'),
                  },
                  {
                      id: 'nav-orders',
                      title: 'Order Layanan & Tracker',
                      description:
                          'Pantau pesanan klien, pembayaran rekber, & URL staging',
                      pathHint: '/studio/orders',
                      matchPath: '/studio/orders',
                      icon: ShoppingBag,
                      group: 'Navigasi Studio',
                      keywords: [
                          'order',
                          'pesanan',
                          'rekber',
                          'tracking',
                          'klien',
                      ],
                      action: () => router.visit('/studio/orders'),
                  },
                  {
                      id: 'nav-services',
                      title: 'Kelola Paket Layanan',
                      description:
                          'Atur katalog layanan software, estimasi harga, & add-on',
                      pathHint: '/studio/services',
                      matchPath: '/studio/services',
                      icon: Calculator,
                      group: 'Navigasi Studio',
                      keywords: ['layanan', 'services', 'harga', 'paket'],
                      action: () => router.visit('/studio/services'),
                  },
                  {
                      id: 'nav-messages',
                      title: 'Pesan Masuk & Kontak',
                      description:
                          'Kotak masuk pertanyaan klien dari halaman depan portofolio',
                      pathHint: '/studio/messages',
                      matchPath: '/studio/messages',
                      icon: Mail,
                      group: 'Navigasi Studio',
                      keywords: ['pesan', 'messages', 'inbox', 'kontak'],
                      action: () => router.visit('/studio/messages'),
                  },
                  {
                      id: 'nav-projects',
                      title: 'Portofolio Proyek',
                      description:
                          'Kelola galeri karya publik, deskripsi, & mockup tampilan',
                      pathHint: '/studio/projects',
                      matchPath: '/studio/projects',
                      icon: Briefcase,
                      group: 'Navigasi Studio',
                      keywords: [
                          'portofolio',
                          'portfolio',
                          'karya',
                          'showcase',
                      ],
                      action: () => router.visit('/studio/projects'),
                  },
                  {
                      id: 'nav-tech-stacks',
                      title: 'Tech Stacks Matrix',
                      description:
                          'Kelola daftar bahasa, framework, & tools penguasaan studio',
                      pathHint: '/studio/tech-stacks',
                      matchPath: '/studio/tech-stacks',
                      icon: Code2,
                      group: 'Navigasi Studio',
                      keywords: [
                          'tech',
                          'stack',
                          'teknologi',
                          'skills',
                          'keahlian',
                      ],
                      action: () => router.visit('/studio/tech-stacks'),
                  },
                  {
                      id: 'nav-certificates',
                      title: 'Sertifikat & Lisensi',
                      description:
                          'Arsip sertifikasi profesional, pelatihan, & kredensial',
                      pathHint: '/studio/certificates',
                      matchPath: '/studio/certificates',
                      icon: Award,
                      group: 'Navigasi Studio',
                      keywords: [
                          'sertifikat',
                          'certificates',
                          'lisensi',
                          'kursus',
                      ],
                      action: () => router.visit('/studio/certificates'),
                  },
                  {
                      id: 'nav-profile',
                      title: 'Profil & Bio Portofolio',
                      description:
                          'Sunting profil studio, bio ringkas, avatar, & pendidikan',
                      pathHint: '/studio/profile',
                      matchPath: '/studio/profile',
                      icon: UserCheck,
                      group: 'Navigasi Studio',
                      keywords: ['profil', 'profile', 'bio', 'avatar'],
                      action: () => router.visit('/studio/profile'),
                  },
              ]
            : [];

        const quickActions: CommandItem[] = [
            ...(isAdmin
                ? [
                      {
                          id: 'action-new-pms-project',
                          title: 'Inisialisasi Proyek PMS Baru',
                          description:
                              'Buka wizard pembuatan proyek, cetak biru teknis, tim, & sprint awal',
                          pathHint: 'Wizard Baru',
                          matchPath: '/studio/pms/projects/create',
                          icon: Sparkles,
                          group: 'Aksi Cepat' as const,
                          keywords: [
                              'buat pms',
                              'new pms',
                              'inisialisasi',
                              'wizard',
                              'proyek baru',
                          ],
                          action: () =>
                              router.visit('/studio/pms/projects/create'),
                          actionLabel: 'Buka Wizard',
                      },
                      {
                          id: 'action-new-project',
                          title: 'Tambah Karya Portofolio Baru',
                          description:
                              'Publikasikan studi kasus & screenshot proyek baru ke galeri',
                          pathHint: 'Create Showcase',
                          matchPath: '/studio/projects/create',
                          icon: PlusCircle,
                          group: 'Aksi Cepat' as const,
                          keywords: [
                              'tambah karya',
                              'new project',
                              'portofolio baru',
                          ],
                          action: () => router.visit('/studio/projects/create'),
                          actionLabel: 'Buat',
                      },
                      {
                          id: 'action-new-cert',
                          title: 'Tambah Sertifikat & Lisensi',
                          description:
                              'Unggah dokumen sertifikasi atau pencapaian terverifikasi baru',
                          pathHint: 'Upload Kredensial',
                          matchPath: '/studio/certificates/create',
                          icon: PlusCircle,
                          group: 'Aksi Cepat' as const,
                          keywords: [
                              'tambah sertifikat',
                              'new certificate',
                              'lisensi',
                          ],
                          action: () =>
                              router.visit('/studio/certificates/create'),
                          actionLabel: 'Tambah',
                      },
                  ]
                : []),
            {
                id: 'action-view-public',
                title: 'Buka Web Portofolio Publik',
                description:
                    'Pratinjau halaman utama portofolio langsung di tab browser baru',
                pathHint: 'Tab Baru',
                icon: Globe,
                group: 'Aksi Cepat',
                keywords: ['public', 'web', 'portofolio', 'depan', 'live'],
                action: () =>
                    window.open(
                        resolvePublicWebUrl(mainWebUrl),
                        '_blank',
                        'noopener,noreferrer',
                    ),
                actionLabel: 'Buka Tab',
            },
            {
                id: 'action-calculator',
                title: 'Buka Kalkulator Estimasi Layanan',
                description:
                    'Pratinjau kalkulator simulasi harga jasa pembuatan software',
                pathHint: 'Tab Baru',
                icon: Calculator,
                group: 'Aksi Cepat',
                keywords: ['kalkulator', 'layanan', 'jasa', 'harga', 'estimasi'],
                action: () =>
                    window.open(
                        resolvePublicWebUrl(mainWebUrl, '/layanan'),
                        '_blank',
                        'noopener,noreferrer',
                    ),
                actionLabel: 'Buka Tab',
            },
        ];

        const prefItems: CommandItem[] = [
            {
                id: 'pref-theme-toggle',
                title:
                    resolvedAppearance === 'dark'
                        ? 'Beralih ke Mode Terang (Light Mode)'
                        : 'Beralih ke Mode Gelap (Dark Mode)',
                description:
                    'Ubah tema tampilan antarmuka studio secara instan',
                pathHint:
                    resolvedAppearance === 'dark' ? 'Saat ini: Dark' : 'Saat ini: Light',
                icon: resolvedAppearance === 'dark' ? Sun : Moon,
                group: 'Preferensi',
                keywords: ['tema', 'theme', 'dark', 'light', 'gelap', 'terang'],
                action: () =>
                    updateAppearance(
                        resolvedAppearance === 'dark' ? 'light' : 'dark',
                    ),
                actionLabel: 'Terapkan',
            },
            {
                id: 'pref-theme-system',
                title: 'Ikuti Tema Sistem (System Default)',
                description:
                    'Sinkronkan mode terang/gelap otomatis dengan pengaturan OS',
                pathHint:
                    appearance === 'system' ? 'Aktif' : 'Otomatis OS',
                icon: Laptop,
                group: 'Preferensi',
                keywords: ['system', 'sistem', 'auto', 'tema'],
                action: () => updateAppearance('system'),
                actionLabel: 'Terapkan',
            },
        ];

        return [...pmsItems, ...studioNavItems, ...quickActions, ...prefItems];
    }, [appearance, isAdmin, mainWebUrl, resolvedAppearance, updateAppearance]);

    const availableGroups: GroupFilter[] = useMemo(() => {
        const present = new Set<CommandGroup>(items.map((item) => item.group));
        const ordered: CommandGroup[] = [
            'Project Management (PMS)',
            'Navigasi Studio',
            'Aksi Cepat',
            'Preferensi',
        ];

        return ['Semua', ...ordered.filter((g) => present.has(g))];
    }, [items]);

    const searchMatchedItems = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) {
return items;
}

        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.group.toLowerCase().includes(q) ||
                item.pathHint?.toLowerCase().includes(q) ||
                item.keywords.some((k) => k.toLowerCase().includes(q)),
        );
    }, [items, search]);

    const groupCounts = useMemo(() => {
        const counts: Record<string, number> = {
            Semua: searchMatchedItems.length,
        };

        for (const item of searchMatchedItems) {
            counts[item.group] = (counts[item.group] ?? 0) + 1;
        }

        return counts;
    }, [searchMatchedItems]);

    const filteredItems = useMemo(() => {
        if (activeGroup === 'Semua') {
return searchMatchedItems;
}

        return searchMatchedItems.filter((item) => item.group === activeGroup);
    }, [activeGroup, searchMatchedItems]);

    const groupedSections = useMemo(() => {
        const order: CommandGroup[] = [
            'Project Management (PMS)',
            'Navigasi Studio',
            'Aksi Cepat',
            'Preferensi',
        ];

        const sections: Array<{
            group: CommandGroup;
            items: Array<{ item: CommandItem; flatIndex: number }>;
        }> = [];

        let flatCounter = 0;

        for (const group of order) {
            const matching = filteredItems.filter((i) => i.group === group);

            if (matching.length === 0) {
continue;
}

            sections.push({
                group,
                items: matching.map((item) => ({
                    item,
                    flatIndex: flatCounter++,
                })),
            });
        }

        return sections;
    }, [filteredItems]);

    const safeSelectedIndex =
        filteredItems.length === 0
            ? 0
            : Math.min(selectedIndex, filteredItems.length - 1);

    const handleSelect = useCallback(
        (item: CommandItem) => {
            item.action();
            handleDialogOpenChange(false);
        },
        [handleDialogOpenChange],
    );

    // Ensure focus lands on input cleanly when opened
    useEffect(() => {
        if (!open) {
return;
}

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 10);

        return () => window.clearTimeout(timer);
    }, [open]);

    // Auto-scroll highlighted command into view during keyboard navigation
    useEffect(() => {
        if (!open || filteredItems.length === 0) {
return;
}

        const activeItem = filteredItems[safeSelectedIndex];

        if (!activeItem) {
return;
}

        const el = itemRefs.current[activeItem.id];
        el?.scrollIntoView({ block: 'nearest' });
    }, [open, filteredItems, safeSelectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();

            if (filteredItems.length === 0) {
return;
}

            setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();

            if (filteredItems.length === 0) {
return;
}

            setSelectedIndex(
                (prev) =>
                    (prev - 1 + filteredItems.length) % filteredItems.length,
            );
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentGroupIdx = availableGroups.indexOf(activeGroup);
            const direction = e.shiftKey ? -1 : 1;
            const nextIdx =
                (currentGroupIdx + direction + availableGroups.length) %
                availableGroups.length;
            setActiveGroup(availableGroups[nextIdx]);
            setSelectedIndex(0);
        } else if (e.key === 'Enter') {
            const activeItem = filteredItems[safeSelectedIndex];

            if (activeItem) {
                e.preventDefault();
                handleSelect(activeItem);
            }
        }
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={handleDialogOpenChange}>
            <DialogPrimitive.Portal>
                {/* Frosted Backdrop Overlay */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-md transition-opacity duration-200 dark:bg-black/65 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Top-Docked Spotlight Frame */}
                <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-3 pt-2.5 sm:px-6 sm:pt-3.5 md:pt-4">
                    <DialogPrimitive.Content
                        onKeyDown={handleKeyDown}
                        className="pointer-events-auto relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_28px_80px_-14px_rgba(15,23,42,0.26),0_0_0_1px_rgba(124,58,237,0.08)] backdrop-blur-2xl focus:outline-none sm:rounded-[22px] dark:border-white/[0.11] dark:bg-[#0B1222]/95 dark:shadow-[0_32px_96px_-12px_rgba(0,0,0,0.88),0_0_0_1px_rgba(139,92,246,0.2)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] duration-200"
                    >
                        <DialogPrimitive.Title className="sr-only">
                            Command Palette Ridhwan Studio
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="sr-only">
                            Pencarian cepat navigasi studio, modul PMS, dan aksi
                            kilat.
                        </DialogPrimitive.Description>

                        {/* Top Specular Luxury Hairline */}
                        <div className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent dark:via-cyan-400/70" />

                        {/* Ambient Top Glow */}
                        <div className="pointer-events-none absolute -top-20 left-1/2 h-32 w-2/3 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/12 to-cyan-500/10 blur-3xl dark:from-violet-500/15 dark:via-indigo-500/15 dark:to-cyan-400/15" />

                        {/* Search Header */}
                        <div className="relative flex items-center gap-3 border-b border-slate-200/80 bg-slate-50/60 px-4 py-3.5 sm:px-5 dark:border-white/[0.08] dark:bg-slate-900/50">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/12 to-indigo-600/12 text-violet-600 shadow-2xs dark:border-violet-400/25 dark:from-violet-500/20 dark:to-indigo-500/20 dark:text-violet-300">
                                <Search className="size-4.5" />
                            </div>

                            <input
                                ref={inputRef}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Ketik perintah, modul PMS, navigasi studio, atau aksi cepat..."
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px] dark:text-white dark:placeholder:text-slate-500"
                            />

                            <div className="flex shrink-0 items-center gap-1.5">
                                {search.trim().length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedIndex(0);
                                            inputRef.current?.focus();
                                        }}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        <X className="size-3" />
                                        <span className="hidden sm:inline">
                                            Reset
                                        </span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    title="Tutup (ESC)"
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-500 shadow-2xs transition-all hover:border-violet-400/50 hover:text-slate-800 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:border-violet-400/40 dark:hover:text-white"
                                >
                                    <span>ESC</span>
                                </button>
                            </div>
                        </div>

                        {/* Category Filter Strip */}
                        <div className="relative flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/70 bg-white/60 px-4 py-2 scrollbar-none sm:px-5 dark:border-white/[0.06] dark:bg-slate-950/35">
                            {availableGroups.map((group) => {
                                const isActive = activeGroup === group;
                                const count = groupCounts[group] ?? 0;
                                const label =
                                    group === 'Semua'
                                        ? 'Semua Fitur'
                                        : GROUP_META[group].shortLabel;

                                return (
                                    <button
                                        key={group}
                                        type="button"
                                        onClick={() => {
                                            setActiveGroup(group);
                                            setSelectedIndex(0);
                                            inputRef.current?.focus();
                                        }}
                                        className={cn(
                                            'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150',
                                            isActive
                                                ? 'border-violet-600/30 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25 dark:border-violet-400/30 dark:from-violet-500 dark:to-indigo-500'
                                                : 'border-slate-200/80 bg-slate-100/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-200',
                                        )}
                                    >
                                        {group !== 'Semua' && (
                                            <span
                                                className={cn(
                                                    'size-1.5 rounded-full',
                                                    isActive
                                                        ? 'bg-white'
                                                        : GROUP_META[group]
                                                              .dotClass,
                                                )}
                                            />
                                        )}
                                        <span>{label}</span>
                                        <span
                                            className={cn(
                                                'rounded-full px-1.5 py-0 text-[10px] font-mono',
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-200/80 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400',
                                            )}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Grouped Results List */}
                        <div className="max-h-[min(60vh,460px)] overflow-y-auto px-2.5 py-2.5 scrollbar-sleek sm:px-3.5">
                            {filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                    <div className="mb-3 flex size-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100/80 text-slate-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-500">
                                        <Search className="size-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Tidak ada hasil untuk &ldquo;{search}
                                        &rdquo;
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Coba kata kunci lain seperti{' '}
                                        <span className="font-mono text-violet-600 dark:text-violet-400">
                                            sprint
                                        </span>
                                        ,{' '}
                                        <span className="font-mono text-violet-600 dark:text-violet-400">
                                            kanban
                                        </span>
                                        , atau{' '}
                                        <span className="font-mono text-violet-600 dark:text-violet-400">
                                            tema
                                        </span>
                                        .
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {groupedSections.map((section) => {
                                        const meta = GROUP_META[section.group];

                                        return (
                                            <div key={section.group}>
                                                <div className="mb-1.5 flex items-center gap-2 px-2">
                                                    <span
                                                        className={cn(
                                                            'size-1.5 rounded-full',
                                                            meta.dotClass,
                                                        )}
                                                    />
                                                    <span className="text-[10.5px] font-bold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
                                                        {section.group}
                                                    </span>
                                                    <div className="h-px flex-1 bg-slate-200/70 dark:bg-white/[0.06]" />
                                                </div>

                                                <div className="space-y-1">
                                                    {section.items.map(
                                                        ({
                                                            item,
                                                            flatIndex,
                                                        }) => {
                                                            const Icon =
                                                                item.icon;
                                                            const isSelected =
                                                                flatIndex ===
                                                                safeSelectedIndex;
                                                            const isCurrentRoute =
                                                                Boolean(
                                                                    item.matchPath &&
                                                                        currentPath ===
                                                                            item.matchPath,
                                                                );

                                                            return (
                                                                <button
                                                                    key={item.id}
                                                                    ref={(
                                                                        el,
                                                                    ) => {
                                                                        itemRefs.current[
                                                                            item.id
                                                                        ] = el;
                                                                    }}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleSelect(
                                                                            item,
                                                                        )
                                                                    }
                                                                    onMouseEnter={() =>
                                                                        setSelectedIndex(
                                                                            flatIndex,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
                                                                        isSelected
                                                                            ? 'border-violet-300/90 bg-gradient-to-r from-violet-50 via-indigo-50/75 to-white shadow-[0_6px_18px_-6px_rgba(124,58,237,0.22)] dark:border-violet-400/35 dark:from-violet-500/18 dark:via-indigo-500/12 dark:to-slate-900/60 dark:shadow-[0_6px_22px_-6px_rgba(139,92,246,0.32)]'
                                                                            : 'border-transparent hover:border-slate-200/70 hover:bg-slate-50/80 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]',
                                                                    )}
                                                                >
                                                                    {/* Left active vertical bar */}
                                                                    {isSelected && (
                                                                        <span className="absolute top-2 bottom-2 left-0.5 w-[3px] rounded-full bg-gradient-to-b from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-cyan-400" />
                                                                    )}

                                                                    <div className="flex min-w-0 items-center gap-3">
                                                                        <div
                                                                            className={cn(
                                                                                'flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-150',
                                                                                isSelected
                                                                                    ? 'border-transparent bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                                                                                    : meta.iconClass,
                                                                            )}
                                                                        >
                                                                            <Icon className="size-4" />
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <p
                                                                                    className={cn(
                                                                                        'truncate text-sm font-semibold',
                                                                                        isSelected
                                                                                            ? 'text-slate-950 dark:text-white'
                                                                                            : 'text-slate-800 dark:text-slate-200',
                                                                                    )}
                                                                                >
                                                                                    <HighlightMatch
                                                                                        text={
                                                                                            item.title
                                                                                        }
                                                                                        query={
                                                                                            search
                                                                                        }
                                                                                    />
                                                                                </p>
                                                                                {isCurrentRoute && (
                                                                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-semibold text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300">
                                                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                                                        Aktif
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                                                                <HighlightMatch
                                                                                    text={
                                                                                        item.description
                                                                                    }
                                                                                    query={
                                                                                        search
                                                                                    }
                                                                                />
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex shrink-0 items-center gap-2 pl-2">
                                                                        {item.pathHint && (
                                                                            <span
                                                                                className={cn(
                                                                                    'hidden rounded-md border px-2 py-0.5 font-mono text-[10.5px] sm:inline-flex',
                                                                                    isSelected
                                                                                        ? 'border-violet-300/80 bg-white/80 text-violet-700 dark:border-violet-400/30 dark:bg-slate-900/80 dark:text-violet-300'
                                                                                        : 'border-slate-200/80 bg-slate-100/80 text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-400',
                                                                                )}
                                                                            >
                                                                                {
                                                                                    item.pathHint
                                                                                }
                                                                            </span>
                                                                        )}

                                                                        {isSelected ? (
                                                                            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-1 text-[11px] font-semibold text-white shadow-xs">
                                                                                <CornerDownLeft className="size-3" />
                                                                                <span className="hidden xs:inline">
                                                                                    {item.actionLabel ??
                                                                                        'Buka'}
                                                                                </span>
                                                                            </span>
                                                                        ) : (
                                                                            <ArrowRight className="size-3.5 -translate-x-1 text-slate-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-500" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Luxury Footer HUD */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5 dark:border-white/[0.07] dark:bg-slate-900/60 dark:text-slate-400">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <span className="inline-flex items-center gap-1.5">
                                    <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                                        ↑↓
                                    </kbd>
                                    <span>Navigasi</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                                        Tab
                                    </kbd>
                                    <span>Kategori</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                                        ↵
                                    </kbd>
                                    <span>Eksekusi</span>
                                </span>
                                <span className="hidden items-center gap-1.5 sm:inline-flex">
                                    <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                                        ESC
                                    </kbd>
                                    <span>Tutup</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 font-mono text-[11px]">
                                <span className="text-slate-400 dark:text-slate-500">
                                    {filteredItems.length} perintah
                                </span>
                                <span className="h-3 w-px bg-slate-200 dark:bg-white/10" />
                                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    <Command className="size-3 text-violet-600 dark:text-violet-400" />
                                    <span>Ridhwan Studio</span>
                                </span>
                            </div>
                        </div>
                    </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
