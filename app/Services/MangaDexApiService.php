<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class MangaDexApiService
{
    protected $client;
    protected $baseUrl = 'https://api.mangadex.org';
    protected $rateLimitDelay = 1; // Delay in seconds between requests

    public function __construct(PendingRequest $client)
    {
        $this->client = $client;
    }

    /**
     * Get latest manga releases from MangaDex
     *
     * @param int $limit
     * @return Collection
     */
    public function getLatestReleases(int $limit = 20): Collection
    {
        try {
            $response = $this->client->get('/chapter', [
                'limit' => $limit,
                'order[publishAt]' => 'desc',
                'includes[]' => 'manga'
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatChapters($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get popular manga from MangaDex
     *
     * @param int $limit
     * @return Collection
     */
    public function getPopularManga(int $limit = 20): Collection
    {
        try {
            $response = $this->client->get('/manga', [
                'limit' => $limit,
                'order[followedCount]' => 'desc',
                'hasAvailableChapters' => true,
                'includes[]' => ['cover_art', 'author', 'artist']
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Search manga on MangaDex by various criteria
     *
     * @param array $criteria
     * @param int $limit
     * @return Collection
     */
    public function searchManga(array $criteria, int $limit = 20): Collection
    {
        try {
            $params = [
                'limit' => $limit,
                'includes[]' => ['cover_art', 'author', 'artist']
            ];

            if (isset($criteria['title'])) {
                $params['title'] = $criteria['title'];
            }

            if (isset($criteria['author'])) {
                $params['author'] = $criteria['author'];
            }

            if (isset($criteria['year'])) {
                $params['year'] = $criteria['year'];
            }

            if (isset($criteria['genres']) && is_array($criteria['genres'])) {
                foreach ($criteria['genres'] as $genre) {
                    $params['includedTags[]'] = $genre;
                }
            }

            if (isset($criteria['status'])) {
                $params['status[]'] = $criteria['status'];
            }

            $response = $this->client->get('/manga', $params);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get detailed information about a specific manga
     *
     * @param string $id
     * @return array|null
     */
    public function getMangaDetails(string $id): ?array
    {
        try {
            $response = $this->client->get("/manga/{$id}", [
                'includes[]' => ['cover_art', 'author', 'artist', 'tag']
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatSingleManga($data);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get chapters for a specific manga
     *
     * @param string $mangaId
     * @return Collection
     */
    public function getMangaChapters(string $mangaId): Collection
    {
        try {
            $response = $this->client->get('/chapter', [
                'manga' => $mangaId,
                'limit' => 100,
                'order[volume]' => 'asc',
                'order[chapter]' => 'asc',
                'translatedLanguage[]' => ['en']
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatChapters($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get chapter images
     *
     * @param string $chapterId
     * @return array
     */
    public function getChapterImages(string $chapterId): array
    {
        try {
            // First, get the chapter's data server
            $response = $this->client->get("/at-home/server/{$chapterId}");

            if (!$response->successful()) {
                return [];
            }

            $serverData = $response->json();
            $baseUrl = $serverData['baseUrl'];
            $chapterHash = $serverData['chapter']['hash'];
            $data = $serverData['chapter']['data'];

            // Format the image URLs
            $images = [];
            foreach ($data as $index => $filename) {
                $images[] = [
                    'index' => $index + 1,
                    'url' => "{$baseUrl}/data/{$chapterHash}/{$filename}"
                ];
            }

            return $images;
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return [];
        }
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
        try {
            // First, we need to find the tag ID for the genre
            $tagResponse = $this->client->get('/manga/tag');
            
            if (!$tagResponse->successful()) {
                return collect([]);
            }
            
            $tags = $tagResponse->json('data');
            $tagId = null;
            
            foreach ($tags as $tag) {
                if (strtolower($tag['attributes']['name']['en']) === strtolower($genre)) {
                    $tagId = $tag['id'];
                    break;
                }
            }
            
            if (!$tagId) {
                return collect([]);
            }
            
            // Now, get manga with this tag
            $response = $this->client->get('/manga', [
                'limit' => $limit,
                'includedTags[]' => $tagId,
                'includes[]' => ['cover_art', 'author', 'artist'],
                'order[followedCount]' => 'desc'
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get similar manga recommendations
     *
     * @param string $mangaId
     * @param int $limit
     * @return Collection
     */
    public function getSimilarManga(string $mangaId, int $limit = 6): Collection
    {
        try {
            // First get the manga details to extract genres
            $manga = $this->getMangaDetails($mangaId);
            
            if (!$manga || empty($manga['genres'])) {
                return collect([]);
            }
            
            // Get a random genre from the manga
            $genre = $manga['genres'][array_rand($manga['genres'])];
            
            // Find manga with similar genre
            $similarManga = $this->getMangaByGenre($genre, $limit + 1);
            
            // Remove the original manga if it's in the results
            return $similarManga->filter(function ($item) use ($mangaId) {
                return $item['id'] !== $mangaId;
            })->take($limit);
        } catch (\Exception $e) {
            Log::error('MangaDex API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Format manga data from API response
     *
     * @param array $data
     * @return Collection
     */
    protected function formatManga(array $data): Collection
    {
        return collect($data)->map(function ($manga) {
            $attributes = $manga['attributes'];
            $relationships = $manga['relationships'];
            
            // Extract cover image
            $coverFileName = null;
            foreach ($relationships as $rel) {
                if ($rel['type'] === 'cover_art') {
                    $coverFileName = $rel['attributes']['fileName'] ?? null;
                    break;
                }
            }
            
            // Extract authors
            $authors = [];
            foreach ($relationships as $rel) {
                if ($rel['type'] === 'author' || $rel['type'] === 'artist') {
                    $authors[] = $rel['attributes']['name'] ?? 'Unknown';
                }
            }
            
            // Extract genres/tags
            $genres = [];
            if (isset($manga['attributes']['tags']) && is_array($manga['attributes']['tags'])) {
                foreach ($manga['attributes']['tags'] as $tag) {
                    $genres[] = $tag['attributes']['name']['en'] ?? '';
                }
            }
            
            return [
                'id' => $manga['id'],
                'title' => $attributes['title']['en'] ?? array_values($attributes['title'])[0] ?? 'Unknown Title',
                'description' => $attributes['description']['en'] ?? array_values($attributes['description'])[0] ?? '',
                'cover_image' => $coverFileName ? "https://uploads.mangadex.org/covers/{$manga['id']}/{$coverFileName}" : null,
                'authors' => $authors,
                'status' => $attributes['status'] ?? 'unknown',
                'genres' => $genres,
                'year' => $attributes['year'] ?? null,
                'popularity_score' => $attributes['followedCount'] ?? 0,
                'source' => 'mangadex'
            ];
        });
    }

    /**
     * Format a single manga with more detailed information
     *
     * @param array $manga
     * @return array
     */
    protected function formatSingleManga(array $manga): array
    {
        $attributes = $manga['attributes'];
        $relationships = $manga['relationships'];
        
        // Extract cover image
        $coverFileName = null;
        foreach ($relationships as $rel) {
            if ($rel['type'] === 'cover_art') {
                $coverFileName = $rel['attributes']['fileName'] ?? null;
                break;
            }
        }
        
        // Extract authors and artists separately
        $authors = [];
        $artists = [];
        foreach ($relationships as $rel) {
            if ($rel['type'] === 'author') {
                $authors[] = $rel['attributes']['name'] ?? 'Unknown';
            } elseif ($rel['type'] === 'artist') {
                $artists[] = $rel['attributes']['name'] ?? 'Unknown';
            }
        }
        
        // Extract genres/tags
        $genres = [];
        if (isset($attributes['tags']) && is_array($attributes['tags'])) {
            foreach ($attributes['tags'] as $tag) {
                $genres[] = $tag['attributes']['name']['en'] ?? '';
            }
        }
        
        // Get alternative titles
        $altTitles = [];
        if (isset($attributes['altTitles']) && is_array($attributes['altTitles'])) {
            foreach ($attributes['altTitles'] as $altTitle) {
                foreach ($altTitle as $lang => $title) {
                    $altTitles[] = $title;
                }
            }
        }
        
        return [
            'id' => $manga['id'],
            'title' => $attributes['title']['en'] ?? array_values($attributes['title'])[0] ?? 'Unknown Title',
            'alt_titles' => $altTitles,
            'description' => $attributes['description']['en'] ?? array_values($attributes['description'])[0] ?? '',
            'cover_image' => $coverFileName ? "https://uploads.mangadex.org/covers/{$manga['id']}/{$coverFileName}" : null,
            'authors' => $authors,
            'artists' => $artists,
            'status' => $attributes['status'] ?? 'unknown',
            'publication_demographic' => $attributes['publicationDemographic'] ?? null,
            'genres' => $genres,
            'year' => $attributes['year'] ?? null,
            'content_rating' => $attributes['contentRating'] ?? 'unknown',
            'original_language' => $attributes['originalLanguage'] ?? 'unknown',
            'created_at' => $attributes['createdAt'] ?? null,
            'updated_at' => $attributes['updatedAt'] ?? null,
            'popularity_score' => $attributes['followedCount'] ?? 0,
            'source' => 'mangadex'
        ];
    }

    /**
     * Format chapters data from API response
     *
     * @param array $data
     * @return Collection
     */
    protected function formatChapters(array $data): Collection
    {
        return collect($data)->map(function ($chapter) {
            $attributes = $chapter['attributes'];
            $relationships = $chapter['relationships'];
            
            // Extract manga info
            $mangaId = null;
            $mangaTitle = null;
            foreach ($relationships as $rel) {
                if ($rel['type'] === 'manga') {
                    $mangaId = $rel['id'];
                    $mangaTitle = $rel['attributes']['title']['en'] ?? array_values($rel['attributes']['title'])[0] ?? 'Unknown Manga';
                    break;
                }
            }
            
            return [
                'id' => $chapter['id'],
                'manga_id' => $mangaId,
                'manga_title' => $mangaTitle,
                'volume' => $attributes['volume'] ?? null,
                'chapter' => $attributes['chapter'] ?? null,
                'title' => $attributes['title'] ?? ('Chapter ' . ($attributes['chapter'] ?? '?')),
                'language' => $attributes['translatedLanguage'] ?? 'unknown',
                'pages' => $attributes['pages'] ?? count($attributes['data'] ?? []),
                'published_at' => $attributes['publishAt'] ?? null,
                'created_at' => $attributes['createdAt'] ?? null,
                'updated_at' => $attributes['updatedAt'] ?? null,
                'source' => 'mangadex'
            ];
        });
    }
}