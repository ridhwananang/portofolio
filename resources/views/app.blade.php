<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/images/anang-logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>Ridhwan Anang Ma'ruf</title>
            <link rel="canonical" href="https://ridhwananang.id/">
            <meta name="description" content="Portfolio resmi Ridhwan Anang Ma'ruf, Fullstack Developer spesialis Laravel & React. Membangun aplikasi web skala produksi yang andal.">
            <meta name="keywords" content="Ridhwan Anang Ma'ruf, Ridhwan Anang, Portfolio, Fullstack Web Developer, Laravel Developer, React Developer, Indonesia, Tangerang Selatan">
            <meta name="author" content="Ridhwan Anang Ma'ruf">

            <!-- Open Graph (Standar Industri untuk Instagram, WhatsApp, LinkedIn, dll.) -->
            <meta property="og:type" content="website">
            <meta property="og:url" content="{{ url()->current() }}">
            <meta property="og:title" content="Ridhwan Anang Ma'ruf - Fullstack Web Developer (Laravel & React)">
            <meta property="og:description" content="Portfolio resmi Ridhwan Anang Ma'ruf. Menampilkan proyek-proyek unggulan, keahlian teknis (Laravel, React, TypeScript, SQL), dan sertifikasi.">
            <meta property="og:image" content="{{ asset('images/anang-logo.png') }}">

            <!-- JSON-LD Structured Data for Person (SEO) -->
            <script type="application/ld+json">
            {
              "@@context": "https://schema.org",
              "@@type": "Person",
              "name": "Ridhwan Anang Ma'ruf",
              "url": "{{ url('/') }}",
              "image": "{{ asset('images/me.webp') }}",
              "sameAs": [
                "https://github.com/ridhwananang",
                "https://www.linkedin.com/in/ridhwan-anang-ma-ruf/",
                "https://www.instagram.com/ridhwan.anang_/"
              ],
              "jobTitle": "Fullstack Web Developer",
              "worksFor": {
                "@@type": "Organization",
                "name": "Freelance"
              },
              "address": {
                "@@type": "PostalAddress",
                "addressLocality": "Tangerang Selatan",
                "addressRegion": "Banten",
                "addressCountry": "ID"
              },
              "description": "Fullstack Web Developer yang berdedikasi membangun sistem backend Laravel yang andal dan antarmuka React + TypeScript yang interaktif."
            }
            </script>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
