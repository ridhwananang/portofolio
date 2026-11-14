import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { WordRichEditor, WordDocumentViewer } from '@/components/ui/word-rich-editor';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowDownLeft,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Coins,
    Copy,
    DollarSign,
    Download,
    ExternalLink,
    FileText,
    FileUp,
    FolderKanban,
    GitBranch,
    Globe,
    Layers,
    ListTodo,
    MoreVertical,
    Paperclip,
    Pencil,
    PenLine,
    PieChart,
    Play,
    Plus,
    Printer,
    Receipt,
    Share2,
    Shield,
    Sparkles,
    Tag,
    Target,
    Trash2,
    TrendingUp,
    UploadCloud,
    User,
    UserCheck,
    UserPlus,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsProject, PmsProjectMember, PmsSprint, PmsTask, PmsUser } from '@/types/pms';

interface Props {
    project: PmsProject;
    availableUsers: PmsUser[];
    is_admin?: boolean;
    user_role_in_project?: string | null;
    current_user_id?: number;
}

const DYNAMIC_ROLE_PRESETS = [
    'Lead Architect',
    'Fullstack Engineer',
    'Frontend Specialist',
    'Backend Engineer',
    'UI/UX Designer',
    'DevOps & Cloud',
    'QA & Automation',
    'Scrum Master',
    'Product Owner',
];

const SPRINT_NAME_PRESETS = [
    'Sprint 1 - Foundation',
    'Sprint 2 - Core Engine',
    'Sprint 3 - UI Integration',
    'Sprint 4 - QA & Deploy',
];

const TASK_TITLE_PRESETS = [
    'Setup DB Schema',
    'Slicing UI Dashboard',
    'Implement REST API',
    'Integrasi Payment',
    'Unit Testing & QA',
    'Deploy Staging',
];

const FINANCE_INCOME_PRESETS = [
    'Termin 1 (DP 50%)',
    'Termin 2 (Mid 30%)',
    'Termin 3 (Pelunasan)',
    'Addendum Fitur',
];

const FINANCE_EXPENSE_PRESETS = [
    'Sewa Cloud Server',
    'Lisensi Domain & SSL',
    'Aset Desain & UI Kit',
    'Honor Tenaga Ahli',
];

