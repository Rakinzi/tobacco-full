<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@tobacco.com',
            'password' => Hash::make('password123'),
            'phone_number' => '+263771234567',
            'user_type' => 'admin',
            'is_active' => true
        ]);
    }
}
