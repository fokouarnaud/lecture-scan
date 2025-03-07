<?php

namespace App\Providers;

use App\Services\MangaApiService;
use App\Services\MangaDexApiService;
use App\Services\MyAnimeListApiService;
use App\Services\KitsuApiService;
use App\Services\JikanApiService;
use App\Services\ComicVineApiService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class ApiServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(MangaApiService::class, function ($app) {
            return new MangaApiService(
                $app->make(MangaDexApiService::class),
                $app->make(MyAnimeListApiService::class),
                $app->make(KitsuApiService::class),
                $app->make(JikanApiService::class),
                $app->make(ComicVineApiService::class)
            );
        });

        $this->app->singleton(MangaDexApiService::class, function ($app) {
            return new MangaDexApiService(Http::baseUrl('https://api.mangadex.org'));
        });

        $this->app->singleton(MyAnimeListApiService::class, function ($app) {
            return new MyAnimeListApiService(Http::baseUrl('https://api.myanimelist.net/v2'));
        });

        $this->app->singleton(KitsuApiService::class, function ($app) {
            return new KitsuApiService(Http::baseUrl('https://kitsu.io/api/edge'));
        });

        $this->app->singleton(JikanApiService::class, function ($app) {
            return new JikanApiService(Http::baseUrl('https://api.jikan.moe/v4'));
        });

        $this->app->singleton(ComicVineApiService::class, function ($app) {
            return new ComicVineApiService(Http::baseUrl('https://comicvine.gamespot.com/api'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}