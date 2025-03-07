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
        Schema::table('users', function (Blueprint $table) {
            $table->string('reading_mode')->default('vertical'); // Options: vertical, horizontal, double-page
            $table->boolean('dark_mode')->default(false);
            $table->boolean('receive_notifications')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['reading_mode', 'dark_mode', 'receive_notifications']);
        });
    }
};