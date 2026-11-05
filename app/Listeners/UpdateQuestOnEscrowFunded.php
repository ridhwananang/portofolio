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
        }

        Log::info("Event EscrowFunded diproses untuk Quest #{$quest->id}.", [
            'quest_id' => $quest->id,
            'transaction_id' => $event->transaction->id,
        ]);
    }
}
