import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_portfolio_pmp_document(output_path):
    doc = docx.Document()

    # Page Margins: 0.75 in (7.0 in printable width)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Color Palette: Corporate Navy & Violet (matching portfolio aesthetic)
    COLOR_PRIMARY_HEX = "0F172A"     # Slate 900 (Deep Dark)
    COLOR_SECONDARY_HEX = "6366F1"   # Indigo 500 (Portfolio Accent)
    COLOR_DARK_TEXT_HEX = "1E293B"   # Slate 800 Dark Text
    COLOR_MUTED_HEX = "64748B"       # Slate 500 Muted Text
    COLOR_LIGHT_BG_HEX = "F8FAFC"    # Slate 50 Light Gray
    COLOR_BORDER_HEX = "CBD5E1"      # Slate 300 Clean Border
    COLOR_ACCENT_HEX = "D97706"      # Amber 600
    COLOR_CAT_BG_HEX = "E2E8F0"      # Slate 200 Header

    COLOR_PRIMARY = RGBColor(15, 23, 42)
    COLOR_SECONDARY = RGBColor(99, 102, 241)
    COLOR_DARK_TEXT = RGBColor(30, 41, 59)
    COLOR_MUTED = RGBColor(100, 116, 139)

    # Configure Normal Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10)
    style_normal.font.color.rgb = COLOR_DARK_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(4)

    # XML Helper Functions
    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=45, bottom=45, left=65, right=65):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                          f'<w:top w:w="{top}" w:type="dxa"/>'
                          f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                          f'<w:left w:w="{left}" w:type="dxa"/>'
                          f'<w:right w:w="{right}" w:type="dxa"/>'
                          f'</w:tcMar>')
        tcPr.append(tcMar)

    def set_row_properties(row, height_dxa=250):
        trPr = row._tr.get_or_add_trPr()
        cantSplit = parse_xml(f'<w:cantSplit {nsdecls("w")}/>')
        trHeight = parse_xml(f'<w:trHeight {nsdecls("w")} w:val="{height_dxa}" w:hRule="atLeast"/>')
        trPr.append(cantSplit)
        trPr.append(trHeight)

    def set_table_borders(table, border_color=COLOR_BORDER_HEX):
        tblPr = table._tbl.tblPr
        borders_xml = f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{COLOR_PRIMARY_HEX}"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{COLOR_PRIMARY_HEX}"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
        </w:tblBorders>
        '''
        tblPr.append(parse_xml(borders_xml))

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(11)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK_TEXT
        return p

    # ==================== COVER PAGE ====================
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(24)
    
    p_inst = doc.add_paragraph()
    r_inst = p_inst.add_run("PROGRAM STUDI TEKNIK INFORMATIKA / ILMU KOMPUTER\nFAKULTAS TEKNOLOGI INFORMASI")
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(10.5)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_MUTED
    p_inst.paragraph_format.space_after = Pt(16)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("PROJECT MANAGEMENT PLAN (PMP)\nTUGAS AKHIR REKAYASA PERANGKAT LUNAK")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(21)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(6)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Pembangunan Website Portofolio Interaktif Berbasis AI (Google Gemini) & Headless CMS Menggunakan Ekosistem Laravel 13 dan React 19 (Inertia.js)\nDomain Produksi: https://ridhwananang.id/")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY
    p_sub.paragraph_format.space_after = Pt(26)

    # Info Tim Capstone
    tbl_team = doc.add_table(rows=5, cols=3)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_widths = [2.2, 2.2, 2.6]
    t_data = [
        ("Nama Mahasiswa", "NIM", "Peran Rekayasa (Engineering Role)"),
        ("A", "[NIM Mahasiswa A]", "Project Manager & Systems Analyst"),
        ("B", "[NIM Mahasiswa B]", "UI/UX Designer & Product Researcher"),
        ("Ridhwan Anang Ma'ruf", "[NIM Ridhwan Anang]", "Tech Lead & Fullstack Developer"),
        ("Dosen Pembimbing:", "[Nama Lengkap Dosen, Gelar]", "Academic Advisor / Project Stakeholder")
    ]
    set_table_borders(tbl_team)
    for r_idx, row in enumerate(tbl_team.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(t_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(t_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=55, bottom=55, left=75, right=75)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
    
    p_year = doc.add_paragraph()
    p_year.paragraph_format.space_before = Pt(30)
    p_year.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_y = p_year.add_run("Tahun Akademik 2026/2027")
    r_y.font.name = 'Calibri'
    r_y.font.size = Pt(11)
    r_y.font.bold = True
    r_y.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ==================== BAB 1 ====================
    add_heading_1("1. INFORMASI PROYEK & TUJUAN PENGEMBANGAN")
    
    add_heading_2("1.1 Latar Belakang Masalah (Analisis 5W + 1H)")
    doc.add_paragraph("Latar belakang perancangan dan pembangunan proyek perangkat lunak ini dianalisis secara komprehensif menggunakan kerangka kerja 5W + 1H:")

    p_w1 = doc.add_paragraph()
    p_w1.add_run("1. WHAT (Apa Sistem yang Dibangun?):\n").bold = True
    p_w1.add_run("Sistem yang dibangun adalah platform portofolio digital interaktif generasi baru (https://ridhwananang.id/) yang mengintegrasikan kecerdasan buatan (Artificial Intelligence) berbasis Large Language Model (Google Gemini API via gemini-3.5-flash) dengan ekosistem modern Laravel 13, React 19 (Inertia.js), TailwindCSS v4, dan Filament v3 Admin Panel. Sistem ini bukan sekadar landing page statis, melainkan aplikasi web adaptif yang menyajikan profil keahlian, katalog proyek rekayasa, sertifikasi terverifikasi, form kontak terintegrasi, serta agen AI virtual yang mampu berdialog interaktif dengan pengunjung secara real-time.")

    p_w2 = doc.add_paragraph()
    p_w2.add_run("2. WHY (Mengapa Sistem Ini Wajib Dibangun?):\n").bold = True
    p_w2.add_run("Portofolio digital konvensional berbasis resume statis (PDF atau website HTML kaku) memiliki kelemahan mendasar: bersifat pasif, satu arah, dan tidak efisien bagi perekrut teknis (tech recruiters) maupun calon klien global yang memiliki waktu evaluasi sangat terbatas (rata-rata 30–60 detik). Pengunjung sering kali kesulitan mencari bukti spesifik kecocokan keahlian (misalnya: 'Apakah Ridhwan berpengalaman menangani PostgreSQL dan React 19?'). Selain itu, pengelolaan konten portofolio manual (hardcoded) sangat rentan usang. Oleh karena itu, dibutuhkan portofolio dinamis yang didukung asisten AI kontekstual dan panel manajemen konten (CMS) terpusat untuk menjawab pertanyaan audiens secara instan dan akurat 24/7.")

    p_w3 = doc.add_paragraph()
    p_w3.add_run("3. WHO (Siapa yang Terlibat dan Menjadi Target Pengguna?):\n").bold = True
    p_w3.add_run("• Tim Pengembang: Triad rekayasa perangkat lunak yang terdiri dari Ridhwan Anang Ma'ruf (Tech Lead & Fullstack Developer), Rekan A (Project Manager & Systems Analyst), dan Rekan B (UI/UX Designer & Product Researcher).\n"
                 "• Target Pengguna Eksternal: Tech Recruiters, Talent Acquisition Specialists, Engineering Managers, serta calon klien/mitra kolaborasi industri nasional dan internasional.\n"
                 "• Pengguna Internal (Administrator): Ridhwan Anang Ma'ruf sebagai pemilik sistem yang mengontrol konten portofolio, sertifikat, proyek, dan membalas pesan masuk.")

    p_w4 = doc.add_paragraph()
    p_w4.add_run("4. WHEN (Kapan Proyek Ini Dikembangkan dan Beroperasi?):\n").bold = True
    p_w4.add_run("Proyek direkayasa selama siklus 16 minggu pada semester pelaksanaan Tugas Akhir (Tahun Akademik 2026/2027) dengan menerapkan metodologi Agile Scrum 3 Sprint. Sistem saat ini telah mencapai tahap rilis operasional penuh (Production Live) dan dapat diakses publik secara berkelanjutan di domain resmi https://ridhwananang.id/.")

    p_w5 = doc.add_paragraph()
    p_w5.add_run("5. WHERE (Di Mana Sistem Ini Diterapkan dan Diakses?):\n").bold = True
    p_w5.add_run("• Sisi Klien (Frontend): Diakses secara global di seluruh dunia melalui peramban web modern (desktop dan smartphone responsif).\n"
                 "• Sisi Server (Backend): Dihosting pada arsitektur cloud server teroptimasi dengan akselerasi Vite 8 dan PHP 8.3.\n"
                 "• Basis Data Terpusat: Berjalan di cloud PostgreSQL melalui Supabase Connection Pooler (wilayah Asia Tenggara/Singapura) yang menjamin latensi jaringan minimal.\n"
                 "• Layanan AI: Terhubung langsung dengan Google AI Studio / Google Cloud API Gateway.")

    p_h1 = doc.add_paragraph()
    p_h1.add_run("6. HOW (Bagaimana Sistem Ini Dirancang dan Direkayasa?):\n").bold = True
    p_h1.add_run("Sistem direkayasa menggunakan arsitektur hybrid modern tanpa overhead REST API tradisional melalui adapter Inertia.js yang menghubungkan Laravel 13 controller langsung ke komponen React 19. Untuk asisten virtual, GeminiChatService mengimplementasikan pendekatan RAG-lite (Retrieval-Augmented Generation) dinamis: sistem mengekstraksi data riil Bio, Skills, Projects, dan Certificates langsung dari PostgreSQL untuk diinjeksi ke dalam System Prompt Gemini. Selain itu, diterapkan mekanisme Out-of-Scope Interceptor untuk memfilter pertanyaan di luar portofolio, token parsing [CHECK_REPLY:email] untuk pengecekan status balasan pesan secara instan, serta panel administrasi Filament v3 pada rute terenkripsi /secret-admin.")

    add_heading_2("1.2 Tujuan & Sasaran Pengembangan (OKRs / Strategic KPIs)")
    doc.add_paragraph("Target keberhasilan rekayasa portofolio https://ridhwananang.id/ diukur secara kuantitatif melalui matriks berikut:")

    tbl_okr = doc.add_table(rows=5, cols=3)
    tbl_okr.alignment = WD_TABLE_ALIGNMENT.CENTER
    okr_widths = [1.5, 2.2, 3.3]
    okr_data = [
        ("Dimensi Sasaran", "Sasaran Strategis (Objective)", "Key Results / Target Keberhasilan Terukur"),
        ("Interaktivitas AI", "Menyediakan asisten cerdas yang responsif dan akurat menjawab seputar profil.", "• Kecepatan respon AI Chatbot < 2.5 detik via gemini-3.5-flash.\n• Akurasi penolakan topik di luar portofolio (Out-of-Scope) 100%."),
        ("Performa Web", "Menghasilkan landing page dengan pengalaman visual mulus dan waktu muat cepat.", "• Core Web Vitals (LCP < 1.8 detik, CLS < 0.05).\n• Animasi Aura Glow & Motion 60 FPS stabil di layar desktop."),
        ("Keamanan & CMS", "Menjamin keamanan data profil dan pesan kontak di panel admin.", "• Panel admin terproteksi pada rute khusus /secret-admin.\n• Implementasi hashing password Bcrypt & proteksi CSRF/Sanctum."),
        ("Penerimaan Pengguna", "Memastikan kemudahan eksplorasi proyek dan kepuasan pengunjung.", "• Skor System Usability Scale (SUS) ≥ 75 (Kategori Good/Excellent).\n• Tingkat keberhasilan pengiriman pesan kontak 100% tanpa error.")
    ]
    set_table_borders(tbl_okr)
    for r_idx, row in enumerate(tbl_okr.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(okr_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(okr_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=45, bottom=45, left=65, right=65)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    add_heading_2("1.3 Profil Target Pengguna Akhir (User Personas Portofolio)")
    doc.add_paragraph("Berdasarkan tujuan operasional situs https://ridhwananang.id/, profil target pengguna dimodelkan dalam dua persona utama:")

    p_per1 = doc.add_paragraph()
    p_per1.add_run("Persona 1: Tech Recruiter & Engineering Hiring Lead (External User)\n").bold = True
    p_per1.add_run("• Profil: Profesional rekrutmen atau pimpinan tim teknis yang mencari kandidat Fullstack Developer berbakat dengan keahlian Laravel, React, dan AI Engineering.\n"
                   "• Kebutuhan Spesifik: Ingin memverifikasi stack teknologi kandidat dengan cepat, meninjau source code GitHub dan demo live proyek, serta menanyakan pertanyaan teknis spesifik langsung kepada AI Chatbot (misal: 'Proyek apa yang menggunakan Supabase dan Inertia?').\n"
                   "• Perilaku Penggunaan: Membuka situs via desktop/laptop, mengeksplorasi kartu proyek, mencoba interaksi chatbot, dan mengirim penawaran kerja melalui form kontak.")

    p_per2 = doc.add_paragraph()
    p_per2.add_run("Persona 2: Content Owner & Portfolio Administrator (Internal User - Ridhwan Anang)\n").bold = True
    p_per2.add_run("• Profil: Pemilik portofolio yang membutuhkan sistem manajemen konten dinamis tanpa harus mengubah kode sumber atau melakukan build/re-deploy setiap kali ada update.\n"
                   "• Kebutuhan Spesifik: Mengunggah sertifikasi baru dengan kompresi WebP otomatis, menambah portofolio proyek baru, memperbarui bio dan tech stacks, serta membaca dan membalas pesan kontak secara langsung dari dashboard admin Filament v3 di /secret-admin.")

    add_heading_2("1.4 Ruang Lingkup Proyek (Scope Boundaries Portofolio)")
    doc.add_paragraph("Batasan ruang lingkup proyek difokuskan secara spesifik pada platform portofolio Ridhwan Anang Ma'ruf:")

    p_in = doc.add_paragraph()
    p_in.add_run("Ruang Lingkup Termasuk (In-Scope):\n").bold = True
    p_in.add_run("1. Frontend Modern: Landing page React 19 + Inertia.js + TailwindCSS v4, efek Aura Glow kursor, Glassmorphism, Dark Mode dinamis, dan animasi Framer Motion v12.\n"
                 "2. Integrasi Google Gemini AI: Widget chatbot interaktif di pojok kanan bawah, injeksi konteks dinamis dari database PostgreSQL (Bio, Projects, Stacks, Certificates), filter topik Out-of-Scope, dan fitur pengecekan balasan kontak [CHECK_REPLY:email].\n"
                 "3. Admin Panel Filament v3 (/secret-admin): Modul CRUD Profiles, Projects, Tech Stacks, Certificates (otomasi konversi .webp), dan Messages inbox.\n"
                 "4. Form Kontak Terintegrasi: Pengiriman pesan ke database dan pengiriman balasan admin yang dapat dicek oleh pengirim via email.\n"
                 "5. Basis Data PostgreSQL & Cloud Deployment: Relational schema di Supabase pooler dan hosting live di https://ridhwananang.id/.")

    p_out = doc.add_paragraph()
    p_out.add_run("Di Luar Ruang Lingkup (Out-of-Scope):\n").bold = True
    p_out.add_run("1. Multi-Tenant SaaS (Aplikasi dirancang dedicated untuk portofolio tunggal Ridhwan Anang Ma'ruf).\n"
                  "2. Modul Payment Gateway (Bukan platform e-commerce komersial transaksi produk).\n"
                  "3. Aplikasi Mobile Native Terpisah (Menggunakan desain antarmuka Web Responsif penuh).")

    doc.add_page_break()

    # ==================== BAB 2 ====================
    add_heading_1("2. TATA KELOLA & PEMBAGIAN KERJA TIM (TRIAD)")
    doc.add_paragraph("Pembagian tugas tim rekayasa portofolio 3 orang didistribusikan secara transparan dan berimbang:")

    tbl_roles = doc.add_table(rows=4, cols=3)
    r_widths = [1.6, 2.0, 3.4]
    r_data = [
        ("Nama / NIM", "Peran Spesifik", "Tanggung Jawab Rekayasa di Proyek Portofolio"),
        ("A\n[NIM]", "Project Manager &\nSystems Analyst", "• Menyusun linimasa sprint, Gantt Chart, dan kontrol ruang lingkup.\n• Menyusun dokumen SRS dan user stories fitur portofolio & AI.\n• Merancang skenario pengujian fungsional (Blackbox Testing).\n• Mengoordinasikan penyerahan deliverable proyek ke stakeholder."),
        ("B\n[NIM]", "UI/UX Designer &\nProduct Researcher", "• Riset desain antarmuka modern, efek Glassmorphism & Aura Glow.\n• Pembuatan Design System dan interactive prototype di Figma.\n• Optimasi micro-interactions dan animasi Framer Motion.\n• Memimpin pengujian Usability Testing menggunakan kuesioner SUS."),
        ("Ridhwan Anang\n[NIM]", "Tech Lead &\nFullstack Developer", "• Mengembangkan backend Laravel 13, integrasi Inertia.js & React 19.\n• Mengembangkan GeminiChatService, prompt engineering & filter AI.\n• Mengembangkan panel admin Filament v3 di rute /secret-admin.\n• Merancang database PostgreSQL Supabase, CI/CD, dan cloud hosting.")
    ]
    set_table_borders(tbl_roles)
    for r_idx, row in enumerate(tbl_roles.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(r_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(r_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=50, bottom=50, left=70, right=70)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    # ==================== BAB 3 ====================
    add_heading_1("3. METODOLOGI PENGEMBANGAN & BAGAN GANTT (GANTT CHART)")
    doc.add_paragraph("Pengembangan portofolio https://ridhwananang.id/ menerapkan Agile Scrum terstruktur selama 16 minggu yang memadukan desain UI, koding fullstack, integrasi Gemini AI, dan evaluasi empiris:")

    # GANTT CHART (19 columns)
    col_widths = [0.35, 2.75, 0.60] + [0.2125] * 16

    gantt_data = [
        (True, "", "FASE 1: INISIASI, RISET & SPRINT 0", "", []),
        (False, "1", "Penyusunan SRS & User Stories Portofolio", "A", [1, 2]),
        (False, "2", "Riset UI Glassmorphism & Figma Design System", "B", [2, 3]),
        (False, "3", "Setup Laravel 13, React 19, Inertia & Supabase", "Ridhwan", [2, 3]),
        (False, "4", "Penyusunan Product Backlog & Sprint 1 Plan", "TIM", [3]),
        
        (True, "", "FASE 2: SIKLUS SPRINT PENGEMBANGAN", "", []),
        (False, "5", "Sprint 1: Desain Landing Page, Bio & Projects", "B", [4]),
        (False, "6", "Sprint 1: Koding Frontend React & Database CRUD", "Ridhwan", [4, 5, 6]),
        (False, "7", "Sprint 1: Blackbox Testing & Review Iterasi 1", "A", [6, 7]),
        (False, "8", "Sprint 2: Desain Widget AI Chatbot & Modal Kontak", "B", [7, 8]),
        (False, "9", "Sprint 2: Koding Gemini AI Service & Filter Topik", "Ridhwan", [8, 9, 10]),
        (False, "10", "Sprint 2: Testing Akurasi AI & Review Iterasi 2", "A", [10]),
        (False, "11", "Sprint 3: Desain Dashboard Admin Filament v3", "B", [11]),
        (False, "12", "Sprint 3: Koding Admin /secret-admin & WebP Upload", "Ridhwan", [11, 12]),
        (False, "13", "Sprint 3: Regression Test & Feature Complete", "A", [12, 13]),

        (True, "", "FASE 3: PENGUJIAN AKHIR & LIVE DEPLOYMENT", "", []),
        (False, "14", "Pengujian Fungsional Blackbox Menyeluruh", "A", [14]),
        (False, "15", "Pengujian Usability (System Usability Scale - SUS)", "B", [14]),
        (False, "16", "Cloud Production Deployment di ridhwananang.id", "Ridhwan", [15]),
        (False, "17", "Penyusunan Laporan Akhir & Dokumentasi Teknis", "TIM", [15, 16]),
        (False, "18", "Sidang Akhir & Presentasi Portofolio Live", "TIM", [16]),
    ]

    total_rows = 2 + len(gantt_data)
    tbl_gantt = doc.add_table(rows=total_rows, cols=19)
    tbl_gantt.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_gantt)

    # Row 0
    r0 = tbl_gantt.rows[0]
    set_row_properties(r0, height_dxa=240)
    for c in r0.cells:
        set_cell_background(c, COLOR_PRIMARY_HEX)
        set_cell_margins(c, top=30, bottom=30, left=30, right=30)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    r0.cells[0].paragraphs[0].text = "No"
    r0.cells[1].paragraphs[0].text = "Tahapan & Aktivitas Rekayasa"
    r0.cells[2].paragraphs[0].text = "PIC"

    m1 = r0.cells[3].merge(r0.cells[6])
    m1.paragraphs[0].text = "Bulan 1"
    m2 = r0.cells[7].merge(r0.cells[10])
    m2.paragraphs[0].text = "Bulan 2"
    m3 = r0.cells[11].merge(r0.cells[14])
    m3.paragraphs[0].text = "Bulan 3"
    m4 = r0.cells[15].merge(r0.cells[18])
    m4.paragraphs[0].text = "Bulan 4"

    for cell in r0.cells:
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(0)
            for run in p.runs:
                run.font.name = 'Calibri'
                run.font.bold = True
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(255, 255, 255)
    r0.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Row 1
    r1 = tbl_gantt.rows[1]
    set_row_properties(r1, height_dxa=220)
    for cell in r1.cells:
        set_cell_background(cell, COLOR_SECONDARY_HEX)
        set_cell_margins(cell, top=20, bottom=20, left=20, right=20)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    r1.cells[0].paragraphs[0].text = ""
    r1.cells[1].paragraphs[0].text = ""
    r1.cells[2].paragraphs[0].text = ""

    for w in range(1, 17):
        cell_w = r1.cells[2 + w]
        p = cell_w.paragraphs[0]
        p.text = str(w)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        for run in p.runs:
            run.font.name = 'Calibri'
            run.font.bold = True
            run.font.size = Pt(7.5)
            run.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for idx, (is_cat, num, act_name, pic, active_weeks) in enumerate(gantt_data):
        row = tbl_gantt.rows[2 + idx]
        set_row_properties(row, height_dxa=250)

        if is_cat:
            cat_cell = row.cells[0].merge(row.cells[18])
            set_cell_background(cat_cell, COLOR_CAT_BG_HEX)
            set_cell_margins(cat_cell, top=35, bottom=35, left=60, right=60)
            cat_cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cat_cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(act_name)
            run.font.name = 'Calibri'
            run.font.bold = True
            run.font.size = Pt(8.5)
            run.font.color.rgb = COLOR_PRIMARY
        else:
            c0 = row.cells[0]
            c0.paragraphs[0].text = num
            c0.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            c1 = row.cells[1]
            c1.paragraphs[0].text = act_name
            c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            
            c2 = row.cells[2]
            c2.paragraphs[0].text = pic
            c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

            row_bg = "FFFFFF" if idx % 2 == 0 else COLOR_LIGHT_BG_HEX
            for c_i in [0, 1, 2]:
                cell = row.cells[c_i]
                set_cell_background(cell, row_bg)
                set_cell_margins(cell, top=30, bottom=30, left=45, right=45)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                for run in p.runs:
                    run.font.name = 'Calibri'
                    run.font.size = Pt(8.0)
                    if c_i == 2:
                        run.font.bold = True
                        run.font.color.rgb = COLOR_PRIMARY

            for w in range(1, 17):
                cell_w = row.cells[2 + w]
                set_cell_margins(cell_w, top=0, bottom=0, left=0, right=0)
                cell_w.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = cell_w.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                p.text = ""

                if w in active_weeks:
                    if num == "18":
                        set_cell_background(cell_w, COLOR_ACCENT_HEX)
                    else:
                        set_cell_background(cell_w, COLOR_SECONDARY_HEX)
                else:
                    set_cell_background(cell_w, "FFFFFF" if idx % 2 == 0 else COLOR_LIGHT_BG_HEX)

    for row in tbl_gantt.rows:
        for i, w in enumerate(col_widths):
            if i < len(row.cells):
                row.cells[i].width = Inches(w)

    # Legend Box
    tbl_leg = doc.add_table(rows=1, cols=4)
    tbl_leg.alignment = WD_TABLE_ALIGNMENT.CENTER
    leg_widths = [0.3, 3.2, 0.3, 3.3]
    
    c_leg0 = tbl_leg.rows[0].cells[0]
    set_cell_background(c_leg0, COLOR_SECONDARY_HEX)
    set_cell_margins(c_leg0, top=20, bottom=20, left=20, right=20)
    c_leg0.paragraphs[0].text = ""

    c_leg1 = tbl_leg.rows[0].cells[1]
    set_cell_background(c_leg1, "FFFFFF")
    set_cell_margins(c_leg1, top=20, bottom=20, left=40, right=40)
    p1 = c_leg1.paragraphs[0]
    p1.paragraph_format.space_after = Pt(0)
    r1 = p1.add_run("Durasi Pengerjaan Aktivitas / Sprint Kerja")
    r1.font.size = Pt(8.0)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_DARK_TEXT

    c_leg2 = tbl_leg.rows[0].cells[2]
    set_cell_background(c_leg2, COLOR_ACCENT_HEX)
    set_cell_margins(c_leg2, top=20, bottom=20, left=20, right=20)
    c_leg2.paragraphs[0].text = ""

    c_leg3 = tbl_leg.rows[0].cells[3]
    set_cell_background(c_leg3, "FFFFFF")
    set_cell_margins(c_leg3, top=20, bottom=20, left=40, right=40)
    p3 = c_leg3.paragraphs[0]
    p3.paragraph_format.space_after = Pt(0)
    r3 = p3.add_run("Tonggak Capaian Kritis / Sidang Tugas Akhir (Milestone)")
    r3.font.size = Pt(8.0)
    r3.font.bold = True
    r3.font.color.rgb = COLOR_DARK_TEXT

    for i, w in enumerate(leg_widths):
        tbl_leg.rows[0].cells[i].width = Inches(w)
        tbl_leg.rows[0].cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    doc.add_page_break()

    # ==================== BAB 4 ====================
    add_heading_1("4. STRATEGI PENJAMINAN KUALITAS & PENGUJIAN (QA)")
    doc.add_paragraph("Strategi pengujian difokuskan secara mendalam pada arsitektur perangkat lunak portofolio https://ridhwananang.id/ menggunakan standar ISO/IEC/IEEE 29119:")

    add_heading_2("4.1 Pengujian Teknis (Unit Testing & Code Quality)")
    doc.add_paragraph("• Backend Testing (Pest PHP & PHPUnit): Menguji logika bisnis service layer, khususnya GeminiChatService dalam menyusun prompt sistem, token replacement [CHECK_REPLY:email], dan penanganan error respons API.\n"
                      "• Static Analysis (Larastan Level 8 & Pint): Pemeriksaan tipe data statis pada kode PHP/Laravel dan penegakan standar kode PSR-12 secara otomatis.\n"
                      "• Frontend Testing & Linter: TypeScript compilation check (tsc --noEmit) untuk menjamin type safety di React 19, serta ESLint + Prettier untuk konsistensi kode komponen.\n"
                      "• Ambang Batas Kelulusan: Zero error pada kompilasi TypeScript dan lolos seluruh test suite Pest PHP sebelum deployment live.")

    add_heading_2("4.2 Pengujian Fungsionalitas (Blackbox Testing Fitur Nyata)")
    doc.add_paragraph("Pengujian fungsionalitas memverifikasi skenario operasional spesifik yang ada pada website portofolio:")

    # Blackbox Table for Actual Features
    tbl_bb = doc.add_table(rows=6, cols=5)
    tbl_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    bb_widths = [1.1, 1.4, 1.9, 1.8, 0.8]
    bb_data = [
        ("Test Case ID", "Modul / Fitur", "Skenario Pengujian", "Hasil yang Diharapkan", "Status"),
        ("TC-AI-01", "AI Chatbot Gemini", "Tanya proyek spesifik: 'Proyek apa yang pakai Laravel?'", "AI menjawab akurat mengambil data Projects dari PostgreSQL", "Passed"),
        ("TC-AI-02", "AI Filter Topik", "Tanya di luar portofolio: 'Bagaimana resep rendang?'", "AI menolak sopan sesuai Out-of-Scope Interceptor", "Passed"),
        ("TC-AI-03", "Status Pesan", "Masukkan email di chat: 'Cek balasan pesan email@test.com'", "Sistem memproses token [CHECK_REPLY] & menampilkan isi balasan", "Passed"),
        ("TC-ADM-01", "Admin Filament", "Upload file sertifikat baru di /secret-admin", "File tersimpan & thumbnail .webp otomatis ter-generate", "Passed"),
        ("TC-SEC-01", "Proteksi Admin", "Akses URL default /admin (bukan /secret-admin)", "Sistem menampilkan halaman 404 Not Found (URL terisolasi)", "Passed")
    ]
    set_table_borders(tbl_bb)
    for r_idx, row in enumerate(tbl_bb.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(bb_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(bb_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=45, bottom=45, left=60, right=60)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx == 4:
                run.font.bold = True
                run.font.color.rgb = RGBColor(16, 120, 50)

    add_heading_2("4.3 Pengujian Penerimaan Pengguna (System Usability Scale - SUS)")
    doc.add_paragraph("• Instrumen Pengujian: Menggunakan kuesioner baku 10 butir System Usability Scale (SUS) John Brooke (1986) berskala Likert 1–5.\n"
                      "• Sampel Uji: 20 responden yang terdiri dari tech recruiters, software engineers, dan mahasiswa informatika tingkat akhir.\n"
                      "• Skenario Tugas (Task-based Evaluation):\n"
                      "  1. Mengunjungi landing page https://ridhwananang.id/ dan mengamati efek visual Aura Glow serta mode gelap/terang.\n"
                      "  2. Membuka kartu proyek (Projects), melihat detail teknologi yang digunakan, serta mengakses tautan live demo.\n"
                      "  3. Berinteraksi dengan widget AI Chatbot untuk menanyakan keahlian Ridhwan dan menguji filter out-of-scope.\n"
                      "  4. Mengisi formulir kontak untuk mengirim pesan penawaran kerja/kolaborasi.\n"
                      "• Target Kelayakan: Skor rata-rata SUS minimum sebesar 75 (Grade B+ / 'Good to Excellent'), membuktikan antarmuka portofolio intuitif, modern, dan sangat nyaman digunakan.")

    # ==================== BAB 5 ====================
    add_heading_1("5. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR SISTEM")
    doc.add_paragraph("Arsitektur perangkat lunak portofolio https://ridhwananang.id/ dirancang secara terintegrasi menggunakan ekosistem teknologi modern:")
    
    p_arch1 = doc.add_paragraph()
    p_arch1.add_run("1. Frontend Architecture (React 19 & Inertia.js):\n").bold = True
    p_arch1.add_run("Menggunakan React 19 yang dirender melalui adapter Inertia.js v3 tanpa overhead pembuatan API controller terpisah. Styling dibangun dengan TailwindCSS v4 (@tailwindcss/vite) dengan performa kompilasi instan. Dilengkapi antarmuka interaktif: efek kursor Aura Glow (ambient radial gradient), panel Glassmorphism semi-transparan (backdrop-filter blur), animasi bertingkat (Motion/Framer Motion v12), dan ikonografi Lucide React.")

    p_arch2 = doc.add_paragraph()
    p_arch2.add_run("2. Backend & CMS Architecture (Laravel 13 & Filament v3):\n").bold = True
    p_arch2.add_run("Ditenagai Laravel 13.x (PHP 8.3+) dengan keamanan Laravel Fortify dan Sanctum. Panel admin dibangun menggunakan Filament v3 pada rute terenkripsi khusus (/secret-admin) untuk mengamankan data dari serangan brute-force URL admin standar. Admin panel melayani pengelolaan Profiles, Projects, Tech Stacks, Certificates (dengan fitur pembuatan thumbnail .webp otomatis), serta Message inbox.")

    p_arch3 = doc.add_paragraph()
    p_arch3.add_run("3. AI Integration Layer (Google Gemini API):\n").bold = True
    p_arch3.add_run("Inti asisten cerdas dikelola oleh GeminiChatService yang berkomunikasi dengan model gemini-3.5-flash. Service ini secara dinamis menyusun System Instruction berbasis data riil profil dan proyek dari database PostgreSQL. Dilengkapi Filter Topik cerdas untuk menolak pertanyaan di luar portofolio, serta pendeteksi token [CHECK_REPLY:email] untuk menampilkan balasan pesan kontak langsung di dalam chat.")

    p_arch4 = doc.add_paragraph()
    p_arch4.add_run("4. Database & Cloud Hosting:\n").bold = True
    p_arch4.add_run("Basis data utama menggunakan PostgreSQL yang di-host pada Supabase Connection Pooler (AWS ap-southeast-1 Singapura) untuk menjaga persistensi data dan konkurensi koneksi. Seluruh lalu lintas data dienkripsi dengan protokol HTTPS / TLS 1.3.")

    # ==================== BAB 6 ====================
    add_heading_1("6. MANAJEMEN RISIKO PROYEK REKAYASA (RISK MANAGEMENT)")
    doc.add_paragraph("Analisis risiko proyek portofolio https://ridhwananang.id/ disusun dengan matriks probabilitas dan dampak (ISO 31000):")

    tbl_rsk = doc.add_table(rows=6, cols=7)
    tbl_rsk.alignment = WD_TABLE_ALIGNMENT.CENTER
    rsk_widths = [0.8, 1.8, 0.4, 0.4, 0.6, 1.8, 1.2]
    rsk_data = [
        ("ID", "Deskripsi Risiko Rekayasa Portofolio", "P", "I", "Skor", "Tindakan Mitigasi Preventif", "Penanggung Jawab"),
        ("RSK-01", "Rate Limit & Kuota API Google Gemini Habis", "3", "4", "12 (M)", "Gunakan model efisien gemini-3.5-flash; caching respon jawaban umum.", "Ridhwan (Tech Lead)"),
        ("RSK-02", "Prompt Injection pada Widget AI Chatbot", "3", "3", "9 (M)", "Terapkan Out-of-Scope Interceptor ketat di GeminiChatService.", "Ridhwan (Tech Lead)"),
        ("RSK-03", "Koneksi Supabase PostgreSQL Mengalami Timeout", "2", "4", "8 (M)", "Gunakan Supabase Connection Pooler port 5432 & fallback SQLite lokal.", "Ridhwan (Tech Lead)"),
        ("RSK-04", "Animasi Aura Glow & Motion Lag di Layar Tertentu", "2", "3", "6 (L)", "Gunakan CSS hardware-acceleration & batasi glow hanya untuk desktop.", "B (UI/UX Designer)"),
        ("RSK-05", "Upaya Akses Ilegal pada Panel Administrasi", "2", "5", "10 (M)", "Isolasi URL ke rute /secret-admin; proteksi session Fortify & rate limit.", "A (Project Manager)")
    ]
    set_table_borders(tbl_rsk)
    for r_idx, row in enumerate(tbl_rsk.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(rsk_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(rsk_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=45, bottom=45, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx == 4:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY

    # ==================== BAB 7: PENGESAHAN ====================
    add_heading_1("7. LEMBAR PENGESAHAN REKAYASA PERANGKAT LUNAK")
    doc.add_paragraph("Dokumen Project Management Plan (PMP) ini disahkan secara resmi sebagai acuan mutu rekayasa perangkat lunak portofolio https://ridhwananang.id/:")

    tbl_sign = doc.add_table(rows=3, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [3.5, 3.6]
    
    sign_boxes = [
        ("TIM REKAYASA PENGEMBANG (ENGINEERING POD)", "PEMBIMBING AKADEMIK (KEY STAKEHOLDER)"),
        ("Disusun Oleh (Project Manager):\n\n\n\n___________________________________\nA\nNIM: [NIM Mahasiswa A]\nTanggal: DD/MM/YYYY",
         "Disetujui Oleh Dosen Pembimbing:\n\n\n\n___________________________________\n[Nama Lengkap Dosen, Gelar]\nNIP / NIDN: [NIP Dosen]\nTanggal: DD/MM/YYYY"),
        ("Tech Lead & Fullstack Developer:\n\n\n\n___________________________________\nRidhwan Anang Ma'ruf\nNIM: [NIM Ridhwan Anang]\nTanggal: DD/MM/YYYY",
         "UI/UX Designer & Researcher:\n\n\n\n___________________________________\nB\nNIM: [NIM Mahasiswa B]\nTanggal: DD/MM/YYYY")
    ]
    
    c0 = tbl_sign.rows[0].cells[0]
    c1 = tbl_sign.rows[0].cells[1]
    c0.paragraphs[0].text = sign_boxes[0][0]
    c1.paragraphs[0].text = sign_boxes[0][1]
    set_cell_background(c0, COLOR_PRIMARY_HEX)
    set_cell_background(c1, COLOR_PRIMARY_HEX)
    c0.paragraphs[0].runs[0].font.bold = True
    c0.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    c1.paragraphs[0].runs[0].font.bold = True
    c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    c0.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    r1_c0 = tbl_sign.rows[1].cells[0]
    r1_c1 = tbl_sign.rows[1].cells[1]
    r1_c0.paragraphs[0].text = sign_boxes[1][0]
    r1_c1.paragraphs[0].text = sign_boxes[1][1]
    set_cell_background(r1_c0, "FFFFFF")
    set_cell_background(r1_c1, "FFFFFF")

    r2_c0 = tbl_sign.rows[2].cells[0]
    r2_c1 = tbl_sign.rows[2].cells[1]
    r2_c0.paragraphs[0].text = sign_boxes[2][0]
    r2_c1.paragraphs[0].text = sign_boxes[2][1]
    set_cell_background(r2_c0, COLOR_LIGHT_BG_HEX)
    set_cell_background(r2_c1, COLOR_LIGHT_BG_HEX)

    for r in tbl_sign.rows:
        for i, c in enumerate(r.cells):
            c.width = Inches(sign_widths[i])
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
    
    set_table_borders(tbl_sign)

    # Save Document
    doc.save(output_path)
    print(f"Portfolio-focused PMP successfully created at: {output_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Portofolio_Ridhwan_Anang.docx"
    create_portfolio_pmp_document(output_file)
