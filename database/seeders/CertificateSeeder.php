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
                'category' => 'Achievement & Kelulusan',
                'issuer' => 'Dicoding Indonesia & DBS Foundation',
                'credential_id' => 'CC26/GRAD/XXVI-07/CFCC288D6Y1198',
                'date' => 'Juli 2026',
                'duration' => '943 Jam Belajar',
                'skills' => ['Full-Stack Web Development', 'React.js', 'Node.js', 'AWS Cloud & Gen AI', 'RESTful API', 'Capstone Project', 'Soft Skills'],
                'file_path' => 'certificates/thumbnails/Coding_Camp_2026_DBS_Foundation_Full_Stack_Web_Developer.webp',
            ],
            [
                'title' => 'Belajar Fundamental Back-End dengan JavaScript',
                'category' => 'Backend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'L4PQ9L2Q4PO1',
                'date' => '11 Juni 2026',
                'duration' => '90 Jam Belajar',
                'skills' => ['Node.js', 'RESTful API', 'Amazon RDS', 'PostgreSQL', 'RabbitMQ', 'Amazon S3', 'Redis Caching'],
                'file_path' => 'certificates/thumbnails/Belajar Fundamental Back-End dengan JavaScript.webp',
            ],
            [
                'title' => 'Belajar Back-End Pemula dengan JavaScript',
                'category' => 'Backend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'JLX1VY92JZ72',
                'date' => '02 Juni 2026',
                'duration' => '45 Jam Belajar',
                'skills' => ['Node.js', 'RESTful API', 'Hapi Framework', 'Postman', 'API Testing'],
                'file_path' => 'certificates/thumbnails/Belajar Back-End Pemula dengan JavaScript.webp',
            ],
            [
                'title' => 'Belajar Fundamental Aplikasi Web dengan React',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'KEXLQW78YPG2',
                'date' => '09 Mei 2026',
                'duration' => '50 Jam Belajar',
                'skills' => ['React.js', 'React Hooks', 'React Router', 'Context API', 'Component Lifecycle', 'PropTypes'],
                'file_path' => 'certificates/thumbnails/Belajar Fundamental Aplikasi Web dengan React.webp',
            ],
            [
                'title' => 'Belajar Membuat Aplikasi Web dengan React',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'JMZVO32MRXN9',
                'date' => '09 April 2026',
                'duration' => '35 Jam Belajar',
                'skills' => ['React.js', 'Stateful Component', 'Controlled Component', 'Reusable Component', 'UI Component'],
                'file_path' => 'certificates/thumbnails/Belajar Membuat Aplikasi Web dengan React.webp',
            ],
            [
                'title' => 'Belajar Membuat Front-End Web untuk Pemula',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '2VX30ONWJXYQ',
                'date' => '31 Maret 2026',
                'duration' => '45 Jam Belajar',
                'skills' => ['HTML5', 'CSS3', 'DOM Manipulation', 'Event Handling', 'Web Storage'],
                'file_path' => 'certificates/thumbnails/Belajar Membuat Front-End Web untuk Pemula.webp',
            ],
            [
                'title' => 'Belajar Dasar Pemrograman JavaScript',
                'category' => 'Software Engineering',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'JLX1VD7NNZ72',
                'date' => '13 Maret 2026',
                'duration' => '46 Jam Belajar',
                'skills' => ['JavaScript ES6+', 'Functional Programming', 'OOP', 'Asynchronous JS', 'Data Structures'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Pemrograman JavaScript.webp',
            ],
            [
                'title' => 'Belajar Dasar Pemrograman Web',
                'category' => 'Frontend Development',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'QLZ99K97MZ5D',
                'date' => '27 Februari 2026',
                'duration' => '41 Jam Belajar',
                'skills' => ['HTML5', 'CSS3', 'Semantic HTML', 'Flexbox', 'Responsive Design'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Pemrograman Web.webp',
            ],
            [
                'title' => 'Belajar Dasar Cloud dan Gen AI di AWS',
                'category' => 'Cloud Computing',
                'issuer' => 'Dicoding Indonesia & AWS',
                'credential_id' => 'L4PQ9MY0OPO1',
                'date' => '16 Februari 2026',
                'duration' => '13 Jam Belajar',
                'skills' => ['AWS Cloud', 'Amazon EC2', 'AWS IAM', 'Cloud Security', 'Generative AI', 'Amazon S3'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Cloud dan Gen AI di AWS.webp',
            ],
            [
                'title' => 'Memulai Dasar Pemrograman untuk Menjadi Pengembang Software',
                'category' => 'Software Engineering',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'EYX4QRJE5PDL',
                'date' => '16 Februari 2026',
                'duration' => '9 Jam Belajar',
                'skills' => ['Software Development', 'Algorithms', 'Git Version Control', 'Software Lifecycle', 'SDLC'],
                'file_path' => 'certificates/thumbnails/Memulai Dasar Pemrograman untuk Menjadi Pengembang Software.webp',
            ],
            [
                'title' => 'Pengenalan ke Logika Pemrograman (Programming Logic 101)',
                'category' => 'Software Engineering',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'JMZVOM52RXN9',
                'date' => '16 Februari 2026',
                'duration' => '6 Jam Belajar',
                'skills' => ['Logic Gates', 'Computational Thinking', 'Algorithm Design', 'Pattern Recognition', 'Problem Solving'],
                'file_path' => 'certificates/thumbnails/Pengenalan ke Logika Pemrograman (Programming Logic 101).webp',
            ],
            [
                'title' => 'Introduction to Financial Literacy',
                'category' => 'Financial Literacy',
                'issuer' => 'Dicoding Indonesia & DBS Foundation',
                'credential_id' => '81P25JJ3NPOY',
                'date' => '12 Desember 2025',
                'duration' => '6 Jam Belajar',
                'skills' => ['Financial Planning', 'Budgeting', 'Cashflow Management', 'Financial Decision'],
                'file_path' => 'certificates/thumbnails/Introduction to Financial Literacy.webp',
            ],
            [
                'title' => 'Financial Literacy 101',
                'category' => 'Financial Literacy',
                'issuer' => 'Dicoding Indonesia & DBS Foundation',
                'credential_id' => 'ERZRE65WQXYV',
                'date' => '13 Mei 2025',
                'duration' => '5 Jam Belajar',
                'skills' => ['Financial Literacy', 'Investment Fundamentals', 'Money Management', 'Financial Goals'],
                'file_path' => 'certificates/thumbnails/Financial Literacy 101.webp',
            ],
            [
                'title' => 'Belajar Dasar AI',
                'category' => 'Artificial Intelligence',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'QLZ97EME9P5D',
                'date' => '13 Agustus 2024',
                'duration' => '10 Jam Belajar',
                'skills' => ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'AI Ethics', 'Prompt Engineering'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar AI.webp',
            ],
            [
                'title' => 'Belajar Dasar Data Science',
                'category' => 'Data Science',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => 'KEXL1JKWMXG2',
                'date' => '13 Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['Data Science', 'Data Analysis', 'Data Visualization', 'Descriptive Statistics'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Data Science.webp',
            ],
            [
                'title' => 'Belajar Dasar Structured Query Language (SQL)',
                'category' => 'Database',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '6RPN1JQO8X2M',
                'date' => '13 Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['SQL', 'Relational Database', 'Data Querying', 'DDL & DML', 'Database Normalization'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Structured Query Language (SQL).webp',
            ],
            [
                'title' => 'Belajar Dasar Manajemen Proyek',
                'category' => 'Project Management',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '1OP8WEK1LXQK',
                'date' => '12 Agustus 2024',
                'duration' => '11 Jam Belajar',
                'skills' => ['Project Management', 'Waterfall & Agile', 'Scrum', 'Risk Management', 'Project Lifecycle'],
                'file_path' => 'certificates/thumbnails/Belajar Dasar Manajemen Proyek.webp',
            ],
            [
                'title' => 'Belajar Strategi Pengembangan Diri',
                'category' => 'Soft Skills',
                'issuer' => 'Dicoding Indonesia',
                'credential_id' => '81P2ND248XOY',
                'date' => '15 Agustus 2024',
                'duration' => '10 Jam Belajar',
                'skills' => ['Growth Mindset', 'Self Management', 'Productivity Strategy', 'Personal Development Plan'],
                'file_path' => 'certificates/thumbnails/Belajar Strategi Pengembangan Diri.webp',
            ],
        ];

        foreach ($certificates as $cert) {
            Certificate::create($cert);
        }
    }
}
