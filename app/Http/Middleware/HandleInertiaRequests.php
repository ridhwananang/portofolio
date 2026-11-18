<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $host = $request->getHost();
        $scheme = $request->getScheme();
        $port = $request->getPort();
        $portSuffix = ($port && ! in_array($port, [80, 443])) ? ':'.$port : '';

        if (str_starts_with($host, 'studio.')) {
            $mainHost = substr($host, 7);
            $mainWebUrl = $scheme.'://'.$mainHost.$portSuffix;
        } elseif (str_starts_with($host, 'admin.')) {
            $mainHost = substr($host, 6);
            $mainWebUrl = $scheme.'://'.$mainHost.$portSuffix;
        } else {
            $configuredUrl = config('app.url');
            $mainWebUrl = $configuredUrl ? rtrim($configuredUrl, '/') : $scheme.'://'.$host.$portSuffix;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'mainWebUrl' => $mainWebUrl,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
