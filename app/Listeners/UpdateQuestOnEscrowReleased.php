<?php

namespace App\Listeners;

use App\Enums\QuestStatus;
use App\Events\EscrowReleased;
use Illuminate\Support\Facades\Log;

class UpdateQuestOnEscrowReleased
{
    public function handle(EscrowReleased $event): void
    {
        $quest = $event->quest;

        $quest->update([
            'status' => QuestStatus::COMPLETED,
            'completed_at' => now(),
        ]);

        Log::info("Quest #{$quest->id} berhasil ditandai COMPLETED setelah pencairan dana ke worker selesai.", [
            'quest_id' => $quest->id,
            'transaction_id' => $event->transaction->id,
        ]);

        if ($quest->projectOrder) {
            $quest->projectOrder->update(['status' => 'completed']);
        }
    }
}
