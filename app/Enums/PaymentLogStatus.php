<?php

namespace App\Enums;

enum PaymentLogStatus: string
{
    case RECEIVED = 'received';
    case PROCESSED = 'processed';
    case FAILED = 'failed';
    case IGNORED = 'ignored';
}
