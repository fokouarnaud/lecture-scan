<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'manga_id',
        'api_id',
        'source',
        'volume',
        'chapter',
        'title',
        'language',
        'pages',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Get the manga that owns the chapter.
     */
    public function manga(): BelongsTo
    {
        return $this->belongsTo(Manga::class);
    }

    /**
     * Get the reading progress records for this chapter.
     */
    public function readingProgress()
    {
        return $this->hasMany(ReadingProgress::class);
    }
}