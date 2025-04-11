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
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('trading_name');
            $table->string('company_registration_number')->unique();
            $table->string('bp_number')->unique()->nullable();
            $table->string('zimra_number')->unique();
            $table->string('physical_address')->unique();
            $table->string('city');
            $table->string('contact_person');
            $table->string('contact_phone');
            $table->string('contact_email');
            $table->enum('business_type', ['auction_floor', 'contractor', 'merchant']);
            $table->string('license_expiry_date')->nullable();
            $table->string('is_verified')->default(false);
            $table->timestamps();   
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
