<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ImageDetectionService;

class ImageDetectionServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ImageDetectionService::class, function ($app) {
            return new ImageDetectionService();
        });
    }
    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
