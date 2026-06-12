<x-mail::message>
# Halo {{ $originalName }},

Terima kasih telah mengirimkan pesan melalui formulir kontak di website portofolio saya. Berikut adalah balasan terkait pertanyaan atau pesan Anda:

<x-mail::panel>
{{ $replyContent }}
</x-mail::panel>

<x-mail::button :url="config('app.url')">
Kunjungi Portofolio Saya
</x-mail::button>

---
**Pesan Asli Anda:**
*Subjek: {{ $originalSubject }}*

> {{ $originalMessage }}

Salam hangat,<br>
**Ridhwan Anang Ma'ruf**  
*Fullstack Web Developer*  
[{{ config('app.url') }}]({{ config('app.url') }})
</x-mail::message>
