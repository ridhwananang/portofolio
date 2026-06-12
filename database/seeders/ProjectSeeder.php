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
        $projects = [
            [
                'title' => 'Finverra',
                'description' => 'Sistem manajemen keuangan khusus pergudangan untuk mengelola arus kas, pencatatan transaksi, dan laporan finansial secara efisien dan terintegrasi.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'finverra',
                'image' => '/images/finverra.png',
            ],
            [
                'title' => 'MyClassyTask',
                'description' => 'Aplikasi manajemen tugas berbasis AI yang membantu pengguna mengatur jadwal, prioritas, dan tenggat waktu secara cerdas dan efisien.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'classytask',
                'image' => '/images/myclassytask.png',
            ],
            [
                'title' => 'ProManageSys',
                'description' => 'Sistem manajemen proyek yang membantu pengguna mengatur proyek, tugas, dan kolaborasi tim secara efisien.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'promanagesys',
                'image' => '/images/promanagesys.png',
            ],
            [
                'title' => 'SiPresens',
                'description' => 'Sistem manajemen kehadiran dan absensi karyawan secara real-time terintegrasi dengan pencatatan lokasi GPS dan pelaporan otomatis.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'sipresens',
                'image' => '/images/sipresens.png',
            ],
            [
                'title' => 'SportIn',
                'description' => 'Platform pemesanan lapangan olahraga dan pencarian kawan bermain (matchmaking) olahraga secara online.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'sportin',
                'image' => '/images/sportin.png',
            ],
            [
                'title' => 'SmartBanana',
                'description' => 'Aplikasi monitoring rantai pasok dan klasifikasi tingkat kematangan buah pisang menggunakan algoritma Computer Vision berbasis AI.',
                'tags' => ['PYTHON', 'FLASK', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'smartbanana',
                'image' => '/images/smartbanana.png',
            ],
            [
                'title' => 'NutriVision',
                'description' => 'Asisten diet personal berbasis AI untuk menganalisis kandungan nutrisi makanan secara instan hanya dari unggahan foto.',
                'tags' => ['PYTHON', 'FASTAPI', 'REACT', 'TYPESCRIPT', 'POSTGRESQL'],
                'mockup_type' => 'nutrivision',
                'image' => '/images/nutrivision.png',
            ],
            [
                'title' => 'MTs Baitis Salmah',
                'description' => 'Sistem informasi akademik dan profil sekolah Madrasah Tsanawiyah Baitis Salmah untuk memudahkan pengelolaan data sekolah, administrasi nilai, serta publikasi berita kegiatan.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'mts-baitis-salmah',
                'image' => '/images/mts-baitis-salmah.png',
            ],
            [
                'title' => 'LMS Skillventura',
                'description' => 'Platform Learning Management System (LMS) modern untuk menyelenggarakan pembelajaran online, kelas interaktif, ujian/kuis, serta sertifikasi keahlian terintegrasi.',
                'tags' => ['LARAVEL', 'API', 'REACT', 'TYPESCRIPT', 'MYSQL'],
                'mockup_type' => 'lms-skillventura',
                'image' => '/images/lms-skillventura.png',
            ],
        ];


        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}
