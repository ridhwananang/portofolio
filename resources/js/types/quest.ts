export type QuestStatusType =
    | 'draft'
    | 'pending_payment'
    | 'open'
    | 'in_progress'
    | 'under_review'
    | 'completed'
    | 'cancelled'
    | 'disputed';

export type TransactionStatusType =
    | 'pending'
    | 'held'
    | 'releasing'
    | 'released'
    | 'failed'
    | 'expired'
    | 'refunded';

export type TransactionTypeType = 'deposit' | 'payout' | 'refund';

export interface QuestTransaction {
    id: number;
    uuid: string;
    quest_id: number;
    user_id: number;
    type: TransactionTypeType;
    amount: string;
    currency: string;
    status: TransactionStatusType;
    xendit_id: string | null;
    xendit_external_id: string;
    payment_method: string | null;
    payment_channel: string | null;
    payment_details: Record<string, any> | null;
    paid_at: string | null;
    released_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface QuestUser {
    id: number;
    name: string;
    email: string;
}

export interface Quest {
    id: number;
    poster_id: number;
    worker_id: number | null;
    title: string;
    description: string;
    reward_amount: string;
    fee_amount: string;
    total_amount: string;
    currency: string;
    status: QuestStatusType;
    submitted_work_notes: string | null;
    dispute_reason: string | null;
    submitted_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    poster?: QuestUser;
    worker?: QuestUser | null;
    transactions?: QuestTransaction[];
    deposit_transaction?: QuestTransaction | null;
    payout_transaction?: QuestTransaction | null;
}
