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
        Schema::create('tobacco_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_profile_id')->constrained()->onDelete('cascade');
            $table->string('batch_number')->unique();
            $table->enum('tobacco_type', ['flue_cured', 'burley', 'dark_fired']);
            $table->decimal('quantity', 10, 2); // in kgs
            $table->string('grade');
            $table->string('region_grown');
            $table->string('season_grown');
            $table->text('description')->nullable();
            $table->decimal('minimum_price', 10, 2);
            $table->boolean('timb_cleared')->default(false);
            $table->dateTime('timb_cleared_at')->nullable();
            $table->string('timb_certificate_number')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'sold'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tobacco_listings');
    }
};
