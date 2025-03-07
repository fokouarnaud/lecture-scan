<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLibrary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'manga_id',
        'source',
        'manga_title',
        'cover_image',
        'status',
    ];

    /**
     * Get the user that owns the library item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}