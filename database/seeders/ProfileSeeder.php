<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Profile;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Profile::create([
            'name' => 'Ridhwan Anang Ma\'ruf',
            'role' => 'Full Stack Developer',
            'bio' => 'Full Stack Developer yang berfokus pada arsitektur backend Laravel yang kokoh, integrasi React + TypeScript yang interaktif, dan optimasi database skala produksi.',
            'location' => 'Tangerang Selatan, Indonesia',
            'email' => 'ridhwananang@gmail.com',
            'image' => '/images/me.webp',
            'github_url' => 'https://github.com/ridhwananang',
            'linkedin_url' => 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/',
            'education' => [
                [
                    'school' => 'Universitas Pamulang',
                    'major' => 'Teknik Informatika (S1)',
                    'period' => '2024 - 2028',
                ],
                [
                    'school' => 'SMK Telekomunikasi Tunas Harapan',
                    'major' => 'Rekayasa Perangkat Lunak',
                    'period' => '2014 - 2017',
                ],
                [
                    'school' => 'SMP PGRI 12 Jakarta',
                    'major' => null,
                    'period' => '2011 - 2014',
                ],
                [
                    'school' => 'SD Negeri Pisangan 02',
                    'major' => null,
                    'period' => '2005 - 2011',
                ],
                [
                    'school' => 'TK Islam Al-Husna',
                    'major' => null,
                    'period' => '2003 - 2005',
                ],
            ],
        ]);
    }
}
