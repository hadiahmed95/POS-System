<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Include the Helper.php file
        if (File::exists(app_path('Helpers/Helper.php'))) {
            require_once app_path('Helpers/Helper.php');
        }
    }
}
