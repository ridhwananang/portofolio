import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            # Skip page number on cover page
            return
            
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#475569'))
        
        # Header
        self.drawString(54, 800, "Laporan Analisis & Dokumentasi Sistem Portofolio Ridhwan Anang")
        self.setStrokeColor(colors.HexColor('#e2e8f0'))
        self.setLineWidth(0.5)
        self.line(54, 792, 541, 792)
        
        # Footer
        self.line(54, 50, 541, 50)
        self.drawString(54, 38, "© 2026 Ridhwan Anang Ma'ruf")
        page_text = f"Halaman {self._pageNumber} dari {page_count}"
        self.drawRightString(541, 38, page_text)
        self.restoreState()

def create_pdf(filename="Dokumentasi_Portofolio_Ridhwan_Anang.pdf"):
    # Target path
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54, # 0.75 in
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Colors
    primary = colors.HexColor('#8b5cf6')
    primary_dark = colors.HexColor('#6d28d9')
    primary_light = colors.HexColor('#eff6ff')
    dark = colors.HexColor('#0f172a')
    slate = colors.HexColor('#475569')
    light = colors.HexColor('#f8fafc')
    border = colors.HexColor('#e2e8f0')
    callout_bg = colors.HexColor('#f5f3ff')
    
    # Custom Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=dark,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=slate,
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=dark,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_dark,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=dark,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    code_style = ParagraphStyle(
        'CodeCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#b45309'),
        backColor=light,
        borderColor=border,
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8
    )
    
    story = []
    
    # ==================== PAGE 1: COVER ====================
    story.append(Spacer(1, 40))
    # Border-like colored block at the top
    story.append(Paragraph("<font color='#8b5cf6' size='11'><b>LAPORAN ANALISIS &amp; DOKUMENTASI SISTEM</b></font>", body_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Ridhwan Anang<br/>Portfolio Website", title_style))
    story.append(Paragraph("Pengembangan Website Portofolio Pribadi Premium Berbasis Laravel 13, React 19 (Inertia.js), Filament v3, dan Google Gemini AI.", subtitle_style))
    
    story.append(Spacer(1, 40))
    
    # URL Callout Card Table
    url_data = [
        [Paragraph("<font color='#475569'><b>LINK AKSES WEBSITE ONLINE (PUBLIK)</b></font>", ParagraphStyle('URLTitle', parent=body_style, alignment=1))],
        [Paragraph("<font color='#6d28d9' size='16'><b>https://ridhwananang.id/</b></font>", ParagraphStyle('URLLink', parent=body_style, alignment=1))],
        [Paragraph("<font color='#475569' size='8.5'>Situs web telah di-deploy sepenuhnya dan dapat diakses publik melalui browser desktop maupun mobile. Hubungkan internet untuk mencoba fitur AI Chatbot secara real-time.</font>", ParagraphStyle('URLDesc', parent=body_style, alignment=1))]
    ]
    url_table = Table(url_data, colWidths=[400])
    url_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), callout_bg),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#ddd6fe')),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(url_table)
    
    story.append(Spacer(1, 120))
    
    # Metadata footer
    meta_data = [
        [
            Paragraph("<b>Dibuat Oleh:</b><br/>Ridhwan Anang Ma'ruf", body_style),
            Paragraph("<b>Teknologi Utama:</b><br/>Laravel + React 19 + Gemini AI", ParagraphStyle('MetaRight', parent=body_style, alignment=2))
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 240])
    meta_table.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 0.5, border),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    
    story.append(PageBreak())
    
    # ==================== PAGE 2: PENDAHULUAN & FITUR UTAMA ====================
    story.append(Paragraph("1. Pendahuluan & Ringkasan Fitur", h1_style))
    story.append(Paragraph(
        "Proyek ini merupakan pengembangan website portofolio pribadi premium untuk Ridhwan Anang Ma'ruf yang memadukan ekosistem PHP modern dan JavaScript terkini. "
        "Tujuan utama dari website ini adalah menyajikan profil profesional, karya proyek, sertifikasi, keahlian teknis secara interaktif, "
        "serta menyediakan asisten cerdas berbasis Artificial Intelligence (AI) untuk melayani tanya-jawab pengunjung secara langsung.",
        body_style
    ))
    
    story.append(Paragraph("1.1 Fitur Utama Aplikasi", h2_style))
    
    features = [
        "<b>Interaktif Frontend (React 19 + Tailwind v4)</b>: Antarmuka modern yang cepat dengan efek transisi halus, aura glow melingkar interaktif yang mengikuti kursor mouse (desktop only), tata letak kartu berbasis <i>glassmorphism</i>, dan navigasi dinamis (sticky header) yang menyesuaikan posisi scroll halaman.",
        "<b>Asisten Virtual Cerdas (Google Gemini AI)</b>: Chatbot AI yang tersemat di pojok kanan bawah halaman. Chatbot ini dibekali pemahaman mendalam tentang Ridhwan berdasarkan data yang tersimpan di database. AI dilatih secara khusus untuk menyaring pertanyaan di luar lingkup portofolio.",
        "<b>Pengecekan Balasan Kontak via Chat</b>: Pengunjung dapat menginput email mereka pada chatbot AI untuk memeriksa status pesan kontak yang dikirim sebelumnya. Jika pesan telah dibalas dari panel admin, AI akan secara dinamis memuat isi balasan tersebut di jendela obrolan.",
        "<b>Filament Admin Panel (/secret-admin)</b>: Panel admin terenkripsi yang memungkinkan pemilik website mengelola data profil, memposting karya/proyek baru, mendaftarkan tech stack, mengunggah file sertifikat baru, serta membaca dan membalas pesan kontak secara langsung."
    ]
    for feat in features:
        story.append(Paragraph(f"• {feat}", bullet_style))
        story.append(Spacer(1, 4))
        
    story.append(Spacer(1, 10))
    
    # Callout box
    callout_data = [[
        Paragraph(
            "<b>Catatan Akses Online:</b> Website ini telah dipublikasikan sepenuhnya dan dapat diuji secara online melalui alamat resmi "
            "<font color='#6d28d9'><b>https://ridhwananang.id/</b></font>. Seluruh integrasi API Gemini, database PostgreSQL Supabase, "
            "dan upload media berjalan dengan baik pada server produksi.",
            ParagraphStyle('CalloutTxt', parent=body_style, textColor=colors.HexColor('#1e1b4b'))
        )
    ]]
    callout_table = Table(callout_data, colWidths=[480])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bbf7d0')),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(callout_table)
    
    story.append(PageBreak())
    
    # ==================== PAGE 3: ANALISIS ARSITEKTUR & TECH STACK ====================
    story.append(Paragraph("2. Arsitektur & Spesifikasi Teknologi", h1_style))
    story.append(Paragraph(
        "Sistem ini dibangun dengan arsitektur modern yang memisahkan urusan rendering antarmuka (frontend) dan manipulasi database (backend) namun tetap terintegrasi erat tanpa lag berkat penggunaan Inertia.js.",
        body_style
    ))
    
    story.append(Paragraph("2.1 Spesifikasi Komponen Sistem", h2_style))
    
    # Table data
    table_content = [
        [
            Paragraph("<b>Komponen</b>", ParagraphStyle('Th', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Teknologi / Library</b>", ParagraphStyle('Th', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Peran &amp; Kegunaan</b>", ParagraphStyle('Th', parent=body_style, fontName='Helvetica-Bold'))
        ],
        [
            Paragraph("Backend", body_style),
            Paragraph("Laravel 13.x, PHP 8.4+", body_style),
            Paragraph("Menyediakan routing web & API, memproses data melalui Eloquent ORM, serta integrasi service Gemini AI.", body_style)
        ],
        [
            Paragraph("Frontend", body_style),
            Paragraph("React 19, TypeScript, Vite 8", body_style),
            Paragraph("Rendering halaman SPA (Single Page Application) secara reaktif dengan dukungan type-safe.", body_style)
        ],
        [
            Paragraph("Styling &amp; Motion", body_style),
            Paragraph("TailwindCSS v4.x, Motion", body_style),
            Paragraph("Pewarnaan modern, kustomisasi glassmorphism, dan transisi/animasi mikro yang halus.", body_style)
        ],
        [
            Paragraph("Konektivitas", body_style),
            Paragraph("Inertia.js", body_style),
            Paragraph("Mengirimkan data dari controller Laravel ke component React sebagai props tanpa routing API terpisah.", body_style)
        ],
        [
            Paragraph("Database", body_style),
            Paragraph("PostgreSQL (Supabase)", body_style),
            Paragraph("Penyimpanan persisten data profil, karya/proyek, sertifikat, tech stack, dan pesan kontak.", body_style)
        ],
        [
            Paragraph("Admin Panel", body_style),
            Paragraph("Filament v3 (Livewire)", body_style),
            Paragraph("Panel admin dengan fitur lengkap, cepat, dan mudah disesuaikan untuk manajemen data.", body_style)
        ],
        [
            Paragraph("Kecerdasan Buatan", body_style),
            Paragraph("Google Gemini API", body_style),
            Paragraph("Model <code>gemini-3.5-flash</code> untuk menjalankan inferensi asisten virtual cerdas secara real-time.", body_style)
        ]
    ]
    
    tech_table = Table(table_content, colWidths=[90, 140, 250])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light),
        ('GRID', (0,0), (-1,-1), 0.5, border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(tech_table)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("2.2 Skema Integrasi AI Gemini", h2_style))
    story.append(Paragraph(
        "Inti kecerdasan buatan dalam sistem ini terletak pada <code>GeminiChatService.php</code>. Layanan ini menggabungkan data dinamis dari tabel "
        "<code>profiles</code>, <code>projects</code>, dan <code>tech_stacks</code> secara langsung saat pengunjung mulai menyapa AI. "
        "Prompt sistem (system prompt) dibentuk secara dinamis di server sebelum dikirimkan ke endpoint API Google Generative Language untuk memastikan jawaban AI selalu akurat dengan kondisi portofolio terbaru.",
        body_style
    ))
    
    story.append(PageBreak())
    
    # ==================== PAGE 4: STRUKTUR DATA & ALUR KERJA ====================
    story.append(Paragraph("3. Skema Basis Data & Integrasi Chat", h1_style))
    story.append(Paragraph(
        "Database PostgreSQL menyimpan seluruh konfigurasi data portofolio. Skema tabel dirancang relasional dan efisien untuk melayani kebutuhan admin panel dan API frontend.",
        body_style
    ))
    
    story.append(Paragraph("3.1 Struktur Tabel Database", h2_style))
    
    tables = [
        "<b><code>profiles</code></b>: Menyimpan informasi dasar pemilik web (nama, bio, email, tautan Github/LinkedIn, foto, dan status ketersediaan kerja).",
        "<b><code>projects</code></b>: Menyimpan data karya proyek (judul, deskripsi, teknologi yang digunakan [JSON tags], url demo, url github, dan gambar sampul).",
        "<b><code>tech_stacks</code></b>: Menyimpan koleksi keahlian (nama teknologi, persentase kemahiran, kategori [frontend/backend], deskripsi singkat, dan nama ikon badge).",
        "<b><code>certificates</code></b>: Berisi sertifikat kompetensi (nama sertifikat, nama penerbit, tanggal terbit, berkas PDF/gambar, url kredensial, dan pembuatan thumbnail otomatis berbentuk format webp).",
        "<b><code>messages</code></b>: Menyimpan pesan pengunjung dari form kontak (nama, email, subjek, isi pesan, serta kolom <code>reply_content</code> dan timestamp <code>replied_at</code>)."
    ]
    for tab in tables:
        story.append(Paragraph(f"• {tab}", bullet_style))
        story.append(Spacer(1, 4))
        
    story.append(Paragraph("3.2 Logika Pengecekan Pesan &amp; Balasan via AI", h2_style))
    story.append(Paragraph(
        "Salah satu fitur inovatif adalah integrasi percakapan untuk mengecek status pesan kontak. Alurnya adalah sebagai berikut:",
        body_style
    ))
    
    steps = [
        "Pengunjung menulis email mereka di chat widget (contoh: <i>'Cek status pesan untuk email budi@gmail.com'</i>).",
        "<code>GeminiChatService</code> menangkap pola email menggunakan Regex di backend.",
        "Sistem mencari record pesan terbaru dari tabel <code>messages</code> dengan email tersebut.",
        "Jika pesan ditemukan dan kolom <code>replied_at</code> bernilai NULL, AI merespon bahwa pesan telah diterima namun belum sempat dibalas.",
        "Jika kolom <code>reply_content</code> telah diisi oleh Ridhwan melalui Filament Admin, sistem mengembalikan balasan tersebut secara langsung ke dalam jendela chat pengunjung."
    ]
    for i, step in enumerate(steps):
        story.append(Paragraph(f"<b>{i+1}.</b> {step}", bullet_style))
        story.append(Spacer(1, 3))
        
    story.append(PageBreak())
    
    # ==================== PAGE 5: PANDUAN RUNNING & ADMIN CREDENTIALS ====================
    story.append(Paragraph("4. Panduan Menjalankan Sistem &amp; Login", h1_style))
    story.append(Paragraph(
        "Proyek ini dikembangkan agar mudah dijalankan di lingkungan lokal menggunakan perintah terpadu.",
        body_style
    ))
    
    story.append(Paragraph("4.1 Langkah Instalasi Lokal", h2_style))
    story.append(Paragraph(
        "1. Unduh repositori, masuk ke folder proyek, dan instal dependensi:<br/>"
        "<code>&nbsp;&nbsp;&nbsp;&nbsp;composer install<br/>&nbsp;&nbsp;&nbsp;&nbsp;npm install</code>",
        body_style
    ))
    story.append(Paragraph(
        "2. Salin file konfigrasi lingkungan <code>.env</code> dan generate key:<br/>"
        "<code>&nbsp;&nbsp;&nbsp;&nbsp;copy .env.example .env<br/>&nbsp;&nbsp;&nbsp;&nbsp;php artisan key:generate</code>",
        body_style
    ))
    story.append(Paragraph(
        "3. Konfigurasikan database (PostgreSQL/SQLite) dan isi <code>GEMINI_API_KEY</code> di dalam file <code>.env</code>.",
        body_style
    ))
    story.append(Paragraph(
        "4. Jalankan migrasi database beserta seeder data awal dan hubungkan folder media:<br/>"
        "<code>&nbsp;&nbsp;&nbsp;&nbsp;php artisan migrate --seed<br/>&nbsp;&nbsp;&nbsp;&nbsp;php artisan storage:link</code>",
        body_style
    ))
    
    story.append(Paragraph("4.2 Cara Menjalankan Aplikasi", h2_style))
    story.append(Paragraph(
        "Cukup jalankan satu perintah berikut di terminal Anda untuk menyalakan Laravel server di <code>http://127.0.0.1:8000</code>, Vite compiler untuk HMR React, dan database queue worker secara bersamaan:",
        body_style
    ))
    story.append(Paragraph("<code>composer dev</code>", code_style))
    
    story.append(Paragraph("4.3 Kredensial Default Panel Admin", h2_style))
    story.append(Paragraph(
        "Untuk mengelola data portofolio, silakan login ke panel admin produksi maupun lokal:",
        body_style
    ))
    
    story.append(Paragraph("• <b>URL Login Admin</b>: <font color='#6d28d9'>https://ridhwananang.id/secret-admin</font>", bullet_style))
    story.append(Paragraph("• <b>Email Akun Admin</b>: <code>ridhwananang@gmail.com</code>", bullet_style))
    story.append(Paragraph("• <b>Password Akun Admin</b>: <code>AanVeena123!</code>", bullet_style))
    
    story.append(Spacer(1, 10))
    
    warning_data = [[
        Paragraph(
            "<b>Peringatan Keamanan:</b> Harap segera mengganti password bawaan setelah pertama kali masuk di panel admin produksi guna menjaga keamanan data.",
            ParagraphStyle('WarnTxt', parent=body_style, textColor=colors.HexColor('#78350f'))
        )
    ]]
    warning_table = Table(warning_data, colWidths=[480])
    warning_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fffbeb')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#fef3c7')),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(warning_table)
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == '__main__':
    create_pdf()
    print("PDF successfully generated.")
