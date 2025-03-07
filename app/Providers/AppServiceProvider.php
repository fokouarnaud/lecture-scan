<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\Paginator;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Vous pouvez ajouter ici des liaisons de services si nécessaire
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Définir une longueur de chaîne par défaut pour MySQL (utile pour éviter des erreurs avec certaines versions de MySQL)
        Schema::defaultStringLength(191);
        
        // Utiliser Bootstrap pour la pagination (si vous utilisez Bootstrap)
        // Paginator::useBootstrap();
        
        // Vous pouvez activer ces options en développement pour identifier les problèmes de performance
        if (app()->isLocal()) {
            // Détection des requêtes N+1
            Model::preventLazyLoading();
            
            // Journalisation des requêtes lentes
            // DB::listen(function ($query) {
            //     if ($query->time > 100) {
            //         Log::channel('slow-queries')->info(
            //             $query->sql, $query->bindings, $query->time
            //         );
            //     }
            // });
        }
    }
}