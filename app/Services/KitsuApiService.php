<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class KitsuApiService
{
    protected $client;
    protected $baseUrl = 'https://kitsu.io/api/edge';
    
    public function __construct(PendingRequest $client)
    {
        $this->client = $client->withHeaders([
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json'
        ]);
    }
    
    /**
     * Get latest manga releases from Kitsu
     *
     * @param int $limit
     * @return Collection
     */
    public function getLatestReleases(int $limit = 20): Collection
    {
        try {
            $response = $this->client->get('/chapters', [
                'page[limit]' => $limit,
                'sort' => '-published_at',
                'include' => 'manga'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('data');
                $included = $response->json('included');
                return $this->formatChapters($data, $included);
            }
            
            return collect([]);
        } catch (\Exception $e) {
            Log::error('Kitsu API error: ' . $e->getMessage());
            return collect([]);
        }
    }
    
    /**
     * Get manga details from Kitsu
     *
     * @param string $id
     * @return array|null
     */
    public function getMangaDetails(string $id): ?array
    {
        try {
            $response = $this->client->get("/manga/{$id}", [
                'include' => 'genres,categories,mediaRelationships.destination,staff.person'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('data');
                $included = $response->json('included');
                return $this->formatSingleManga($data, $included);
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('Kitsu API error: ' . $e->getMessage());
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
            $response = $this->client->get("/chapters", [
                'filter[manga_id]' => $mangaId,
                'page[limit]' => 100,
                'sort' => 'number'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatChapters($data);
            }
            
            return collect([]);
        } catch (\Exception $e) {
            Log::error('Kitsu API error: ' . $e->getMessage());
            return collect([]);
        }
    }
    
    /**
     * Get chapter images (not directly supported by Kitsu API)
     *
     * @param string $chapterId
     * @return array
     */
    public function getChapterImages(string $chapterId): array
    {
        // Kitsu doesn't provide chapter images directly
        return [];
    }
    
    /**
     * Format manga data from API response
     *
     * @param array $data
     * @param array $included
     * @return Collection
     */
    protected function formatManga(array $data, array $included = []): Collection
    {
        return collect($data)->map(function ($manga) use ($included) {
            $attributes = $manga['attributes'];
            
            // Extract genres
            $genres = [];
            if (!empty($included)) {
                $genreReferences = collect($manga['relationships']['genres']['data'] ?? [])
                    ->pluck('id')
                    ->toArray();
                
                $genres = collect($included)
                    ->filter(function ($item) use ($genreReferences) {
                        return $item['type'] === 'genres' && in_array($item['id'], $genreReferences);
                    })
                    ->pluck('attributes.name')
                    ->toArray();
            }
            
            return [
                'id' => $manga['id'],
                'title' => $attributes['titles']['en'] ?? $attributes['titles']['en_jp'] ?? $attributes['canonicalTitle'] ?? 'Unknown Title',
                'description' => $attributes['synopsis'] ?? '',
                'cover_image' => !empty($attributes['posterImage']) ? $attributes['posterImage']['original'] : null,
                'authors' => [], // Kitsu doesn't easily provide authors in the main manga endpoint
                'status' => $this->mapStatus($attributes['status'] ?? ''),
                'genres' => $genres,
                'year' => $attributes['startDate'] ? substr($attributes['startDate'], 0, 4) : null,
                'popularity_score' => $attributes['favoritesCount'] ?? 0,
                'source' => 'kitsu'
            ];
        });
    }
    
    /**
     * Format a single manga with more detailed information
     *
     * @param array $manga
     * @param array $included
     * @return array
     */
    protected function formatSingleManga(array $manga, array $included = []): array
    {
        $attributes = $manga['attributes'];
        
        // Extract genres
        $genres = [];
        $genreReferences = collect($manga['relationships']['genres']['data'] ?? [])
            ->pluck('id')
            ->toArray();
        
        $genres = collect($included)
            ->filter(function ($item) use ($genreReferences) {
                return $item['type'] === 'genres' && in_array($item['id'], $genreReferences);
            })
            ->pluck('attributes.name')
            ->toArray();
        
        // Extract authors/staff
        $authors = [];
        $artists = [];
        
        $staffReferences = collect($manga['relationships']['staff']['data'] ?? [])
            ->pluck('id')
            ->toArray();
        
        $staff = collect($included)
            ->filter(function ($item) use ($staffReferences) {
                return $item['type'] === 'staff' && in_array($item['id'], $staffReferences);
            });
        
        foreach ($staff as $member) {
            $role = $member['attributes']['role'] ?? '';
            $personId = $member['relationships']['person']['data']['id'] ?? null;
            
            if ($personId) {
                $person = collect($included)->firstWhere(function ($item) use ($personId) {
                    return $item['type'] === 'people' && $item['id'] === $personId;
                });
                
                if ($person) {
                    $name = $person['attributes']['name'] ?? 'Unknown';
                    
                    if (stripos($role, 'author') !== false || stripos($role, 'story') !== false) {
                        $authors[] = $name;
                    } else if (stripos($role, 'art') !== false || stripos($role, 'illust') !== false) {
                        $artists[] = $name;
                    } else {
                        // Default to author if role is ambiguous
                        $authors[] = $name;
                    }
                }
            }
        }
        
        // Alternative titles
        $altTitles = [];
        foreach ($attributes['titles'] ?? [] as $title) {
            if ($title !== $attributes['canonicalTitle']) {
                $altTitles[] = $title;
            }
        }
        
        return [
            'id' => $manga['id'],
            'title' => $attributes['titles']['en'] ?? $attributes['titles']['en_jp'] ?? $attributes['canonicalTitle'] ?? 'Unknown Title',
            'alt_titles' => $altTitles,
            'description' => $attributes['synopsis'] ?? '',
            'cover_image' => !empty($attributes['posterImage']) ? $attributes['posterImage']['original'] : null,
            'authors' => array_unique($authors),
            'artists' => array_unique($artists),
            'status' => $this->mapStatus($attributes['status'] ?? ''),
            'genres' => $genres,
            'year' => $attributes['startDate'] ? substr($attributes['startDate'], 0, 4) : null,
            'popularity_score' => $attributes['favoritesCount'] ?? 0,
            'rating' => $attributes['averageRating'] ? floatval($attributes['averageRating']) / 10 : null,
            'chapter_count' => $attributes['chapterCount'] ?? null,
            'volume_count' => $attributes['volumeCount'] ?? null,
            'source' => 'kitsu'
        ];
    }
    
    /**
     * Format chapters data from API response
     *
     * @param array $data
     * @param array $included
     * @return Collection
     */
    protected function formatChapters(array $data, array $included = []): Collection
    {
        return collect($data)->map(function ($chapter) use ($included) {
            $attributes = $chapter['attributes'];
            
            // Get manga info if available in included data
            $mangaId = $chapter['relationships']['manga']['data']['id'] ?? null;
            $mangaTitle = 'Unknown Manga';
            
            if ($mangaId && !empty($included)) {
                $manga = collect($included)->firstWhere(function ($item) use ($mangaId) {
                    return $item['type'] === 'manga' && $item['id'] === $mangaId;
                });
                
                if ($manga) {
                    $mangaTitle = $manga['attributes']['titles']['en'] ?? 
                                 $manga['attributes']['titles']['en_jp'] ?? 
                                 $manga['attributes']['canonicalTitle'] ?? 
                                 'Unknown Manga';
                }
            }
            
            return [
                'id' => $chapter['id'],
                'manga_id' => $mangaId,
                'manga_title' => $mangaTitle,
                'volume' => $attributes['volumeNumber'] ? (string)$attributes['volumeNumber'] : null,
                'chapter' => $attributes['number'] ? (string)$attributes['number'] : null,
                'title' => $attributes['title'] ?? ('Chapter ' . ($attributes['number'] ?? '?')),
                'language' => $attributes['language'] ?? 'en',
                'pages' => $attributes['pageCount'] ?? 0,
                'published_at' => $attributes['published'] ?? null,
                'created_at' => $attributes['createdAt'] ?? null,
                'updated_at' => $attributes['updatedAt'] ?? null,
                'source' => 'kitsu'
            ];
        });
    }
    
    /**
     * Map Kitsu status to standardized status format
     *
     * @param string $status
     * @return string
     */
    protected function mapStatus(string $status): string
    {
        $statusMap = [
            'current' => 'ongoing',
            'finished' => 'completed',
            'tba' => 'not_published',
            'unreleased' => 'not_published',
            'upcoming' => 'not_published',
            'abandoned' => 'cancelled'
        ];
        
        return $statusMap[strtolower($status)] ?? 'unknown';
    }
}