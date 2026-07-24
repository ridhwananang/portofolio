<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User']
        );

        User::updateOrCreate(
            ['email' => 'ridhwananang@gmail.com'],
            [
                'name' => 'Ridhwan Anang Ma\'ruf',
                'password' => \Illuminate\Support\Facades\Hash::make('AanVeena123!'),
            ]
        );

        $this->call([
            ProfileSeeder::class,
            ProjectSeeder::class,
            TechStackSeeder::class,
            CertificateSeeder::class,
        ]);
    }
}
