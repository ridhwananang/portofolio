<x-mail::message>
# Laporan Kemajuan Proyek: {{ $project->name }} 📊

Halo, **{{ $project->client }}**,

Berikut adalah laporan kemajuan (*executive progress update*) terkini untuk pengerjaan proyek **{{ $project->name }} ({{ $project->code }})**.

<x-mail::panel>
### 📈 Indikator Kemajuan:
- **Progres Keseluruhan:** **{{ $project->progress_percentage }}% Selesai**
- **Status Proyek:** {{ strtoupper(str_replace('_', ' ', $project->status)) }}
- **Total Tiket Tugas:** {{ $summaryData['total_tasks'] ?? 0 }} Tiket
- **Tugas Rampung (Done):** {{ $summaryData['done_tasks'] ?? 0 }} Tiket
- **Checklist Subtask Lolos:** {{ $summaryData['done_subtasks'] ?? 0 }} dari {{ $summaryData['total_subtasks'] ?? 0 }} Subtask
- **Siklus Sprint Aktif:** {{ $summaryData['active_sprint'] ?? 'Semua Sprint Terencana' }}
</x-mail::panel>

@if(!empty($summaryData['recent_achievements']))
### ✨ Pencapaian & Fitur Selesai Terbaru:
@foreach($summaryData['recent_achievements'] as $item)
- ✅ **{{ $item }}**
@endforeach
@endif

<x-mail::button :url="$portalUrl" color="primary">
🔍 Lihat Rincian & Timeline Interaktif
</x-mail::button>

Anda dapat mengakses **Portal Pantau Proyek Rahasia** kapan saja untuk melihat timeline visual gantt chart dan rincian deliverable teknis.

Salam hangat,<br>
**Ridhwan Anang Ma'ruf**  
*Lead Architect - Ridhwan Studio*  
[{{ config('app.url') }}]({{ config('app.url') }})
</x-mail::message>
