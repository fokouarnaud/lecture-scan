<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class JikanApiService
{
    protected $client;
    protected $baseUrl = 'https://api.jikan.moe/v4';
    protected $rateLimitDelay = 2; // Jikan has a rate limit of 3 requests per second, we use 2s to be safe

    public function __construct(PendingRequest $client)
    {
        $this->client = $client;
    }

    /**
     * Get popular manga from Jikan/MyAnimeList
     *
     * @param int $limit
     * @return Collection
     */
    public function getPopularManga(int $limit = 20): Collection
    {
        try {
            // Sleep to respect rate limiting
            if ($this->rateLimitDelay > 0) {
                sleep($this->rateLimitDelay);
            }

            $response = $this->client->get('/top/manga', [
                'limit' => $limit,
                'type' => 'manga'
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('Jikan API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Search manga by title
     *
     * @param string $title
     * @param int $limit
     * @return Collection
     */
    public function searchByTitle(string $title, int $limit = 20): Collection
    {
        try {
            // Sleep to respect rate limiting
            if ($this->rateLimitDelay > 0) {
                sleep($this->rateLimitDelay);
            }

            $response = $this->client->get('/manga', [
                'q' => $title,
                'limit' => $limit,
                'order_by' => 'popularity'
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('Jikan API error: ' . $e->getMessage());
            return collect([]);
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
            // First, we need to map the genre to a genre ID
            $genreMap = [
                'action' => 1,
                'adventure' => 2,
                'comedy' => 4,
                'drama' => 8,
                'fantasy' => 10,
                'horror' => 14,
                'mystery' => 7,
                'romance' => 22,
                'sci-fi' => 24,
                'slice of life' => 36,
                'sports' => 30,
                'supernatural' => 37,
                'thriller' => 41
            ];
            
            $genreLower = strtolower($genre);
            $genreId = $genreMap[$genreLower] ?? null;
            
            if (!$genreId) {
                return collect([]);
            }
            
            // Sleep to respect rate limiting
            if ($this->rateLimitDelay > 0) {
                sleep($this->rateLimitDelay);
            }

            $response = $this->client->get('/manga', [
                'genres' => $genreId,
                'limit' => $limit,
                'order_by' => 'popularity'
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('Jikan API error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get manga details
     *
     * @param string $id
     * @return array|null
     */
    public function getMangaDetails(string $id): ?array
    {
        try {
            // Sleep to respect rate limiting
            if ($this->rateLimitDelay > 0) {
                sleep($this->rateLimitDelay);
            }

            $response = $this->client->get("/manga/{$id}/full");

            if ($response->successful()) {
                $data = $response->json('data');
                
                // Format for single manga with more details
                $formattedManga = $this->formatSingleManga($data);
                
                // Add more details if available
                if (isset($data['relations'])) {
                    $formattedManga['relations'] = $data['relations'];
                }
                
                if (isset($data['recommendations'])) {
                    $formattedManga['recommendations'] = collect($data['recommendations'])
                        ->map(function ($rec) {
                            return [
                                'id' => $rec['entry']['mal_id'],
                                'title' => $rec['entry']['title'],
                                'image' => $rec['entry']['images']['jpg']['image_url'] ?? null
                            ];
                        })
                        ->take(6)
                        ->toArray();
                }
                
                return $formattedManga;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Jikan API error: ' . $e->getMessage());
            return null;
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
            // Sleep to respect rate limiting
            if ($this->rateLimitDelay > 0) {
                sleep($this->rateLimitDelay);
            }

            $response = $this->client->get("/manga/{$mangaId}/recommendations");

            if ($response->successful()) {
                $recommendations = $response->json('data');
                
                return collect($recommendations)
                    ->map(function ($rec) {
                        return [
                            'id' => $rec['entry']['mal_id'],
                            'title' => $rec['entry']['title'],
                            'image' => $rec['entry']['images']['jpg']['image_url'] ?? null,
                            'votes' => $rec['votes'] ?? 0,
                            'source' => 'jikan'
                        ];
                    })
                    ->sortByDesc('votes')
                    ->take($limit);
            }

            return collect([]);
        } catch (\Exception $e) {
            Log::error('Jikan API error: ' . $e->getMessage());
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
            // Extract genres
            $genres = [];
            if (isset($manga['genres']) && is_array($manga['genres'])) {
                foreach ($manga['genres'] as $genre) {
                    $genres[] = $genre['name'];
                }
            }
            
            // Extract demographic
            $demographic = null;
            if (isset($manga['demographics']) && is_array($manga['demographics']) && !empty($manga['demographics'])) {
                $demographic = $manga['demographics'][0]['name'] ?? null;
            }
            
            return [
                'id' => (string) $manga['mal_id'],
                'title' => $manga['title'],
                'description' => $manga['synopsis'] ?? '',
                'cover_image' => $manga['images']['jpg']['large_image_url'] ?? 
                                $manga['images']['jpg']['image_url'] ?? null,
                'authors' => collect($manga['authors'] ?? [])->pluck('name')->toArray(),
                'status' => $this->mapStatus($manga['status'] ?? 'Unknown'),
                'genres' => $genres,
                'year' => $manga['published']['prop']['from']['year'] ?? null,
                'popularity_score' => $manga['members'] ?? 0,
                'score' => $manga['score'] ?? 0,
                'publication_demographic' => $demographic,
                'source' => 'jikan'
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
        // Extract genres
        $genres = [];
        if (isset($manga['genres']) && is_array($manga['genres'])) {
            foreach ($manga['genres'] as $genre) {
                $genres[] = $genre['name'];
            }
        }
        
        // Extract demographic
        $demographic = null;
        if (isset($manga['demographics']) && is_array($manga['demographics']) && !empty($manga['demographics'])) {
            $demographic = $manga['demographics'][0]['name'] ?? null;
        }
        
        // Extract alternative titles
        $altTitles = [];
        if (isset($manga['titles']) && is_array($manga['titles'])) {
            foreach ($manga['titles'] as $title) {
                if ($title['type'] !== 'Default') {
                    $altTitles[] = $title['title'];
                }
            }
        }
        
        return [
            'id' => (string) $manga['mal_id'],
            'title' => $manga['title'],
            'alt_titles' => $altTitles,
            'description' => $manga['synopsis'] ?? '',
            'cover_image' => $manga['images']['jpg']['large_image_url'] ?? 
                            $manga['images']['jpg']['image_url'] ?? null,
            'authors' => collect($manga['authors'] ?? [])->pluck('name')->toArray(),
            'status' => $this->mapStatus($manga['status'] ?? 'Unknown'),
            'genres' => $genres,
            'year' => $manga['published']['prop']['from']['year'] ?? null,
            'popularity_score' => $manga['members'] ?? 0,
            'score' => $manga['score'] ?? 0,
            'rank' => $manga['rank'] ?? null,
            'publication_demographic' => $demographic,
            'volumes' => $manga['volumes'] ?? null,
            'chapters' => $manga['chapters'] ?? null,
            'serialization' => collect($manga['serializations'] ?? [])->pluck('name')->join(', '),
            'background' => $manga['background'] ?? null,
            'source' => 'jikan'
        ];
    }

    /**
     * Map status from Jikan to our standard format
     *
     * @param string $status
     * @return string
     */
    protected function mapStatus(string $status): string
    {
        $statusMap = [
            'Publishing' => 'ongoing',
            'Finished' => 'completed',
            'On Hiatus' => 'hiatus',
            'Discontinued' => 'cancelled',
            'Not yet published' => 'not_published'
        ];
        
        return $statusMap[$status] ?? 'unknown';
    }
}