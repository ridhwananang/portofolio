export interface PmsUser {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    role_title?: string | null;
    status: 'active' | 'inactive';
    is_admin?: boolean;
    created_at?: string;
    pms_projects_count?: number;
    assigned_pms_tasks_count?: number;
}

export interface PmsProjectDetail {
    id?: number;
    project_id?: number;
    background?: string | null;
    objective?: string | null;
    scope?: string | null;
    tech_stack?: string[] | null;
    deliverables?: string | null;
    repository_url?: string | null;
    live_demo_url?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface PmsProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    role_in_project: string;
    hourly_rate?: number | string | null;
    joined_at?: string | null;
    user?: PmsUser;
}

export interface PmsSubtask {
    id: number;
    task_id: number;
    title: string;
    is_done: boolean;
    completed_at?: string | null;
    created_at?: string;
}

export interface PmsAttachment {
    id: number;
    project_id?: number | null;
    task_id?: number | null;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type?: string | null;
    uploaded_by: number;
    uploader?: PmsUser;
    created_at: string;
}

export interface PmsTask {
    id: number;
    project_id: number;
    sprint_id?: number | null;
    title: string;
    description?: string | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: number | null;
    due_date?: string | null;
    estimated_hours?: number | string;
    actual_hours?: number | string;
    order_index: number;
    created_by: number;
    assignee?: PmsUser | null;
    creator?: PmsUser;
    sprint?: PmsSprint | null;
    project?: {
        id: number;
        name: string;
        code: string;
    };
    subtasks?: PmsSubtask[];
    attachments?: PmsAttachment[];
    subtasks_count?: number;
    completed_subtasks_count?: number;
    created_at?: string;
}

export interface PmsSprint {
    id: number;
    project_id: number;
    name: string;
    goal?: string | null;
    status: 'planned' | 'active' | 'completed';
    start_date?: string | null;
    end_date?: string | null;
    tasks?: PmsTask[];
    tasks_count?: number;
    completed_tasks_count?: number;
    progress_percentage?: number;
    project?: {
        id: number;
        name: string;
        code: string;
    };
    created_at?: string;
}

export interface PmsFinance {
    id: number;
    project_id?: number | null;
    type: 'income' | 'project_expense' | 'general_expense';
    title: string;
    category?: string | null;
    amount: number | string;
    transaction_date: string;
    notes?: string | null;
    receipt_file?: string | null;
    created_by: number;
    project?: {
        id: number;
        name: string;
        code: string;
    } | null;
    creator?: PmsUser;
    created_at?: string;
}

export interface PmsActivityLog {
    id: number;
    project_id?: number | null;
    user_id?: number | null;
    action: string;
    entity_type: string;
    description: string;
    properties?: Record<string, any> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    project?: {
        id: number;
        name: string;
        code: string;
    } | null;
    user?: PmsUser | null;
}

export interface PmsProject {
    id: number;
    name: string;
    code: string;
    client: string;
    description?: string | null;
    budget: number | string;
    status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    start_date?: string | null;
    end_date?: string | null;
    project_order_id?: number | null;
    created_by: number;
    progress_percentage: number;
    total_income: number;
    total_expense: number;
    remaining_budget: number;
    budget_burn_rate: number;
    creator?: PmsUser;
    detail?: PmsProjectDetail | null;
    members?: PmsProjectMember[];
    sprints?: PmsSprint[];
    tasks?: PmsTask[];
    finances?: PmsFinance[];
    attachments?: PmsAttachment[];
    activity_logs?: PmsActivityLog[];
    project_order?: any;
    created_at?: string;
}

export interface PmsStats {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    total_budget: number;
    total_income: number;
    total_expenses: number;
    remaining_budget: number;
    total_tasks: number;
    open_tasks: number;
    completed_tasks: number;
    active_sprints: number;
}

export interface PmsProjectHealth {
    id: number;
    name: string;
    code: string;
    client: string;
    status: string;
    priority: string;
    progress: number;
    active_sprints: number;
    open_tasks: number;
    total_tasks: number;
    days_left: number | null;
    budget: number;
    spent: number;
    burn_rate: number;
}

export interface PmsTimelineItem {
    type: 'project' | 'sprint' | 'task';
    id: string;
    project_id: number;
    project_name?: string;
    name: string;
    code?: string;
    status: string;
    priority?: string;
    start_date: string;
    end_date: string;
    progress?: number;
    tasks_count?: number;
    assignee_name?: string;
    assignee_avatar?: string | null;
}
