<x-mail::message>
# Halo, {{ $project->client }} 👋

Terima kasih atas kepercayaan Anda bermitra dengan **Ridhwan Studio**. 

Untuk menjaga kenyamanan dan transparansi pengerjaan proyek digital Anda, kami telah menyiapkan **Portal Pantau Proyek Rahasia (*Live Project Vault*)**. Melalui portal ini, Anda dapat memantau siklus sprint, rincian tugas tim, checklist deliverable, laporan progres berkala, hingga timeline jadwal peluncuran secara *real-time*.

<x-mail::panel>
### 📌 Ringkasan Proyek:
- **Nama Proyek:** {{ $project->name }} ({{ $project->code }})
- **Status Saat Ini:** {{ strtoupper(str_replace('_', ' ', $project->status)) }}
- **Target Deadline:** {{ $project->end_date ? \Carbon\Carbon::parse($project->end_date)->translatedFormat('d F Y') : 'Fleksibel' }}
- **Lead / Creator:** {{ $project->creator?->name ?? 'Ridhwan Studio Team' }}
</x-mail::panel>

<x-mail::button :url="$portalUrl" color="primary">
🚀 Buka Portal Pantau Proyek
</x-mail::button>

Jika tombol di atas tidak dapat diklik, Anda dapat menyalin dan membuka tautan berikut di peramban Anda:  
[{{ $portalUrl }}]({{ $portalUrl }})

---

> **Catatan Kerahasiaan (NDA & Privacy):**  
> Seluruh informasi teknis, aset desain, dan kode di dalam portal ini bersifat rahasia antara Anda dan Ridhwan Studio.

Salam hormat,<br>
**Ridhwan Anang Ma'ruf**  
*Lead Architect & Founder - Ridhwan Studio*  
[{{ config('app.url') }}]({{ config('app.url') }})
</x-mail::message>
