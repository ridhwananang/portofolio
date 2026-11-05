import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_global_standard_pmp(output_path):
    doc = docx.Document()

    # Set Margins (0.75 in margins = 7.0 in printable width)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Color Palette: Corporate Slate Navy & Indigo
    COLOR_PRIMARY_HEX = "0F172A"     # Slate 900
    COLOR_SECONDARY_HEX = "4F46E5"   # Indigo 600
    COLOR_DARK_TEXT_HEX = "1E293B"   # Slate 800
    COLOR_MUTED_HEX = "64748B"       # Slate 500
    COLOR_LIGHT_BG_HEX = "F8FAFC"    # Slate 50
    COLOR_BORDER_HEX = "CBD5E1"      # Slate 300
    COLOR_ACCENT_HEX = "D97706"      # Amber 600
    COLOR_CAT_BG_HEX = "E2E8F0"      # Slate 200

    COLOR_PRIMARY = RGBColor(15, 23, 42)
    COLOR_SECONDARY = RGBColor(79, 70, 229)
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
    p_top.paragraph_format.space_before = Pt(28)
    
    p_inst = doc.add_paragraph()
    r_inst = p_inst.add_run("GLOBAL SOFTWARE ENGINEERING STANDARDS (IEEE STD 1058 / ISO/IEC/IEEE 12207)")
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(10)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_SECONDARY
    p_inst.paragraph_format.space_after = Pt(14)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("PROJECT MANAGEMENT PLAN (PMP)\nSOFTWARE ENGINEERING MASTER BASELINE")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(21)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(6)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Platform Portofolio Interaktif, Asisten Virtual Cerdas (Google Gemini AI), Client Project Order Tracker & Sistem Rekening Bersama Escrow (Midtrans & Xendit)\nSistem Live: https://ridhwananang.id/")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_MUTED
    p_sub.paragraph_format.space_after = Pt(28)

    # Project Metadata Box
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_widths = [2.2, 4.8]
    meta_data = [
        ("Nama Proyek / Sistem", "Portofolio & Freelance Client Service Platform — Ridhwan Anang Ma'ruf"),
        ("Identifier Dokumen", "PMP-SPMP-RAM-2026-V1.0"),
        ("Standar Rekayasa yang Diacu", "IEEE Std 1058, PMI PMBOK 7th Edition, ISO/IEC/IEEE 12207, ISO 29119"),
        ("URL Produksi Aktif", "https://ridhwananang.id/"),
        ("Tim Rekayasa (Triad Pod)", "Ridhwan Anang Ma'ruf (Tech Lead), A (Project Manager), B (UI/UX Designer)"),
        ("Status Baseline", "Baseline v1.0 — Production Approved & Operational Live")
    ]
    set_table_borders(tbl_meta)
    for r_idx, row in enumerate(tbl_meta.rows):
        for c_idx, val in enumerate(meta_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(meta_widths[c_idx])
            set_cell_background(cell, COLOR_LIGHT_BG_HEX if c_idx == 0 else "FFFFFF")
            set_cell_margins(cell, top=55, bottom=55, left=75, right=75)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.0)
            if c_idx == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_PRIMARY

    doc.add_page_break()

    # ==================== SECTION 1 ====================
    add_heading_1("1. PROJECT OVERVIEW, STRATEGIC CONTEXT & SWOT ANALYSIS")
    
    add_heading_2("1.1 Latar Belakang Masalah (Analisis 5W + 1H)")
    doc.add_paragraph("Latar belakang perancangan platform portofolio digital https://ridhwananang.id/ dianalisis secara terperinci menggunakan kerangka kerja 5W + 1H:")

    p_w1 = doc.add_paragraph()
    p_w1.add_run("1. WHAT (Apa Sistem yang Direkayasa?):\n").bold = True
    p_w1.add_run("Platform perangkat lunak yang direkayasa adalah portal portofolio interaktif dan client project management berbasis web modern (https://ridhwananang.id/). Sistem mengintegrasikan monolit modern Laravel 13 dan React 19 via Inertia.js v3, ditenagai oleh asisten virtual cerdas berbasis LLM (Google Gemini API gemini-3.5-flash), sistem pemesanan jasa mandiri (/layanan), live tracker pengerjaan proyek 5-milestone (/track-project/{tracking_code}), sistem rekening bersama (Escrow Service) terintegrasi Midtrans & Xendit, serta panel administrasi konten terisolasi (Filament v3 pada rute /secret-admin).")

    p_w2 = doc.add_paragraph()
    p_w2.add_run("2. WHY (Mengapa Sistem Ini Wajib Dibangun?):\n").bold = True
    p_w2.add_run("Portofolio digital konvensional berbasis resume statis (PDF atau website HTML kaku) memiliki kelemahan mendasar: bersifat pasif, satu arah, dan tidak efisien bagi tech recruiters maupun klien global yang memiliki waktu evaluasi sangat terbatas (rata-rata 30-60 detik). Pengunjung kesulitan memverifikasi kecocokan kompetensi teknis secara instan (misal: 'Apakah Ridhwan berpengalaman menangani PostgreSQL dan React 19?'). Selain itu, dalam alur kerja freelance, sering terjadi ketidakpastian biaya dan sengketa pembayaran. Oleh karena itu, diperlukan platform interaktif yang dilengkapi asisten AI kontekstual 24/7, kalkulator harga transparan, serta sistem Escrow rekber terpercaya.")

    p_w3 = doc.add_paragraph()
    p_w3.add_run("3. WHO (Siapa yang Terlibat dan Menjadi Target Pengguna?):\n").bold = True
    p_w3.add_run("• Tim Rekayasa Pengembang (Triad): Ridhwan Anang Ma'ruf (Tech Lead & Fullstack Developer), Rekan A (Project Manager & Systems Analyst), dan Rekan B (UI/UX Designer & Product Researcher).\n"
                 "• Target Pengguna Eksternal: Tech Recruiters, Talent Acquisition Specialists, Engineering Managers, serta Klien Bisnis pemberi proyek freelance.\n"
                 "• Administrator Internal: Ridhwan Anang Ma'ruf sebagai pemilik sistem yang mengontrol konten portofolio, sertifikat, proyek, dan membalas pesan masuk.")

    p_w4 = doc.add_paragraph()
    p_w4.add_run("4. WHEN (Kapan Proyek Direkayasa dan Beroperasi?):\n").bold = True
    p_w4.add_run("Proyek direkayasa selama siklus 16 minggu menggunakan metodologi Agile Scrum 4 Sprint. Saat ini sistem telah mencapai rilis operasional penuh (Production Live) dan beroperasi aktif secara online di domain resmi https://ridhwananang.id/.")

    p_w5 = doc.add_paragraph()
    p_w5.add_run("5. WHERE (Di Mana Sistem Diterapkan dan Diakses?):\n").bold = True
    p_w5.add_run("• Client-Side: Diakses global melalui browser web modern (desktop dan smartphone responsif).\n"
                 "• Server-Side: Berjalan pada arsitektur cloud server teroptimasi Vite 8 dan PHP 8.3.\n"
                 "• Basis Data Terpusat: Cloud PostgreSQL pada Supabase Connection Pooler (AWS ap-southeast-1 Singapura) untuk latensi jaringan minimal.\n"
                 "• Layanan AI: Terhubung langsung ke Google AI Studio / Google Cloud API Gateway.")

    p_h1 = doc.add_paragraph()
    p_h1.add_run("6. HOW (Bagaimana Sistem Ini Dirancang dan Direkayasa?):\n").bold = True
    p_h1.add_run("Sistem direkayasa menggunakan arsitektur monolit modern via adapter Inertia.js yang menghubungkan controller Laravel 13 langsung ke komponen React 19. Untuk asisten virtual, GeminiChatService mengimplementasikan pendekatan RAG-lite dinamis: mengekstraksi data riil Bio, Skills, Projects, dan Certificates dari database PostgreSQL untuk diinjeksi ke System Instruction Gemini. Dilengkapi Out-of-Scope Interceptor untuk memfilter pertanyaan di luar portofolio, token parsing [CHECK_REPLY:email] untuk pengecekan status balasan pesan kontak langsung di chat, live project tracker 5-milestone berbasis kode unik PRJ-XXXXXXXX, serta EscrowService untuk rekber otomatis berbasis webhook Midtrans dan Xendit.")

    add_heading_2("1.2 Sasaran Strategis & Metrik Keberhasilan (OKRs / KPIs)")
    doc.add_paragraph("Target keberhasilan rekayasa sistem portofolio https://ridhwananang.id/ diukur secara kuantitatif melalui matriks berikut:")

    tbl_okr = doc.add_table(rows=5, cols=3)
    tbl_okr.alignment = WD_TABLE_ALIGNMENT.CENTER
    okr_widths = [1.5, 2.2, 3.3]
    okr_data = [
        ("Dimensi Sasaran", "Sasaran Strategis (Objective)", "Key Results / Target Keberhasilan Terukur"),
        ("Interaktivitas AI", "Menyediakan asisten virtual cerdas yang responsif dan akurat menjawab kualifikasi teknis.", "• Latensi respon AI Chatbot < 2.5 detik via gemini-3.5-flash.\n• Akurasi penolakan topik di luar portofolio (Out-of-Scope) 100%."),
        ("Performa Web", "Menghasilkan landing page dengan visual modern dan waktu muat sangat cepat.", "• Core Web Vitals (LCP < 1.8 detik, CLS < 0.05).\n• Animasi Aura Glow & Motion 60 FPS stabil pada layar desktop."),
        ("Keamanan & CMS", "Menjamin keamanan data profil, transaksi, dan pesan kontak di panel admin.", "• Panel admin terproteksi pada rute khusus /secret-admin.\n• Proteksi Fortify, Sanctum, Two-Factor Authentication, & Bcrypt."),
        ("Penerimaan Pengguna", "Memastikan kenyamanan navigasi proyek dan kepuasan pengunjung.", "• Skor System Usability Scale (SUS) ≥ 75 (Kategori Good/Excellent).\n• Tingkat keberhasilan transaksi DP & pelacakan proyek 100%.")
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

    # ==================== SWOT SECTION ====================
    add_heading_2("1.3 Analisis SWOT Strategis Proyek (Strengths, Weaknesses, Opportunities, Threats)")
    doc.add_paragraph("Analisis SWOT berikut mengevaluasi posisi kompetitif, kelayakan rekayasa internal, serta tantangan eksternal sistem portofolio https://ridhwananang.id/:")

    tbl_swot = doc.add_table(rows=4, cols=2)
    tbl_swot.alignment = WD_TABLE_ALIGNMENT.CENTER
    swot_widths = [3.5, 3.5]
    swot_data = [
        ("FAKTOR KEKUATAN INTERNAL (STRENGTHS)", "FAKTOR KELEMAHAN INTERNAL (WEAKNESSES)"),
        ("• S1. Arsitektur Modern Monolith (Laravel 13 + React 19 Inertia v3) tanpa overhead REST API terpisah.\n"
         "• S2. Asisten AI Kontekstual (Gemini 3.5 Flash RAG-lite) membaca data riil dari PostgreSQL.\n"
         "• S3. Ekosistem Transaksi Freelance Lengkap (Kalkulator biaya, Live Tracker 5-milestone, Escrow Midtrans & Xendit).\n"
         "• S4. UI/UX Premium (Aura Glow radial cursor, Glassmorphism, Dark Mode, Framer Motion v12).\n"
         "• S5. Panel Admin Terisolasi (Filament v3 di /secret-admin) mereduksi risiko serangan brute force.",
         "• W1. Bottleneck Pengembang Tunggal: Ridhwan memegang peran ganda (Tech Lead, Fullstack, DevOps).\n"
         "• W2. Ketergantungan Multi-Vendor Cloud Latency (Supabase Singapura, Google AI Studio, Midtrans/Xendit).\n"
         "• W3. Arsitektur Single-Tenant: Didesain spesifik portofolio Ridhwan, belum multi-tenant SaaS.\n"
         "• W4. Beban Grafis Perangkat Klien: Efek blur & animasi radial glow membutuhkan GPU/CPU memadai."),
        ("PELUANG PENGEMBANGAN EKSTERNAL (OPPORTUNITIES)", "ANCAMAN & TANTANGAN EKSTERNAL (THREATS)"),
        ("• O1. Tingginya Kebutuhan Industri Global akan Developer Fullstack berkemampuan integrasi AI.\n"
         "• O2. Skalabilitas Portofolio Menjadi Agensi Software Mandiri (Boutique Software House).\n"
         "• O3. Peluang Peningkatan ke Gemini Multimodal (Voice chat interaktif & analisis PDF brief proyek).\n"
         "• O4. Potensi Komersialisasi Starter Kit / Open-Source Template portofolio modern.",
         "• T1. Risiko Fluktuasi Kuota & Rate Limit API Google Gemini pada lonjakan trafik tinggi.\n"
         "• T2. Potensi Serangan Prompt Injection untuk memanipulasi obrolan chatbot AI.\n"
         "• T3. Risiko Kegagalan Webhook Callback Pembayaran (Inkonsistensi status transaksi Escrow).\n"
         "• T4. Cepatnya Siklus Rilis Dependensi JS/NPM yang menuntut pemeliharaan paket rutin.")
    ]
    set_table_borders(tbl_swot)
    for r_idx, row in enumerate(tbl_swot.rows):
        is_hdr = (r_idx == 0 or r_idx == 2)
        bg = COLOR_PRIMARY_HEX if is_hdr else (COLOR_LIGHT_BG_HEX if r_idx == 1 else "FFFFFF")
        for c_idx, val in enumerate(swot_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(swot_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=50, bottom=50, left=70, right=70)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if is_hdr:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # TOWS Matrix
    add_heading_3("Matriks Strategi TOWS (Actionable Strategy Matrix)")
    tbl_tows = doc.add_table(rows=5, cols=2)
    tbl_tows.alignment = WD_TABLE_ALIGNMENT.CENTER
    tows_widths = [1.8, 5.2]
    tows_data = [
        ("Kategori Strategi", "Rencana Aksi Strategis Rekayasa & Operasional"),
        ("Strategi SO\n(Maxi - Maxi)", "• Memanfaatkan keunggulan teknologi Laravel 13 + React 19 dan AI Gemini untuk memenangkan proyek freelance bernilai tinggi dari klien internasional.\n• Mempromosikan fitur Live Project Tracker dan Escrow sebagai diferensiasi transparansi kerja agensi."),
        ("Strategi WO\n(Mini - Maxi)", "• Mengembangkan modul kalkulator dan tracker menjadi package terisolasi agar siap dikomersialkan sebagai SaaS boilerplate.\n• Menyusun dokumentasi teknis komprehensif guna mempermudah penambahan tim pengembang baru saat agensi berkembang."),
        ("Strategi ST\n(Maxi - Mini)", "• Mengoptimalkan model efisien gemini-3.5-flash dan menerapkan caching respon untuk meminimalkan konsumsi kuota token API.\n• Menangkal serangan prompt injection dengan Out-of-Scope Interceptor dan penegakan System Instruction yang ketat."),
        ("Strategi WT\n(Mini - Mini)", "• Membatasi efek Aura Glow hanya pada perangkat desktop (pointer: fine) guna mencegah degradasi performa pada perangkat mobile.\n• Menyiapkan mekanisme polling transaksi manual sebagai fallback jika webhook callback payment gateway mengalami timeout.")
    ]
    set_table_borders(tbl_tows)
    for r_idx, row in enumerate(tbl_tows.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(tows_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(tows_widths[c_idx])
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
            elif c_idx == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY

    doc.add_page_break()

    # ==================== SECTION 2 ====================
    add_heading_1("2. SCOPE BASELINE & SYSTEM BOUNDARIES")
    
    add_heading_2("2.1 Komponen Ruang Lingkup Termasuk (In-Scope)")
    doc.add_paragraph("Berdasarkan audit fungsionalitas kode sumber, ruang lingkup yang direkayasa terbagi dalam 5 modul inti:\n"
                      "1. Modul Showcase Portofolio: Landing page interaktif React 19 + Inertia.js + TailwindCSS v4, efek Aura Glow kursor, Glassmorphism, Dark/Light Mode, dan animasi Framer Motion v12.\n"
                      "2. Modul Asisten Virtual AI (Google Gemini): Chatbot widget floating, injeksi konteks dinamis dari PostgreSQL (Bio, Projects, Skills, Certificates), Out-of-Scope filter, dan token [CHECK_REPLY:email].\n"
                      "3. Modul Pemesanan Jasa & Live Tracker: Kalkulator harga interaktif (/layanan), submission pesanan (kode PRJ-XXXXXXXX), dan halaman tracking 5 milestone (DP, Desain, Koding, Staging Live, Handover).\n"
                      "4. Modul Rekening Bersama (Escrow Service): Engine deposit rekber, pelepasan dana, sengketa, dan refund terintegrasi webhook Midtrans Snap dan Xendit Invoice.\n"
                      "5. Modul Administrasi & Operasional: Panel Filament v3 pada rute /secret-admin dan controller /admin/* untuk manajemen konten, auto-generate thumbnail WebP, dan inbox balasan pesan.")

    add_heading_2("2.2 Batasan Ruang Lingkup (Out-of-Scope)")
    doc.add_paragraph("Hal-hal berikut dinyatakan secara tegas berada di luar batasan proyek:\n"
                      "• Tidak mencakup arsitektur Multi-Tenant SaaS (sistem didedikasikan tunggal untuk portofolio Ridhwan Anang Ma'ruf).\n"
                      "• Tidak melayani transaksi e-commerce fisik atau integrasi kurir logistik.\n"
                      "• Tidak membangun file kompilasi aplikasi mobile native (menggunakan web responsif lintas perangkat).")

    # ==================== SECTION 3 ====================
    add_heading_1("3. PROJECT GOVERNANCE & RACI MATRIX")
    doc.add_paragraph("Tata kelola proyek dijalankan oleh Tim Triad Rekayasa Perangkat Lunak dengan pembagian peran terstruktur:")

    tbl_raci = doc.add_table(rows=10, cols=4)
    tbl_raci.alignment = WD_TABLE_ALIGNMENT.CENTER
    raci_widths = [3.2, 1.3, 1.2, 1.3]
    raci_data = [
        ("Modul / Komponen Deliverable", "Ridhwan (Lead Dev)", "A (PM / Analyst)", "B (UI/UX Designer)"),
        ("Project Management Plan (PMP) Baseline", "Consulted (C)", "Accountable (A)", "Consulted (C)"),
        ("Figma UI/UX & Design Tokens", "Consulted (C)", "Consulted (C)", "Responsible (R)"),
        ("Core Landing Page (React 19 & Inertia)", "Responsible (R)", "Informed (I)", "Consulted (C)"),
        ("Gemini AI Service & Prompt Engine", "Responsible (R)", "Accountable (A)", "Informed (I)"),
        ("Client Order Calculator & Live Tracker", "Responsible (R)", "Accountable (A)", "Consulted (C)"),
        ("Escrow Service (Midtrans & Xendit)", "Responsible (R)", "Accountable (A)", "Informed (I)"),
        ("Admin Panel Filament (/secret-admin)", "Responsible (R)", "Consulted (C)", "Informed (I)"),
        ("Blackbox Functional QA Suite", "Support (C)", "Responsible (R)", "Consulted (C)"),
        ("Usability Evaluation (SUS Survey)", "Informed (I)", "Consulted (C)", "Responsible (R)")
    ]
    set_table_borders(tbl_raci)
    for r_idx, row in enumerate(tbl_raci.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(raci_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(raci_widths[c_idx])
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
            elif c_idx > 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # ==================== SECTION 4 ====================
    add_heading_1("4. WORK BREAKDOWN STRUCTURE (WBS) & GANTT CHART SCHEDULE")
    doc.add_paragraph("Jadwal pelaksanaan rekayasa sistem portofolio https://ridhwananang.id/ dipetakan ke dalam siklus 16 minggu dengan visualisasi Bagan Gantt solid-bar:")

    # GANTT CHART TABLE (19 columns)
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
        (False, "17", "Dokumentasi Teknis & Panduan Pemeliharaan", "TIM", [15, 16]),
        (False, "18", "Pemeriksaan Kesiapan Operasional Penuh (Go-Live)", "TIM", [16]),
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
    r3 = p3.add_run("Tonggak Kritis Operasional / Production Go-Live")
    r3.font.size = Pt(8.0)
    r3.font.bold = True
    r3.font.color.rgb = COLOR_DARK_TEXT

    for i, w in enumerate(leg_widths):
        tbl_leg.rows[0].cells[i].width = Inches(w)
        tbl_leg.rows[0].cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    doc.add_page_break()

    # ==================== SECTION 5 ====================
    add_heading_1("5. TECHNICAL ARCHITECTURE & COMPONENT BASELINE")
    doc.add_paragraph("Arsitektur perangkat lunak portofolio https://ridhwananang.id/ mengadopsi pola modern monolith dengan integrasi multi-layanan:")

    p_arc1 = doc.add_paragraph()
    p_arc1.add_run("1. Frontend Architecture (React 19 & Inertia.js):\n").bold = True
    p_arc1.add_run("Menggunakan React 19 dengan adapter Inertia.js v3 yang memungkinkan perutean halaman single page application (SPA) langsung dari backend Laravel tanpa membuat REST API terpisah. Styling menggunakan TailwindCSS v4 (@tailwindcss/vite) dengan performa kompilasi instan. Dilengkapi antarmuka interaktif: efek kursor Aura Glow (ambient radial gradient), panel Glassmorphism semi-transparan (backdrop-filter: blur), animasi bertingkat (Motion/Framer Motion v12), dan ikonografi Lucide React.")

    p_arc2 = doc.add_paragraph()
    p_arc2.add_run("2. Backend & CMS Architecture (Laravel 13 & Filament v3):\n").bold = True
    p_arc2.add_run("Ditenagai Laravel 13.x (PHP 8.3+) dengan keamanan Laravel Fortify dan Sanctum. Panel admin dibangun menggunakan Filament v3 pada rute terenkripsi khusus (/secret-admin) untuk mengamankan data dari serangan brute-force URL admin standar. Admin panel melayani pengelolaan Profiles, Projects, Tech Stacks, Certificates (dengan fitur pembuatan thumbnail .webp otomatis), serta Message inbox.")

    p_arc3 = doc.add_paragraph()
    p_arc3.add_run("3. AI Integration Layer (Google Gemini API):\n").bold = True
    p_arc3.add_run("Inti asisten cerdas dikelola oleh GeminiChatService yang berkomunikasi dengan model gemini-3.5-flash. Service ini secara dinamis menyusun System Instruction berbasis data riil profil dan proyek dari database PostgreSQL. Dilengkapi Filter Topik cerdas untuk menolak pertanyaan di luar portofolio, serta pendeteksi token [CHECK_REPLY:email] untuk menampilkan balasan pesan kontak langsung di dalam chat.")

    p_arc4 = doc.add_paragraph()
    p_arc4.add_run("4. Escrow Engine & Database Persistence:\n").bold = True
    p_arc4.add_run("EscrowService mengelola alur deposit, release dana, sengketa, dan refund untuk ProjectOrder dan Quest. Terhubung langsung dengan Midtrans Snap API dan Xendit Invoice. Basis data utama menggunakan PostgreSQL pada Supabase Connection Pooler (AWS ap-southeast-1 Singapura) dengan jaminan integritas transaksi ACID.")

    # ==================== SECTION 6 ====================
    add_heading_1("6. QUALITY ASSURANCE & TESTING PLAN")
    doc.add_paragraph("Strategi penjaminan kualitas menerapkan standar ISO/IEC/IEEE 29119 dengan pendekatan piramida pengujian terintegrasi:")

    add_heading_2("6.1 Pengujian Teknis Otomatis")
    doc.add_paragraph("• Backend Testing (Pest PHP & PHPUnit): Pengujian unit pada service layer, khususnya GeminiChatService dan EscrowService.\n"
                      "• Static Code Analysis (Larastan Level 8): Analisis tipe data statis ketat pada seluruh codebase PHP/Laravel.\n"
                      "• Code Standards (Laravel Pint): Penegakan standar koding PSR-12 secara otomatis sebelum commit.\n"
                      "• Frontend Type Safety (TypeScript): Pemeriksaan tipe kompilasi ketat (tsc --noEmit) pada seluruh komponen React 19.")

    add_heading_2("6.2 Pengujian Fungsionalitas (Blackbox Testing Fitur Riil)")
    tbl_bb = doc.add_table(rows=6, cols=5)
    tbl_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    bb_widths = [1.1, 1.4, 1.9, 1.8, 0.8]
    bb_data = [
        ("Test Case ID", "Modul / Fitur", "Skenario Pengujian", "Hasil yang Diharapkan", "Status"),
        ("TC-AI-01", "AI Chatbot Gemini", "Tanya proyek spesifik: 'Proyek apa yang pakai Laravel?'", "AI menjawab akurat mengambil data Projects dari PostgreSQL", "Passed"),
        ("TC-AI-02", "AI Filter Topik", "Tanya di luar portofolio: 'Bagaimana resep rendang?'", "AI menolak sopan sesuai Out-of-Scope Interceptor", "Passed"),
        ("TC-AI-03", "Status Pesan", "Masukkan email di chat: 'Cek balasan pesan email@test.com'", "Sistem memproses token [CHECK_REPLY] & menampilkan isi balasan", "Passed"),
        ("TC-ADM-01", "Admin Filament", "Upload file sertifikat baru di /secret-admin", "File tersimpan & thumbnail .webp otomatis ter-generate", "Passed"),
        ("TC-SEC-01", "Proteksi Admin", "Akses URL default /admin tanpa autentikasi", "Sistem menampilkan halaman 404 Not Found (URL terisolasi)", "Passed")
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

    add_heading_2("6.3 Pengujian Penerimaan Pengguna (System Usability Scale - SUS)")
    doc.add_paragraph("• Instrumen Pengujian: Menggunakan kuesioner 10 butir System Usability Scale (SUS) John Brooke (1986) berskala Likert 1-5.\n"
                      "• Sampel Uji: 20 responden profesional yang terdiri dari tech recruiters, software engineers, dan tech leads.\n"
                      "• Skenario Evaluasi: Penjelajahan landing page, interaksi widget AI Gemini, pengujian kalkulator layanan, dan pengiriman pesan kontak.\n"
                      "• Target Skor: Nilai rata-rata SUS minimum sebesar 75 (Grade B+ / Good to Excellent), membuktikan kelayakan antarmuka kelas enterprise.")

    # ==================== SECTION 7 ====================
    add_heading_1("7. DEVOPS, DEPLOYMENT & RELEASE MANAGEMENT")
    doc.add_paragraph("Siklus deployment dan pemeliharaan platform https://ridhwananang.id/ diatur melalui prosedur baku:\n"
                      "• Local Development: Laravel Herd dengan PHP 8.3, Node.js 20+, SQLite/PostgreSQL lokal, dan Vite HMR.\n"
                      "• Production Environment: Cloud server teroptimasi dengan sertifikasi SSL/TLS 1.3 dan akselerasi cache Vite.\n"
                      "• Automated Release Steps: composer install --no-dev, npm run build, php artisan migrate --force, php artisan storage:link, dan php artisan config:cache.\n"
                      "• Rollback Protocol: Prosedur rollback commit Git dan migrasi database yang teruji dapat diselesaikan dalam waktu kurang dari 10 menit.")

    # ==================== SECTION 8 ====================
    add_heading_1("8. RISK MANAGEMENT & MITIGATION (ISO 31000)")
    doc.add_paragraph("Manajemen risiko proyek dianalisis menggunakan matriks kuadran formal Probabilitas x Dampak (ISO 31000):")

    tbl_rsk = doc.add_table(rows=6, cols=7)
    tbl_rsk.alignment = WD_TABLE_ALIGNMENT.CENTER
    rsk_widths = [0.8, 1.8, 0.4, 0.4, 0.6, 1.8, 1.2]
    rsk_data = [
        ("ID", "Deskripsi Risiko Rekayasa", "P", "I", "Skor", "Tindakan Mitigasi Preventif", "Penanggung Jawab"),
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

    # ==================== SECTION 9: DOCUMENT CONTROL ====================
    add_heading_1("9. DOCUMENT CONTROL & CONFIGURATION BASELINE")
    doc.add_paragraph("Sebagai pengganti lembar persetujuan statis, dokumen Project Management Plan (PMP) ini dikendalikan melalui konfigurasi kontrol versi formal standar rekayasa perangkat lunak:")

    tbl_ctrl = doc.add_table(rows=4, cols=5)
    tbl_ctrl.alignment = WD_TABLE_ALIGNMENT.CENTER
    ctrl_widths = [0.8, 1.2, 1.4, 1.8, 1.8]
    ctrl_data = [
        ("Versi", "Tanggal Rilis", "Penanggung Jawab", "Status Verifikasi", "Catatan Perubahan Baseline"),
        ("v0.1", "10/06/2026", "A (Project Manager)", "Draft Inception", "Inisiasi ruang lingkup awal portofolio"),
        ("v0.5", "12/08/2026", "Ridhwan (Lead Dev)", "Technical Review", "Integrasi Gemini AI & arsitektur Inertia"),
        ("v1.0", "01/10/2026", "Triad Team Lead", "Approved Baseline", "Rilis penuh: Live Tracker, Escrow, SWOT & Production")
    ]
    set_table_borders(tbl_ctrl)
    for r_idx, row in enumerate(tbl_ctrl.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(ctrl_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(ctrl_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=45, bottom=45, left=55, right=55)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx == 3:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY

    # Save Document
    try:
        doc.save(output_path)
        print(f"Global Standard PMP with SWOT successfully generated at: {output_path}")
    except PermissionError:
        alt_path = output_path.replace(".docx", "_v2.docx")
        doc.save(alt_path)
        print(f"File locked by another process. Successfully saved to fallback: {alt_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Global_Standard.docx"
    create_global_standard_pmp(output_file)
