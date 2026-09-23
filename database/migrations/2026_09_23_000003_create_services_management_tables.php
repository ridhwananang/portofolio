<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('base_price', 15, 2);
            $table->string('timeline')->default('1-2 minggu');
            $table->string('icon', 64)->default('Globe');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->integer('sort_order')->default(0);
            $table->json('features_included')->nullable();
            $table->timestamps();
        });

        Schema::create('service_addons', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('icon', 64)->default('Sparkles');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('service_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique()->index();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed initial default packages
        DB::table('service_packages')->insert([
            [
                'slug' => 'landing_page',
                'title' => 'Landing Page Modern',
                'description' => 'Single-page responsif, visual interaktif, copywriting terstruktur, dan konversi tinggi.',
                'base_price' => 150000.00,
                'timeline' => '5-7 hari',
                'icon' => 'Globe',
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'company_profile',
                'title' => 'Company Profile',
                'description' => 'Website profil perusahaan multi-halaman yang elegan, profesional, dan SEO-ready.',
                'base_price' => 250000.00,
                'timeline' => '1-2 minggu',
                'icon' => 'Layers',
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'fullstack_app',
                'title' => 'Full-Stack Web App',
                'description' => 'Aplikasi web kompleks dengan Laravel + React/Inertia, database, dan arsitektur modular.',
                'base_price' => 500000.00,
                'timeline' => '2-4 minggu',
                'icon' => 'Zap',
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'ecommerce',
                'title' => 'E-Commerce / Toko Online',
                'description' => 'Katalog produk, keranjang belanja, checkout otomatis, dan manajemen pesanan.',
                'base_price' => 400000.00,
                'timeline' => '2-3 minggu',
                'icon' => 'Rocket',
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed initial default add-ons
        DB::table('service_addons')->insert([
            [
                'slug' => 'ai_gemini',
                'name' => 'Integrasi Google Gemini AI',
                'description' => 'Chatbot asisten pintar yang memahami data bisnis Anda.',
                'price' => 75000.00,
                'icon' => 'Sparkles',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'payment_gateway',
                'name' => 'Payment Gateway Otomatis (QRIS, VA, E-Wallet)',
                'description' => 'Menerima pembayaran otomatis via QRIS, VA, dan E-Wallet.',
                'price' => 50000.00,
                'icon' => 'CreditCard',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'admin_cms',
                'name' => 'Dashboard Admin Panel (Filament)',
                'description' => 'Kemudahan mengelola konten, artikel, dan data secara mandiri.',
                'price' => 50000.00,
                'icon' => 'Layers',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'auth_security',
                'name' => 'Multi-Role Auth & 2FA',
                'description' => 'Sistem login aman dengan hak akses peran dan otentikasi ganda.',
                'price' => 40000.00,
                'icon' => 'Lock',
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'seo_speed',
                'name' => 'Optimasi SEO & Kecepatan Turbo',
                'description' => 'Skor audit Lighthouse tinggi, metadata OpenGraph, dan sitemap dinamis.',
                'price' => 35000.00,
                'icon' => 'Zap',
                'is_active' => true,
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed initial default settings
        DB::table('service_settings')->insert([
            ['key' => 'express_multiplier', 'value' => '1.20', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'consultation_phone', 'value' => '6281284567890', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'guarantee_badge_text', 'value' => '100% Garansi Rekening Bersama (Escrow)', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_settings');
        Schema::dropIfExists('service_addons');
        Schema::dropIfExists('service_packages');
    }
};
