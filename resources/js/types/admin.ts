export interface Education {
    school: string;
    major?: string;
    period?: string;
}

export interface Profile {
    id: number;
    name: string;
    role: string;
    bio: string;
    location: string;
    email: string;
    image?: string | null;
    image_url?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    education?: Education[] | null;
    created_at?: string;
    updated_at?: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    tags: string[];
    mockup_type: string;
    image?: string | null;
    image_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface TechStack {
    id: number;
    name: string;
    description: string;
    badge: string;
    color: string;
    text_color: string;
    accent: string;
    icon_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Certificate {
    id: number;
    title: string;
    category: string;
    issuer: string;
    credential_id?: string | null;
    date: string;
    duration: string;
    skills: string[];
    file_path?: string | null;
    file_url?: string | null;
    thumbnail_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Message {
    id: number;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    is_read: boolean;
    reply_content?: string | null;
    replied_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'in_progress' | 'pending';
    updated_at?: string | null;
}

export interface ClientRevision {
    id: string;
    text: string;
    created_at: string;
    status?: 'pending' | 'resolved';
}

export interface HandoverData {
    repository_url?: string | null;
    live_domain_url?: string | null;
    cms_admin_url?: string | null;
    cms_admin_username?: string | null;
    cms_admin_password?: string | null;
    documentation_url?: string | null;
    notes?: string | null;
}

export interface ClientBrief {
    target_audience?: string | null;
    reference_websites?: string | null;
    brand_assets_url?: string | null;
    color_preferences?: string | null;
    additional_requirements?: string | null;
}

export interface ProjectOrder {
    id: number;
    tracking_code: string;
    client_name: string;
    client_email: string;
    client_phone?: string | null;
    project_type: string;
    selected_features?: string[] | null;
    client_brief?: ClientBrief | null;
    delivery_speed: string;
    notes?: string | null;
    total_amount: string | number;
    currency: string;
    payment_scheme?: 'down_payment' | 'full_payment';
    dp_percentage?: number | string;
    dp_amount?: number | string;
    remaining_amount?: number | string;
    payment_stage?: 'awaiting_dp' | 'dp_paid' | 'awaiting_final' | 'fully_paid';
    dp_paid_at?: string | null;
    final_paid_at?: string | null;
    dp_transaction_id?: number | null;
    final_transaction_id?: number | null;
    dp_transaction?: {
        id: number;
        status: string;
        amount: number;
        xendit_external_id?: string;
        payment_details?: {
            invoice_url?: string;
            token?: string;
            transaction_id?: string;
            payment_type?: string;
        };
        paid_at?: string | null;
    } | null;
    final_transaction?: {
        id: number;
        status: string;
        amount: number;
        xendit_external_id?: string;
        payment_details?: {
            invoice_url?: string;
            token?: string;
            transaction_id?: string;
            payment_type?: string;
        };
        paid_at?: string | null;
    } | null;
    status: 'pending_payment' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
    milestone_progress?: ProjectMilestone[] | null;
    staging_url?: string | null;
    handover_data?: HandoverData | null;
    revision_notes?: ClientRevision[] | null;
    quest_id?: number | null;
    quest?: {
        id: number;
        status: string;
        reward_amount: number;
        deposit_transaction?: {
            id: number;
            reference_number: string;
            status: string;
            amount: number;
            payment_details?: {
                invoice_url?: string;
                token?: string;
                transaction_id?: string;
                payment_type?: string;
                status_code?: string;
            };
            paid_at?: string | null;
        } | null;
        dp_deposit_transaction?: {
            id: number;
            status: string;
            amount: number;
            payment_details?: {
                invoice_url?: string;
                token?: string;
            };
            paid_at?: string | null;
        } | null;
        final_deposit_transaction?: {
            id: number;
            status: string;
            amount: number;
            payment_details?: {
                invoice_url?: string;
                token?: string;
            };
            paid_at?: string | null;
        } | null;
        payout_transaction?: {
            id: number;
            reference_number: string;
            status: string;
            amount: number;
            released_at?: string | null;
        } | null;
        poster?: {
            id: number;
            name: string;
            email: string;
        } | null;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface ServicePackage {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    base_price: number | string;
    timeline: string;
    icon: string;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number;
    features_included?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

export interface ServiceAddon {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    price: number | string;
    icon: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface ServiceSettingsMap {
    express_multiplier?: string;
    consultation_phone?: string;
    guarantee_badge_text?: string;
    default_dp_percentage?: string;
    [key: string]: string | undefined;
}

