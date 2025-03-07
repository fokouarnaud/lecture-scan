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
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable(); // E.g., 'author', 'artist', etc.
            $table->timestamps();
            
            // Make the combination unique
            $table->unique(['name', 'role']);
        });
        
        // Create pivot table for many-to-many relationship
        Schema::create('author_manga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained()->onDelete('cascade');
            $table->foreignId('manga_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Make the combination unique
            $table->unique(['author_id', 'manga_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('author_manga');
        Schema::dropIfExists('authors');
    }
};