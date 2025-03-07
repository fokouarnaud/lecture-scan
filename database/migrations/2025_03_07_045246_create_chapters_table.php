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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manga_id')->constrained()->onDelete('cascade');
            $table->string('api_id');
            $table->string('source');
            $table->string('volume')->nullable();
            $table->string('chapter')->nullable();
            $table->string('title')->nullable();
            $table->string('language')->default('en');
            $table->integer('pages')->default(0);
            $table->timestamp('published_at')->nullable();
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
        Schema::dropIfExists('chapters');
    }
};