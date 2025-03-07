<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ComicVineApiService
{
    protected $client;
    protected $baseUrl = 'https://comicvine.gamespot.com/api';
    protected $apiKey;
    
    public function __construct(PendingRequest $client)
    {
        $this->apiKey = env('COMICVINE_API_KEY', '');
        $this->client = $client->withHeaders([
            'Accept' => 'application/json'
        ]);
    }
    
    /**
     * Get popular manga/comics from ComicVine
     *
     * @param int $limit
     * @return Collection
     */
    public function getPopularManga(int $limit = 20): Collection
    {
        try {
            // ComicVine requires an API key
            if (empty($this->apiKey)) {
                Log::warning('ComicVine API: No API key configured');
                return collect([]);
            }
            
            $response = $this->client->get('/volumes', [
                'api_key' => $this->apiKey,
                'format' => 'json',
                'filter' => 'volume_type:collection',
                'sort' => 'date_last_updated:desc',
                'limit' => $limit,
                'field_list' => 'id,name,description,image,publisher,start_year,first_issue_name,last_issue_name,count_of_issues'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('results');
                return $this->formatManga($data);
            }
            
            return collect([]);
        } catch (\Exception $e) {
            Log::error('ComicVine API error: ' . $e->getMessage());
            return collect([]);
        }
    }
    
    /**
     * Search for manga/comics in ComicVine
     *
     * @param array $criteria
     * @param int $limit
     * @return Collection
     */
    public function searchManga(array $criteria, int $limit = 20): Collection
    {
        try {
            // ComicVine requires an API key
            if (empty($this->apiKey)) {
                Log::warning('ComicVine API: No API key configured');
                return collect([]);
            }
            
            $filters = [];
            
            if (isset($criteria['title'])) {
                $filters[] = 'name:' . urlencode($criteria['title']);
            }
            
            if (isset($criteria['year'])) {
                $filters[] = 'start_year:' . $criteria['year'];
            }
            
            $filterStr = !empty($filters) ? implode(',', $filters) : 'volume_type:collection';
            
            $response = $this->client->get('/volumes', [
                'api_key' => $this->apiKey,
                'format' => 'json',
                'filter' => $filterStr,
                'limit' => $limit,
                'field_list' => 'id,name,description,image,publisher,start_year,first_issue_name,last_issue_name,count_of_issues'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('results');
                return $this->formatManga($data);
            }
            
            return collect([]);
        } catch (\Exception $e) {
            Log::error('ComicVine API error: ' . $e->getMessage());
            return collect([]);
        }
    }
    
    /**
     * Get manga details from ComicVine
     *
     * @param string $id
     * @return array|null
     */
    public function getMangaDetails(string $id): ?array
    {
        try {
            // ComicVine requires an API key
            if (empty($this->apiKey)) {
                Log::warning('ComicVine API: No API key configured');
                return null;
            }
            
            $response = $this->client->get("/volume/4050-{$id}/", [
                'api_key' => $this->apiKey,
                'format' => 'json',
                'field_list' => 'id,name,description,image,publisher,start_year,first_issue_name,last_issue_name,count_of_issues,characters,people,concepts'
            ]);
            
            if ($response->successful()) {
                $data = $response->json('results');
                return $this->formatSingleManga($data);
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('ComicVine API error: ' . $e->getMessage());
            return null;
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
            // Extract the ID from the API URL
            $id = $manga['id'];
            if (is_string($manga['api_detail_url'])) {
                $parts = explode('/', rtrim($manga['api_detail_url'], '/'));
                $id = end($parts);
                $id = str_replace('4050-', '', $id);
            }
            
            // Extract publisher as author
            $authors = [];
            if (isset($manga['publisher']['name'])) {
                $authors[] = $manga['publisher']['name'];
            }
            
            return [
                'id' => (string) $id,
                'title' => $manga['name'] ?? 'Unknown Title',
                'description' => strip_tags($manga['description'] ?? ''),
                'cover_image' => $manga['image']['original_url'] ?? null,
                'authors' => $authors,
                'status' => $manga['count_of_issues'] > 0 ? 'completed' : 'unknown',
                'genres' => [], // ComicVine doesn't provide genres in the volume listing
                'year' => $manga['start_year'] ?? null,
                'popularity_score' => 0, // Not provided by ComicVine
                'source' => 'comicvine'
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
        // Extract the ID from the API URL
        $id = $manga['id'];
        if (is_string($manga['api_detail_url'])) {
            $parts = explode('/', rtrim($manga['api_detail_url'], '/'));
            $id = end($parts);
            $id = str_replace('4050-', '', $id);
        }
        
        // Extract publisher as author
        $authors = [];
        if (isset($manga['publisher']['name'])) {
            $authors[] = $manga['publisher']['name'];
        }
        
        // Extract creators
        if (isset($manga['people']) && is_array($manga['people'])) {
            foreach ($manga['people'] as $person) {
                $role = $person['role'] ?? '';
                if (stripos($role, 'writer') !== false || stripos($role, 'creator') !== false) {
                    $authors[] = $person['name'] ?? 'Unknown Author';
                }
            }
        }
        
        // Extract concepts as genres
        $genres = [];
        if (isset($manga['concepts']) && is_array($manga['concepts'])) {
            foreach ($manga['concepts'] as $concept) {
                $genres[] = $concept['name'] ?? '';
            }
        }
        
        return [
            'id' => (string) $id,
            'title' => $manga['name'] ?? 'Unknown Title',
            'alt_titles' => [],
            'description' => strip_tags($manga['description'] ?? ''),
            'cover_image' => $manga['image']['original_url'] ?? null,
            'authors' => array_unique($authors),
            'artists' => [], // Not easily available from ComicVine
            'status' => $manga['count_of_issues'] > 0 ? 'completed' : 'unknown',
            'genres' => array_filter($genres),
            'year' => $manga['start_year'] ?? null,
            'chapter_count' => $manga['count_of_issues'] ?? null,
            'source' => 'comicvine'
        ];
    }
}