export interface ClientSubtask {
    id: number;
    task_id: number;
    title: string;
    is_done: boolean;
    completed_at?: string | null;
}

export interface ClientAttachment {
    id: number;
    task_id?: number | null;
    task_title?: string | null;
    file_name: string;
    file_path: string;
    file_url?: string | null;
    file_size: number;
    file_type?: string | null;
    uploader_name?: string | null;
    created_at?: string | null;
}

export interface ClientMember {
    id: number;
    user_id: number;
    name: string;
    role_in_project: string;
    role_title?: string | null;
    avatar?: string | null;
    is_admin?: boolean;
}

export interface ClientTask {
    id: number;
    project_id: number;
    sprint_id?: number | null;
    assigned_to?: number | null;
    title: string;
    description?: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string | null;
    created_at?: string | null;
    sprint?: {
        id: number;
        name: string;
        status: string;
    } | null;
    assignee_role: string;
    assignee_name: string;
    assignee_avatar?: string | null;
    subtasks?: ClientSubtask[];
    attachments?: ClientAttachment[];
}

export interface ClientSprint {
    id: number;
    name: string;
    goal?: string | null;
    status: 'planned' | 'active' | 'completed';
    start_date?: string | null;
    end_date?: string | null;
    tasks_count: number;
    done_tasks_count: number;
    progress_percentage: number;
}

export interface ClientProjectDetail {
    background?: string | null;
    objective?: string | null;
    scope?: string | null;
    deliverables?: string | null;
    live_demo_url?: string | null;
    tech_stack?: string[] | null;
}

export interface ClientProject {
    id: number;
    name: string;
    code: string;
    client: string;
    creator_name?: string | null;
    description?: string | null;
    status: string;
    priority: string;
    start_date?: string | null;
    end_date?: string | null;
    progress_percentage: number;
    detail?: ClientProjectDetail | null;
    sprints: ClientSprint[];
    tasks: ClientTask[];
    members?: ClientMember[];
    attachments?: ClientAttachment[];
}

export interface ClientMetrics {
    total_tasks: number;
    done_tasks: number;
    in_progress_tasks: number;
    review_tasks: number;
    todo_tasks: number;
    total_subtasks: number;
    done_subtasks: number;
    subtask_percentage: number;
}

export interface HoveredGanttItem {
    name: string;
    type: 'project' | 'sprint' | 'task';
    status: string;
    priority?: string;
    start_date: string;
    end_date: string;
    durationDays: number;
    progress?: number;
    assignee_name?: string;
    assignee_role?: string;
    clientX: number;
    clientY: number;
}

export type PortalTabKey =
    | 'blueprint'
    | 'sprints'
    | 'tasks'
    | 'reports'
    | 'team'
    | 'attachments'
    | 'timeline';
