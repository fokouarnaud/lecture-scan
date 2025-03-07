<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class MyAnimeListApiService
{
    protected $client;
    protected $baseUrl = 'https://api.myanimelist.net/v2';
    protected $clientId;
    
    public function __construct(PendingRequest $client)
    {
        $this->client = $client;
        $this->clientId = env('MYANIMELIST_CLIENT_ID', '');
        
        // Ajouter l'en-tête d'authentification si l'ID client est configuré
        if ($this->clientId) {
            $this->client = $this->client->withHeaders([
                'X-MAL-CLIENT-ID' => $this->clientId
            ]);
        }
    }
    
    /**
     * Get popular manga from MyAnimeList
     *
     * @param int $limit
     * @return Collection
     */
    public function getPopularManga(int $limit = 20): Collection
    {
        try {
            // Vérifier si nous avons un ID client
            if (empty($this->clientId)) {
                Log::warning('MyAnimeList API: No client ID configured');
                return collect([]);
            }
            
            $response = $this->client->get('/manga/ranking', [
                'ranking_type' => 'popularity',
                'limit' => $limit,
                'fields' => 'id,title,main_picture,synopsis,genres,authors{first_name,last_name},status,start_date'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('data');
                return $this->formatManga($data);
            }
            
            return collect([]);
        } catch (\Exception $e) {
            Log::error('MyAnimeList API error: ' . $e->getMessage());
            return collect([]);
        }
    }
    
    /**
     * Get manga details from MyAnimeList
     *
     * @param string $id
     * @return array|null
     */
    public function getMangaDetails(string $id): ?array
    {
        try {
            // Vérifier si nous avons un ID client
            if (empty($this->clientId)) {
                Log::warning('MyAnimeList API: No client ID configured');
                return null;
            }
            
            $response = $this->client->get("/manga/{$id}", [
                'fields' => 'id,title,main_picture,synopsis,genres,authors{first_name,last_name},status,start_date,end_date,mean,popularity,num_volumes,num_chapters,alternative_titles'
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return $this->formatSingleManga($data);
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('MyAnimeList API error: ' . $e->getMessage());
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
        // MyAnimeList n'a pas d'endpoint direct pour les recommandations similaires
        // Nous retournons une collection vide pour l'instant
        return collect([]);
    }
    
    /**
     * Format manga data from API response
     *
     * @param array $data
     * @return Collection
     */
    protected function formatManga(array $data): Collection
    {
        return collect($data)->map(function ($item) {
            $manga = $item['node'];
            
            // Extraire les auteurs
            $authors = [];
            if (isset($manga['authors'])) {
                foreach ($manga['authors'] as $author) {
                    $name = implode(' ', array_filter([
                        $author['node']['first_name'] ?? '',
                        $author['node']['last_name'] ?? ''
                    ]));
                    $authors[] = $name ?: 'Unknown';
                }
            }
            
            // Extraire les genres
            $genres = [];
            if (isset($manga['genres'])) {
                foreach ($manga['genres'] as $genre) {
                    $genres[] = $genre['name'];
                }
            }
            
            return [
                'id' => (string) $manga['id'],
                'title' => $manga['title'],
                'description' => $manga['synopsis'] ?? '',
                'cover_image' => $manga['main_picture']['large'] ?? $manga['main_picture']['medium'] ?? null,
                'authors' => $authors,
                'status' => $this->mapStatus($manga['status'] ?? ''),
                'genres' => $genres,
                'year' => isset($manga['start_date']) ? substr($manga['start_date'], 0, 4) : null,
                'popularity_score' => $manga['popularity'] ?? 0,
                'source' => 'myanimelist'
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
        // Extraire les auteurs
        $authors = [];
        if (isset($manga['authors'])) {
            foreach ($manga['authors'] as $author) {
                $name = implode(' ', array_filter([
                    $author['node']['first_name'] ?? '',
                    $author['node']['last_name'] ?? ''
                ]));
                $authors[] = $name ?: 'Unknown';
            }
        }
        
        // Extraire les genres
        $genres = [];
        if (isset($manga['genres'])) {
            foreach ($manga['genres'] as $genre) {
                $genres[] = $genre['name'];
            }
        }
        
        // Extraire les titres alternatifs
        $altTitles = [];
        if (isset($manga['alternative_titles'])) {
            if (!empty($manga['alternative_titles']['en'])) {
                $altTitles[] = $manga['alternative_titles']['en'];
            }
            if (!empty($manga['alternative_titles']['ja'])) {
                $altTitles[] = $manga['alternative_titles']['ja'];
            }
            if (isset($manga['alternative_titles']['synonyms']) && is_array($manga['alternative_titles']['synonyms'])) {
                $altTitles = array_merge($altTitles, $manga['alternative_titles']['synonyms']);
            }
        }
        
        return [
            'id' => (string) $manga['id'],
            'title' => $manga['title'],
            'alt_titles' => $altTitles,
            'description' => $manga['synopsis'] ?? '',
            'cover_image' => $manga['main_picture']['large'] ?? $manga['main_picture']['medium'] ?? null,
            'authors' => $authors,
            'artists' => $authors, // MAL ne sépare pas les auteurs/artistes clairement
            'status' => $this->mapStatus($manga['status'] ?? ''),
            'genres' => $genres,
            'year' => isset($manga['start_date']) ? substr($manga['start_date'], 0, 4) : null,
            'score' => $manga['mean'] ?? null,
            'popularity_score' => $manga['popularity'] ?? 0,
            'volumes' => $manga['num_volumes'] ?? null,
            'chapters' => $manga['num_chapters'] ?? null,
            'source' => 'myanimelist'
        ];
    }
    
    /**
     * Map MyAnimeList status to standardized status format
     *
     * @param string $status
     * @return string
     */
    protected function mapStatus(string $status): string
    {
        $statusMap = [
            'currently_publishing' => 'ongoing',
            'finished' => 'completed',
            'not_yet_published' => 'not_published',
            'on_hiatus' => 'hiatus',
            'discontinued' => 'cancelled'
        ];
        
        return $statusMap[strtolower($status)] ?? 'unknown';
    }
}