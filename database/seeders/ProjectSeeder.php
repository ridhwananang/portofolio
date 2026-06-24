<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Project::query()->delete();

        $projects = [
            [
                'title' => 'LMS SkillVentura',
                'description' => 'Platform Learning Management System (LMS) modern untuk menyelenggarakan pembelajaran online, kelas interaktif, ujian/kuis, serta sertifikasi keahlian terintegrasi.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'lms-skillventura',
                'image' => '/images/lms-skillventura.webp',
            ],
            [
                'title' => 'Nutrivision',
                'description' => 'Asisten diet personal berbasis AI untuk menganalisis kandungan nutrisi makanan secara instan hanya dari unggahan foto.',
                'tags' => ['PYTHON', 'FASTAPI', 'REACT', 'TYPESCRIPT', 'POSTGRESQL'],
                'mockup_type' => 'nutrivision',
                'image' => '/images/nutrivision.webp',
            ],
            [
                'title' => 'SmartBanana',
                'description' => 'Aplikasi monitoring rantai pasok dan klasifikasi tingkat kematangan buah pisang menggunakan algoritma Computer Vision berbasis AI.',
                'tags' => ['PYTHON', 'FLASK', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'smartbanana',
                'image' => '/images/smartbanana.webp',
            ],
            [
                'title' => 'ProManageSys',
                'description' => 'Sistem manajemen proyek yang membantu pengguna mengatur proyek, tugas, dan kolaborasi tim secara efisien.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'promanagesys',
                'image' => '/images/promanagesys.webp',
            ],
            [
                'title' => 'SiPresens',
                'description' => 'Sistem manajemen kehadiran dan absensi karyawan secara real-time terintegrasi dengan pencatatan lokasi GPS dan pelaporan otomatis.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'sipresens',
                'image' => '/images/sipresens.webp',
            ],
            [
                'title' => 'MyClassyTask',
                'description' => 'Aplikasi manajemen tugas berbasis AI yang membantu pengguna mengatur jadwal, prioritas, dan tenggat waktu secara cerdas dan efisien.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'classytask',
                'image' => '/images/myclassytask.webp',
            ],
            [
                'title' => 'SportIn',
                'description' => 'Platform pemesanan lapangan olahraga dan pencarian kawan bermain (matchmaking) olahraga secara online.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'sportin',
                'image' => '/images/sportin.webp',
            ],
            [
                'title' => 'Finverra',
                'description' => 'Sistem manajemen keuangan khusus pergudangan untuk mengelola arus kas, pencatatan transaksi, dan laporan finansial secara efisien dan terintegrasi.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'finverra',
                'image' => '/images/finverra.webp',
            ],
            [
                'title' => 'Mts Baitis Salmah',
                'description' => 'Sistem informasi akademik dan profil sekolah Madrasah Tsanawiyah Baitis Salmah untuk memudahkan pengelolaan data sekolah, administrasi nilai, serta publikasi berita kegiatan.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'mts-baitis-salmah',
                'image' => '/images/mts-baitis-salmah.webp',
            ],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}