export default function ProjectShow({
    project,
    availableUsers,
    is_admin = true,
    user_role_in_project = null,
    current_user_id,
}: Props) {
    const [activeTab, setActiveTab] = useState<'blueprint' | 'sprints' | 'tasks' | 'reports' | 'team' | 'finances' | 'attachments' | 'logs'>(() => {
        if (typeof window !== 'undefined') {
            const tabParam = new URLSearchParams(window.location.search).get('tab');
            if (tabParam === 'reports' || tabParam === 'sprints' || tabParam === 'tasks' || tabParam === 'team' || tabParam === 'finances' || tabParam === 'attachments' || tabParam === 'logs') {
                return tabParam;
            }
        }
        return 'blueprint';
    });
    const [taskFilter, setTaskFilter] = useState<'all' | 'my_tasks'>('all');

    // ----------------------------------------------------
    // PROJECT PERCENTAGE & DETAILED BREAKDOWN METRICS
    // ----------------------------------------------------
    const allTasks = project.tasks || [];
    const totalTasksCount = allTasks.length;
    const doneTasksCount = allTasks.filter((t) => t.status === 'done').length;
    const inProgressTasksCount = allTasks.filter((t) => t.status === 'in_progress').length;
    const reviewTasksCount = allTasks.filter((t) => t.status === 'review').length;
    const todoTasksCount = allTasks.filter((t) => t.status === 'todo').length;

    const doneRatio = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : (project.status === 'completed' ? 100 : 0);
    const inProgressRatio = totalTasksCount > 0 ? Math.round((inProgressTasksCount / totalTasksCount) * 100) : 0;
    const reviewRatio = totalTasksCount > 0 ? Math.round((reviewTasksCount / totalTasksCount) * 100) : 0;
    const todoRatio = totalTasksCount > 0 ? Math.round((todoTasksCount / totalTasksCount) * 100) : 0;

    const allSubtasks = allTasks.flatMap((t) => t.subtasks || []);
    const totalSubtasksCount = allSubtasks.length;
    const doneSubtasksCount = allSubtasks.filter((s) => s.is_done).length;
    const subtaskRatio = totalSubtasksCount > 0 ? Math.round((doneSubtasksCount / totalSubtasksCount) * 100) : 100;



    const [copiedReport, setCopiedReport] = useState(false);

    const getMemberAvatar = (user?: PmsUser | null) => {
        if (!user) return '/images/me.webp';
        if (user.avatar) {
            return user.avatar.startsWith('http') || user.avatar.startsWith('/')
                ? user.avatar
                : `/storage/${user.avatar}`;
        }
        if (user.is_admin || user.email === 'ridhwananang@gmail.com') {
            return '/images/me.webp';
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=ffffff&bold=true&size=80`;
    };

    const handleCopyReportSummary = () => {
        const sprintLines = (project.sprints || []).map((sprint, idx) => {
            const sprintTasks = allTasks.filter((t) => t.sprint_id === sprint.id);
            const spTotal = sprintTasks.length;
            const spDone = sprintTasks.filter((t) => t.status === 'done').length;
            const spPercent = spTotal > 0 ? Math.round((spDone / spTotal) * 100) : (sprint.status === 'completed' ? 100 : 0);
            return `  ${idx + 1}. ${sprint.name} [${sprint.status.toUpperCase()}]: ${spPercent}% Selesai (${spDone}/${spTotal} Tugas)`;
        }).join('\n');

        const memberLines = (project.members || []).map((m) => {
            const mTasks = allTasks.filter((t) => t.assigned_to === m.user_id);
            const mTotal = mTasks.length;
            const mDone = mTasks.filter((t) => t.status === 'done').length;
            const mPercent = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
            return `  • ${m.user?.name || 'Anggota'} (${m.role_in_project}): ${mPercent}% (${mDone}/${mTotal} Tugas)`;
        }).join('\n');

        const tasksWithSubtasks = allTasks.filter((t) => t.subtasks && t.subtasks.length > 0);
        const subtaskSummaryLines = tasksWithSubtasks.map((t) => {
            const sDone = t.subtasks?.filter((s) => s.is_done).length || 0;
            const sTotal = t.subtasks?.length || 0;
            const sPercent = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
            const items = (t.subtasks || []).map((s) => `    [${s.is_done ? '✓' : ' '}] ${s.title}`).join('\n');
            return `  • ${t.title} (${sDone}/${sTotal} Selesai - ${sPercent}%):\n${items}`;
        }).join('\n\n');

        const textReport = `=========================================
📊 LAPORAN PROGRESS PROYEK PMS
=========================================
Proyek        : ${project.name} (${project.code})
Klien         : ${project.client}
Status        : ${project.status.toUpperCase()} (Prioritas: ${project.priority.toUpperCase()})
Progress Total: ${project.progress_percentage}% (${doneTasksCount}/${totalTasksCount} Tugas Selesai)
Subtask Check : ${doneSubtasksCount}/${totalSubtasksCount} Selesai (${subtaskRatio}%)
Target Waktu  : ${project.end_date ? new Date(project.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fleksibel'}

📌 RINCIAN TAHAPAN STATUS TUGAS:
  • Selesai (Done)      : ${doneTasksCount} tiket (${doneRatio}%)
  • Review / QA         : ${reviewTasksCount} tiket (${reviewRatio}%)
  • Dalam Pengerjaan    : ${inProgressTasksCount} tiket (${inProgressRatio}%)
  • Antrean (To Do)     : ${todoTasksCount} tiket (${todoRatio}%)

🚀 RINCIAN SIKLUS SPRINT (BAGIAN PER BAGIAN):
${sprintLines || '  (Belum ada siklus sprint)'}

👥 DISTRIBUSI & KONTRIBUSI TIM:
${memberLines || '  (Belum ada penugasan tim spesifik)'}

📋 RINCIAN DETAIL SUBTASK & DELIVERABLES:
${subtaskSummaryLines || '  (Belum ada checklist subtask)'}
=========================================
Dibuat otomatis dari Ridhwan Studio PMS Cockpit
Waktu Laporan: ${new Date().toLocaleString('id-ID')}
`;

        navigator.clipboard.writeText(textReport);
        setCopiedReport(true);
        toast.success('Ringkasan laporan teks berhasil disalin! Siap dikirim ke WhatsApp klien.');
        setTimeout(() => setCopiedReport(false), 2500);
    };

    const handlePrintReport = () => {
        window.print();
    };

    // Horizontal Scroll Tracking for Workspace Tabs
    const tabsTrackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // File Input Refs for Luxury Dropzones
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const checkTabScroll = () => {
        if (!tabsTrackRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = tabsTrackRef.current;
        setCanScrollLeft(scrollLeft > 6);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    };

    useEffect(() => {
        checkTabScroll();
        const t1 = setTimeout(checkTabScroll, 60);
        const t2 = setTimeout(checkTabScroll, 250);
        window.addEventListener('resize', checkTabScroll);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', checkTabScroll);
        };
    }, []);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (!tabsTrackRef.current) return;
        tabsTrackRef.current.scrollBy({
            left: direction === 'left' ? -220 : 220,
            behavior: 'smooth',
        });
    };

    // Quick Status Update
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Modals
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

    // Selected Sprint for task creation
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

    // Subtask quick addition state
    const [activeTaskIdForSubtask, setActiveTaskIdForSubtask] = useState<number | null>(null);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    // Blueprint view toggle
    const [isEditingBlueprint, setIsEditingBlueprint] = useState(false);

    // Detail Blueprint Form
    const detailForm = useForm({
        background: project.detail?.background || '',
        objective: project.detail?.objective || '',
        scope: project.detail?.scope || '',
        deliverables: project.detail?.deliverables || '',
        repository_url: project.detail?.repository_url || '',
        live_demo_url: project.detail?.live_demo_url || '',
        notes: project.detail?.notes || '',
    });

    // Sprint Form (Create)
    const sprintForm = useForm({
        project_id: project.id,
        name: '',
        goal: '',
        status: 'planned',
        start_date: '',
        end_date: '',
    });

    // Sprint Edit & Delete state
    const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<PmsSprint | null>(null);
    const editSprintForm = useForm({
        name: '',
        goal: '',
        status: 'planned',
        start_date: '',
        end_date: '',
    });

    const [isDeleteSprintConfirmOpen, setIsDeleteSprintConfirmOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<{ id: number; name: string } | null>(null);

    const formatSprintDate = (val?: string | null) => {
        if (!val) return '-';
        try {
            const cleanStr = String(val).split('T')[0];
            const d = new Date(cleanStr);
            if (isNaN(d.getTime())) return cleanStr;
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return String(val).split('T')[0];
        }
    };

    const openEditSprintModal = (sprint: PmsSprint) => {
        setEditingSprint(sprint);
        editSprintForm.setData({
            name: sprint.name,
            goal: sprint.goal || '',
            status: sprint.status,
            start_date: sprint.start_date ? String(sprint.start_date).split('T')[0] : '',
            end_date: sprint.end_date ? String(sprint.end_date).split('T')[0] : '',
        });
        setIsEditSprintModalOpen(true);
    };

    const handleUpdateSprint = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSprint) return;
        editSprintForm.put(`/studio/pms/sprints/${editingSprint.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Sprint ${editSprintForm.data.name} berhasil diperbarui.`);
                setIsEditSprintModalOpen(false);
                setEditingSprint(null);
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal memperbarui sprint'),
        });
    };

    const handleSprintStatusChange = (sprint: PmsSprint, newStatus: string) => {
        router.put(
            `/studio/pms/sprints/${sprint.id}`,
            {
                name: sprint.name,
                goal: sprint.goal,
                status: newStatus,
                start_date: sprint.start_date ? String(sprint.start_date).split('T')[0] : null,
                end_date: sprint.end_date ? String(sprint.end_date).split('T')[0] : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Status sprint ${sprint.name} diubah ke ${newStatus}`),
                onError: () => toast.error('Gagal memperbarui status sprint'),
            }
        );
    };

    const confirmDeleteSprint = (sprint: PmsSprint) => {
        setSprintToDelete({ id: sprint.id, name: sprint.name });
        setIsDeleteSprintConfirmOpen(true);
    };

    const executeDeleteSprint = () => {
        if (!sprintToDelete) return;
        router.delete(`/studio/pms/sprints/${sprintToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Sprint ${sprintToDelete.name} berhasil dihapus.`);
                setIsDeleteSprintConfirmOpen(false);
                setSprintToDelete(null);
            },
            onError: () => toast.error('Gagal menghapus sprint'),
        });
    };

    // Task Form
    const taskForm = useForm({
        project_id: project.id,
        sprint_id: '' as string | number,
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '' as string | number,
        due_date: '',
        estimated_hours: 0,
    });

    // Member Assign Form (Dynamic Role!)
    const memberForm = useForm({
        user_id: '' as string | number,
        role_in_project: '',
        hourly_rate: '',
    });

    const selectedAssignUser =
        availableUsers.find(
            (u) => String(u.id) === String(memberForm.data.user_id),
        ) || availableUsers[0];

    const openAssignMemberModal = () => {
        if (!memberForm.data.user_id && availableUsers.length > 0) {
            memberForm.setData({
                user_id: availableUsers[0].id,
                role_in_project: availableUsers[0].role_title || 'Lead Architect',
                hourly_rate: '',
            });
        }
        setIsAssignMemberOpen(true);
    };

    // Finance Form
    const financeForm = useForm({
        project_id: project.id,
        type: 'income',
        title: '',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt: null as File | null,
    });

    // Attachment Form
    const attachmentForm = useForm({
        project_id: project.id,
        task_id: null as number | null,
        file: null as File | null,
    });

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const getSprintDurationDays = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const s = new Date(start);
        const e = new Date(end);
        const diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 ? Math.round(diff) + 1 : null;
    };

    const handleSetSprintDuration = (days: number, isEdit: boolean = false) => {
        const form = isEdit ? editSprintForm : sprintForm;
        const start = form.data.start_date || new Date().toISOString().split('T')[0];
        const startDateObj = new Date(start);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + days);
        const end = endDateObj.toISOString().split('T')[0];
        form.setData({
            ...form.data,
            start_date: start,
            end_date: end,
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setIsUpdatingStatus(true);
        router.put(
            `/studio/pms/projects/${project.id}`,
            {
                name: project.name,
                code: project.code,
                client: project.client,
                budget: project.budget,
                status: newStatus,
                priority: project.priority,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status proyek diperbarui ke ${newStatus.replace('_', ' ')}`);
                    setIsUpdatingStatus(false);
                },
                onError: () => setIsUpdatingStatus(false),
            }
        );
    };

    const handleSaveDetail = (e: React.FormEvent) => {
        e.preventDefault();
        detailForm.put(`/studio/pms/projects/${project.id}/detail`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Cetak biru teknis berhasil disimpan');
                setIsEditingBlueprint(false);
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal menyimpan detail'),
        });
    };

    const handleCreateSprint = (e: React.FormEvent) => {
        e.preventDefault();
        sprintForm.post('/studio/pms/sprints', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sprint baru berhasil ditambahkan');
                setIsSprintModalOpen(false);
                sprintForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal membuat sprint'),
        });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        taskForm.post('/studio/pms/tasks', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tugas baru berhasil dibuat');
                setIsTaskModalOpen(false);
                taskForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal membuat tugas'),
        });
    };

    const handleToggleSubtask = (subtaskId: number) => {
        router.patch(
            `/studio/pms/subtasks/${subtaskId}/toggle`,
            {},
            { preserveScroll: true }
        );
    };

    const handleAddSubtask = (taskId: number) => {
        if (!newSubtaskTitle.trim()) return;
        router.post(
            `/studio/pms/tasks/${taskId}/subtasks`,
            { title: newSubtaskTitle.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewSubtaskTitle('');
                    setActiveTaskIdForSubtask(null);
                },
            }
        );
    };

    const handleAssignMember = (e: React.FormEvent) => {
        e.preventDefault();
        memberForm.post(`/studio/pms/projects/${project.id}/members`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Anggota tim berhasil ditugaskan dengan peran kustom');
                setIsAssignMemberOpen(false);
                memberForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal menugaskan anggota'),
        });
    };

    // Team Member Delete Confirmation State
    const [memberToDelete, setMemberToDelete] = useState<PmsProjectMember | null>(null);
    const [isDeleteMemberConfirmOpen, setIsDeleteMemberConfirmOpen] = useState(false);
    const [isDeletingMember, setIsDeletingMember] = useState(false);

    const openDeleteMemberModal = (member: PmsProjectMember) => {
        setMemberToDelete(member);
        setIsDeleteMemberConfirmOpen(true);
    };

    const executeDeleteMember = () => {
        if (!memberToDelete) return;
        setIsDeletingMember(true);
        router.delete(`/studio/pms/members/${memberToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Penugasan ${memberToDelete.user?.name ?? 'anggota'} telah dihapus`);
                setIsDeleteMemberConfirmOpen(false);
                setMemberToDelete(null);
                setIsDeletingMember(false);
            },
            onError: () => {
                toast.error('Gagal menghapus penugasan anggota');
                setIsDeletingMember(false);
            },
        });
    };

    const handleCreateFinance = (e: React.FormEvent) => {
        e.preventDefault();
        financeForm.post('/studio/pms/finances', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Catatan keuangan berhasil disimpan');
                setIsFinanceModalOpen(false);
                financeForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal menyimpan transaksi'),
        });
    };

    const handleUploadAttachment = (e: React.FormEvent) => {
        e.preventDefault();
        attachmentForm.post('/studio/pms/attachments', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berkas berhasil diunggah');
                setIsAttachmentModalOpen(false);
                attachmentForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal mengunggah berkas'),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Daftar Proyek', href: '/studio/pms/projects' },
                { title: project.code, href: `/studio/pms/projects/${project.id}` },
            ]}
        >
            <Head title={`${project.name} (${project.code}) - Workspace PMS`} />

            <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* 1. Master Workspace Header */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 md:p-8 backdrop-blur-2xl shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/studio/pms/projects"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>
                                <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg">
                                    {project.code}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="capitalize font-semibold text-xs border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10"
                                >
                                    {project.priority} priority
                                </Badge>
                                {project.project_order && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                        Client Order #{project.project_order.tracking_code}
                                    </Badge>
                                )}
                                {user_role_in_project && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-xs font-semibold gap-1.5 py-0.5 px-2.5">
                                        <Shield className="size-3 text-emerald-500" />
                                        Peran Anda: {user_role_in_project}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {project.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                <span>Klien: <strong className="text-slate-800 dark:text-slate-200">{project.client}</strong></span>
                                <span>Mulai: {project.start_date ? new Date(project.start_date).toLocaleDateString('id-ID') : '-'}</span>
                                <span>Deadline: {project.end_date ? new Date(project.end_date).toLocaleDateString('id-ID') : '-'}</span>
                                <span>Lead / Created by: {project.creator?.name ?? 'Admin'}</span>
                            </div>
                        </div>

                        {/* Top Right Controls: Status & Metrics */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 w-full lg:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">Status Proyek:</span>
                                <Select
                                    value={project.status}
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-36 sm:w-40 h-9 rounded-xl bg-white dark:bg-slate-950 font-semibold text-xs border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review / QA</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="flex-1 sm:flex-none rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-9 text-xs font-semibold cursor-pointer shadow-sm shadow-violet-500/25"
                                >
                                    <Plus className="size-3.5" /> Tambah Tugas
                                </Button>
                                {is_admin && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsSprintModalOpen(true)}
                                        className="flex-1 sm:flex-none rounded-xl gap-1.5 h-9 text-xs font-semibold cursor-pointer border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <Zap className="size-3.5 text-amber-500" /> Buat Sprint
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress & Overview Ribbon (Financial for Admin, Task Scoped for Members) */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress Keseluruhan</div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('reports')}
                                    className="text-[10.5px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                    Rincian <ArrowUpRight className="size-3" />
                                </button>
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {project.progress_percentage}%
                                </span>
                                <span className="text-xs text-slate-500">
                                    ({doneTasksCount}/{totalTasksCount} Tugas)
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                                <div
                                    className="h-full bg-violet-600 rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress_percentage}%` }}
                                />
                            </div>
                        </div>

                        {is_admin ? (
                            <>
                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Anggaran</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                        {formatCurrency(project.budget)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Pemasukan: {formatCurrency(project.total_income)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Realisasi Pengeluaran</div>
                                    <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                                        {formatCurrency(project.total_expense)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Burn Rate: {project.budget_burn_rate}%
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sisa Anggaran Proyek</div>
                                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                        {formatCurrency(project.remaining_budget)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {project.tasks?.length ?? 0} Tugas • {project.sprints?.length ?? 0} Sprint
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tugas Proyek</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                        {project.tasks?.length ?? 0} <span className="text-xs font-normal text-slate-500">Tiket</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {project.sprints?.length ?? 0} Siklus Sprint Aktif
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tugas Terselesaikan</div>
                                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                        {project.tasks?.filter((t: any) => t.status === 'done').length ?? 0} <span className="text-xs font-normal text-slate-500">Selesai</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {project.tasks?.filter((t: any) => t.status === 'in_progress').length ?? 0} Dalam Pengerjaan
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jobdesk Ditugaskan ke Anda</div>
                                    <div className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                                        {project.tasks?.filter((t: any) => t.assigned_to === current_user_id).length ?? 0} <span className="text-xs font-normal text-slate-500">Tugas Anda</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        {project.tasks?.filter((t: any) => t.assigned_to === current_user_id && t.status === 'done').length ?? 0} Tugas Anda Selesai
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Workspace Navigation Dock (Hanya Bilah Tombol Ini Yang Mengizinkan Scroll Horisontal Mulus) */}
                <div className="relative w-full min-w-0 max-w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-1.5 sm:p-2 backdrop-blur-xl shadow-xs group">
                    {/* Left Scroll Button */}
                    {canScrollLeft && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex items-center">
                            <button
                                type="button"
                                onClick={() => scrollTabs('left')}
                                className="size-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                aria-label="Scroll menu ke kiri"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                        </div>
                    )}

                    {/* Scrollable Tabs Track (Single Pristine Row) */}
                    <div
                        ref={tabsTrackRef}
                        onScroll={checkTabScroll}
                        className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1.5 scroll-smooth touch-pan-x scrollbar-none"
                    >
                        {[
                            { id: 'blueprint', label: 'Cetak Biru Teknis', icon: FileText, count: null },
                            { id: 'sprints', label: 'Sprint Cycles', icon: Zap, count: project.sprints?.length ?? 0 },
                            { id: 'tasks', label: 'Daftar Tugas', icon: ListTodo, count: project.tasks?.length ?? 0 },
                            { id: 'reports', label: 'Laporan Progres', icon: BarChart3, count: `${project.progress_percentage}%` },
                            { id: 'team', label: 'Tim & Anggota', icon: Users, count: project.members?.length ?? 0 },
                            ...(is_admin ? [{ id: 'finances', label: 'Keuangan & Struk', icon: Coins, count: null }] : []),
                            { id: 'attachments', label: 'Lampiran', icon: Paperclip, count: project.attachments?.length ?? 0 },
                            { id: 'logs', label: 'Log Aktivitas', icon: Activity, count: null },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`group flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                                        isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 ring-1 ring-violet-400/40'
                                            : 'text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60'
                                    }`}
                                >
                                    <Icon className={`size-3.5 transition-colors ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300'
                                    }`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== null && (
                                        <span
                                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                                                isActive
                                                    ? 'bg-white/25 text-white font-bold'
                                                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Scroll Button */}
                    {canScrollRight && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex items-center">
                            <button
                                type="button"
                                onClick={() => scrollTabs('right')}
                                className="size-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                aria-label="Scroll menu ke kanan"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Tab Contents */}

                {/* TAB: BLUEPRINT */}
                {activeTab === 'blueprint' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0 max-w-full">
                        <div className="lg:col-span-8 min-w-0 max-w-full space-y-6">
                            {!isEditingBlueprint ? (
                                /* 1. Executive Word Document Sheets (View Mode) */
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xs">
                                        <div>
                                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                <FileText className="size-5 text-violet-500" />
                                                Dokumen Cetak Biru & Spesifikasi Teknis
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Visualisasi lembar dokumen resmi proyek dalam format Microsoft Word standar enterprise.
                                            </p>
                                        </div>
                                        {is_admin && (
                                            <Button
                                                type="button"
                                                onClick={() => setIsEditingBlueprint(true)}
                                                size="sm"
                                                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5 shadow-sm font-semibold shrink-0"
                                            >
                                                <PenLine className="size-3.5" /> Ubah / Edit Cetak Biru
                                            </Button>
                                        )}
                                    </div>

                                    <WordDocumentViewer
                                        content={project.detail?.objective || detailForm.data.objective}
                                        label="1. Sasaran Utama & Key Results (Objectives)"
                                    />

                                    <WordDocumentViewer
                                        content={project.detail?.scope || detailForm.data.scope}
                                        label="2. Ruang Lingkup Teknis (Scope of Work)"
                                    />

                                    <WordDocumentViewer
                                        content={project.detail?.background || detailForm.data.background}
                                        label="3. Latar Belakang Proyek & Masalah Bisnis"
                                    />

                                    <WordDocumentViewer
                                        content={project.detail?.deliverables || detailForm.data.deliverables}
                                        label="4. Hasil Akhir & Deliverables"
                                    />

                                    <WordDocumentViewer
                                        content={project.detail?.notes || detailForm.data.notes}
                                        label="5. Catatan Teknis Tambahan & Instruksi Khusus"
                                    />
                                </div>
                            ) : (
                                /* 2. Full Word Rich Editor Form (Edit Mode) */
                                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSaveDetail} className="space-y-5">
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsEditingBlueprint(false)}
                                                        className="rounded-xl text-xs gap-1.5 text-slate-600 dark:text-slate-400"
                                                    >
                                                        <ArrowLeft className="size-3.5" /> Kembali ke Tampilan Dokumen
                                                    </Button>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={detailForm.processing}
                                                    size="sm"
                                                    className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold h-8 px-4 shadow-sm"
                                                >
                                                    {detailForm.processing ? 'Menyimpan...' : 'Simpan Cetak Biru'}
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <WordRichEditor
                                                    value={detailForm.data.objective}
                                                    onChange={(val) => detailForm.setData('objective', val)}
                                                    label="Sasaran Utama & Key Results (Objectives)"
                                                    placeholder="Menjelaskan problem statement dan sasaran teknis..."
                                                    minHeight="180px"
                                                    presetType="objective"
                                                />

                                                <WordRichEditor
                                                    value={detailForm.data.scope}
                                                    onChange={(val) => detailForm.setData('scope', val)}
                                                    label="Ruang Lingkup Teknis (Scope of Work)"
                                                    placeholder="Daftar modul, integrasi payment gateway, role permission, dsb..."
                                                    minHeight="180px"
                                                    presetType="scope"
                                                />

                                                <WordRichEditor
                                                    value={detailForm.data.background}
                                                    onChange={(val) => detailForm.setData('background', val)}
                                                    label="Latar Belakang Proyek & Masalah Bisnis"
                                                    placeholder="Konteks industri, arsitektur sistem sebelumnya, dsb..."
                                                    minHeight="160px"
                                                    presetType="background"
                                                />

                                                <WordRichEditor
                                                    value={detailForm.data.deliverables}
                                                    onChange={(val) => detailForm.setData('deliverables', val)}
                                                    label="Hasil Akhir & Deliverables"
                                                    placeholder="Contoh: Source code Git repo, staging deploy, panduan instalasi..."
                                                    minHeight="160px"
                                                    presetType="deliverables"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                        <GitBranch className="size-3 text-slate-400" /> Repositori URL (GitHub/GitLab)
                                                    </Label>
                                                    <Input
                                                        value={detailForm.data.repository_url}
                                                        onChange={(e) => detailForm.setData('repository_url', e.target.value)}
                                                        placeholder="https://github.com/..."
                                                        className="rounded-xl h-9 text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                        <Globe className="size-3 text-slate-400" /> Staging / Preview Live URL
                                                    </Label>
                                                    <Input
                                                        value={detailForm.data.live_demo_url}
                                                        onChange={(e) => detailForm.setData('live_demo_url', e.target.value)}
                                                        placeholder="https://preview.domain.com"
                                                        className="rounded-xl h-9 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <WordRichEditor
                                                    value={detailForm.data.notes}
                                                    onChange={(val) => detailForm.setData('notes', val)}
                                                    label="Catatan Teknis Tambahan / Instruksi Khusus"
                                                    placeholder="Kredensial staging, environment variables, konfigurasi server..."
                                                    minHeight="180px"
                                                    presetType="notes"
                                                />
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Quick Links & Summary */}
                        <div className="lg:col-span-4 min-w-0 max-w-full space-y-4">
                            <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 backdrop-blur-xl shadow-xs">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                    <Sparkles className="size-4 text-amber-500" />
                                    Tautan Cepat & Sumber Daya
                                </h4>
                                <div className="space-y-2.5 text-xs">
                                    {detailForm.data.repository_url ? (
                                        <a
                                            href={detailForm.data.repository_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                                        >
                                            <span className="flex items-center gap-2 font-medium truncate">
                                                <GitBranch className="size-3.5 text-slate-500 shrink-0" /> <span className="truncate">Repositori Git</span>
                                            </span>
                                            <ExternalLink className="size-3 text-slate-400 shrink-0" />
                                        </a>
                                    ) : (
                                        <div className="text-slate-400 dark:text-slate-500 italic">Repositori belum dikonfigurasi</div>
                                    )}

                                    {detailForm.data.live_demo_url ? (
                                        <a
                                            href={detailForm.data.live_demo_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                                        >
                                            <span className="flex items-center gap-2 font-medium truncate">
                                                <Globe className="size-3.5 text-emerald-500 shrink-0" /> <span className="truncate">Server Preview Staging</span>
                                            </span>
                                            <ExternalLink className="size-3 text-slate-400 shrink-0" />
                                        </a>
                                    ) : (
                                        <div className="text-slate-400 dark:text-slate-500 italic">URL staging belum dikonfigurasi</div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB: REPORTS & DETAILED PROGRESS BREAKDOWN (BAGIAN PER BAGIAN) */}
                {activeTab === 'reports' && (
                    <div className="space-y-6 min-w-0 max-w-full">
                        {/* Header & Export Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shrink-0">
                                    <BarChart3 className="size-5" />
                                </span>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                        Laporan Rinci Persentase & Status Pengembangan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Rincian progres bagian per bagian: siklus sprint, tahapan workflow, deliverables checklist, dan kontribusi tim
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyReportSummary}
                                    className="rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 h-9 text-xs font-bold cursor-pointer hover:border-violet-500/40"
                                >
                                    {copiedReport ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-violet-600 dark:text-violet-400" />}
                                    <span>{copiedReport ? 'Tersalin' : 'Salin Format WA/Klien'}</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintReport}
                                    className="rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 h-9 text-xs font-bold cursor-pointer hover:border-violet-500/40"
                                >
                                    <Printer className="size-3.5 text-slate-600 dark:text-slate-300" />
                                    <span className="hidden sm:inline">Cetak / PDF</span>
                                </Button>
                            </div>
                        </div>

                        {/* 1. Executive Metric Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Progress Card */}
                            <div className="p-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 dark:bg-slate-900/80 shadow-xs relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Total Progres</span>
                                    <TrendingUp className="size-4 text-violet-500" />
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {project.progress_percentage}%
                                    </span>
                                    <Badge variant="outline" className="border-violet-500/30 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                                        {project.status === 'completed' ? 'Selesai Penuh' : (project.progress_percentage >= 50 ? 'On Track' : 'In Progress')}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                                    {doneTasksCount} dari {totalTasksCount} tugas tereksekusi tuntas
                                </p>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                                    <div className="h-full bg-violet-600 rounded-full transition-all duration-700" style={{ width: `${project.progress_percentage}%` }} />
                                </div>
                            </div>

                            {/* Sprints Health */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Siklus Sprint</span>
                                    <Zap className="size-4 text-amber-500" />
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {project.sprints?.length ?? 0}
                                    </span>
                                    <span className="text-xs text-slate-500">Siklus</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                                    {project.sprints?.filter((s) => s.status === 'completed').length ?? 0} Selesai • {project.sprints?.filter((s) => s.status === 'active').length ?? 0} Aktif
                                </p>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                                    <div
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{
                                            width: `${(project.sprints?.length ?? 0) > 0 ? Math.round(((project.sprints?.filter((s) => s.status === 'completed').length ?? 0) / (project.sprints?.length ?? 1)) * 100) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Subtask Delivery */}
                            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Checklist Subtask</span>
                                    <CheckSquare className="size-4 text-emerald-500" />
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {subtaskRatio}%
                                    </span>
                                    <span className="text-xs text-slate-500">Ketercapaian</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                                    {doneSubtasksCount} dari {totalSubtasksCount} item micro-deliverables dicentang
                                </p>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${subtaskRatio}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Visual Segmented Progress Bar (Tahapan Workflow) */}
                        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <PieChart className="size-4 text-violet-500" />
                                        Rincian Distribusi Status & Tahapan Pekerjaan
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Proporsi tiket tugas di setiap stage kanban workflow
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-400">
                                    Total {totalTasksCount} Tiket Tugas
                                </span>
                            </div>

                            {/* Segmented Multi-Color Progress Bar */}
                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                                {doneRatio > 0 && (
                                    <div
                                        title={`Selesai (Done): ${doneTasksCount} tiket (${doneRatio}%)`}
                                        className="h-full bg-emerald-500 transition-all duration-500 hover:brightness-110"
                                        style={{ width: `${doneRatio}%` }}
                                    />
                                )}
                                {reviewRatio > 0 && (
                                    <div
                                        title={`Review / QA: ${reviewTasksCount} tiket (${reviewRatio}%)`}
                                        className="h-full bg-purple-500 transition-all duration-500 hover:brightness-110"
                                        style={{ width: `${reviewRatio}%` }}
                                    />
                                )}
                                {inProgressRatio > 0 && (
                                    <div
                                        title={`Dalam Pengerjaan (In Progress): ${inProgressTasksCount} tiket (${inProgressRatio}%)`}
                                        className="h-full bg-amber-500 transition-all duration-500 hover:brightness-110"
                                        style={{ width: `${inProgressRatio}%` }}
                                    />
                                )}
                                {todoRatio > 0 && (
                                    <div
                                        title={`Antrean (To Do): ${todoTasksCount} tiket (${todoRatio}%)`}
                                        className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500 hover:brightness-110"
                                        style={{ width: `${todoRatio}%` }}
                                    />
                                )}
                            </div>

                            {/* Status Pills Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-emerald-500" /> Selesai (Done)
                                        </span>
                                        <span>{doneRatio}%</span>
                                    </div>
                                    <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1">
                                        {doneTasksCount} <span className="text-xs font-normal text-slate-500">Tugas</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                    <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-purple-500" /> Review / QA
                                        </span>
                                        <span>{reviewRatio}%</span>
                                    </div>
                                    <div className="text-lg font-black text-purple-800 dark:text-purple-300 mt-1">
                                        {reviewTasksCount} <span className="text-xs font-normal text-slate-500">Tugas</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-amber-500 animate-pulse" /> In Progress
                                        </span>
                                        <span>{inProgressRatio}%</span>
                                    </div>
                                    <div className="text-lg font-black text-amber-800 dark:text-amber-300 mt-1">
                                        {inProgressTasksCount} <span className="text-xs font-normal text-slate-500">Tugas</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-slate-400" /> Antrean (To Do)
                                        </span>
                                        <span>{todoRatio}%</span>
                                    </div>
                                    <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1">
                                        {todoTasksCount} <span className="text-xs font-normal text-slate-500">Tugas</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. RINCIAN BAGIAN PER BAGIAN: SPRINT CYCLES BREAKDOWN */}
                        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Zap className="size-4 text-amber-500" />
                                        Rincian Persentase per Bagian / Siklus Sprint
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Tingkat penyelesaian dan output deliverable tiap sprint iterasi proyek
                                    </p>
                                </div>

                            </div>

                            {project.sprints?.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    Belum ada siklus sprint yang dibuat. Buat sprint di tab "Sprint Cycles" untuk membagi pengerjaan ke dalam tahapan berkala.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {project.sprints?.map((sprint, idx) => {
                                        const spTasks = allTasks.filter((t) => t.sprint_id === sprint.id);
                                        const spTotal = spTasks.length;
                                        const spDone = spTasks.filter((t) => t.status === 'done').length;
                                        const spProgress = spTotal > 0 ? Math.round((spDone / spTotal) * 100) : (sprint.status === 'completed' ? 100 : 0);
                                        const isDone = spProgress === 100 || sprint.status === 'completed';

                                        return (
                                            <div
                                                key={sprint.id}
                                                className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-3 transition-all hover:border-violet-500/30"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                                            isDone
                                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                                                        }`}>
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                                {sprint.name}
                                                            </div>
                                                            {sprint.goal && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                                    Sasaran: {sprint.goal}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0 text-xs">
                                                        <div className="text-right">
                                                            <span className="font-black text-base text-slate-900 dark:text-white">
                                                                {spProgress}%
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 block">
                                                                {spDone} dari {spTotal} Tugas
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize text-[10px] font-bold ${
                                                                sprint.status === 'completed'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                    : sprint.status === 'active'
                                                                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                      : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {sprint.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Progress bar for individual sprint */}
                                                <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            isDone ? 'bg-emerald-500' : spProgress >= 50 ? 'bg-violet-600' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${spProgress}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3 text-slate-400" />
                                                        {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Mulai'}
                                                        {' - '}
                                                        {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Target'}
                                                    </span>
                                                    <span>
                                                        {spTasks.filter(t => t.status === 'in_progress').length} In Progress • {spTasks.filter(t => t.status === 'todo').length} To Do
                                                    </span>
                                                </div>

                                                {/* Daftar Tiket & Detail Subtask Deliverables dalam Bagian Ini */}
                                                {spTasks.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
                                                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                                                            <span>Deliverables &amp; Fitur ({spTasks.length} Tiket)</span>
                                                            <span>{spDone}/{spTotal} Selesai</span>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {spTasks.map((task) => {
                                                                const subtasks = task.subtasks || [];
                                                                const tDone = subtasks.filter((s) => s.is_done).length;
                                                                const tTotal = subtasks.length;
                                                                const tRatio = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : (task.status === 'done' ? 100 : 0);

                                                                return (
                                                                    <div
                                                                        key={task.id}
                                                                        className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 space-y-2.5 shadow-2xs"
                                                                    >
                                                                        {/* Header Tiket Tugas */}
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <span className={`size-2 rounded-full shrink-0 ${
                                                                                    task.status === 'done'
                                                                                        ? 'bg-emerald-500'
                                                                                        : task.status === 'in_progress'
                                                                                        ? 'bg-amber-500 animate-pulse'
                                                                                        : task.status === 'review'
                                                                                        ? 'bg-purple-500'
                                                                                        : 'bg-slate-400'
                                                                                }`} />
                                                                                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                                                    {task.title}
                                                                                </span>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-[9px] capitalize py-0 px-1.5 h-4 font-semibold shrink-0"
                                                                                >
                                                                                    {task.status.replace('_', ' ')}
                                                                                </Badge>
                                                                            </div>

                                                                            <div className="flex items-center gap-2 shrink-0">
                                                                                {tTotal > 0 ? (
                                                                                    <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                                                                                        {tDone}/{tTotal} Subtask ({tRatio}%)
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                                        task.status === 'done'
                                                                                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                                                                                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                                                                                    }`}>
                                                                                        {task.status === 'done' ? 'Tuntas' : 'Dalam Proses'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Detail Subtasks: Bersih, Jelas, Tanpa Coretan (No line-through) */}
                                                                        {tTotal > 0 && (
                                                                            <div className="pl-2 sm:pl-3 space-y-1.5 pt-1 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
                                                                                {subtasks.map((st) => (
                                                                                    <div
                                                                                        key={st.id}
                                                                                        className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/50 text-xs border border-slate-100 dark:border-slate-800/60"
                                                                                    >
                                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                                            {st.is_done ? (
                                                                                                <div className="size-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                                                                    <Check className="size-3 stroke-[3]" />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="size-4.5 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                                                                                                    ○
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Teks Subtask: Jelas & Terbaca, Tanpa Coretan */}
                                                                                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                                                                                                {st.title}
                                                                                            </span>
                                                                                        </div>

                                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                                                            st.is_done
                                                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                                                                        }`}>
                                                                                            {st.is_done ? 'Selesai' : 'Pending'}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Tugas Tambahan & Backlog Tanpa Sprint */}
                                    {(() => {
                                        const unassignedTasks = allTasks.filter((t) => !t.sprint_id);
                                        if (unassignedTasks.length === 0) return null;

                                        const unTotal = unassignedTasks.length;
                                        const unDone = unassignedTasks.filter((t) => t.status === 'done').length;
                                        const unProgress = unTotal > 0 ? Math.round((unDone / unTotal) * 100) : 0;

                                        return (
                                            <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                                                            <FolderKanban className="size-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                                                                Tugas &amp; Deliverables Tambahan (Di Luar Sprint)
                                                            </div>
                                                            <p className="text-xs text-slate-500">Tiket dan checklist yang dikerjakan di luar siklus sprint terjadwal</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-black text-base text-slate-900 dark:text-white">{unProgress}%</span>
                                                        <span className="text-[11px] text-slate-500 block">{unDone} dari {unTotal} Tugas</span>
                                                    </div>
                                                </div>

                                                <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${unProgress}%` }} />
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2">
                                                    {unassignedTasks.map((task) => {
                                                        const subtasks = task.subtasks || [];
                                                        const tDone = subtasks.filter((s) => s.is_done).length;
                                                        const tTotal = subtasks.length;
                                                        const tRatio = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : (task.status === 'done' ? 100 : 0);

                                                        return (
                                                            <div key={task.id} className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 space-y-2.5 shadow-2xs">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{task.title}</span>
                                                                        <Badge variant="outline" className="text-[9px] capitalize py-0 px-1.5 h-4 font-semibold">{task.status.replace('_', ' ')}</Badge>
                                                                    </div>
                                                                    {tTotal > 0 && <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">{tDone}/{tTotal} Subtask ({tRatio}%)</span>}
                                                                </div>
                                                                {tTotal > 0 && (
                                                                    <div className="pl-2 sm:pl-3 space-y-1.5 pt-1 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
                                                                        {subtasks.map((st) => (
                                                                            <div key={st.id} className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/50 text-xs border border-slate-100 dark:border-slate-800/60">
                                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                                    {st.is_done ? (
                                                                                        <div className="size-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                                                            <Check className="size-3 stroke-[3]" />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="size-4.5 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-400">○</div>
                                                                                    )}
                                                                                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{st.title}</span>
                                                                                </div>
                                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.is_done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                                                                    {st.is_done ? 'Selesai' : 'Pending'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* 4. KONTRIBUSI & BEBAN KERJA ANGGOTA TIM */}
                        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="size-4 text-indigo-500" />
                                        Persentase Penyelesaian per Anggota Tim
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Tingkat kontribusi dan penyelesaian jobdesk masing-masing person-in-charge (PIC)
                                    </p>
                                </div>
                            </div>

                            {project.members?.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Belum ada anggota tim yang ditugaskan secara spesifik ke proyek ini.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.members?.map((m) => {
                                        const mTasks = allTasks.filter((t) => t.assigned_to === m.user_id);
                                        const mTotal = mTasks.length;
                                        const mDone = mTasks.filter((t) => t.status === 'done').length;
                                        const mProgress = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
                                        const avatarUrl = getMemberAvatar(m.user);

                                        return (
                                            <div
                                                key={m.id}
                                                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between space-y-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full ring-2 ring-violet-500/30 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                            src={avatarUrl}
                                                            alt={m.user?.name || 'Avatar'}
                                                            className="size-full object-cover"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).src = '/images/me.webp';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                            {m.user?.name || 'Anggota Tim'}
                                                        </div>
                                                        <div className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold truncate">
                                                            {m.role_in_project}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-black text-sm text-slate-900 dark:text-white">
                                                            {mProgress}%
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            {mDone}/{mTotal} Tiket
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${mProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: SPRINTS */}
                {activeTab === 'sprints' && (
                    <div className="space-y-6 min-w-0 max-w-full">
                        {/* Header & Quick Stats */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Zap className="size-5 text-amber-500 fill-amber-500/20" />
                                    Siklus Sprint Proyek
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Bagi pengembangan fitur ke dalam iterasi 1-2 mingguan yang terukur, terkontrol, dan fokus pada target deliverable.
                                </p>
                            </div>

                            {is_admin && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        onClick={() => setIsSprintModalOpen(true)}
                                        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 text-xs font-semibold shadow-sm shadow-violet-500/25 cursor-pointer"
                                    >
                                        <Plus className="size-3.5" /> Tambah Sprint Baru
                                    </Button>
                                </div>
                            )}
                        </div>

                        {project.sprints?.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
                                Belum ada sprint untuk proyek ini. Klik tombol <strong>Tambah Sprint Baru</strong> di atas untuk membuat siklus kerja pertama.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0 max-w-full">
                                {project.sprints?.map((sprint) => {
                                    const totalTasks = sprint.tasks?.length ?? 0;
                                    const completedTasks = sprint.tasks?.filter((t: any) => t.status === 'done').length ?? 0;
                                    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                    return (
                                        <div
                                            key={sprint.id}
                                            className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 backdrop-blur-xl shadow-xs hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4 min-w-0"
                                        >
                                            {/* Top Status & Quick Action Buttons */}
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                                <div>
                                                    {sprint.status === 'active' && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[11px] font-bold gap-1.5 py-1 px-2.5">
                                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                                            Sedang Berjalan (Active)
                                                        </Badge>
                                                    )}
                                                    {sprint.status === 'completed' && (
                                                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 text-[11px] font-bold gap-1.5 py-1 px-2.5">
                                                            <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                            Selesai (Completed)
                                                        </Badge>
                                                    )}
                                                    {sprint.status === 'planned' && (
                                                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-[11px] font-bold gap-1.5 py-1 px-2.5">
                                                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                                                            Direncanakan (Planned)
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedSprintId(sprint.id);
                                                            taskForm.setData('sprint_id', sprint.id);
                                                            setIsTaskModalOpen(true);
                                                        }}
                                                        className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-slate-800 gap-1 h-8 px-2.5 rounded-lg font-semibold cursor-pointer"
                                                    >
                                                        <Plus className="size-3" /> Tugas
                                                    </Button>

                                                    {is_admin && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                                                >
                                                                    <MoreVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl">
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditSprintModal(sprint)}
                                                                    className="text-xs gap-2 font-medium cursor-pointer"
                                                                >
                                                                    <Pencil className="size-3.5 text-slate-400" /> Edit Rincian Sprint
                                                                </DropdownMenuItem>
                                                                {sprint.status !== 'active' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleSprintStatusChange(sprint, 'active')}
                                                                        className="text-xs gap-2 font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                                                    >
                                                                        <Play className="size-3.5" /> Jadikan Sprint Aktif
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {sprint.status !== 'completed' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleSprintStatusChange(sprint, 'completed')}
                                                                        className="text-xs gap-2 font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                                                                    >
                                                                        <CheckCircle2 className="size-3.5" /> Tandai Selesai
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {sprint.status !== 'planned' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleSprintStatusChange(sprint, 'planned')}
                                                                        className="text-xs gap-2 font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                                                                    >
                                                                        <Clock className="size-3.5" /> Kembalikan ke Planned
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                <DropdownMenuItem
                                                                    onClick={() => confirmDeleteSprint(sprint)}
                                                                    className="text-xs gap-2 font-medium text-rose-600 dark:text-rose-400 cursor-pointer"
                                                                >
                                                                    <Trash2 className="size-3.5" /> Hapus Sprint
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sprint Title & Goal Box */}
                                            <div className="space-y-2">
                                                <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                                                    {sprint.name}
                                                </h4>

                                                {sprint.goal ? (
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                                        <span className="font-bold text-violet-700 dark:text-violet-400 block mb-0.5 text-[10px] uppercase tracking-wider">
                                                            Sasaran / Goal:
                                                        </span>
                                                        <p className="line-clamp-3 leading-relaxed">
                                                            {sprint.goal}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">
                                                        Belum ada target sasaran yang ditulis.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Progress Bar of Tasks */}
                                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                    <span>Progres Tugas</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {percent}% ({completedTasks}/{totalTasks} Selesai)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                            percent === 100
                                                                ? 'bg-emerald-500'
                                                                : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                                                        }`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Sprint Card Footer: Clean Formatted Dates & Task Link */}
                                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                                                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                                                    <span>
                                                        {formatSprintDate(sprint.start_date)} - {formatSprintDate(sprint.end_date)}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('tasks')}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline cursor-pointer"
                                                >
                                                    <span>{totalTasks} Tugas</span>
                                                    <ArrowRight className="size-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: TASKS */}
                {activeTab === 'tasks' && (() => {
                    const myTasksCount = project.tasks?.filter((t) => t.assigned_to === current_user_id).length ?? 0;
                    const displayedTasks = (project.tasks ?? []).filter((task) => {
                        if (taskFilter === 'my_tasks') {
                            return task.assigned_to === current_user_id;
                        }
                        return true;
                    });

                    return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <ListTodo className="size-5 text-violet-500" />
                                    Daftar Tugas & Subtask
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Kelola rincian tiket pekerjaan, penugasan developer, dan status penyelesaian.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Jobdesk Filter Toggle */}
                                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setTaskFilter('all')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                            taskFilter === 'all'
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Semua Tugas ({project.tasks?.length ?? 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaskFilter('my_tasks')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                            taskFilter === 'my_tasks'
                                                ? 'bg-violet-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400'
                                        }`}
                                    >
                                        <CheckSquare className="size-3.5" />
                                        Jobdesk Saya ({myTasksCount})
                                    </button>
                                </div>

                                <Button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 text-xs cursor-pointer shadow-sm shadow-violet-500/25 shrink-0"
                                >
                                    <Plus className="size-3.5" /> Tambah Tugas Baru
                                </Button>
                            </div>
                        </div>

                        {displayedTasks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
                                {taskFilter === 'my_tasks'
                                    ? 'Belum ada tugas yang ditugaskan kepada Anda pada proyek ini.'
                                    : 'Belum ada tugas di dalam proyek ini.'}
                            </div>
                        ) : (
                            <div className="space-y-3 min-w-0 max-w-full">
                                {displayedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 backdrop-blur-xl shadow-xs hover:border-violet-500/40 transition-all space-y-3 min-w-0"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {task.title}
                                                    </span>
                                                    {task.assigned_to === current_user_id && (
                                                        <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-[10px] gap-1 px-2 py-0.5 shadow-xs border-0">
                                                            <CheckSquare className="size-2.5" /> Jobdesk Anda
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        className={`text-[10px] capitalize font-medium ${
                                                            task.status === 'done'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                : task.status === 'in_progress'
                                                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                {task.description && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                {task.assignee ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                                        <User className="size-3 text-slate-400" />
                                                        {task.assignee.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Belum ditugaskan</span>
                                                )}

                                                <Select
                                                    value={task.status}
                                                    onValueChange={(val) => {
                                                        router.patch(
                                                            `/studio/pms/tasks/${task.id}/status`,
                                                            { status: val },
                                                            { preserveScroll: true }
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="w-32 h-8 rounded-lg text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                        <SelectItem value="todo">Todo</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="review">Review</SelectItem>
                                                        <SelectItem value="done">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Subtasks Checklist */}
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                                                <span>Subtask Checklist ({task.subtasks?.filter(s => s.is_done).length ?? 0}/{task.subtasks?.length ?? 0})</span>
                                                <button
                                                    onClick={() => setActiveTaskIdForSubtask(activeTaskIdForSubtask === task.id ? null : task.id)}
                                                    className="text-violet-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="size-3" /> Tambah Subtask
                                                </button>
                                            </div>

                                            {task.subtasks?.map((subtask) => (
                                                <div
                                                    key={subtask.id}
                                                    onClick={() => handleToggleSubtask(subtask.id)}
                                                    className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                                >
                                                    <div className={`size-4 rounded border flex items-center justify-center ${subtask.is_done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                                                        {subtask.is_done && <Check className="size-3" />}
                                                    </div>
                                                    <span className={subtask.is_done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                                                        {subtask.title}
                                                    </span>
                                                </div>
                                            ))}

                                            {activeTaskIdForSubtask === task.id && (
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Input
                                                        value={newSubtaskTitle}
                                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                        placeholder="Ketik judul subtask lalu enter..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddSubtask(task.id);
                                                        }}
                                                        className="h-8 text-xs rounded-lg"
                                                    />
                                                    <Button size="sm" onClick={() => handleAddSubtask(task.id)} className="h-8 text-xs rounded-lg">
                                                        Simpan
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    );
                })()}

                {/* TAB: TEAM (DYNAMIC ROLES) */}
                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    Tim & Penugasan Peran Dinamis
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Tugaskan anggota tim dengan peran bebas (misal: Lead Architect, QA Tester, Frontend Specialist) tanpa terikat seeder statis.
                                </p>
                            </div>
                            {is_admin && (
                                <Button
                                    onClick={openAssignMemberModal}
                                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 gap-2 h-9 text-xs font-bold cursor-pointer"
                                >
                                    <UserPlus className="size-3.5" /> Tambah Anggota Tim Dinamis
                                </Button>
                            )}
                        </div>

                        {project.members?.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                                Belum ada anggota yang ditugaskan ke proyek ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 max-w-full">
                                {project.members?.map((member) => (
                                    <div
                                        key={member.id}
                                        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 backdrop-blur-xl shadow-xs flex items-center justify-between min-w-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Ornamental Circular Avatar */}
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-sm shadow-violet-500/30">
                                                    <div className="p-[1.5px] rounded-full bg-white dark:bg-slate-900">
                                                        <div className="size-11 rounded-full overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                                            <img
                                                                src={
                                                                    member.user?.avatar
                                                                        ? (member.user.avatar.startsWith('http') || member.user.avatar.startsWith('/')
                                                                            ? member.user.avatar
                                                                            : `/storage/${member.user.avatar}`)
                                                                        : (member.user?.is_admin || member.user?.email === 'ridhwananang@gmail.com'
                                                                            ? '/images/me.webp'
                                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || 'User')}&background=6366f1&color=ffffff&bold=true`)
                                                                }
                                                                alt={member.user?.name || 'Avatar'}
                                                                className="size-full object-cover"
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLImageElement).src = '/images/me.webp';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                    {member.user?.name}
                                                </div>
                                                <div className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate">
                                                    {member.role_in_project}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate">
                                                    {member.user?.email}
                                                </div>
                                            </div>
                                        </div>

                                        {is_admin && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => openDeleteMemberModal(member)}
                                                className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0 transition-colors"
                                                title={`Hapus penugasan ${member.user?.name ?? 'anggota'}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: FINANCES */}
                {is_admin && activeTab === 'finances' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    Catatan Keuangan & Struk Pembayaran
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Rekam termin masuk dari klien dan biaya pengeluaran langsung untuk proyek ini.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsFinanceModalOpen(true)}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 text-xs"
                            >
                                <Plus className="size-3.5" /> Catat Transaksi
                            </Button>
                        </div>

                        {project.finances?.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500">
                                Belum ada catatan transaksi keuangan untuk proyek ini.
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto min-w-0 max-w-full shadow-sm">
                                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-semibold text-slate-600 dark:text-slate-400">
                                            <th className="py-3 px-4">Tanggal</th>
                                            <th className="py-3 px-4">Jenis Transaksi</th>
                                            <th className="py-3 px-4">Keterangan / Judul</th>
                                            <th className="py-3 px-4">Kategori</th>
                                            <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                                            <th className="py-3 px-4 text-center">Struk / Bukti</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {project.finances?.map((fin) => (
                                            <tr key={fin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3 px-4 text-slate-500">{fin.transaction_date}</td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={fin.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}
                                                    >
                                                        {fin.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{fin.title}</td>
                                                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{fin.category ?? '-'}</td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                                                    {formatCurrency(fin.amount)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {fin.receipt_file || fin.receipt_url ? (
                                                        <a
                                                            href={fin.receipt_url ?? (fin.receipt_file?.startsWith('http') || fin.receipt_file?.startsWith('/') ? fin.receipt_file : `/storage/${fin.receipt_file}`)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center justify-center gap-1 font-semibold"
                                                        >
                                                            <Receipt className="size-3" /> Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: ATTACHMENTS */}
                {activeTab === 'attachments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    Berkas & Lampiran Proyek
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Simpan dokumen brief, aset grafis, dan berkas serah terima proyek.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsAttachmentModalOpen(true)}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 text-xs"
                            >
                                <Paperclip className="size-3.5" /> Unggah Berkas
                            </Button>
                        </div>

                        {project.attachments?.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                                Belum ada berkas lampiran yang diunggah.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0 max-w-full">
                                {project.attachments?.map((att) => (
                                    <div
                                        key={att.id}
                                        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 backdrop-blur-xl shadow-xs flex items-center justify-between min-w-0"
                                    >
                                        <div className="space-y-1 min-w-0 pr-2">
                                            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                                {att.file_name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {(att.file_size / 1024).toFixed(1)} KB • Oleh: {att.uploader?.name ?? 'Admin'}
                                            </div>
                                        </div>

                                        <a
                                            href={att.file_url ?? (att.file_path?.startsWith('http') || att.file_path?.startsWith('/') ? att.file_path : `/storage/${att.file_path}`)}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 shrink-0 transition-colors"
                                        >
                                            <Download className="size-3.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: ACTIVITY LOGS */}
                {activeTab === 'logs' && (
                    <div className="space-y-4 min-w-0 max-w-full">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                            Riwayat Audit & Perubahan Proyek
                        </h3>

                        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 backdrop-blur-xl shadow-xs space-y-3 min-w-0">
                            {project.activity_logs?.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada log aktivitas untuk proyek ini.
                                </div>
                            ) : (
                                project.activity_logs?.map((log) => (
                                    <div key={log.id} className="py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 text-xs flex items-center justify-between gap-3 min-w-0">
                                        <div className="min-w-0">
                                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                                {log.description}
                                            </span>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Aksi: {log.action} • Oleh: {log.user?.name ?? 'Sistem'}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* 1. SPRINT MODAL (CREATE) - SLEEK, COMPACT & RESPONSIF */}
                <Dialog open={isSprintModalOpen} onOpenChange={setIsSprintModalOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold w-fit">
                                <Zap className="size-3 text-violet-500 fill-violet-500/20" />
                                Sprint Iteration Engine
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-violet-500/25 shrink-0">
                                    <Zap className="size-4 fill-white/20" />
                                </div>
                                <span className="truncate">Buat Sprint Cycle Baru</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Rencanakan siklus iterasi pengerjaan fitur dengan target terukur.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSprint} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Nama Sprint */}
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Nama Sprint <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-normal text-slate-400">Wajib diisi</span>
                                </Label>
                                <Input
                                    required
                                    value={sprintForm.data.name}
                                    onChange={(e) => sprintForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Sprint 1 - Core Setup"
                                    className="rounded-xl h-9 text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 w-full min-w-0"
                                />

                                {/* Quick Presets */}
                                <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0 max-w-full">
                                    {SPRINT_NAME_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => sprintForm.setData('name', preset)}
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer truncate max-w-full ${
                                                sprintForm.data.name === preset
                                                    ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status Sprint - Sleek Segmented Bar */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Status Awal Sprint
                                </Label>
                                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                                    {[
                                        { key: 'planned', label: 'Direncanakan', icon: Calendar, color: 'text-slate-500' },
                                        { key: 'active', label: 'Sedang Aktif', icon: Zap, color: 'text-emerald-500' },
                                        { key: 'completed', label: 'Selesai', icon: CheckCircle2, color: 'text-violet-500' },
                                    ].map((s) => {
                                        const IconComp = s.icon;
                                        const isSelected = sprintForm.data.status === s.key;
                                        return (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => sprintForm.setData('status', s.key as any)}
                                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                <IconComp className={`size-3.5 shrink-0 ${s.color}`} />
                                                <span className="truncate">{s.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Goal Sprint */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Sasaran & Target Deliverable
                                </Label>
                                <Textarea
                                    rows={2}
                                    value={sprintForm.data.goal}
                                    onChange={(e) => sprintForm.setData('goal', e.target.value)}
                                    placeholder="Target atau deliverable utama yang harus diselesaikan pada sprint ini..."
                                    className="rounded-xl text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 resize-none w-full min-w-0"
                                />
                            </div>

                            {/* Tanggal & Durasi Cepat */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-1 flex-wrap min-w-0">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Rentang Pelaksanaan
                                    </Label>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {[
                                            { days: 7, label: '+1 Mgg' },
                                            { days: 14, label: '+2 Mgg' },
                                            { days: 30, label: '+1 Bln' },
                                        ].map((d) => (
                                            <button
                                                key={d.days}
                                                type="button"
                                                onClick={() => handleSetSprintDuration(d.days, false)}
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 transition-all cursor-pointer whitespace-nowrap"
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                    <div className="space-y-1 min-w-0">
                                        <Label className="text-[11px] font-medium text-slate-500">Mulai</Label>
                                        <Input
                                            type="date"
                                            value={sprintForm.data.start_date}
                                            onChange={(e) => sprintForm.setData('start_date', e.target.value)}
                                            className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                        />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <Label className="text-[11px] font-medium text-slate-500">Selesai</Label>
                                        <Input
                                            type="date"
                                            value={sprintForm.data.end_date}
                                            onChange={(e) => sprintForm.setData('end_date', e.target.value)}
                                            className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                        />
                                    </div>
                                </div>

                                {/* Live Duration Badge */}
                                {sprintForm.data.start_date && sprintForm.data.end_date && (
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-800 dark:text-violet-200 text-xs min-w-0">
                                        <CalendarDays className="size-3.5 text-violet-500 shrink-0" />
                                        <span className="truncate">
                                            Durasi: <strong>{getSprintDurationDays(sprintForm.data.start_date, sprintForm.data.end_date)} Hari</strong> (~{Math.ceil((getSprintDurationDays(sprintForm.data.start_date, sprintForm.data.end_date) || 0) / 7)} Minggu)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsSprintModalOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={sprintForm.processing}
                                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-violet-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <Zap className="size-3.5 mr-1.5" />
                                    {sprintForm.processing ? 'Menyimpan...' : 'Simpan Sprint'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 2. SPRINT MODAL (EDIT) - SLEEK, COMPACT & RESPONSIF */}
                <Dialog open={isEditSprintModalOpen} onOpenChange={setIsEditSprintModalOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold w-fit">
                                <Pencil className="size-3 text-violet-500" />
                                Modifikasi Siklus Sprint
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-violet-500/25 shrink-0">
                                    <Pencil className="size-4" />
                                </div>
                                <span className="truncate">Edit Siklus Sprint</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Perbarui sasaran capaian, status, serta durasi iterasi sprint.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateSprint} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Nama Sprint */}
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Nama Sprint <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    required
                                    value={editSprintForm.data.name}
                                    onChange={(e) => editSprintForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Sprint 1 - Core Setup"
                                    className="rounded-xl h-9 text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                />
                            </div>

                            {/* Status Sprint - Sleek Segmented Bar */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Status Sprint
                                </Label>
                                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                                    {[
                                        { key: 'planned', label: 'Direncanakan', icon: Calendar, color: 'text-slate-500' },
                                        { key: 'active', label: 'Sedang Aktif', icon: Zap, color: 'text-emerald-500' },
                                        { key: 'completed', label: 'Selesai', icon: CheckCircle2, color: 'text-violet-500' },
                                    ].map((s) => {
                                        const IconComp = s.icon;
                                        const isSelected = editSprintForm.data.status === s.key;
                                        return (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => editSprintForm.setData('status', s.key as any)}
                                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                <IconComp className={`size-3.5 shrink-0 ${s.color}`} />
                                                <span className="truncate">{s.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Goal Sprint */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Sasaran & Deliverable Sprint
                                </Label>
                                <Textarea
                                    rows={2}
                                    value={editSprintForm.data.goal}
                                    onChange={(e) => editSprintForm.setData('goal', e.target.value)}
                                    placeholder="Target atau deliverable utama yang harus selesai pada sprint ini..."
                                    className="rounded-xl text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 resize-none w-full min-w-0"
                                />
                            </div>

                            {/* Rentang Pelaksanaan */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-1 flex-wrap min-w-0">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Rentang Pelaksanaan
                                    </Label>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {[
                                            { days: 7, label: '+1 Mgg' },
                                            { days: 14, label: '+2 Mgg' },
                                            { days: 30, label: '+1 Bln' },
                                        ].map((d) => (
                                            <button
                                                key={d.days}
                                                type="button"
                                                onClick={() => handleSetSprintDuration(d.days, true)}
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 transition-all cursor-pointer whitespace-nowrap"
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                    <div className="space-y-1 min-w-0">
                                        <Label className="text-[11px] font-medium text-slate-500">Mulai</Label>
                                        <Input
                                            type="date"
                                            value={editSprintForm.data.start_date}
                                            onChange={(e) => editSprintForm.setData('start_date', e.target.value)}
                                            className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                        />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <Label className="text-[11px] font-medium text-slate-500">Selesai</Label>
                                        <Input
                                            type="date"
                                            value={editSprintForm.data.end_date}
                                            onChange={(e) => editSprintForm.setData('end_date', e.target.value)}
                                            className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                        />
                                    </div>
                                </div>

                                {editSprintForm.data.start_date && editSprintForm.data.end_date && (
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-800 dark:text-violet-200 text-xs min-w-0">
                                        <CalendarDays className="size-3.5 text-violet-500 shrink-0" />
                                        <span className="truncate">
                                            Durasi: <strong>{getSprintDurationDays(editSprintForm.data.start_date, editSprintForm.data.end_date)} Hari</strong> (~{Math.ceil((getSprintDurationDays(editSprintForm.data.start_date, editSprintForm.data.end_date) || 0) / 7)} Minggu)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditSprintModalOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editSprintForm.processing}
                                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-violet-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <Check className="size-3.5 mr-1.5" />
                                    {editSprintForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 3. DELETE SPRINT CONFIRMATION DIALOG - SLEEK DANGER */}
                <Dialog open={isDeleteSprintConfirmOpen} onOpenChange={setIsDeleteSprintConfirmOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/25 dark:border-rose-500/20 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1.5 min-w-0">
                            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs shrink-0">
                                <Trash2 className="size-5" />
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                                Hapus Siklus Sprint?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                                <div>
                                    Apakah Anda yakin ingin menghapus sprint <strong className="text-rose-600 dark:text-rose-400 font-bold">{sprintToDelete?.name}</strong>?
                                </div>
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                                    🛡️ <strong>Keamanan Data:</strong> Tiket tugas di dalam sprint ini aman dan otomatis dikembalikan ke antrean <em>backlog</em>.
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 relative z-10 flex flex-col-reverse sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteSprintConfirmOpen(false)}
                                className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="button"
                                onClick={executeDeleteSprint}
                                className="rounded-xl h-9 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 cursor-pointer w-full sm:w-auto"
                            >
                                <Trash2 className="size-3.5 mr-1.5" />
                                Ya, Hapus Sprint
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 4. TASK MODAL (CREATE) - SLEEK, COMPACT & 100% RESPONSIF */}
                <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold w-fit">
                                <ListTodo className="size-3 text-violet-500" />
                                Work Breakdown Ticket
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-violet-500/25 shrink-0">
                                    <ListTodo className="size-4" />
                                </div>
                                <span className="truncate">Buat Tugas Baru</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Tentukan rincian tugas, prioritas, estimasi jam, dan penugasan tim.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateTask} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Judul Tugas */}
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Judul Tugas <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-normal text-slate-400">Wajib diisi</span>
                                </Label>
                                <Input
                                    required
                                    value={taskForm.data.title}
                                    onChange={(e) => taskForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Slicing UI Dashboard Klien"
                                    className="rounded-xl h-9 text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 w-full min-w-0"
                                />

                                {/* Quick Presets Chips - Compact & Responsive */}
                                <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0 max-w-full">
                                    {TASK_TITLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => taskForm.setData('title', preset)}
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer truncate max-w-full ${
                                                taskForm.data.title === preset
                                                    ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Deskripsi & DoD */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Deskripsi & Kriteria Selesai (DoD)
                                </Label>
                                <Textarea
                                    rows={2}
                                    value={taskForm.data.description}
                                    onChange={(e) => taskForm.setData('description', e.target.value)}
                                    placeholder="Instruksi pengerjaan, link referensi Figma, atau kriteria pengujian..."
                                    className="rounded-xl text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 resize-none w-full min-w-0"
                                />
                            </div>

                            {/* Prioritas - Sleek Segmented Control (Zero Overflow!) */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Tingkat Prioritas
                                </Label>
                                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                                    {[
                                        { key: 'low', label: 'Low', dot: 'bg-emerald-500', active: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300' },
                                        { key: 'medium', label: 'Medium', dot: 'bg-sky-500', active: 'border-sky-500/40 text-sky-700 dark:text-sky-300' },
                                        { key: 'high', label: 'High', dot: 'bg-amber-500', active: 'border-amber-500/40 text-amber-700 dark:text-amber-300' },
                                        { key: 'urgent', label: 'Urgent', dot: 'bg-rose-500 animate-ping', active: 'border-rose-500/40 text-rose-700 dark:text-rose-300' },
                                    ].map((p) => {
                                        const isSelected = taskForm.data.priority === p.key;
                                        return (
                                            <button
                                                key={p.key}
                                                type="button"
                                                onClick={() => taskForm.setData('priority', p.key as any)}
                                                className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? `bg-white dark:bg-slate-800 shadow-xs border ${p.active}`
                                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
                                                }`}
                                            >
                                                <span className={`size-2 rounded-full shrink-0 ${p.dot}`} />
                                                <span className="truncate">{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sprint & Ditugaskan Kepada */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Siklus Sprint
                                    </Label>
                                    <Select
                                        value={taskForm.data.sprint_id ? String(taskForm.data.sprint_id) : 'none'}
                                        onValueChange={(val) => taskForm.setData('sprint_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0">
                                            <SelectValue placeholder="Pilih Sprint" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tanpa Sprint (Backlog)</SelectItem>
                                            {project.sprints?.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Ditugaskan Kepada
                                    </Label>
                                    <Select
                                        value={taskForm.data.assigned_to ? String(taskForm.data.assigned_to) : 'none'}
                                        onValueChange={(val) => taskForm.setData('assigned_to', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0">
                                            <SelectValue placeholder="Belum Ditugaskan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Belum Ditugaskan</SelectItem>
                                            {availableUsers.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Live Assignee Preview Pill if assigned */}
                            {taskForm.data.assigned_to && taskForm.data.assigned_to !== 'none' && (() => {
                                const assignee = availableUsers.find(u => String(u.id) === String(taskForm.data.assigned_to));
                                if (!assignee) return null;
                                return (
                                    <div className="flex items-center gap-2.5 p-2 rounded-xl border border-violet-500/20 bg-violet-500/5 text-xs min-w-0">
                                        <div className="size-6 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                            {assignee.avatar ? (
                                                <img
                                                    src={assignee.avatar.startsWith('http') || assignee.avatar.startsWith('/') ? assignee.avatar : `/storage/${assignee.avatar}`}
                                                    alt={assignee.name}
                                                    className="size-full rounded-full object-cover"
                                                />
                                            ) : (
                                                assignee.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white truncate flex-1">{assignee.name}</span>
                                        <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 text-[10px] font-bold shrink-0">
                                            {assignee.role_title || 'Anggota Tim'}
                                        </Badge>
                                    </div>
                                );
                            })()}

                            {/* Tenggat Waktu (Due Date) */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Tenggat Waktu (Due Date)
                                </Label>
                                <Input
                                    type="date"
                                    value={taskForm.data.due_date}
                                    onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                    className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 w-full min-w-0"
                                />
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={taskForm.processing}
                                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-violet-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <Plus className="size-3.5 mr-1.5" />
                                    {taskForm.processing ? 'Menyimpan...' : 'Buat Tugas Baru'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 5. TAMBAH ANGGOTA TIM DINAMIS MODAL - SLEEK & COMPACT */}
                <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold w-fit">
                                <Sparkles className="size-3 text-violet-500" />
                                Dynamic Personnel Allocation
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-violet-500/25 shrink-0">
                                    <UserPlus className="size-4" />
                                </div>
                                <span className="truncate">Tambah Anggota Tim Dinamis</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Amanahkan peran strategis kepada personil tim tanpa batasan peran enum statis.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAssignMember} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Live Persona Preview Card */}
                            {selectedAssignUser && (
                                <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 dark:border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-3 backdrop-blur-xl shadow-inner min-w-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative size-12 rounded-full overflow-hidden bg-violet-900 flex items-center justify-center text-white shrink-0 border-2 border-violet-500/40">
                                            {selectedAssignUser.avatar ? (
                                                <img
                                                    src={selectedAssignUser.avatar.startsWith('http') || selectedAssignUser.avatar.startsWith('/') ? selectedAssignUser.avatar : `/storage/${selectedAssignUser.avatar}`}
                                                    alt={selectedAssignUser.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-base font-bold text-white">
                                                    {selectedAssignUser.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                    {selectedAssignUser.name}
                                                </h4>
                                                <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 text-[9px] font-bold shrink-0">
                                                    {selectedAssignUser.role_title || 'Anggota Inti'}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                                {selectedAssignUser.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pilih User */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Pilih Personil Pengguna <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-medium text-slate-400">Total: {availableUsers.length}</span>
                                </Label>
                                <select
                                    value={String(memberForm.data.user_id || (selectedAssignUser ? selectedAssignUser.id : ''))}
                                    onChange={(e) => {
                                        const uid = Number(e.target.value);
                                        memberForm.setData('user_id', uid);
                                        const user = availableUsers.find((u) => u.id === uid);
                                        if (user && !memberForm.data.role_in_project) {
                                            memberForm.setData('role_in_project', user.role_title || 'Core Specialist');
                                        }
                                    }}
                                    className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-violet-500 outline-none truncate"
                                >
                                    {availableUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.role_title || 'Anggota'}) • {u.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dynamic Role Input & Presets */}
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Peran Dinamis Dalam Proyek Ini <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    required
                                    value={memberForm.data.role_in_project}
                                    onChange={(e) => memberForm.setData('role_in_project', e.target.value)}
                                    placeholder="Ketik peran kustom (misal: Lead Cloud Architect)"
                                    className="rounded-xl h-9 text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                />

                                {/* Quick Presets */}
                                <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0 max-w-full">
                                    {DYNAMIC_ROLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => memberForm.setData('role_in_project', preset)}
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer truncate max-w-full ${
                                                memberForm.data.role_in_project === preset
                                                    ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center justify-between min-w-0">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Tarif Per Jam (Hourly Rate)
                                    </Label>
                                    <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
                                </div>
                                <div className="relative min-w-0">
                                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                                        Rp
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={memberForm.data.hourly_rate}
                                        onChange={(e) => memberForm.setData('hourly_rate', e.target.value)}
                                        placeholder="0"
                                        className="rounded-xl h-9 text-xs pl-9 pr-14 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                    />
                                    <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400">
                                        / jam
                                    </span>
                                </div>

                                {/* Live Rate Formatter & Quick Chips */}
                                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5 min-w-0">
                                    <div className="flex flex-wrap gap-1 min-w-0">
                                        {[
                                            { val: '75000', label: '75rb' },
                                            { val: '100000', label: '100rb' },
                                            { val: '150000', label: '150rb' },
                                            { val: '250000', label: '250rb' },
                                        ].map((r) => (
                                            <button
                                                key={r.val}
                                                type="button"
                                                onClick={() => memberForm.setData('hourly_rate', r.val)}
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 hover:border-slate-300 text-slate-600 dark:text-slate-400 cursor-pointer"
                                            >
                                                +{r.label}
                                            </button>
                                        ))}
                                    </div>

                                    {memberForm.data.hourly_rate && Number(memberForm.data.hourly_rate) > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 truncate">
                                            ≈ {formatCurrency(memberForm.data.hourly_rate)} / jam
                                        </span>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAssignMemberOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={memberForm.processing}
                                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-violet-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <UserCheck className="size-3.5 mr-1.5" />
                                    {memberForm.processing ? 'Menugaskan...' : 'Tugaskan Personil'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL KONFIRMASI HAPUS ANGGOTA TIM - SLEEK DANGER & RESPONSIF */}
                <Dialog open={isDeleteMemberConfirmOpen} onOpenChange={setIsDeleteMemberConfirmOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/25 dark:border-rose-500/20 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-2 min-w-0">
                            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs shrink-0">
                                <Trash2 className="size-5" />
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                                Hapus Anggota Tim?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2.5">
                                <div>
                                    Apakah Anda yakin ingin menghapus penugasan personil <strong className="text-rose-600 dark:text-rose-400 font-bold">{memberToDelete?.user?.name}</strong> dari proyek ini?
                                </div>

                                {memberToDelete && (
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 min-w-0">
                                        <div className="size-9 rounded-full overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                            {memberToDelete.user?.avatar ? (
                                                <img
                                                    src={
                                                        memberToDelete.user.avatar.startsWith('http') || memberToDelete.user.avatar.startsWith('/')
                                                            ? memberToDelete.user.avatar
                                                            : `/storage/${memberToDelete.user.avatar}`
                                                    }
                                                    alt={memberToDelete.user?.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                memberToDelete.user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                {memberToDelete.user?.name}
                                            </div>
                                            <div className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold truncate">
                                                {memberToDelete.role_in_project}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate">
                                                {memberToDelete.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                                    🛡️ <strong>Keamanan Akun:</strong> Akun personil tidak dihapus dari sistem, melainkan hanya dilepas dari alokasi penugasan proyek ini.
                                </div>
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isDeletingMember}
                                onClick={() => setIsDeleteMemberConfirmOpen(false)}
                                className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="button"
                                disabled={isDeletingMember}
                                onClick={executeDeleteMember}
                                className="rounded-xl h-9 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 cursor-pointer w-full sm:w-auto"
                            >
                                <Trash2 className="size-3.5 mr-1.5" />
                                {isDeletingMember ? 'Menghapus...' : 'Ya, Hapus Anggota'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 6. FINANCE TRANSACTION MODAL - SLEEK & COMPACT */}
                <Dialog open={isFinanceModalOpen} onOpenChange={setIsFinanceModalOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold w-fit">
                                <Coins className="size-3 text-emerald-500" />
                                Fiscal & Cashflow Ledger
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25 shrink-0">
                                    <Coins className="size-4" />
                                </div>
                                <span className="truncate">Catat Transaksi Keuangan</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Dokumentasikan arus kas termin masuk atau beban pengeluaran proyek.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateFinance} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Tipe Transaksi - Sleek Segmented Bar */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Tipe Transaksi
                                </Label>
                                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            financeForm.setData('type', 'income');
                                            if (!financeForm.data.category) financeForm.setData('category', 'Termin Klien');
                                        }}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                            financeForm.data.type === 'income'
                                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <TrendingUp className="size-3.5 shrink-0" />
                                        <span className="truncate">Pemasukan (Termin)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            financeForm.setData('type', 'project_expense');
                                            if (!financeForm.data.category) financeForm.setData('category', 'Operasional Proyek');
                                        }}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                            financeForm.data.type === 'project_expense'
                                                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs border border-rose-500/30'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <Receipt className="size-3.5 shrink-0" />
                                        <span className="truncate">Pengeluaran Proyek</span>
                                    </button>
                                </div>
                            </div>

                            {/* Judul Transaksi & Presets */}
                            <div className="space-y-1.5 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Keterangan Transaksi <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-normal text-slate-400">Wajib diisi</span>
                                </Label>
                                <Input
                                    required
                                    value={financeForm.data.title}
                                    onChange={(e) => financeForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Pembayaran Termin 1 DP 50%"
                                    className="rounded-xl h-9 text-xs font-medium border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-900 w-full min-w-0"
                                />

                                {/* Dynamic Presets */}
                                <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0 max-w-full">
                                    {(financeForm.data.type === 'income' ? FINANCE_INCOME_PRESETS : FINANCE_EXPENSE_PRESETS).map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => financeForm.setData('title', preset)}
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer truncate max-w-full ${
                                                financeForm.data.title === preset
                                                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nominal Transaksi (Rp) with Live Formatter */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative min-w-0">
                                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                                        Rp
                                    </span>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={financeForm.data.amount}
                                        onChange={(e) => financeForm.setData('amount', e.target.value)}
                                        placeholder="0"
                                        className="rounded-xl h-9 text-xs pl-9 pr-3 font-mono font-bold border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                    />
                                </div>

                                {/* Live Indonesian Rupiah Banner & Quick Increments */}
                                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5 min-w-0">
                                    <div className="flex flex-wrap gap-1 min-w-0">
                                        {[
                                            { val: 500000, label: '+500rb' },
                                            { val: 1000000, label: '+1jt' },
                                            { val: 5000000, label: '+5jt' },
                                            { val: 10000000, label: '+10jt' },
                                        ].map((inc) => (
                                            <button
                                                key={inc.val}
                                                type="button"
                                                onClick={() => {
                                                    const cur = Number(financeForm.data.amount) || 0;
                                                    financeForm.setData('amount', String(cur + inc.val));
                                                }}
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 hover:border-slate-300 text-slate-600 dark:text-slate-400 cursor-pointer"
                                            >
                                                {inc.label}
                                            </button>
                                        ))}
                                    </div>

                                    {financeForm.data.amount && Number(financeForm.data.amount) > 0 && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border truncate ${
                                            financeForm.data.type === 'income'
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                                        }`}>
                                            {financeForm.data.type === 'income' ? '+ ' : '- '}
                                            {formatCurrency(financeForm.data.amount)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Kategori & Tanggal Transaksi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] font-medium text-slate-500">Kategori</Label>
                                    <Input
                                        value={financeForm.data.category}
                                        onChange={(e) => financeForm.setData('category', e.target.value)}
                                        placeholder="Termin / Cloud Hosting"
                                        className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                    />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <Label className="text-[11px] font-medium text-slate-500">Tanggal Transaksi</Label>
                                    <Input
                                        type="date"
                                        value={financeForm.data.transaction_date}
                                        onChange={(e) => financeForm.setData('transaction_date', e.target.value)}
                                        className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0"
                                    />
                                </div>
                            </div>

                            {/* Interactive Receipt Upload Dropzone */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Struk / Bukti Transfer</span>
                                    <span className="text-[10px] font-normal text-slate-400">Opsional</span>
                                </Label>

                                <input
                                    ref={receiptInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => financeForm.setData('receipt', e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                {financeForm.data.receipt ? (
                                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                                                {(financeForm.data.receipt as File).name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                                                ({formatFileSize((financeForm.data.receipt as File).size)})
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => financeForm.setData('receipt', null)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => receiptInputRef.current?.click()}
                                        className="w-full p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/40 dark:bg-slate-950/40 text-center transition-all cursor-pointer group min-w-0"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            <UploadCloud className="size-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                                            <span>Unggah bukti struk / transfer (JPG, PNG, PDF maks 5MB)</span>
                                        </div>
                                    </button>
                                )}
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsFinanceModalOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={financeForm.processing}
                                    className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-xl shadow-md shadow-emerald-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <Coins className="size-3.5 mr-1.5" />
                                    {financeForm.processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 7. ATTACHMENT MODAL (UPLOAD) - SLEEK & COMPACT */}
                <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
                    <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[88vh] text-slate-900 dark:text-slate-100 min-w-0">
                        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold w-fit">
                                <Paperclip className="size-3 text-cyan-500" />
                                Digital Asset Vault
                            </div>
                            <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                                <div className="size-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-cyan-500/25 shrink-0">
                                    <Paperclip className="size-4" />
                                </div>
                                <span className="truncate">Unggah Berkas Lampiran Proyek</span>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                Simpan dokumen cetak biru, spesifikasi teknis, atau aset grafis proyek.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUploadAttachment} className="space-y-3.5 pt-1.5 relative z-10 min-w-0">
                            {/* Interactive File Dropzone */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Pilih Berkas Lampiran <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-normal text-slate-400">Maksimal 20MB</span>
                                </Label>

                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    required
                                    onChange={(e) => attachmentForm.setData('file', e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                {attachmentForm.data.file ? (
                                    <div className="p-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between gap-2.5 min-w-0">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <FileText className="size-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                                                    {(attachmentForm.data.file as File).name}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        {formatFileSize((attachmentForm.data.file as File).size)}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-600 font-semibold">• Siap diunggah</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => attachmentForm.setData('file', null)}
                                            className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => attachmentInputRef.current?.click()}
                                        className="w-full p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-950/50 text-center transition-all cursor-pointer group min-w-0"
                                    >
                                        <UploadCloud className="size-6 text-slate-400 group-hover:text-cyan-500 mx-auto transition-colors" />
                                        <span className="block mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Klik untuk memilih atau seret berkas ke sini
                                        </span>
                                        <span className="block text-[10px] text-slate-400 mt-0.5">
                                            PDF, DOCX, XLSX, ZIP, PNG, JPG (Maksimal 20MB)
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Hubungkan ke Tiket Tugas */}
                            <div className="space-y-1 min-w-0">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Hubungkan ke Tiket Tugas (Opsional)
                                </Label>
                                <Select
                                    value={attachmentForm.data.task_id ? String(attachmentForm.data.task_id) : 'none'}
                                    onValueChange={(val) => attachmentForm.setData('task_id', val === 'none' ? null : Number(val))}
                                >
                                    <SelectTrigger className="rounded-xl h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 w-full min-w-0">
                                        <SelectValue placeholder="Lampiran Umum Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Lampiran Umum Proyek
                                        </SelectItem>
                                        {project.tasks?.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                #{t.id} {t.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAttachmentModalOpen(false)}
                                    className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 cursor-pointer w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={attachmentForm.processing || !attachmentForm.data.file}
                                    className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white rounded-xl shadow-md shadow-cyan-500/25 h-9 px-5 text-xs font-bold cursor-pointer w-full sm:w-auto"
                                >
                                    <FileUp className="size-3.5 mr-1.5" />
                                    {attachmentForm.processing ? 'Mengunggah...' : 'Unggah Berkas'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
