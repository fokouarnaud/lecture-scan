<?php

namespace App\Http\Controllers;

use App\Models\ReadingProgress;
use App\Models\UserLibrary;
use App\Services\MangaApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserLibraryController extends Controller
{
    protected $mangaService;

    public function __construct(MangaApiService $mangaService)
    {
        $this->mangaService = $mangaService;
        // Require authentication for all methods
        //$this->middleware('auth');
    }

    /**
     * Display user's library
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get user's library items with details from APIs
        $libraryItems = UserLibrary::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        $mangaDetails = [];
        
        foreach ($libraryItems as $item) {
            $details = $this->mangaService->getMangaDetails($item->manga_id, $item->source);
            
            if ($details) {
                // Get reading progress if available
                $progress = ReadingProgress::where([
                    'user_id' => $user->id,
                    'manga_id' => $item->manga_id,
                    'source' => $item->source
                ])
                ->orderBy('read_at', 'desc')
                ->first();
                
                // Add progress info to manga details
                $details['reading_progress'] = $progress ? [
                    'chapter_id' => $progress->chapter_id,
                    'chapter_number' => $progress->chapter_number,
                    'chapter_title' => $progress->chapter_title,
                    'last_page' => $progress->last_page,
                    'read_at' => $progress->read_at
                ] : null;
                
                // Add library status
                $details['library_status'] = $item->status;
                
                $mangaDetails[] = $details;
            }
        }
        
        // Available library statuses
        $statuses = [
            'reading' => 'Currently Reading',
            'completed' => 'Completed',
            'on_hold' => 'On Hold',
            'dropped' => 'Dropped',
            'plan_to_read' => 'Plan to Read'
        ];
        
        return Inertia::render('User/Library', [
            'mangaList' => $mangaDetails,
            'statuses' => $statuses
        ]);
    }

    /**
     * Add manga to library
     */
    public function add(Request $request)
    {
        $request->validate([
            'manga_id' => 'required|string',
            'source' => 'required|string',
            'status' => 'required|string|in:reading,completed,on_hold,dropped,plan_to_read',
            'manga_title' => 'required|string',
            'cover_image' => 'nullable|string'
        ]);
        
        UserLibrary::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'manga_id' => $request->input('manga_id'),
                'source' => $request->input('source')
            ],
            [
                'manga_title' => $request->input('manga_title'),
                'cover_image' => $request->input('cover_image'),
                'status' => $request->input('status')
            ]
        );
        
        return back()->with('success', 'Manga added to your library');
    }

    /**
     * Update manga status in library
     */
    public function updateStatus(Request $request, $mangaId)
    {
        $request->validate([
            'source' => 'required|string',
            'status' => 'required|string|in:reading,completed,on_hold,dropped,plan_to_read'
        ]);
        
        $libraryItem = UserLibrary::where([
            'user_id' => Auth::id(),
            'manga_id' => $mangaId,
            'source' => $request->input('source')
        ])->first();
        
        if (!$libraryItem) {
            return response()->json(['message' => 'Manga not found in library'], 404);
        }
        
        $libraryItem->update([
            'status' => $request->input('status')
        ]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Remove manga from library
     */
    public function remove(Request $request, $mangaId)
    {
        $request->validate([
            'source' => 'required|string'
        ]);
        
        UserLibrary::where([
            'user_id' => Auth::id(),
            'manga_id' => $mangaId,
            'source' => $request->input('source')
        ])->delete();
        
        return back()->with('success', 'Manga removed from your library');
    }

    /**
     * Display user's reading history
     */
    public function history()
    {
        $readingProgress = ReadingProgress::where('user_id', Auth::id())
            ->orderBy('read_at', 'desc')
            ->paginate(20);
        
        return Inertia::render('User/History', [
            'readingProgress' => $readingProgress
        ]);
    }
}