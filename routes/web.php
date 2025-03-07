<?php

use App\Http\Controllers\ChapterController;
use App\Http\Controllers\MangaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserLibraryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Home page
Route::get('/', [MangaController::class, 'home'])->name('home');

// Manga routes
Route::get('/manga', [MangaController::class, 'index'])->name('manga.index');
Route::get('/manga/genre/{genre}', [MangaController::class, 'byGenre'])->name('manga.by-genre');
Route::get('/manga/{id}/{source?}', [MangaController::class, 'show'])->name('manga.show');

// Chapter/Reader routes
Route::get('/manga/{mangaId}/chapter/{chapterId}/{source?}', [ChapterController::class, 'show'])->name('chapter.show');
Route::post('/manga/{mangaId}/chapter/{chapterId}/progress', [ChapterController::class, 'updateProgress'])->name('chapter.update-progress');

// Authentication required routes
Route::middleware('auth')->group(function () {
    // User profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // User library
    Route::get('/library', [UserLibraryController::class, 'index'])->name('library.index');
    Route::post('/library/add', [UserLibraryController::class, 'add'])->name('library.add');
    Route::patch('/library/{mangaId}', [UserLibraryController::class, 'updateStatus'])->name('library.update-status');
    Route::delete('/library/{mangaId}', [UserLibraryController::class, 'remove'])->name('library.remove');
    
    // Reading history
    Route::get('/history', [UserLibraryController::class, 'history'])->name('history.index');
});

require __DIR__.'/auth.php';