<?php

namespace App\Http\Controllers;

use App\Models\ReadingProgress;
use App\Services\MangaApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChapterController extends Controller
{
    protected $mangaService;

    public function __construct(MangaApiService $mangaService)
    {
        $this->mangaService = $mangaService;
    }

    /**
     * Display chapter for reading
     */
    public function show(Request $request, $mangaId, $chapterId, $source = 'mangadex')
    {
        // Get chapter details
        $chapters = $this->mangaService->getMangaChapters($mangaId, $source);
        $currentChapter = $chapters->firstWhere('id', $chapterId);
        
        if (!$currentChapter) {
            abort(404);
        }
        
        // Get manga details for navigation
        $manga = $this->mangaService->getMangaDetails($mangaId, $source);
        
        if (!$manga) {
            abort(404);
        }
        
        // Get chapter images
        $images = $this->mangaService->getChapterImages($chapterId, $source);
        
        // Find next and previous chapters
        $chapterIndex = $chapters->search(function ($chapter) use ($chapterId) {
            return $chapter['id'] === $chapterId;
        });
        
        $prevChapter = $chapterIndex > 0 ? $chapters[$chapterIndex - 1] : null;
        $nextChapter = $chapterIndex < $chapters->count() - 1 ? $chapters[$chapterIndex + 1] : null;
        
        // Save reading progress for authenticated users
        if (Auth::check()) {
            ReadingProgress::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'manga_id' => $mangaId,
                    'chapter_id' => $chapterId,
                    'source' => $source
                ],
                [
                    'manga_title' => $manga['title'],
                    'chapter_number' => $currentChapter['chapter'] ?? null,
                    'chapter_title' => $currentChapter['title'] ?? null,
                    'last_page' => 1,
                    'total_pages' => count($images),
                    'read_at' => now()
                ]
            );
        }
        
        // Get reading preferences (from authenticated user or default)
        $readingMode = $request->input('mode', 
            Auth::check() ? Auth::user()->reading_mode ?? 'vertical' : 'vertical'
        );
        
        return Inertia::render('Reader/Show', [
            'manga' => $manga,
            'chapter' => $currentChapter,
            'images' => $images,
            'prevChapter' => $prevChapter,
            'nextChapter' => $nextChapter,
            'readingMode' => $readingMode
        ]);
    }

    /**
     * Update reading progress
     */
    public function updateProgress(Request $request, $mangaId, $chapterId)
    {
        // Only for authenticated users
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $request->validate([
            'page' => 'required|integer|min:1',
            'source' => 'required|string'
        ]);
        
        $progress = ReadingProgress::where([
            'user_id' => Auth::id(),
            'manga_id' => $mangaId,
            'chapter_id' => $chapterId,
            'source' => $request->input('source')
        ])->first();
        
        if ($progress) {
            $progress->update([
                'last_page' => $request->input('page'),
                'read_at' => now()
            ]);
        }
        
        return response()->json(['success' => true]);
    }
}