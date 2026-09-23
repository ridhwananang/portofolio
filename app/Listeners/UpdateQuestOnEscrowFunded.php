<?php

namespace App\Listeners;

use App\Enums\QuestStatus;
use App\Events\EscrowFunded;
use Illuminate\Support\Facades\Log;

class UpdateQuestOnEscrowFunded
{
    public function handle(EscrowFunded $event): void
    {
        $quest = $event->quest;
        
        // Update quest status to OPEN if it's currently draft or pending payment
        if (in_array($quest->status, [QuestStatus::DRAFT, QuestStatus::PENDING_PAYMENT])) {
            $quest->update([
                'status' => QuestStatus::OPEN,
            ]);

            Log::info("Quest #{$quest->id} berhasil diaktifkan menjadi OPEN setelah pembayaran deposit rekber.", [
                'quest_id' => $quest->id,
                'transaction_id' => $event->transaction->id,
            ]);
        }

        if ($order = $quest->projectOrder) {
            $isFinal = str_contains($event->transaction->xendit_external_id, '-FINAL-') 
                || (($event->transaction->payment_details['stage'] ?? '') === 'final')
                || ($order->final_transaction_id === $event->transaction->id);

            if ($isFinal) {
                $milestones = $order->milestone_progress ?? \App\Models\ProjectOrder::getDefaultMilestones();
                foreach ($milestones as &$m) {
                    $m['status'] = 'completed';
                    if (empty($m['updated_at'])) {
                        $m['updated_at'] = ($event->transaction->paid_at ?? now())->toIso8601String();
                    }
                }

                $order->update([
                    'status' => 'completed',
                    'payment_stage' => 'fully_paid',
                    'final_paid_at' => $event->transaction->paid_at ?? now(),
                    'final_transaction_id' => $event->transaction->id,
                    'milestone_progress' => $milestones,
                ]);
            } else {
                $milestones = $order->milestone_progress ?? \App\Models\ProjectOrder::getDefaultMilestones();
                foreach ($milestones as &$m) {
                    if ($m['id'] === 'deposit') {
                        $m['status'] = 'completed';
                        if (empty($m['updated_at'])) {
                            $m['updated_at'] = ($event->transaction->paid_at ?? now())->toIso8601String();
                        }
                    }
                }

                $order->update([
                    'status' => in_array($order->status, ['pending_payment', 'awaiting_dp']) ? 'in_progress' : ($order->status ?: 'in_progress'),
                    'payment_stage' => in_array($order->payment_stage, ['awaiting_final', 'fully_paid']) ? $order->payment_stage : 'dp_paid',
                    'dp_paid_at' => $order->dp_paid_at ?? ($event->transaction->paid_at ?? now()),
                    'dp_transaction_id' => $event->transaction->id,
                    'milestone_progress' => $milestones,
                ]);
            }
        }
    }
}
