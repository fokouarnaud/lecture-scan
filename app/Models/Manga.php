<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Manga extends Model
{
    use HasFactory;

    protected $fillable = [
        'api_id',
        'source',
        'title',
        'description',
        'cover_image',
        'status',
        'year',
        'publication_demographic',
        'content_rating'
    ];

    /**
     * Get the chapters for the manga.
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    /**
     * Get the genres that belong to the manga.
     */
    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    /**
     * Get the authors that belong to the manga.
     */
    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class);
    }

    /**
     * Get the users who have this manga in their library.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_libraries')
                    ->withPivot('status')
                    ->withTimestamps();
    }
}