<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingProgress extends Model
{
    use HasFactory;
    // Spécifier explicitement le nom de la table
    protected $table = 'reading_progresses';

    protected $fillable = [
        'user_id',
        'manga_id',
        'chapter_id',
        'source',
        'manga_title',
        'chapter_number',
        'chapter_title',
        'last_page',
        'total_pages',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the reading progress.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}