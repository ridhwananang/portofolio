<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Certificate;

class CertificateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Certificate::query()->delete();

        $certificates = [
            [
                'title' => 'Belajar Fundamental Back-End dengan JavaScript',
                'category' => 'Backend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'L4PQ9L2Q4PO1',
                'date' => 'Juni 2026',
                'duration' => '120 Jam Belajar',
                'skills' => ['Node.js', 'RESTful API', 'Clean Code', 'API Design', 'Postman'],
                'file_path' => '/images/Sertifikat/Belajar Fundamental Back-End dengan JavaScript.pdf',
            ],
            [
                'title' => 'Belajar Back-End Pemula dengan JavaScript',
                'category' => 'Backend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-BE-JS',
                'date' => 'Desember 2025',
                'duration' => '80 Jam Belajar',
                'skills' => ['Node.js', 'RESTful API', 'Hapi framework', 'API Testing', 'Postman'],
                'file_path' => '/images/Sertifikat/Belajar Back-End Pemula dengan JavaScript.pdf',
            ],
            [
                'title' => 'Belajar Membuat Aplikasi Web dengan React',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-APP-RCT',
                'date' => 'Oktober 2025',
                'duration' => '120 Jam Belajar',
                'skills' => ['React Router', 'Context API', 'TypeScript', 'Web Components', 'Performance Optimization'],
                'file_path' => '/images/Sertifikat/Belajar Membuat Aplikasi Web dengan React.pdf',
            ],
            [
                'title' => 'Belajar Fundamental Aplikasi Web dengan React',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-FUND-RCT',
                'date' => 'September 2025',
                'duration' => '120 Jam Belajar',
                'skills' => ['React', 'State Management', 'React Hooks', 'Routing', 'Web Storage'],
                'file_path' => '/images/Sertifikat/Belajar Fundamental Aplikasi Web dengan React.pdf',
            ],
        ];

        foreach ($certificates as $cert) {
            Certificate::create($cert);
        }
    }
}
