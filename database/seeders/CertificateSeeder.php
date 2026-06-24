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
                'title' => 'Belajar Fundamental Aplikasi Web dengan React',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-FUND-RCT',
                'date' => 'September 2025',
                'duration' => '120 Jam Belajar',
                'skills' => ['React', 'State Management', 'React Hooks', 'Routing', 'Web Storage'],
                'file_path' => '/images/Sertifikat/Belajar Fundamental Aplikasi Web dengan React.pdf',
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
                'title' => 'Belajar Dasar Pemrograman JavaScript',
                'category' => 'Software Engineering',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-BASIC-JS',
                'date' => 'Agustus 2025',
                'duration' => '45 Jam Belajar',
                'skills' => ['JS Variables', 'Functions', 'OOP JavaScript', 'Data Structures', 'ES6+'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Pemrograman JavaScript.pdf',
            ],
            [
                'title' => 'Belajar Membuat Front-End Web untuk Pemula',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-FE-BEGIN',
                'date' => 'Juli 2025',
                'duration' => '70 Jam Belajar',
                'skills' => ['DOM Manipulation', 'Event Handling', 'HTML5 APIs', 'Layouting', 'CSS Flexbox'],
                'file_path' => '/images/Sertifikat/Belajar Membuat Front-End Web untuk Pemula.pdf',
            ],
            [
                'title' => 'Belajar Dasar Pemrograman Web',
                'category' => 'Web Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-WEB-BASIC',
                'date' => 'Juni 2025',
                'duration' => '40 Jam Belajar',
                'skills' => ['HTML5', 'CSS3', 'Semantic HTML', 'Responsive Design', 'Flexbox'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Pemrograman Web.pdf',
            ],
            [
                'title' => 'Belajar Dasar Cloud dan Gen AI di AWS',
                'category' => 'Cloud Computing',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-AWS-CLOUD',
                'date' => 'November 2025',
                'duration' => '30 Jam Belajar',
                'skills' => ['AWS EC2', 'Generative AI', 'Cloud Services', 'IAM', 'Amazon S3'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Cloud dan Gen AI di AWS.pdf',
            ],
            [
                'title' => 'Memulai Dasar Pemrograman untuk Menjadi Pengembang Software',
                'category' => 'Software Engineering',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-SE-INTRO',
                'date' => 'Mei 2025',
                'duration' => '20 Jam Belajar',
                'skills' => ['Algorithms', 'Flowcharts', 'Git Version Control', 'Coding Principles', 'SDLC'],
                'file_path' => '/images/Sertifikat/Memulai Dasar Pemrograman untuk Menjadi Pengembang Software.pdf',
            ],
            [
                'title' => 'Pengenalan ke Logika Pemrograman (Programming Logic 101)',
                'category' => 'Computer Science',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'DC-LOGIC-101',
                'date' => 'April 2025',
                'duration' => '15 Jam Belajar',
                'skills' => ['Boolean Logic', 'Conditionals', 'Loops', 'Pseudo-code', 'Problem Solving'],
                'file_path' => '/images/Sertifikat/Pengenalan ke Logika Pemrograman (Programming Logic 101).pdf',
            ],
            [
                'title' => 'Belajar Dasar AI',
                'category' => 'Artificial Intelligence',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'QLZ97EME9P5D',
                'date' => 'Agustus 2024',
                'duration' => '10 Jam Belajar',
                'skills' => ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'AI Ethics', 'Prompt Engineering'],
                'file_path' => '/images/Sertifikat/Belajar Dasar AI.pdf',
            ],
            [
                'title' => 'Belajar Dasar Data Science',
                'category' => 'Data Science',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'KEXL1JKWMXG2',
                'date' => 'Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['Data Science', 'Data Analysis', 'Data Visualization', 'Machine Learning Basics'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Data Science.pdf',
            ],
            [
                'title' => 'Belajar Dasar Structured Query Language (SQL)',
                'category' => 'Database',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '6RPN1JQO8X2M',
                'date' => 'Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['SQL', 'Relational Database', 'Database Queries', 'Data Manipulation'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Structured Query Language (SQL).pdf',
            ],
            [
                'title' => 'Belajar Dasar Manajemen Proyek',
                'category' => 'Project Management',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '1OP8WEK1LXQK',
                'date' => 'Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['Project Management', 'Agile & Scrum', 'SDLC', 'Project Planning', 'Risk Management'],
                'file_path' => '/images/Sertifikat/Belajar Dasar Manajemen Proyek.pdf',
            ],
            [
                'title' => 'Belajar Strategi Pengembangan Diri',
                'category' => 'Soft Skills',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '81P2ND248XOY',
                'date' => 'Agustus 2024',
                'duration' => '10 Jam Belajar',
                'skills' => ['Growth Mindset', 'Time Management', 'Adaptability', 'Personal Development'],
                'file_path' => '/images/Sertifikat/Belajar Strategi Pengembangan Diri.pdf',
            ],
            [
                'title' => 'Financial Literacy 101',
                'category' => 'Finance',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'ERZRE65WQXYV',
                'date' => 'Mei 2025',
                'duration' => '5 Jam Belajar',
                'skills' => ['Financial Literacy', 'Personal Finance', 'Budgeting', 'Investment Basics'],
                'file_path' => '/images/Sertifikat/Financial Literacy 101.pdf',
            ],
            [
                'title' => 'Introduction to Financial Literacy',
                'category' => 'Finance',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '81P25JJ3NPOY',
                'date' => 'Desember 2025',
                'duration' => '6 Jam Belajar',
                'skills' => ['Financial Literacy', 'Personal Finance', 'Investment', 'Loan Management'],
                'file_path' => '/images/Sertifikat/Introduction to Financial Literacy.pdf',
            ],
        ];

        foreach ($certificates as $cert) {
            Certificate::create($cert);
        }
    }
}
