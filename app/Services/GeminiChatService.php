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
            return $this->getFallbackResponse($lastMessageText);
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
                    return trim($text);
                }
            }
            
            Log::error('Gemini API Response Error (' . $response->status() . '): ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Gemini Connection Exception: ' . $e->getMessage());
        }

        // Fallback in case of API errors
        $lastMessageText = end($contents)['parts'][0]['text'] ?? 'Halo';
        return $this->getFallbackResponse($lastMessageText);
    }

    /**
     * Build the dynamic system prompt based on portfolio data.
     */
    private function buildSystemPrompt($profile, $projects, $techStacks): string
    {
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

        $systemPrompt .= "--- PROYEK UNGGULAN RIDHWAN ---\n";
        if ($projects && $projects->count() > 0) {
            foreach ($projects as $proj) {
                $tags = is_array($proj->tags) ? $proj->tags : json_decode($proj->tags ?? '[]', true);
                $tagsString = implode(', ', $tags ?? []);
                $systemPrompt .= "- " . $proj->title . ": " . $proj->description . " (Tech: " . $tagsString . ")\n";
            }
        } else {
            $systemPrompt .= "- Finverra: Sistem manajemen keuangan pergudangan (Laravel, React, TypeScript, MySQL)\n";
            $systemPrompt .= "- MyClassyTask: Aplikasi manajemen tugas berbasis AI (Laravel, React, TypeScript, MySQL)\n";
            $systemPrompt .= "- ProManageSys: Sistem manajemen proyek kolaborasi tim (Laravel, React, TypeScript, MySQL)\n";
        }
        $systemPrompt .= "\n";

        $systemPrompt .= "--- PANDUAN MENJAWAB (PENTING) ---\n";
        $systemPrompt .= "1. Jawab sebagai asisten virtual pribadi Ridhwan. Gunakan gaya bahasa yang sopan, ramah, profesional, dan sedikit santai.\n";
        $systemPrompt .= "2. Jawablah secara singkat, padat, dan jelas (maksimal 2-3 kalimat per respon agar nyaman dibaca di layar chat kecil). Hindari penjelasan yang terlalu panjang lebar berparagraf-paragraf kecuali diminta detail.\n";
        $systemPrompt .= "3. Status kerja: Ridhwan saat ini tersedia untuk kolaborasi, proyek backend/fullstack, baik kontrak, part-time, maupun freelance.\n";
        $systemPrompt .= "4. Kontak: Pengguna bisa mengisi form kontak di situs ini, atau mengirim email langsung ke ridhwananang@gmail.com.\n";
        $systemPrompt .= "5. Gunakan format Markdown standar jika diperlukan (seperti cetak tebal untuk kata kunci penting atau bullet points sederhana).\n";
        $systemPrompt .= "6. Jawablah dalam Bahasa Indonesia yang baik dan alami. Namun, jika pengguna menyapa atau bertanya dalam Bahasa Inggris, balaslah menggunakan Bahasa Inggris.";

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
            
            // Filter consecutive identical roles
            if ($role === $lastRole) {
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
            return 'Rate Ridhwan sangat fleksibel dan kompetitif, disesuaikan dengan skala proyek (freelance per-proyek atau kontrak bulanan). Silakan kirimkan brief proyek Anda melalui form kontak!';
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
}
