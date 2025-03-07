<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MangaApiService
{
    protected $mangaDexApi;
    protected $myAnimeListApi;
    protected $kitsuApi;
    protected $jikanApi;
    protected $comicVineApi;

    public function __construct(
        MangaDexApiService $mangaDexApi,
        MyAnimeListApiService $myAnimeListApi,
        KitsuApiService $kitsuApi,
        JikanApiService $jikanApi,
        ComicVineApiService $comicVineApi
    ) {
        $this->mangaDexApi = $mangaDexApi;
        $this->myAnimeListApi = $myAnimeListApi;
        $this->kitsuApi = $kitsuApi;
        $this->jikanApi = $jikanApi;
        $this->comicVineApi = $comicVineApi;
    }

    /**
     * Get latest manga releases
     *
     * @param int $limit
     * @return Collection
     */
    public function getLatestReleases(int $limit = 20): Collection
    {
        return Cache::remember('latest_releases_' . $limit, 3600, function () use ($limit) {
            try {
                // Prioritize MangaDex as primary source
                $results = $this->mangaDexApi->getLatestReleases($limit);
                
                // If we didn't get enough results, try other sources
                if ($results->count() < $limit) {
                    $needed = $limit - $results->count();
                    $results = $results->merge($this->kitsuApi->getLatestReleases($needed)->take($needed));
                }
                
                // Deduplicate by title
                return $results->unique('title');
            } catch (\Exception $e) {
                Log::error('Error fetching latest releases: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    /**
     * Get popular manga
     *
     * @param int $limit
     * @return Collection
     */
    public function getPopularManga(int $limit = 20): Collection
    {
        return Cache::remember('popular_manga_' . $limit, 3600, function () use ($limit) {
            try {
                $results = collect([]);
                
                // Get from multiple sources and merge
                $sources = [
                    $this->mangaDexApi->getPopularManga(intval($limit * 0.5)),
                    $this->myAnimeListApi->getPopularManga(intval($limit * 0.3)),
                    $this->jikanApi->getPopularManga(intval($limit * 0.2))
                ];
                
                foreach ($sources as $source) {
                    $results = $results->merge($source);
                }
                
                // Sort by popularity score and take only what we need
                return $results->sortByDesc('popularity_score')->take($limit);
            } catch (\Exception $e) {
                Log::error('Error fetching popular manga: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    /**
     * Search manga by various criteria
     *
     * @param array $criteria
     * @param int $limit
     * @return Collection
     */
    public function searchManga(array $criteria, int $limit = 20): Collection
    {
        $cacheKey = 'search_manga_' . md5(json_encode($criteria)) . '_' . $limit;
        
        return Cache::remember($cacheKey, 1800, function () use ($criteria, $limit) {
            try {
                $results = $this->mangaDexApi->searchManga($criteria, $limit);
                
                // If we need more results, query other sources
                if ($results->count() < $limit) {
                    $needed = $limit - $results->count();
                    $additionalResults = collect([]);
                    
                    // Try other sources based on the criteria
                    if (isset($criteria['title'])) {
                        $additionalResults = $additionalResults->merge(
                            $this->jikanApi->searchByTitle($criteria['title'], $needed)
                        );
                    }
                    
                    // Merge unique results
                    $results = $results->merge($additionalResults)->unique('id')->take($limit);
                }
                
                return $results;
            } catch (\Exception $e) {
                Log::error('Error searching manga: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    /**
     * Get detailed information about a specific manga
     *
     * @param string $id
     * @param string $source
     * @return array|null
     */
    public function getMangaDetails(string $id, string $source = 'mangadex'): ?array
    {
        $cacheKey = 'manga_details_' . $source . '_' . $id;
        
        return Cache::remember($cacheKey, 3600, function () use ($id, $source) {
            try {
                switch ($source) {
                    case 'mangadex':
                        return $this->mangaDexApi->getMangaDetails($id);
                    case 'myanimelist':
                        return $this->myAnimeListApi->getMangaDetails($id);
                    case 'kitsu':
                        return $this->kitsuApi->getMangaDetails($id);
                    case 'jikan':
                        return $this->jikanApi->getMangaDetails($id);
                    case 'comicvine':
                        return $this->comicVineApi->getMangaDetails($id);
                    default:
                        return $this->mangaDexApi->getMangaDetails($id);
                }
            } catch (\Exception $e) {
                Log::error('Error fetching manga details: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get chapters for a specific manga
     *
     * @param string $mangaId
     * @param string $source
     * @return Collection
     */
    public function getMangaChapters(string $mangaId, string $source = 'mangadex'): Collection
    {
        $cacheKey = 'manga_chapters_' . $source . '_' . $mangaId;
        
        return Cache::remember($cacheKey, 1800, function () use ($mangaId, $source) {
            try {
                switch ($source) {
                    case 'mangadex':
                        return $this->mangaDexApi->getMangaChapters($mangaId);
                    case 'kitsu':
                        return $this->kitsuApi->getMangaChapters($mangaId);
                    default:
                        return $this->mangaDexApi->getMangaChapters($mangaId);
                }
            } catch (\Exception $e) {
                Log::error('Error fetching manga chapters: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    /**
     * Get chapter images
     *
     * @param string $chapterId
     * @param string $source
     * @return array
     */
    public function getChapterImages(string $chapterId, string $source = 'mangadex'): array
    {
        // Short cache time for chapter images to ensure freshness
        $cacheKey = 'chapter_images_' . $source . '_' . $chapterId;
        
        return Cache::remember($cacheKey, 900, function () use ($chapterId, $source) {
            try {
                switch ($source) {
                    case 'mangadex':
                        return $this->mangaDexApi->getChapterImages($chapterId);
                    case 'kitsu':
                        return $this->kitsuApi->getChapterImages($chapterId);
                    default:
                        return $this->mangaDexApi->getChapterImages($chapterId);
                }
            } catch (\Exception $e) {
                Log::error('Error fetching chapter images: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get manga by genre
     *
     * @param string $genre
     * @param int $limit
     * @return Collection
     */
    public function getMangaByGenre(string $genre, int $limit = 20): Collection
    {
        $cacheKey = 'manga_by_genre_' . $genre . '_' . $limit;
        
        return Cache::remember($cacheKey, 3600, function () use ($genre, $limit) {
            try {
                $results = $this->mangaDexApi->getMangaByGenre($genre, intval($limit * 0.6));
                $results = $results->merge($this->jikanApi->getMangaByGenre($genre, intval($limit * 0.4)));
                
                return $results->unique('id')->take($limit);
            } catch (\Exception $e) {
                Log::error('Error fetching manga by genre: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    /**
     * Get similar manga recommendations
     *
     * @param string $mangaId
     * @param string $source
     * @param int $limit
     * @return Collection
     */
    public function getSimilarManga(string $mangaId, string $source = 'mangadex', int $limit = 6): Collection
    {
        $cacheKey = 'similar_manga_' . $source . '_' . $mangaId . '_' . $limit;
        
        return Cache::remember($cacheKey, 3600, function () use ($mangaId, $source, $limit) {
            try {
                switch ($source) {
                    case 'mangadex':
                        return $this->mangaDexApi->getSimilarManga($mangaId, $limit);
                    case 'myanimelist':
                        return $this->myAnimeListApi->getSimilarManga($mangaId, $limit);
                    case 'jikan':
                        return $this->jikanApi->getSimilarManga($mangaId, $limit);
                    default:
                        return $this->mangaDexApi->getSimilarManga($mangaId, $limit);
                }
            } catch (\Exception $e) {
                Log::error('Error fetching similar manga: ' . $e->getMessage());
                return collect([]);
            }
        });
    }
}