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
        Schema::create('user_libraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('manga_id'); // External API ID
            $table->string('source'); // API source (e.g., 'mangadex', 'jikan')
            $table->string('manga_title');
            $table->string('cover_image')->nullable();
            $table->enum('status', ['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'])->default('reading');
            $table->timestamps();
            
            // Make sure a user can't add the same manga twice
            $table->unique(['user_id', 'manga_id', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_libraries');
    }
};