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
                'title' => 'Coding Camp 2026 powered by DBS Foundation - Full-Stack Web Developer',
                'category' => 'Fullstack Development',
                'issuer' => 'Dicoding Indonesia & DBS Foundation',
                'credential_id' => 'CC26/GRAD/XXVI-07/CFCC288D6Y1198',
                'date' => 'Juli 2026',
                'duration' => '943 Jam Belajar',
                'skills' => ['Full-Stack Web Development', 'React.js', 'Node.js', 'AWS Cloud & Gen AI', 'RESTful API', 'Capstone Project', 'Soft Skills'],
                'file_path' => '/images/Sertifikat/Coding Camp 2026 - DBS Foundation - Full-Stack Web Developer.pdf',
            ],
        ];

        foreach ($certificates as $cert) {
            Certificate::create($cert);
        }
    }
}
