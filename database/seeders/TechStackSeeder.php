<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TechStack;

class TechStackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $techs = [
            [
                'name' => 'Laravel Backend',
                'description' => 'Arsitektur MVC, REST API, authentication, authorization, queue, job, dan clean code berbasis best practice.',
                'badge' => 'Framework',
                'color' => 'from-rose-500/10 to-red-500/10 dark:from-rose-950/20 dark:to-red-950/20',
                'text_color' => 'text-rose-600 dark:text-rose-400',
                'accent' => 'bg-rose-500',
                'icon_name' => 'SiLaravel',
            ],
            [
                'name' => 'PHP Modern',
                'description' => 'Pemanfaatan fitur PHP terbaru untuk performa, maintainability, dan keamanan aplikasi.',
                'badge' => 'Language',
                'color' => 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-950/20 dark:to-blue-950/20',
                'text_color' => 'text-indigo-600 dark:text-indigo-400',
                'accent' => 'bg-indigo-500',
                'icon_name' => 'SiPhp',
            ],
            [
                'name' => 'React + TypeScript',
                'description' => 'Frontend berbasis komponen dengan type safety, state management, dan integrasi API yang solid.',
                'badge' => 'Library',
                'color' => 'from-sky-500/10 to-blue-500/10 dark:from-sky-950/20 dark:to-blue-950/20',
                'text_color' => 'text-sky-600 dark:text-sky-400',
                'accent' => 'bg-sky-550',
                'icon_name' => 'SiReact',
            ],
            [
                'name' => 'JavaScript (ES6+)',
                'description' => 'Logika antarmuka, validasi client-side, dan komunikasi data asinkron.',
                'badge' => 'Language',
                'color' => 'from-amber-500/10 to-yellow-500/10 dark:from-amber-950/20 dark:to-yellow-950/20',
                'text_color' => 'text-amber-600 dark:text-amber-400',
                'accent' => 'bg-amber-500',
                'icon_name' => 'SiJavascript',
            ],
            [
                'name' => 'SQL Database',
                'description' => 'Perancangan skema relasional, query efisien, indexing, dan optimasi performa data.',
                'badge' => 'Database',
                'color' => 'from-blue-500/10 to-teal-500/10 dark:from-blue-950/20 dark:to-teal-950/20',
                'text_color' => 'text-blue-600 dark:text-blue-400',
                'accent' => 'bg-blue-500',
                'icon_name' => 'SiMysql',
            ],
            [
                'name' => 'MongoDB',
                'description' => 'Database NoSQL untuk data fleksibel, logging, analytics, dan kebutuhan skala besar.',
                'badge' => 'Database',
                'color' => 'from-emerald-500/10 to-green-500/10 dark:from-emerald-950/20 dark:to-green-950/20',
                'text_color' => 'text-emerald-600 dark:text-emerald-400',
                'accent' => 'bg-emerald-550',
                'icon_name' => 'SiMongodb',
            ],
            [
                'name' => 'HTML5 Semantik',
                'description' => 'Struktur markup rapi dan aksesibel sebagai fondasi frontend yang sehat.',
                'badge' => 'Foundational',
                'color' => 'from-orange-500/10 to-red-500/10 dark:from-orange-950/20 dark:to-red-950/20',
                'text_color' => 'text-orange-600 dark:text-orange-400',
                'accent' => 'bg-orange-550',
                'icon_name' => 'SiHtml5',
            ],
            [
                'name' => 'CSS Modern',
                'description' => 'Flexbox dan utility modern untuk mendukung UI tanpa mengorbankan performa.',
                'badge' => 'Foundational',
                'color' => 'from-blue-500/10 to-indigo-500/10 dark:from-blue-950/20 dark:to-indigo-950/20',
                'text_color' => 'text-blue-500 dark:text-blue-450',
                'accent' => 'bg-blue-600',
                'icon_name' => 'SiCss',
            ],
        ];

        foreach ($techs as $tech) {
            TechStack::create($tech);
        }
    }
}
