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
        Schema::create('mangas', function (Blueprint $table) {
            $table->id();
            $table->string('api_id');
            $table->string('source');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('status')->default('unknown');
            $table->year('year')->nullable();
            $table->string('publication_demographic')->nullable();
            $table->string('content_rating')->nullable();
            $table->timestamps();
            
            // Create a unique constraint on api_id and source to prevent duplicates
            $table->unique(['api_id', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mangas');
    }
};