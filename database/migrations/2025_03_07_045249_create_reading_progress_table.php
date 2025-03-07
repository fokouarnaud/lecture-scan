<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reading_progresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('manga_id'); // External API ID
            $table->string('chapter_id'); // External API ID
            $table->string('source'); // API source (e.g., 'mangadex', 'jikan')
            $table->string('manga_title');
            $table->string('chapter_number')->nullable();
            $table->string('chapter_title')->nullable();
            $table->integer('last_page')->default(1);
            $table->integer('total_pages')->default(0);
            $table->timestamp('read_at');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'manga_id', 'chapter_id', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_progresses');
    }
};