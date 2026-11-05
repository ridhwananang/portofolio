<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\ContactRepositoryInterface::class,
            \App\Repositories\ContactRepository::class
        );

        $this->app->bind(
            \App\Contracts\PaymentGatewayInterface::class,
            function ($app) {
                $driver = strtolower((string) config('services.payment_gateway', 'mayar'));

                return match ($driver) {
                    'midtrans' => $app->make(\App\Services\Payment\Midtrans\MidtransPaymentGateway::class),
                    'xendit' => $app->make(\App\Services\Payment\Xendit\XenditPaymentGateway::class),
                    default => $app->make(\App\Services\Payment\Mayar\MayarPaymentGateway::class),
                };
            }
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\EscrowFunded::class,
            \App\Listeners\UpdateQuestOnEscrowFunded::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\EscrowReleased::class,
            \App\Listeners\UpdateQuestOnEscrowReleased::class
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
