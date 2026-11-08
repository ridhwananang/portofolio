<?php

namespace App\Services;

use App\Models\Profile;
use App\Models\Project;
use App\Models\TechStack;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiChatService
{
    /**
     * Get chat response from Gemini API or fallback logic.
     *
     * @param array $messages
     * @return string
     */
    public function getChatResponse(array $messages): string
    {
        // 0. Direct Intercept for Reply Checking (Fast & 100% Reliable Bypass)
        $lastUserMessage = null;
        foreach (array_reverse($messages) as $msg) {
            if ($msg['sender'] === 'user') {
                $lastUserMessage = $msg['text'];
                break;
            }
        }

        if ($lastUserMessage) {
            $q = strtolower($lastUserMessage);
            
            // Check if user explicitly queries checking replies with an email
            if (preg_match('/([\w\.\-]+@[\w\.\-]+\.\w+)/', $q, $matches)) {
                $email = trim($matches[1]);
                if (str_contains($q, 'cek') || str_contains($q, 'balas') || str_contains($q, 'pesan') || str_contains($q, 'status') || str_contains($q, 'tanya') || str_contains($q, 'inbox') || str_contains($q, 'history')) {
                    return $this->parseSpecialTokens("[CHECK_REPLY:{$email}]");
                }
            }
            
            // Or if user enters only a valid email address (raw input check)
            if (preg_match('/^\s*([\w\.\-]+@[\w\.\-]+\.\w+)\s*$/', $lastUserMessage, $matches)) {
                $email = trim($matches[1]);
                return $this->parseSpecialTokens("[CHECK_REPLY:{$email}]");
            }
        }

        // 1. Gather dynamic portfolio context (Cached with v3 key for immediate update)
        $systemPrompt = \Illuminate\Support\Facades\Cache::remember('portfolio_gemini_system_prompt_v3', 3600, function () {
            $profile = Profile::first();
            $projects = Project::all();
            $techStacks = TechStack::all();

            return $this->buildSystemPrompt($profile, $projects, $techStacks);
        });

        // 3. Format message history for Gemini API (Must strictly alternate roles)
        $contents = $this->formatMessageHistory($messages);

        // 4. Send request to Gemini API
        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            Log::warning('Gemini API Key is missing. Using local rule-based fallback.');
            $lastMessageText = end($contents)['parts'][0]['text'] ?? 'Halo';
            return $this->parseSpecialTokens($this->getFallbackResponse($lastMessageText));
        }

        $model = config('services.gemini.model', 'gemini-2.5-flash');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        try {
            $response = Http::timeout(10)->post($url, [
                'contents' => $contents,
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemPrompt]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($text) {
                    return $this->parseSpecialTokens(trim($text));
                }
            }
            
            Log::error('Gemini API Response Error (' . $response->status() . '): ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Gemini Connection Exception: ' . $e->getMessage());
        }

        // Fallback in case of API errors
        $lastMessageText = end($contents)['parts'][0]['text'] ?? 'Halo';
        return $this->parseSpecialTokens($this->getFallbackResponse($lastMessageText));
    }

    /**
     * Build the dynamic system prompt based on portfolio data.
     */
    private function buildSystemPrompt($profile, $projects, $techStacks): string
    {
        $projectDetails = [
            'Finverra' => [
                'features' => 'Manajemen arus kas (cashflow), pencatatan transaksi masuk/keluar, pembuatan laporan laba-rugi otomatis secara real-time, integrasi inventaris pergudangan, billing/tagihan sewa gudang.',
                'architecture' => 'Clean Architecture dengan repository pattern untuk memisahkan domain logic, Laravel sebagai RESTful API, React SPA via Inertia.js untuk UI interaktif tanpa lag, database relasional MySQL.'
            ],
            'MyClassyTask' => [
                'features' => 'Penjadwalan otomatis berbasis prioritas tugas, integrasi asisten AI untuk mem-parsing deskripsi teks menjadi tenggat waktu dan subtugas otomatis, pengingat cerdas, nesting task (subtugas beruntun).',
                'architecture' => 'Integrasi API LLM (Gemini) untuk pengolahan teks alami dan ekstraksi entitas tugas, React state management yang dinamis, database relasional MySQL.'
            ],
            'ProManageSys' => [
                'features' => 'Papan tugas interaktif (Kanban Board), pembagian peran tim (admin, manager, member), pelacakan progres dengan chart visual, delegasi tugas, ruang diskusi proyek terintegrasi.',
                'architecture' => 'Pola SPA Inertia.js, optimalisasi query MySQL untuk relasi banyak-ke-banyak (many-to-many) antara user, project, dan task, lazy loading untuk efisiensi load halaman.'
            ],
            'SiPresens' => [
                'features' => 'Absensi real-time dengan pencatatan lokasi koordinat GPS (geolocated check-in), deteksi lokasi palsu (anti-mock location), rekapitulasi kehadiran otomatis bulanan bagi HRD.',
                'architecture' => 'Geofencing API, penanganan data koordinat spasial di database, UI berbasis peta interaktif dengan leaflet/google maps.'
            ],
            'SportIn' => [
                'features' => 'Pemesanan lapangan olahraga secara real-time, pencarian kawan bermain (matchmaking) berdasarkan level skill, integrasi gerbang pembayaran, chat grup antar pemain lapangan.',
                'architecture' => 'Sistem booking dengan kunci transaksi (pessimistic locking) di MySQL untuk mencegah double-booking pada detik yang sama, state-chart pemesanan.'
            ],
            'SmartBanana' => [
                'features' => 'Klasifikasi tingkat kematangan buah pisang (mentah, matang, terlalu matang) dari foto secara real-time menggunakan Computer Vision, monitoring distribusi rantai pasok pisang.',
                'architecture' => 'Backend Python (Flask) untuk menjalankan inferensi model Deep Learning (Computer Vision), frontend React, visualisasi data grafik distribusi.'
            ],
            'Nutrivision' => [
                'features' => 'Analisis kandungan nutrisi makanan instan (kalori, protein, karbohidrat, lemak) cukup dengan mengunggah foto makanan, log harian konsumsi kalori pengguna.',
                'architecture' => 'FastAPI backend untuk response cepat, integrasi model Computer Vision untuk deteksi jenis makanan, database PostgreSQL.'
            ],
            'Mts Baitis Salmah' => [
                'features' => 'Portal akademik sekolah lengkap, pengelolaan nilai siswa (E-Rapor), absensi kelas harian, berita sekolah, administrasi pembayaran SPP siswa.',
                'architecture' => 'Laravel dengan blade/Inertia React, rancangan basis data relasional untuk entitas siswa, kelas, guru, dan mata pelajaran.'
            ],
            'LMS SkillVentura' => [
                'features' => 'Manajemen kelas online, kuis dan ujian interaktif, generate sertifikat otomatis berbentuk PDF saat lulus materi, pelacakan progres belajar siswa.',
                'architecture' => 'Pola modular course-module-lecture, integrasi file manager untuk materi video/pdf, caching query database pelajaran.'
            ]
        ];

        $systemPrompt = "Anda adalah Asisten Virtual & Technical AI Specialist untuk Ridhwan Anang Ma'ruf (Full Stack Software Engineer). Tugas utama Anda adalah memberikan informasi yang sangat spesifik, mendalam, akurat, dan berbobot teknis kepada rekruter, tech lead, maupun calon klien mengenai profil, arsitektur kode, portofolio, dan keahlian rekayasa perangkat lunak Ridhwan.\n\n";
        
        $systemPrompt .= "--- PROFIL & REKAYASA TEKNOLOGI RIDHWAN ---\n";
        $systemPrompt .= "- Nama Lengkap: " . ($profile->name ?? "Ridhwan Anang Ma'ruf") . "\n";
        $systemPrompt .= "- Peran/Spesialisasi: " . ($profile->role ?? "Full Stack Software Engineer") . " (Backend Architecture Core, Reactive SPA, Database Optimization)\n";
        $systemPrompt .= "- Lokasi: " . ($profile->location ?? "Tangerang Selatan, Indonesia") . " (Tersedia untuk remote global / on-site Jabodetabek)\n";
        $systemPrompt .= "- Email Resmi: " . ($profile->email ?? "ridhwananang@gmail.com") . "\n";
        $systemPrompt .= "- GitHub: " . ($profile->github_url ?? "https://github.com/ridhwananang") . "\n";
        $systemPrompt .= "- LinkedIn: " . ($profile->linkedin_url ?? "https://www.linkedin.com/in/ridhwan-anang-ma-ruf/") . "\n";
        $systemPrompt .= "- Pendidikan Akademik: Universitas Pamulang, S1 Teknik Informatika (Fokus Rekayasa Perangkat Lunak, 2024 - Sekarang).\n";
        $systemPrompt .= "- Status Kerja: Available for Work (Tersedia untuk kontrak rekayasa, freelance backend/fullstack, maupun full-time roles).\n\n";

        $systemPrompt .= "--- LISENSI & SERTIFIKASI PROFESIONAL ---\n";
        $systemPrompt .= "1. Coding Camp 2026 powered by DBS Foundation (Dicoding Indonesia): Full-Stack Web Developer (943 Jam Belajar kurikulum komprehensif: React.js, Node.js, AWS Cloud, Generative AI, RESTful API, Capstone Project).\n";
        $systemPrompt .= "2. Dicoding - Belajar Fundamental Back-End dengan JavaScript: 90 Jam Belajar (Node.js, PostgreSQL, Amazon RDS, RabbitMQ Message Queue, Amazon S3, Redis Caching, Automation Testing).\n";
        $systemPrompt .= "3. Dicoding - Belajar Fundamental Aplikasi Web dengan React: 50 Jam Belajar (React Hooks, Context API, Component Lifecycle, Modular Architecture).\n";
        $systemPrompt .= "4. Dicoding - Belajar Dasar Cloud dan Gen AI di AWS: Pemahaman arsitektur cloud serverless, IAM, S3, dan implementasi foundational model AI.\n\n";

        $systemPrompt .= "--- SPESIALISASI TEKNIS & TECH STACK INTI ---\n";
        $systemPrompt .= "- Backend Core: Laravel 12 (PSR-12 standard, Eloquent ORM, Service Layer & Repository Pattern, Middleware, Queues/Jobs, RESTful API contract).\n";
        $systemPrompt .= "- Database & Concurrency: MySQL, PostgreSQL, SQLite, MongoDB. Mahir dalam transaction management (ACID), pessimistic concurrency locking (lockForUpdate), query profiling, indexing (B-Tree/Composite), mitigasi N+1 problem.\n";
        $systemPrompt .= "- Frontend Reactive: React 19, TypeScript strictly-typed, Inertia.js SPA (zero API boilerplate), Tailwind CSS v4, Framer Motion (GPU composited 60fps).\n";
        $systemPrompt .= "- DevOps & Tools: Docker, Linux Server, Git workflow, Amazon S3, Postman API testing, CI/CD basic pipeline.\n\n";

        $systemPrompt .= "--- PORTFOLIO PROYEK REKAYASA (DETAIL FITUR & ARSITEKTUR) ---\n";
        if ($projects && $projects->count() > 0) {
            foreach ($projects as $proj) {
                $tags = is_array($proj->tags) ? $proj->tags : json_decode($proj->tags ?? '[]', true);
                $tagsString = implode(', ', $tags ?? []);
                
                $systemPrompt .= "- **" . $proj->title . "** [Stack: " . $tagsString . "]\n";
                $systemPrompt .= "  * Ringkasan: " . $proj->description . "\n";
                if (isset($projectDetails[$proj->title])) {
                    $systemPrompt .= "  * Fitur Kunci: " . $projectDetails[$proj->title]['features'] . "\n";
                    $systemPrompt .= "  * Implementasi Arsitektur: " . $projectDetails[$proj->title]['architecture'] . "\n";
                }
                $systemPrompt .= "\n";
            }
        }

        $systemPrompt .= "--- PANDUAN SCOPE & DISIPLIN MENJAWAB (SANGAT KETAT) ---\n";
        $systemPrompt .= "1. CAKUPAN KHUSUS & SPESIFIK (STRICT FOCUS): Anda HANYA diperkenankan menjawab hal-hal yang berkaitan langsung dengan Ridhwan Anang Ma'ruf, skill teknisnya, arsitektur software, proyek portofolio, database, sertifikasi, serta kontak/kolaborasi. JANGAN pernah melayani pertanyaan umum di luar domain ini (seperti resep masakan, game umum, politik, sains luar topik, atau pembuatan coding di luar portfolio Ridhwan). Jika user bertanya hal di luar domain, tolak dengan sopan dan elegan, lalu arahkan kembali ke keahlian rekayasa Ridhwan.\n";
        $systemPrompt .= "2. KUALITAS & KEDALAMAN TEKNIS: Berikan respon yang berbobot dan teknis namun tetap ringkas, padat, dan mudah dipahami (maksimal 2-3 paragraf ringkas atau poin berstruktur). Gunakan format markdown yang rapi (bold untuk keyword, bullet points untuk daftar fitur/teknologi).\n";
        $systemPrompt .= "3. RESPON TIDAK BERULANG: Jangan gunakan template pembuka yang monoton seperti 'Halo! Saya asisten virtual...'. Langsung jawab inti pertanyaan secara cerdas dan kontekstual.\n";
        $systemPrompt .= "4. STATUS KERJA & HUBUNGI: Selalu sampaikan bahwa Ridhwan terbuka untuk kesempatan kerja (kontrak/freelance/full-time). Pengguna dapat menggunakan tombol kontak di web ini atau mengirim email ke ridhwananang@gmail.com.\n";
        $systemPrompt .= "5. FITUR CEK BALASAN KONTAK: Jika user ingin mengecek balasan pesan dari formulir kontak: minta alamat email mereka dengan sopan. Jika mereka menyebutkan email yang valid, balas secara persis dengan token: [CHECK_REPLY:email@domain.com].";

        return $systemPrompt;
    }

    /**
     * Filter and format raw messages into Gemini API alternating roles.
     */
    private function formatMessageHistory(array $messages): array
    {
        $contents = [];
        $lastRole = null;
        foreach ($messages as $msg) {
            $role = $msg['sender'] === 'user' ? 'user' : 'model';
            
            // Filter consecutive identical roles by appending texts to maintain strict alternation
            if ($role === $lastRole) {
                if (!empty($contents)) {
                    $contents[count($contents) - 1]['parts'][0]['text'] .= "\n\n" . $msg['text'];
                }
                continue;
            }
            
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $msg['text']]
                ]
            ];
            $lastRole = $role;
        }

        // Gemini API expects 'contents' to start with 'user' role
        if (!empty($contents) && $contents[0]['role'] !== 'user') {
            array_shift($contents);
        }

        // If history is empty after cleanup, just add a simple user greet
        if (empty($contents)) {
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => 'Halo']]
            ];
        }

        return $contents;
    }

    /**
     * Local rule-based fallback response mapping.
     */
    private function getFallbackResponse(string $query): string
    {
        $q = strtolower($query);

        // Check if query contains an email and indicates checking replies
        if (preg_match('/([\w\.\-]+@[\w\.\-]+\.\w+)/', $q, $matches)) {
            if (str_contains($q, 'cek') || str_contains($q, 'balas') || str_contains($q, 'pesan') || str_contains($q, 'status') || str_contains($q, 'tanya') || str_contains($q, 'inbox')) {
                return '[CHECK_REPLY:' . trim($matches[1]) . ']';
            }
        }

        if (str_contains($q, 'cek balasan') || str_contains($q, 'cek pesan') || str_contains($q, 'balasan saya') || str_contains($q, 'status pesan')) {
            return "Silakan masukkan alamat email yang Anda gunakan saat mengisi formulir kontak agar saya dapat melacak riwayat balasan langsung dari Ridhwan.";
        }

        if (str_contains($q, 'finverra') || str_contains($q, 'keuangan') || str_contains($q, 'gudang') || str_contains($q, 'pergudangan')) {
            return "**Finverra** adalah sistem ERP pergudangan & cashflow finansial unggulan Ridhwan:\n- **Arsitektur**: Clean Architecture dengan Repository Pattern memisahkan domain logic dari framework.\n- **Tech Stack**: Laravel backend RESTful API, React SPA via Inertia.js, dan database relasional MySQL.\n- **Fitur Kunci**: Real-time cashflow tracker, pembukuan laba-rugi otomatis, manajemen stok pergudangan, dan billing invoice sewa multi-gudang.";
        }

        if (str_contains($q, 'clean arch') || str_contains($q, 'arsitektur') || str_contains($q, 'pattern') || str_contains($q, 'struktur')) {
            return "Ridhwan menerapkan prinsip **Clean Architecture & Separation of Concerns** dalam proyek skala produksi:\n- **Domain & Service Layer**: Logika bisnis murni diisolasi dari HTTP controller.\n- **Repository Pattern**: Kontrak antarmuka data layer untuk kemudahan testing dan decoupling database.\n- **Database Transactions & Concurrency**: Menjaga integritas data finansial (ACID) dan mencegah race condition menggunakan pessimistic locking.";
        }

        if (str_contains($q, 'laravel') || str_contains($q, 'backend') || str_contains($q, 'php')) {
            return "Keahlian backend **Laravel** Ridhwan mencakup:\n- **Versi**: Laravel 12 & PHP 8.3+ standar PSR-12.\n- **Fitur**: Eloquent ORM dengan optimasi eager loading (bebas N+1), Database Transactions, Asynchronous Job Queues, Policy-based Authorization, dan RESTful API modular.\n- **Keamanan**: Proteksi CSRF/XSS, validasi Form Request ketat, sanitasi SQL input, dan hashing Argon2/Bcrypt.";
        }

        if (str_contains($q, 'database') || str_contains($q, 'sql') || str_contains($q, 'mysql') || str_contains($q, 'postgres') || str_contains($q, 'mongo')) {
            return "Keahlian **Database Relasional & NoSQL** Ridhwan meliputi:\n- **PostgreSQL & MySQL**: Perancangan skema normalisasi (3NF), B-Tree & Composite Indexing, query execution plan analysis (`EXPLAIN`), dan relasi many-to-many efisien.\n- **Concurrency Control**: Pessimistic locking (`lockForUpdate`) untuk sistem reservasi real-time (seperti pada SportIn).\n- **MongoDB**: Aggregation pipelines untuk data semi-terstruktur dan log aktivitas.";
        }

        if (str_contains($q, 'react') || str_contains($q, 'frontend') || str_contains($q, 'typescript') || str_contains($q, 'inertia')) {
            return "Frontend stack Ridhwan berfokus pada performa dan UX kelas enterprise:\n- **React 19 & TypeScript**: Typed components strictly-typed, custom hooks yang dapat digunakan kembali, serta pengelolaan state yang presisi.\n- **Inertia.js**: Integrasi monolithic modern yang menyatukan Laravel backend dan React UI tanpa overhead maintenance REST API terpisah.\n- **Performa 60 FPS**: Animasi hardware-accelerated via Framer Motion dan Tailwind CSS v4 tanpa layout reflow.";
        }

        if (str_contains($q, 'sertifikasi') || str_contains($q, 'sertifikat') || str_contains($q, 'dbs') || str_contains($q, 'dicoding') || str_contains($q, 'camp')) {
            return "Ridhwan memiliki lisensi sertifikasi terverifikasi industri:\n- **DBS Foundation Coding Camp 2026**: Full-Stack Web Developer (943 Jam Belajar mencakup React, Node.js, AWS Cloud, Gen AI, dan Capstone Project).\n- **Dicoding Indonesia**: Belajar Fundamental Back-End dengan JavaScript & AWS (90 Jam - Node.js, PostgreSQL, RabbitMQ, Redis, Amazon S3).\n- **Fundamental React**: 50 Jam Belajar arsitektur komponen modular dan single-page application.";
        }

        if (str_contains($q, 'myclassytask') || str_contains($q, 'promanagesys') || str_contains($q, 'sipresens') || str_contains($q, 'sportin') || str_contains($q, 'proyek') || str_contains($q, 'karya')) {
            return "Selain **Finverra**, beberapa proyek unggulan Ridhwan lainnya:\n- **MyClassyTask**: Task manager dengan AI LLM extraction untuk parsing otomatis teks ke deadline & subtugas.\n- **ProManageSys**: Kanban board kolaboratif tim dengan dynamic permissions & optimasi relasi database.\n- **SiPresens**: Presensi karyawan geofencing GPS real-time dengan proteksi anti-mock location.\n- **SportIn**: Booking lapangan olahraga dengan database pessimistic locking untuk mencegah double-booking.";
        }

        if (str_contains($q, 'kontak') || str_contains($q, 'email') || str_contains($q, 'hire') || str_contains($q, 'kerja') || str_contains($q, 'status') || str_contains($q, 'kolaborasi') || str_contains($q, 'rate') || str_contains($q, 'harga')) {
            return "Ridhwan saat ini berstatus **Available for Work** (Terbuka untuk kontrak rekayasa software, proyek backend/fullstack, maupun remote roles).\n- **Email**: `ridhwananang@gmail.com`\n- **Lokasi**: Tangerang Selatan, Indonesia\n- **Rate**: Fleksibel dan kompetitif sesuai ruang lingkup proyek. Silakan klik tombol **Hubungi Saya** pada halaman ini!";
        }

        if (str_contains($q, 'halo') || str_contains($q, 'hai') || str_contains($q, 'pagi') || str_contains($q, 'siang') || str_contains($q, 'sore') || str_contains($q, 'malam')) {
            return "Halo! Saya adalah **Asisten AI Teknis Ridhwan Anang Ma'ruf**. Ada yang bisa saya jelaskan mengenai arsitektur Laravel, proyek Finverra, optimasi database, atau ketersediaan kerja Ridhwan?";
        }

        // Out of scope fallback
        return "Saya adalah asisten virtual khusus yang berfokus pada portofolio dan keahlian rekayasa perangkat lunak **Ridhwan Anang Ma'ruf**. Anda dapat menanyakan tentang arsitektur backend Laravel, integrasi React 19 + TypeScript, proyek seperti Finverra, atau peluang kolaborasi kerja bersama Ridhwan.";
    }

    /**
     * Intercept and parse special tokens (like [CHECK_REPLY:...]) in the response.
     */
    protected function parseSpecialTokens(string $text): string
    {
        if (preg_match('/\[?CHECK_REPLY\s*:\s*([\w\.\-]+@[\w\.\-]+\.\w+)\]?/i', $text, $matches)) {
            $email = trim($matches[1]);
            
            $msg = \App\Models\Message::where('email', $email)->latest()->first();
            
            if (!$msg) {
                return "Maaf, saya tidak menemukan riwayat pesan kontak yang dikirim menggunakan alamat email **{$email}**. Pastikan email yang Anda masukkan sudah benar atau silakan kirim pesan baru melalui formulir kontak.";
            }
            
            if ($msg->replied_at) {
                return "|||reply|||" . $msg->reply_content;
            }
            
            return "Pesan Anda dengan subjek '**{$msg->subject}**' sudah kami terima pada " . $msg->created_at->format('d M Y H:i') . ", namun saat ini Ridhwan belum sempat membalasnya. Mohon tunggu sebentar ya!";
        }
        
        return $text;
    }
}
