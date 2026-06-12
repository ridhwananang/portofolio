<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechStack;
use Illuminate\Http\JsonResponse;

class TechStackController extends Controller
{
    /**
     * Display a listing of the tech stacks.
     */
    public function index(): JsonResponse
    {
        $techStacks = TechStack::orderBy('id', 'asc')->get();

        return response()->json($techStacks);
    }
}
