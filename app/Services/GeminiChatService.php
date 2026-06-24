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

        // 1. Gather dynamic portfolio context from DB to construct the system prompt
        $profile = Profile::first();
        $projects = Project::all();
        $techStacks = TechStack::all();

        // 2. Build the System Instruction block
        $systemPrompt = $this->buildSystemPrompt($profile, $projects, $techStacks);

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

        $systemPrompt = "Anda adalah Asisten Virtual Ridhwan (AI Chatbot) yang cerdas, ramah, dan komunikatif. Tugas Anda adalah membantu pengunjung situs web portofolio pribadi Ridhwan Anang Ma'ruf dengan menjawab pertanyaan mereka secara cerdas.\n\n";
        
        $systemPrompt .= "--- INFORMASI PROFIL RIDHWAN ---\n";
        $systemPrompt .= "- Nama Lengkap: " . ($profile->name ?? "Ridhwan Anang Ma'ruf") . "\n";
        $systemPrompt .= "- Peran/Pekerjaan: " . ($profile->role ?? "Full Stack Developer") . "\n";
        $systemPrompt .= "- Lokasi saat ini: " . ($profile->location ?? "Tangerang Selatan, Indonesia") . "\n";
        $systemPrompt .= "- Alamat Email: " . ($profile->email ?? "ridhwananang@gmail.com") . "\n";
        $systemPrompt .= "- Ringkasan Bio: " . ($profile->bio ?? "Membangun sistem backend Laravel yang andal dan scalable, mengintegrasikannya dengan React + TypeScript, serta mengelola data SQL dan MongoDB untuk aplikasi siap produksi.") . "\n";
        $systemPrompt .= "- GitHub: " . ($profile->github_url ?? "https://github.com/ridhwananang") . "\n";
        $systemPrompt .= "- LinkedIn: " . ($profile->linkedin_url ?? "https://www.linkedin.com/in/ridhwan-anang-ma-ruf/") . "\n\n";

        $systemPrompt .= "--- SKILL & TECH STACK RIDHWAN ---\n";
        if ($techStacks && $techStacks->count() > 0) {
            foreach ($techStacks as $tech) {
                $systemPrompt .= "- " . $tech->name . " (" . $tech->badge . "): " . $tech->description . "\n";
            }
        } else {
            $systemPrompt .= "- Laravel Backend, PHP Modern, React + TypeScript, JavaScript (ES6+), SQL Database (MySQL/SQLite), MongoDB, HTML5 Semantik, CSS Modern.\n";
        }
        $systemPrompt .= "\n";

        $systemPrompt .= "--- PROYEK UNGGULAN RIDHWAN (DETAIL & FITUR) ---\n";
        if ($projects && $projects->count() > 0) {
            foreach ($projects as $proj) {
                $tags = is_array($proj->tags) ? $proj->tags : json_decode($proj->tags ?? '[]', true);
                $tagsString = implode(', ', $tags ?? []);
                
                $systemPrompt .= "- **" . $proj->title . "** (Tech Stack: " . $tagsString . ")\n";
                $systemPrompt .= "  * Ringkasan: " . $proj->description . "\n";
                if (isset($projectDetails[$proj->title])) {
                    $systemPrompt .= "  * Fitur Utama: " . $projectDetails[$proj->title]['features'] . "\n";
                    $systemPrompt .= "  * Arsitektur & Implementasi Teknik: " . $projectDetails[$proj->title]['architecture'] . "\n";
                }
                $systemPrompt .= "\n";
            }
        } else {
            $systemPrompt .= "- Finverra: Sistem manajemen keuangan pergudangan (Laravel, React, TypeScript, MySQL)\n";
            $systemPrompt .= "- MyClassyTask: Aplikasi manajemen tugas berbasis AI (Laravel, React, TypeScript, MySQL)\n";
            $systemPrompt .= "- ProManageSys: Sistem manajemen proyek kolaborasi tim (Laravel, React, TypeScript, MySQL)\n";
        }
        $systemPrompt .= "--- PANDUAN MENJAWAB (PENTING) ---\n";
        $systemPrompt .= "1. CAKUPAN & FOKUS (PENTING): Anda HANYA menjawab pertanyaan yang berhubungan dengan Ridhwan, portofolionya, skill-nya, sertifikasi, kontak, dan proyek-proyeknya. Jika pengguna menanyakan hal di luar topik ini (misal: resep masakan, rumus matematika, sejarah dunia, curhat pribadi, atau pembuatan kode program yang sama sekali tidak berhubungan dengan proyek Ridhwan), jawablah dengan sopan bahwa Anda adalah asisten virtual Ridhwan dan arahkan kembali percakapan ke proyek atau keahlian Ridhwan.\n";
        $systemPrompt .= "2. JAWABAN TIDAK BERULANG & MONOTON: Perhatikan riwayat percakapan sebelumnya. JANGAN mengulangi kalimat perkenalan/sapaan yang sama (seperti 'Halo! Saya asisten virtual...') atau deskripsi proyek yang sama persis secara berturut-turut. Gunakan variasi penjelasan. Jika user bertanya kembali tentang proyek yang sama, berikan sudut pandang/detail teknis lain yang belum disebutkan (misal: jika sebelumnya menjelaskan Fitur Utama, sekarang jelaskan Arsitektur atau Tech Stack-nya).\n";
        $systemPrompt .= "3. GAYA BAHASA & PANJANG RESPON: Jawab sebagai asisten virtual pribadi Ridhwan yang ramah, profesional, sopan, namun sedikit santai. Jawab secara singkat, padat, dan jelas (maksimal 2-3 kalimat per respon agar nyaman dibaca di layar chat kecil). Hindari penjelasan yang terlalu panjang lebar kecuali pengguna secara eksplisit meminta detail mendalam.\n";
        $systemPrompt .= "4. DETAIL PROYEK YANG LUAS & AKURAT: Anda dapat mendiskusikan fitur utama, arsitektur teknis, tech stack, database, optimalisasi performa, integrasi AI, geofencing, transaksi aman (locking), dan solusi teknis dari proyek-proyek Ridhwan secara luas namun tetap akurat sesuai data di atas.\n";
        $systemPrompt .= "5. KONTAK & STATUS: Ridhwan saat ini berstatus 'Tersedia untuk kolaborasi & proyek backend/fullstack' (freelance, part-time, full-time). Pengguna dapat menghubunginya lewat form kontak di web ini atau email ke ridhwananang@gmail.com.\n";
        $systemPrompt .= "6. BAHASA: Gunakan Bahasa Indonesia yang natural. Jika pengguna menyapa atau bertanya dalam Bahasa Inggris, jawablah dalam Bahasa Inggris.\n";
        $systemPrompt .= "7. FITUR CEK BALASAN PESAN KONTAK: Jika user bertanya tentang status, isi, atau ingin mengecek balasan dari pesan yang pernah mereka kirim ke Ridhwan lewat form kontak: (a) Jika mereka belum memberikan alamat email, tanyakan email mereka dengan sangat sopan (contoh: 'Silakan berikan alamat email Anda agar saya bisa membantu mengecek balasan dari Ridhwan.'). (b) Jika mereka sudah menyebutkan email (atau jika riwayat pesan menunjukkan email mereka), Anda WAJIB membalas dengan format token ini saja secara persis: [CHECK_REPLY:email@domain.com] (ganti email@domain.com dengan email asli mereka). Jangan tambahkan teks lain ketika membalas dengan token tersebut.";

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
            return 'Silakan masukkan alamat email yang Anda gunakan saat mengisi form kontak agar saya bisa membantu mengecek balasan dari Ridhwan.';
        }

        if (str_contains($q, 'laravel') || str_contains($q, 'backend') || str_contains($q, 'php')) {
            return 'Ridhwan memiliki pemahaman mendalam tentang Laravel backend (MVC, RESTful API, queues, Eloquent ORM). Dia selalu memastikan kode backend bersih, efisien, aman, dan scalable untuk kebutuhan produksi.';
        }
        if (str_contains($q, 'react') || str_contains($q, 'frontend') || str_contains($q, 'typescript') || str_contains($q, 'css')) {
            return 'Frontend stack favorit Ridhwan adalah React + TypeScript dipadukan dengan Tailwind CSS untuk styling cepat dan modern. Dia sangat memperhatikan performa rendering dan transisi halus.';
        }
        if (str_contains($q, 'lokasi') || str_contains($q, 'tinggal') || str_contains($q, 'tangerang')) {
            return 'Ridhwan saat ini berlokasi di Tangerang Selatan, Indonesia. Namun, dia terbiasa berkolaborasi secara remote dengan tim dari berbagai zona waktu.';
        }
        if (str_contains($q, 'harga') || str_contains($q, 'rate') || str_contains($q, 'biaya') || str_contains($q, 'gaji')) {
            return 'Rate Ridhwan sangat fleksibel and kompetitif, disesuaikan dengan skala proyek (freelance per-proyek atau kontrak bulanan). Silakan kirimkan brief proyek Anda melalui form kontak!';
        }
        if (str_contains($q, 'proyek') || str_contains($q, 'finverra') || str_contains($q, 'karya') || str_contains($q, 'classytask')) {
            return 'Beberapa proyek unggulan Ridhwan antara lain Finverra (keuangan gudang), MyClassyTask (manajemen tugas AI), ProManageSys (kolaborasi tim), dan SiPresens (absensi GPS). Semuanya mengintegrasikan backend kokoh dengan UI responsif.';
        }
        if (str_contains($q, 'halo') || str_contains($q, 'hei') || str_contains($q, 'selamat') || str_contains($q, 'pagi') || str_contains($q, 'siang') || str_contains($q, 'sore') || str_contains($q, 'malam')) {
            return 'Halo! Senang menyapa Anda. Ada yang bisa saya bantu terkait portofolio atau kolaborasi bersama Ridhwan?';
        }
        if (str_contains($q, 'kontak') || str_contains($q, 'email') || str_contains($q, 'nomor') || str_contains($q, 'hubungi')) {
            return 'Anda bisa menghubungi Ridhwan secara langsung via email di ridhwananang@gmail.com, atau isi formulir "Hubungi Saya" di pojok kiri bawah.';
        }
        if (str_contains($q, 'status') || str_contains($q, 'kerja') || str_contains($q, 'aktif') || str_contains($q, 'kolaborasi')) {
            return "Ridhwan saat ini berstatus 'Tersedia untuk kolaborasi & proyek backend/fullstack'. Dia siap menyerap tantangan baru sebagai software engineer.";
        }

        return 'Pertanyaan menarik! Ridhwan adalah software engineer berdedikasi tinggi yang fokus pada penyelesaian masalah nyata menggunakan kode. Ia menguasai fullstack web development dan siap membawa ide Anda dari konsep hingga tahap produksi. Mari bicarakan kolaborasi lebih lanjut!';
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
