# Portofolio Ridhwan Anang Ma'ruf 🚀

🌐 **Link Akses Online**: [https://ridhwananang.id/](https://ridhwananang.id/)

Website portofolio pribadi premium yang dibangun menggunakan ekosistem modern **Laravel 13** dan **React 19** (melalui **Inertia.js**), ditenagai oleh **Google Gemini AI** untuk fitur asisten interaktif, serta dilengkapi **Filament Admin Panel** untuk manajemen konten secara dinamis.

---

## 🌟 Fitur Utama

### 1. Frontend Modern & Interaktif (React 19 + TailwindCSS v4)
*   **Aura Glow Mengikuti Kursor**: Efek pencahayaan ambient radial gradient yang mengikuti pergerakan kursor mouse secara halus (desktop only).
*   **Desain Glassmorphism**: Panel-panel semi-transparan dengan efek blur backdrop (`backdrop-filter`) yang memberikan kesan modern dan premium.
*   **Navigasi Dinamis (Sticky Header)**: Memantau scroll halaman untuk menyoroti menu aktif secara otomatis.
*   **Dukungan Dark Mode**: Transisi warna yang halus antara tema terang (slate/violet) dan tema gelap (slate/indigo).
*   **Staggered Entrance Animations**: Animasi pemuatan elemen bertingkat menggunakan **Motion (Framer Motion v12)**.

### 2. Integrasi Asisten Virtual (Google Gemini AI)
*   **Widget AI Chatbot**: Obrolan interaktif di pojok kanan bawah yang mengerti seluruh informasi portofolio Ridhwan (Bio, Proyek, Sertifikasi, Skill, dan Kontak).
*   **Konteks Dinamis dari Database**: Informasi profil, proyek, dan keahlian dibaca secara langsung dari database PostgreSQL untuk dijadikan instruksi sistem (system prompt) bagi model `gemini-3.5-flash`.
*   **Filter Topik (Out-of-Scope Interceptor)**: Secara cerdas menolak pertanyaan di luar topik portofolio Ridhwan (misal: resep masakan, pemrograman acak, curhat) untuk menjaga relevansi.
*   **Cek Status Pesan Kontak**: Pengunjung dapat memasukkan email mereka dalam chat untuk memeriksa apakah pesan kontak mereka sudah dibaca/dibalas oleh Ridhwan. Jika sudah, AI akan langsung menampilkan isi balasan dari database.

### 3. Panel Admin Khusus (Filament v3)
*   Menggunakan panel khusus di `/secret-admin` untuk meminimalkan risiko eksploitasi URL `/admin` standar.
*   Dashboard administrasi interaktif dengan performa optimal (font Outfit, tema violet & slate).
*   **Manajemen Konten Lengkap**:
    *   **Profiles**: Mengedit bio, nama, peran, kontak, lokasi, tautan GitHub/LinkedIn, dan riwayat pendidikan.
    *   **Projects**: Menambah/mengedit proyek, tag teknologi, gambar, serta tautan kode sumber dan demo live.
    *   **Tech Stacks**: Mengelola kategori keahlian, ikon badge, deskripsi tingkat keahlian.
    *   **Certificates**: Unggah dokumen sertifikat, pembuatan thumbnail otomatis (`.webp`), dan pengelolaan tautan kredensial.
    *   **Messages**: Membaca pesan masuk dari formulir kontak, melihat detail pengirim, serta membalas pesan secara langsung dari admin panel.

---

## 🛠️ Tech Stack

### Backend & Database
*   **Framework**: Laravel 13.x (PHP 8.3+)
*   **Admin Panel**: Filament v3 (Livewire)
*   **Authentication & Security**: Laravel Fortify, Laravel Sanctum, Passkeys, Two-Factor Authentication (2FA)
*   **Database**: PostgreSQL (Supabase Connection Pooler) / SQLite (Local fallback)
*   **AI Integration**: Google Gemini API via `gemini-3.5-flash`

### Frontend & Build Tools
*   **Runtime/Library**: React 19 & React DOM 19
*   **Bypass & Routing**: Inertia.js (React SPA Adapter)
*   **CSS Framework**: TailwindCSS v4.x (menggunakan `@tailwindcss/vite` compiler baru yang sangat cepat)
*   **Animations**: Motion (Framer Motion v12) & tw-animate-css
*   **Icons**: Lucide React & React Icons
*   **Bundler**: Vite 8.x

---

## 📂 Struktur Folder Penting

*   [`app/Http/Controllers/Api/`](file:///c:/Users/An/Herd/portofolio/app/Http/Controllers/Api) - Controller API untuk melayani data profil, proyek, sertifikat, form kontak, dan chat.
*   [`app/Services/GeminiChatService.php`](file:///c:/Users/An/Herd/portofolio/app/Services/GeminiChatService.php) - Inti logika integrasi Gemini API, pembentukan prompt sistem dinamis, filter topik, serta logika token `[CHECK_REPLY:email]`.
*   [`app/Filament/Resources/`](file:///c:/Users/An/Herd/portofolio/app/Filament/Resources) - Kelas-kelas resource Filament untuk antarmuka admin.
*   [`resources/js/pages/welcome.tsx`](file:///c:/Users/An/Herd/portofolio/resources/js/pages/welcome.tsx) - Halaman utama portofolio (landing page) berbasis React.
*   [`resources/js/components/`](file:///c:/Users/An/Herd/portofolio/resources/js/components) - Komponen-komponen UI React seperti `AIChatWidget`, `ProfileCard`, `Projects`, `TechStack`, `Certificates`, dan `ContactModal`.
*   [`resources/css/app.css`](file:///c:/Users/An/Herd/portofolio/resources/css/app.css) - Styling TailwindCSS v4, kustomisasi animasi glow/float, scrollbar modern, dan kelas glassmorphic.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
Pastikan Anda sudah menginstal alat-alat berikut di komputer Anda:
*   PHP >= 8.3
*   Composer
*   Node.js >= 20.x & npm
*   Database (PostgreSQL atau SQLite lokal)

### Langkah-Langkah

1.  **Clone Repository & Masuk ke Folder Proyek**
    ```bash
    git clone https://github.com/ridhwananang/portofolio.git
    cd portofolio
    ```

2.  **Instal Dependensi PHP (Composer)**
    ```bash
    composer install
    ```

3.  **Instal Dependensi Node.js (npm)**
    ```bash
    npm install
    ```

4.  **Konfigurasi Environment (`.env`)**
    Salin file `.env.example` menjadi `.env`:
    ```bash
    copy .env.example .env
    ```
    Buka file `.env` dan sesuaikan variabel berikut:
    *   **Koneksi Database** (Sesuaikan dengan DB lokal Anda atau Supabase):
        ```env
        DB_CONNECTION=sqlite  # atau pgsql
        # Jika menggunakan pgsql:
        # DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
        # DB_PORT=5432
        # DB_DATABASE=postgres
        # DB_USERNAME=username_anda
        # DB_PASSWORD=password_anda
        ```
    *   **Kunci API Gemini**:
        Dapatkan API Key gratis di Google AI Studio, lalu masukkan ke `.env`:
        ```env
        GEMINI_API_KEY=isi_dengan_api_key_gemini_anda
        GEMINI_MODEL=gemini-3.5-flash
        ```

5.  **Generate Application Key**
    ```bash
    php artisan key:generate
    ```

6.  **Jalankan Migrasi & Database Seeder**
    Perintah ini akan membuat semua tabel database yang diperlukan dan mengisi data awal (Profile, Projects, Tech Stacks, Certificates, dan akun Admin Default):
    ```bash
    php artisan migrate --seed
    ```

7.  **Hubungkan Folder Storage**
    Agar berkas yang diunggah lewat Filament (sertifikat, foto profil, dll.) dapat diakses secara publik:
    ```bash
    php artisan storage:link
    ```

---

## 🏃 Cara Menjalankan Aplikasi

Aplikasi ini menggunakan dependensi `concurrently` di tingkat PHP Composer untuk menjalankan server lokal PHP, queue listener, dan compiler Vite secara bersamaan dalam satu baris perintah.

Jalankan perintah berikut di terminal Anda:
```bash
composer dev
```

Ini akan mengaktifkan:
*   **Web Server (PHP artisan serve)** di `http://127.0.0.1:8000`
*   **Vite Dev Server** untuk HMR (Hot Module Replacement) aset React & CSS
*   **Queue Listener** untuk memproses antrean pesan atau tugas latar belakang

Buka peramban (browser) Anda dan kunjungi `http://127.0.0.1:8000`.

---

## 🔑 Akses Panel Admin

Untuk memperbarui data portofolio (mengganti bio, menambah proyek baru, mengunggah sertifikat baru, atau membalas pesan kontak):

*   **URL**: `http://127.0.0.1:8000/secret-admin`
*   **Akun Default (dari Seeder)**:
    *   **Email**: `ridhwananang@gmail.com`
    *   **Password**: `AanVeena123!`

> [!WARNING]  
> Harap segera ganti password default di panel admin `/secret-admin` pada menu profil setelah pertama kali masuk untuk menjaga keamanan aplikasi portofolio Anda.
