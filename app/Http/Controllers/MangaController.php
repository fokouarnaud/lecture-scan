<?php

namespace App\Http\Controllers;

use App\Services\MangaApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MangaController extends Controller
{
    protected $mangaService;

    public function __construct(MangaApiService $mangaService)
    {
        $this->mangaService = $mangaService;
    }

    /**
     * Display the homepage with latest releases and popular manga
     */
    public function home()
    {
        $latestReleases = $this->mangaService->getLatestReleases(12);
        $popularManga = $this->mangaService->getPopularManga(12);
        
        // Group genres for the navigation
        $genres = [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
            'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 
            'Sports', 'Supernatural', 'Thriller'
        ];

        return Inertia::render('Home', [
            'latestReleases' => $latestReleases,
            'popularManga' => $popularManga,
            'genres' => $genres,
        ]);
    }

    /**
     * Display manga listing with search/filter capabilities
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $genre = $request->input('genre');
        $status = $request->input('status');
        $sort = $request->input('sort', 'popularity');
        
        $criteria = [];
        
        if ($search) {
            $criteria['title'] = $search;
        }
        
        if ($genre) {
            $criteria['genres'] = [$genre];
        }
        
        if ($status) {
            $criteria['status'] = $status;
        }
        
        if (!empty($criteria)) {
            $manga = $this->mangaService->searchManga($criteria, 24);
        } else {
            $manga = $this->mangaService->getPopularManga(24);
        }
        
        // Apply sorting
        if ($sort === 'latest') {
            $manga = $manga->sortByDesc('created_at')->values();
        } elseif ($sort === 'title') {
            $manga = $manga->sortBy('title')->values();
        } elseif ($sort === 'rating') {
            $manga = $manga->sortByDesc('score')->values();
        }
        
        // Available filters
        $genres = [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
            'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 
            'Sports', 'Supernatural', 'Thriller'
        ];
        
        $statuses = [
            'ongoing' => 'Ongoing',
            'completed' => 'Completed',
            'hiatus' => 'On Hiatus',
            'cancelled' => 'Cancelled'
        ];
        
        $sortOptions = [
            'popularity' => 'Popularity',
            'latest' => 'Latest Update',
            'title' => 'Title (A-Z)',
            'rating' => 'Rating'
        ];

        return Inertia::render('Manga/Index', [
            'manga' => $manga,
            'filters' => [
                'search' => $search,
                'genre' => $genre,
                'status' => $status,
                'sort' => $sort
            ],
            'genres' => $genres,
            'statuses' => $statuses,
            'sortOptions' => $sortOptions
        ]);
    }

    /**
     * Display manga by genre
     */
    public function byGenre(Request $request, $genre)
    {
        $manga = $this->mangaService->getMangaByGenre($genre, 24);
        
        return Inertia::render('Manga/ByGenre', [
            'manga' => $manga,
            'genre' => $genre
        ]);
    }

    /**
     * Display manga details
     */
    public function show(Request $request, $id, $source = 'mangadex')
    {
        $manga = $this->mangaService->getMangaDetails($id, $source);
        
        if (!$manga) {
            abort(404);
        }
        
        $chapters = $this->mangaService->getMangaChapters($id, $source);
        $similarManga = $this->mangaService->getSimilarManga($id, $source);
        
        return Inertia::render('Manga/Show', [
            'manga' => $manga,
            'chapters' => $chapters,
            'similarManga' => $similarManga
        ]);
    }
}