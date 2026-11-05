import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# Color Palette (Executive Corporate Navy)
COLOR_PRIMARY_HEX = "1E3A8A"      # Deep Navy
COLOR_SECONDARY_HEX = "4F46E5"    # Indigo Accent
COLOR_LIGHT_BG_HEX = "F8FAFC"     # Slate Tint
COLOR_CAT_BG_HEX = "E2E8F0"       # Neutral Category Tint
COLOR_ACCENT_HEX = "F59E0B"       # Amber Gold
COLOR_BORDER_HEX = "CBD5E1"       # Light Slate Border

COLOR_PRIMARY = RGBColor(30, 58, 138)
COLOR_SECONDARY = RGBColor(79, 70, 229)
COLOR_DARK_TEXT = RGBColor(15, 23, 42)
COLOR_MUTED_TEXT = RGBColor(71, 85, 105)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=60, bottom=60, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'  <w:top w:w="{top}" w:type="dxa"/>'
        f'  <w:left w:w="{left}" w:type="dxa"/>'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'  <w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color=COLOR_BORDER_HEX, sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_cell_border_bottom(cell, sz="6", color="000000"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_table_borders_none(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_row_properties(row, height_dxa=None, cant_split=True):
    trPr = row._tr.get_or_add_trPr()
    if cant_split:
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
    if height_dxa:
        trPr.append(parse_xml(f'<w:trHeight {nsdecls("w")} w:val="{height_dxa}" w:hRule="atLeast"/>'))

def create_aligned_pmp_document(output_path):
    doc = Document()

    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)
        sec.header_distance = Inches(0.4)
        sec.footer_distance = Inches(0.4)
        
        # Header
        hdr = sec.header
        p_hdr = hdr.paragraphs[0]
        p_hdr.text = "RENCANA PROYEK (PROJECT MANAGEMENT PLAN) — https://ridhwananang.laravel.cloud/"
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_hdr.runs[0].font.name = "Calibri"
        p_hdr.runs[0].font.size = Pt(8)
        p_hdr.runs[0].font.color.rgb = COLOR_MUTED_TEXT

        # Footer
        ftr = sec.footer
        p_ftr = ftr.paragraphs[0]
        p_ftr.text = "Dokumen Panduan Rencana Proyek | Triad Engineering Pod | Baseline v1.0"
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ftr.runs[0].font.name = "Calibri"
        p_ftr.runs[0].font.size = Pt(8)
        p_ftr.runs[0].font.color.rgb = COLOR_MUTED_TEXT

    # Normal Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10)
    style_normal.font.color.rgb = COLOR_DARK_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(4)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    # ==================== COVER / HEADER PANDUAN ====================
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_pre = p_pre.add_run("PANDUAN TUGAS AKHIR — SOFTWARE ENGINEERING CAPSTONE")
    r_pre.font.name = 'Calibri'
    r_pre.font.size = Pt(10)
    r_pre.font.bold = True
    r_pre.font.color.rgb = COLOR_SECONDARY

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_t1 = p_title.add_run("Portofolio & Freelance Client Service Platform\n")
    r_t1.font.name = 'Calibri'
    r_t1.font.size = Pt(18)
    r_t1.font.bold = True
    r_t1.font.color.rgb = COLOR_PRIMARY
    r_t2 = p_title.add_run("RENCANA PROYEK (PROJECT MANAGEMENT PLAN)")
    r_t2.font.name = 'Calibri'
    r_t2.font.size = Pt(15)
    r_t2.font.bold = True
    r_t2.font.color.rgb = COLOR_SECONDARY

    p_note = doc.add_paragraph()
    p_note.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_note.paragraph_format.space_before = Pt(4)
    p_note.paragraph_format.space_after = Pt(8)
    r_note = p_note.add_run(
        "[Catatan: Dokumen ini berfungsi sebagai panduan rencana proyek resmi. Struktur dan daftar isi "
        "telah diselaraskan secara komprehensif mengikuti standar template panduan proyek (Bab 1 s/d Bab 8), "
        "mengintegrasikan seluruh konteks rekayasa sistem riil: arsitektur modern monolith Laravel 13, React 19 Inertia v3, "
        "asisten cerdas Google Gemini AI, kalkulator layanan, live project tracker, dan payment gateway yang beroperasi aktif "
        "pada https://ridhwananang.laravel.cloud/.]"
    )
    r_note.font.size = Pt(8.5)
    r_note.font.italic = True
    r_note.font.color.rgb = COLOR_MUTED_TEXT

    # Header Metadata Table
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_widths = [2.2, 4.8]
    meta_data = [
        ("Nama Projek", "Portofolio & Freelance Client Service Platform"),
        ("Rencana Proyek", "Rencana Pengelolaan Rekayasa Perangkat Lunak (Software Project Management Plan)"),
        ("Dibuat Oleh", "Yulian (Project Manager & Systems Analyst)"),
        ("Anggota Kelompok", "1. Ridhwan Anang Ma'ruf (Tech Lead — AI Fullstack Developer)\n"
                             "2. Yulian (Project Manager & Systems Analyst)\n"
                             "3. B (UI/UX Designer & Product Researcher)"),
        ("Tanggal Rilis", "01 Oktober 2026 (Operational Baseline v1.0)"),
        ("Sistem Operasional Live", "https://ridhwananang.laravel.cloud/")
    ]
    set_table_borders(tbl_meta)
    for r_idx, row in enumerate(tbl_meta.rows):
        for c_idx, val in enumerate(meta_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(meta_widths[c_idx])
            set_cell_background(cell, COLOR_LIGHT_BG_HEX if c_idx == 0 else "FFFFFF")
            set_cell_margins(cell, top=45, bottom=45, left=65, right=65)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.0)
            if c_idx == 0:
                run.font.bold = True
                run.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==================== DAFTAR ISI ====================
    add_h2("Daftar Isi")
    tbl_toc = doc.add_table(rows=18, cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_widths = [6.0, 1.0]
    toc_data = [
        ("1  Pendahuluan", "2"),
        ("   1.1  Tujuan (Sasaran Strategis, OKRs, & Analisis 5W + 1H)", "2"),
        ("   1.2  Ruang Lingkup (In-Scope & Out-of-Scope)", "3"),
        ("   1.3  Referensi Standar Rekayasa Perangkat Lunak", "3"),
        ("   1.4  Konteks Strategis: Analisis SWOT & Matriks TOWS", "3"),
        ("2  Rencana Keterlibatan Pemangku Kepentingan", "5"),
        ("   2.1  Rencana Keterlibatan Tim (Peran, Tanggung Jawab & Deliverables)", "5"),
        ("   2.2  Matriks Tata Kelola RACI", "6"),
        ("3  Risiko dan Kontingensi", "7"),
        ("4  Pemantauan dan Pengendalian Proyek", "8"),
        ("   4.1  Jadwal Proyek (Bagan Gantt 16 Minggu Solid-Bar)", "8"),
        ("   4.2  Jalur Kritis (Critical Path)", "10"),
        ("        4.2.1  Tugas dan Kegiatan Jalur Kritis", "10"),
        ("5  Metodologi Pengujian", "11"),
        ("   5.1  Ruang Lingkup Uji", "11"),
        ("   5.2  Strategi Pengujian (Sistem/Blackbox, Unit/Pest, Kinerja, SUS Usability)", "11"),
        ("   5.3  Alat Pengujian (Testing Tools Suite)", "13"),
        ("6  Metodologi Implementasi", "14"),
        ("   6.1  Prasyarat Lingkungan & Dependensi", "14"),
        ("   6.2  Data & Lingkungan Produksi", "14"),
        ("   6.3  Dokumentasi Teknis & Rollback Protocol", "15"),
        ("7  Asumsi", "15"),
        ("8  Lampiran", "16"),
        ("   8.1  Lampiran A : Tanda Tangan Persetujuan Proyek", "16"),
        ("   8.2  Lampiran B : Dokumen Lain & Sejarah Dokumen", "17")
    ]
    # Re-dim table to match len(toc_data)
    # Clear and rebuild TOC rows
    set_table_borders(tbl_toc)
    # Adjust tbl_toc rows if needed
    while len(tbl_toc.rows) < len(toc_data):
        tbl_toc.add_row()
    while len(tbl_toc.rows) > len(toc_data):
        tbl_toc._tbl.remove(tbl_toc.rows[-1]._tr)

    for r_idx, (sec_title, page_num) in enumerate(toc_data):
        row = tbl_toc.rows[r_idx]
        set_row_properties(row, height_dxa=180)
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = Inches(toc_widths[0]), Inches(toc_widths[1])
        set_cell_background(c0, COLOR_LIGHT_BG_HEX if not sec_title.startswith("   ") else "FFFFFF")
        set_cell_background(c1, COLOR_LIGHT_BG_HEX if not sec_title.startswith("   ") else "FFFFFF")
        set_cell_margins(c0, top=20, bottom=20, left=40, right=40)
        set_cell_margins(c1, top=20, bottom=20, left=40, right=40)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(sec_title)
        r0.font.name = 'Calibri'
        r0.font.size = Pt(8.5)
        if not sec_title.startswith("   "):
            r0.font.bold = True
            r0.font.color.rgb = COLOR_PRIMARY
            
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r1 = p1.add_run(page_num)
        r1.font.name = 'Calibri'
        r1.font.size = Pt(8.5)
        if not sec_title.startswith("   "):
            r1.font.bold = True

    doc.add_page_break()

    # ==================== BAB 1: PENDAHULUAN ====================
    add_h1("1  Pendahuluan")
    doc.add_paragraph(
        "Tujuan dari rencana proyek ini adalah untuk mendeskripsikan seluruh aktivitas teknis, manajerial, dan "
        "organisasional dalam rekayasa platform portofolio digital dan freelance client hub guna menjamin ketercapaian "
        "kualitas perangkat lunak berstandar global. Dokumen ini menjadi acuan tunggal (single source of truth) "
        "bagi tim pengembang, analis, dan pemangku kepentingan dalam memantau siklus hidup rekayasa sistem yang "
        "dioperasikan secara aktif pada https://ridhwananang.laravel.cloud/."
    )

    add_h2("1.1  Tujuan")
    doc.add_paragraph(
        "Tujuan rekayasa sistem portofolio digital ini didefinisikan secara komprehensif melalui kerangka analisis "
        "5W + 1H serta penetapan Sasaran Strategis (Objectives and Key Results / OKRs):"
    )

    p_w1 = doc.add_paragraph()
    p_w1.add_run("1. WHAT (Apa Sistem yang Direkayasa?):\n").bold = True
    p_w1.add_run(
        "Platform perangkat lunak yang direkayasa adalah portal portofolio interaktif dan client project management "
        "berbasis web modern (https://ridhwananang.laravel.cloud/). Sistem mengintegrasikan monolit modern Laravel 13 "
        "dan React 19 via Inertia.js v3, ditenagai oleh asisten virtual cerdas berbasis LLM (Google Gemini API "
        "gemini-3.5-flash), sistem pemesanan jasa mandiri (/layanan), live tracker pengerjaan proyek 5-milestone "
        "(/track-project/{tracking_code}), sistem rekening bersama (Escrow Service) terintegrasi payment gateway "
        "(Midtrans / Xendit), serta panel administrasi konten terisolasi (/secret-admin)."
    )

    p_w2 = doc.add_paragraph()
    p_w2.add_run("2. WHY (Mengapa Sistem Ini Wajib Dibangun?):\n").bold = True
    p_w2.add_run(
        "Portofolio digital konvensional berbasis resume statis (PDF atau website HTML kaku) memiliki kelemahan mendasar: "
        "bersifat pasif, satu arah, dan tidak efisien bagi tech recruiters maupun klien global yang memiliki waktu evaluasi "
        "sangat terbatas (rata-rata 30-60 detik). Pengunjung kesulitan memverifikasi kecocokan kompetensi teknis secara instan "
        "(misal: 'Apakah Ridhwan berpengalaman menangani PostgreSQL dan React 19?'). Selain itu, dalam alur kerja freelance, "
        "sering terjadi ketidakpastian biaya dan sengketa pembayaran. Oleh karena itu, diperlukan platform interaktif yang "
        "dilengkapi asisten AI kontekstual 24/7, kalkulator harga transparan, serta sistem Escrow rekber terpercaya."
    )

    p_w3 = doc.add_paragraph()
    p_w3.add_run("3. WHO (Siapa yang Terlibat dan Menjadi Target Pengguna?):\n").bold = True
    p_w3.add_run(
        "• Tim Rekayasa Pengembang (Triad): Ridhwan Anang Ma'ruf (Tech Lead & Fullstack Developer), Yulian (Project Manager & "
        "Systems Analyst), dan B (UI/UX Designer & Product Researcher).\n"
        "• Target Pengguna Eksternal: Tech Recruiters, Talent Acquisition Specialists, Engineering Managers, serta Klien Bisnis pemberi proyek freelance.\n"
        "• Administrator Internal: Ridhwan Anang Ma'ruf sebagai pemilik sistem yang mengontrol konten portofolio, sertifikat, proyek, dan membalas pesan masuk."
    )

    p_w4 = doc.add_paragraph()
    p_w4.add_run("4. WHEN (Kapan Proyek Direkayasa dan Beroperasi?):\n").bold = True
    p_w4.add_run(
        "Proyek direkayasa selama siklus 16 minggu menggunakan metodologi Agile Scrum 4 Sprint. Saat ini sistem telah mencapai "
        "rilis operasional penuh (Production Live) dan beroperasi aktif secara online di domain resmi https://ridhwananang.laravel.cloud/."
    )

    p_w5 = doc.add_paragraph()
    p_w5.add_run("5. WHERE (Di Mana Sistem Diterapkan dan Diakses?):\n").bold = True
    p_w5.add_run(
        "• Client-Side: Diakses global melalui browser web modern (desktop dan smartphone responsif).\n"
        "• Server-Side: Berjalan pada arsitektur cloud server teroptimasi Vite 8 dan PHP 8.3.\n"
        "• Basis Data Terpusat: Cloud PostgreSQL pada Supabase Connection Pooler (AWS ap-southeast-1 Singapura) untuk latensi jaringan minimal.\n"
        "• Layanan AI: Terhubung langsung ke Google AI Studio / Google Cloud API Gateway."
    )

    p_h1 = doc.add_paragraph()
    p_h1.add_run("6. HOW (Bagaimana Sistem Ini Dirancang dan Direkayasa?):\n").bold = True
    p_h1.add_run(
        "Sistem direkayasa menggunakan arsitektur monolit modern via adapter Inertia.js yang menghubungkan controller Laravel 13 "
        "langsung ke komponen React 19. Untuk asisten virtual, GeminiChatService mengimplementasikan pendekatan RAG-lite dinamis: "
        "mengekstraksi data riil Bio, Skills, Projects, dan Certificates dari database PostgreSQL untuk diinjeksi ke System Instruction "
        "Gemini. Dilengkapi Out-of-Scope Interceptor untuk memfilter pertanyaan di luar portofolio, token parsing [CHECK_REPLY:email] "
        "untuk pengecekan status balasan pesan kontak langsung di chat, live project tracker 5-milestone berbasis kode unik PRJ-XXXXXXXX, "
        "serta EscrowService yang terintegrasi dengan payment gateway."
    )

    add_h3("Sasaran Strategis & Metrik Keberhasilan Terukur (OKRs / KPIs)")
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

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_h2("1.2  Ruang Lingkup")
    doc.add_paragraph(
        "Rencana proyek ini menjelaskan tanggung jawab, metodologi, tonggak kualitas proyek, serta batasan fungsional "
        "yang mencakup item berikut:"
    )
    p_sc1 = doc.add_paragraph()
    p_sc1.add_run("A. Komponen Ruang Lingkup Termasuk (In-Scope):\n").bold = True
    p_sc1.add_run(
        "1. Modul Showcase Portofolio: Landing page interaktif React 19 + Inertia.js + TailwindCSS v4, efek Aura Glow kursor, Glassmorphism, Dark/Light Mode, dan animasi Framer Motion v12.\n"
        "2. Modul Asisten Virtual AI (Google Gemini): Chatbot widget floating, injeksi konteks dinamis dari PostgreSQL (Bio, Projects, Skills, Certificates), Out-of-Scope filter, dan token [CHECK_REPLY:email].\n"
        "3. Modul Pemesanan Jasa & Live Tracker: Kalkulator harga interaktif (/layanan), submission pesanan (kode PRJ-XXXXXXXX), dan halaman tracking 5 milestone (DP, Desain, Koding, Staging Live, Handover).\n"
        "4. Modul Payment Gateway: Layanan transaksi untuk pembayaran aman menggunakan payment gateway seperti Xendit atau Midtrans.\n"
        "5. Modul Administrasi & Operasional: Panel admin untuk manajemen konten portofolio, auto-generate thumbnail WebP, dan inbox balasan pesan."
    )
    p_sc2 = doc.add_paragraph()
    p_sc2.add_run("B. Batasan Ruang Lingkup (Out-of-Scope):\n").bold = True
    p_sc2.add_run(
        "• Tidak mencakup arsitektur Multi-Tenant SaaS (sistem didedikasikan tunggal untuk portofolio Ridhwan Anang Ma'ruf).\n"
        "• Tidak melayani transaksi e-commerce produk fisik atau integrasi kurir logistik fisik.\n"
        "• Tidak membangun file kompilasi aplikasi mobile native terpisah (menggunakan web responsif lintas perangkat)."
    )

    add_h2("1.3  Referensi")
    doc.add_paragraph(
        "Penyusunan rencana proyek, metodologi pengujian, manajemen risiko, dan arsitektur sistem merujuk pada standar global rekayasa perangkat lunak:\n"
        "1. IEEE Std 1058-1998: Standard for Software Project Management Plans (SPMP).\n"
        "2. Project Management Institute (PMI): A Guide to the Project Management Body of Knowledge (PMBOK Guide 7th Edition).\n"
        "3. ISO/IEC/IEEE 12207:2017: Systems and software engineering — Software life cycle processes.\n"
        "4. ISO/IEC/IEEE 29119: Software Testing Standards (Unit, System, and Acceptance Testing).\n"
        "5. ISO 31000:2018: Risk Management — Guidelines.\n"
        "6. Dokumentasi Spesifikasi Kebutuhan Perangkat Lunak (SRS) Portofolio Digital v1.0."
    )

    add_h2("1.4  Konteks Strategis: Analisis SWOT & Matriks TOWS")
    doc.add_paragraph(
        "Analisis SWOT mengevaluasi posisi kompetitif, kelayakan rekayasa internal, serta peluang dan ancaman eksternal sistem:"
    )

    tbl_swot = doc.add_table(rows=4, cols=2)
    tbl_swot.alignment = WD_TABLE_ALIGNMENT.CENTER
    swot_widths = [3.5, 3.5]
    swot_data = [
        ("FAKTOR KEKUATAN INTERNAL (STRENGTHS)", "FAKTOR KELEMAHAN INTERNAL (WEAKNESSES)"),
        ("• S1. Arsitektur Modern Monolith (Laravel 13 + React 19 Inertia v3) tanpa overhead REST API terpisah.\n"
         "• S2. Asisten AI Kontekstual (Gemini 3.5 Flash RAG-lite) membaca data riil dari PostgreSQL.\n"
         "• S3. Ekosistem Transaksi Freelance Lengkap (Kalkulator biaya, Live Tracker 5-milestone, Payment Gateway).\n"
         "• S4. UI/UX Premium (Aura Glow radial cursor, Glassmorphism, Dark Mode, Framer Motion v12).\n"
         "• S5. Panel Admin Terisolasi (/secret-admin) mereduksi risiko serangan brute force.",
         "• W1. Bottleneck Pengembang Tunggal: Ridhwan memegang peran ganda (Tech Lead, Fullstack, DevOps).\n"
         "• W2. Ketergantungan Multi-Vendor Cloud Latency (Supabase Singapura, Google AI Studio, Payment Gateway).\n"
         "• W3. Arsitektur Single-Tenant: Didesain spesifik portofolio Ridhwan, belum multi-tenant SaaS.\n"
         "• W4. Beban Grafis Perangkat Klien: Efek blur & animasi radial glow membutuhkan GPU/CPU memadai."),
        ("PELUANG PENGEMBANGAN EKSTERNAL (OPPORTUNITIES)", "ANCAMAN & TANTANGAN EKSTERNAL (THREATS)"),
        ("• O1. Tingginya Kebutuhan Industri Global akan Developer Fullstack berkemampuan integrasi AI.\n"
         "• O2. Skalabilitas Portofolio Menjadi Agensi Software Mandiri (Boutique Software House).\n"
         "• O3. Peluang Peningkatan ke Gemini Multimodal (Voice chat interaktif & analisis PDF brief proyek).\n"
         "• O4. Potensi Komersialisasi Starter Kit / Open-Source Template portofolio modern.",
         "• T1. Risiko Fluktuasi Kuota & Rate Limit API Google Gemini pada lonjakan trafik tinggi.\n"
         "• T2. Potensi Serangan Prompt Injection untuk memanipulasi obrolan chatbot AI.\n"
         "• T3. Risiko Kegagalan Webhook Callback Pembayaran (Inkonsistensi status transaksi pesanan).\n"
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
            set_cell_margins(cell, top=45, bottom=45, left=65, right=65)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            if is_hdr:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # TOWS Matrix
    add_h3("Matriks Strategi TOWS (Actionable Strategy Matrix)")
    tbl_tows = doc.add_table(rows=5, cols=2)
    tbl_tows.alignment = WD_TABLE_ALIGNMENT.CENTER
    tows_widths = [1.8, 5.2]
    tows_data = [
        ("Kategori Strategi", "Rencana Aksi Strategis Rekayasa & Operasional"),
        ("Strategi SO\n(Maxi - Maxi)", "• Memanfaatkan keunggulan teknologi Laravel 13 + React 19 dan AI Gemini untuk memenangkan proyek freelance bernilai tinggi dari klien internasional.\n• Mempromosikan fitur Live Project Tracker dan Payment Gateway sebagai diferensiasi transparansi kerja agensi."),
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

    # ==================== BAB 2: RENCANA KETERLIBATAN PEMANGKU KEPENTINGAN ====================
    add_h1("2  Rencana Keterlibatan Pemangku Kepentingan")
    doc.add_paragraph(
        "Peran dan tanggung jawab yang terlibat bertugas mengendalikan kualitas perangkat lunak, ketepatan jadwal, "
        "serta keandalan seluruh deliverable proyek. Berikut adalah rencana keterlibatan tim dan pemangku kepentingan "
        "dalam proyek Portofolio & Freelance Client Service Platform:"
    )

    add_h2("2.1  Rencana Keterlibatan Tim")
    tbl_team = doc.add_table(rows=5, cols=5)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    team_widths = [0.4, 1.4, 1.4, 2.3, 1.5]
    team_data = [
        ("No", "Nama", "Peran", "Tanggung Jawab", "Deliverables"),
        ("1", "Yulian", "Manajer Proyek & Analis Sistem",
         "• Lakukan aktivitas perencanaan proyek & jadwal WBS\n"
         "• Komunikasikan kemajuan proyek kepada semua stakeholder\n"
         "• Fasilitasi pertemuan evaluasi sprint & penutupan\n"
         "• Kembangkan Spesifikasi Kebutuhan Perangkat Lunak (SRS)\n"
         "• Lakukan verifikasi dan Blackbox Functional Testing\n"
         "• Kelola risiko proyek & pangkalan data cacat/isu",
         "• Jadwal Proyek & WBS\n"
         "• Dokumen Rencana Proyek (PMP)\n"
         "• Spesifikasi Kebutuhan (SRS)\n"
         "• Laporan Blackbox Testing"),
        ("2", "Ridhwan Anang Ma'ruf", "Tech Lead & Fullstack Engineer",
         "• Rancang arsitektur modern monolit (Laravel 13 & React 19)\n"
         "• Implementasikan Gemini AI Service & Dynamic Context\n"
         "• Kembangkan modul Kalkulator Jasa, Tracker & Payment Gateway\n"
         "• Bangun panel admin terisolasi & upload WebP otomatis\n"
         "• Lakukan Unit Testing (Pest PHP) & Static Analysis\n"
         "• Kelola basis data Supabase & deployment ke cloud server",
         "• Kode Sumber (Source Code)\n"
         "• Skrip Migrasi DB Supabase\n"
         "• Layanan AI GeminiChatService\n"
         "• Integrasi Payment Gateway\n"
         "• Hasil Uji Unit (Pest PHP)\n"
         "• Live Production Deployment"),
        ("3", "B", "Desainer UI/UX & Riset Produk",
         "• Rancang Figma Design System & Glassmorphism\n"
         "• Buat efek interaktif Aura Glow & animasi Framer Motion\n"
         "• Rancang antarmuka widget chat AI & kalkulator layanan\n"
         "• Pastikan konsistensi Dark/Light mode & responsivitas web\n"
         "• Lakukan pengujian kegunaan System Usability Scale (SUS)",
         "• Prototipe Figma UI/UX\n"
         "• Design Tokens & Aset Visual\n"
         "• Kuesioner & Laporan Hasil Evaluasi Usability (SUS)"),
        ("4", "Klien & Tech Recruiters", "Pemangku Kepentingan Eksternal",
         "• Akses dan evaluasi platform portofolio secara mandiri\n"
         "• Lakukan interaksi dengan asisten AI untuk memverifikasi skill\n"
         "• Uji alur pemesanan jasa (/layanan) dan pelacakan milestone\n"
         "• Berikan umpan balik evaluasi kegunaan dan penerimaan",
         "• Respon Kuesioner SUS\n"
         "• Umpan Balik Validasi Fitur\n"
         "• Konfirmasi Transaksi / Order")
    ]
    set_table_borders(tbl_team)
    for r_idx, row in enumerate(tbl_team.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(team_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(team_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=45, bottom=45, left=55, right=55)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_h2("2.2  Matriks Tata Kelola RACI")
    doc.add_paragraph("Matriks RACI (Responsible, Accountable, Consulted, Informed) menegaskan akuntabilitas kerja tim:")
    tbl_raci = doc.add_table(rows=10, cols=4)
    tbl_raci.alignment = WD_TABLE_ALIGNMENT.CENTER
    raci_widths = [3.2, 1.3, 1.2, 1.3]
    raci_data = [
        ("Modul / Komponen Deliverable", "Ridhwan (Lead Dev)", "Yulian (PM / Analyst)", "B (UI/UX Designer)"),
        ("Project Management Plan (PMP) Baseline", "Consulted (C)", "Accountable (A)", "Consulted (C)"),
        ("Figma UI/UX & Design Tokens", "Consulted (C)", "Consulted (C)", "Responsible (R)"),
        ("Core Landing Page (React 19 & Inertia)", "Responsible (R)", "Informed (I)", "Consulted (C)"),
        ("Gemini AI Service & Prompt Engine", "Responsible (R)", "Accountable (A)", "Informed (I)"),
        ("Client Order Calculator & Live Tracker", "Responsible (R)", "Accountable (A)", "Consulted (C)"),
        ("Payment Gateway (Midtrans & Xendit)", "Responsible (R)", "Accountable (A)", "Informed (I)"),
        ("Admin Panel Terisolasi (/secret-admin)", "Responsible (R)", "Consulted (C)", "Informed (I)"),
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
            set_cell_margins(cell, top=40, bottom=40, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
            elif c_idx > 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # ==================== BAB 3: RISIKO DAN KONTINGENSI ====================
    add_h1("3  Risiko dan Kontingensi")
    doc.add_paragraph(
        "Seluruh potensi risiko teknis dan operasional yang dapat mempengaruhi jadwal, kualitas, serta keamanan sistem "
        "telah diidentifikasi dan direncanakan tindakan kontingensinya menggunakan standar ISO 31000:"
    )

    tbl_rsk = doc.add_table(rows=7, cols=6)
    tbl_rsk.alignment = WD_TABLE_ALIGNMENT.CENTER
    rsk_widths = [0.4, 1.1, 1.1, 1.6, 1.4, 1.4]
    rsk_data = [
        ("No", "Tanggal Identifikasi", "Fase Proyek", "Risiko", "Dampak", "Tindakan Mitigasi"),
        ("1", "15-Juni-2026", "Fase Inisiasi & Desain",
         "Keterbatasan kuota & fluktuasi rate limit API Google Gemini",
         "Kegagalan respon chatbot AI saat lonjakan trafik pengunjung",
         "Gunakan model efisien gemini-3.5-flash, terapkan caching respon lokal, siapkan graceful error fallback."),
        ("2", "22-Juni-2026", "Fase Koding & AI",
         "Serangan Prompt Injection dan upaya manipulasi chat AI",
         "Chatbot menjawab di luar konteks portofolio / membocorkan instruksi",
         "Terapkan Out-of-Scope Interceptor dan System Instruction dinamis yang dikunci dari database PostgreSQL."),
        ("3", "10-Juli-2026", "Fase Backend & DB",
         "Koneksi cloud database Supabase mengalami network timeout",
         "Halaman web gagal merender daftar proyek dan skill pengembang",
         "Gunakan Supabase Connection Pooler port 5432 regional Singapura dan sediakan query caching lokal."),
        ("4", "20-Juli-2026", "Fase Frontend UI",
         "Animasi Aura Glow dan Glassmorphism memicu frame drop",
         "Performa scroll melambat pada perangkat hardware spesifikasi rendah",
         "Gunakan akselerasi GPU CSS (will-change) dan batasi efek ambient glow hanya pada pointer desktop (pointer: fine)."),
        ("5", "05-Agustus-2026", "Fase Integrasi Payment",
         "Kegagalan webhook callback notifikasi dari Payment Gateway",
         "Inkonsistensi status pembayaran DP pada live tracker proyek",
         "Terapkan validasi signature webhook yang ketat dan buat fitur pengecekan status manual (polling fallback)."),
        ("6", "15-Agustus-2026", "Fase Rilis & Security",
         "Upaya serangan brute force URL terhadap panel administrasi",
         "Potensi kompromi kredensial admin dan manipulasi konten",
         "Isolasi rute panel admin ke /secret-admin, terapkan proteksi Laravel Fortify, Sanctum, dan rate limiting ketat.")
    ]
    set_table_borders(tbl_rsk)
    for r_idx, row in enumerate(tbl_rsk.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(rsk_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(rsk_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=40, bottom=40, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # ==================== BAB 4: PEMANTAUAN DAN PENGENDALIAN PROYEK ====================
    add_h1("4  Pemantauan dan Pengendalian Proyek")
    doc.add_paragraph(
        "Pemantauan kemajuan rekayasa perangkat lunak dikendalikan menggunakan metodologi Agile Scrum 4 Sprint "
        "yang dipetakan ke dalam siklus 16 minggu, dilengkapi penentuan Jalur Kritis (Critical Path) dan tonggak pencapaian."
    )

    add_h2("4.1  Jadwal Proyek (Bagan Gantt 16 Minggu Solid-Bar)")
    doc.add_paragraph("Visualisasi durasi pengerjaan aktivitas proyek selama 16 minggu:")

    # GANTT CHART TABLE (19 columns)
    col_widths = [0.35, 2.75, 0.60] + [0.2125] * 16
    gantt_data = [
        (True, "", "FASE 1: INISIASI, RISET & SPRINT 0", "", []),
        (False, "1", "Penyusunan SRS & User Stories Portofolio", "Yulian", [1, 2]),
        (False, "2", "Riset UI Glassmorphism & Figma Design System", "Yulian", [2, 3]),
        (False, "3", "Setup Laravel 13, React 19, Inertia & Supabase", "Ridhwan", [2, 3]),
        (False, "4", "Penyusunan Product Backlog & Sprint 1 Plan", "TIM", [3]),
        
        (True, "", "FASE 2: SIKLUS SPRINT PENGEMBANGAN", "", []),
        (False, "5", "Sprint 1: Desain Landing Page, Bio & Projects", "Yulian", [4]),
        (False, "6", "Sprint 1: Implementasi Backend & Frontend React", "Ridhwan", [4, 5, 6]),
        (False, "7", "Sprint 1: Blackbox Testing & Review Iterasi 1", "Yulian", [6, 7]),
        (False, "8", "Sprint 2: Desain Widget AI Chatbot & Modal Kontak", "B", [7, 8]),
        (False, "9", "Sprint 2: Koding Gemini AI Service & Filter Topik", "Ridhwan", [8, 9, 10]),
        (False, "10", "Sprint 2: Testing Akurasi AI & Review Iterasi 2", "Yulian", [10]),
        (False, "11", "Sprint 3: Desain Dashboard Admin Filament v3", "B", [11]),
        (False, "12", "Sprint 3: Admin /secret-admin & WebP Upload", "Ridhwan", [11, 12]),
        (False, "13", "Sprint 3: Regression Test & Feature Complete", "Yulian", [12, 13]),

        (True, "", "FASE 3: PENGUJIAN AKHIR & LIVE DEPLOYMENT", "", []),
        (False, "14", "Pengujian Fungsional Blackbox Menyeluruh", "Yulian", [14]),
        (False, "15", "Pengujian Usability (System Usability Scale - SUS)", "B", [14]),
        (False, "16", "Cloud Production Deployment di ridhwananang.laravel.cloud", "Ridhwan", [15]),
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

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4.2 Jalur Kritis (Critical Path)
    add_h2("4.2  Jalur Kritis (Critical Path)")
    doc.add_paragraph(
        "Jalur Kritis mengidentifikasi urutan aktivitas beruntun yang tidak memiliki toleransi keterlambatan (zero float). "
        "Keterlambatan pada aktivitas jalur kritis secara langsung memicu mundurnya tanggal rilis operasional produksi (Go-Live). "
        "Jalur kritis proyek mencakup rantai: Penyusunan SRS -> Setup Arsitektur Dasar -> Sprint 1 Core -> Sprint 2 Gemini AI -> "
        "Sprint 3 Payment Gateway -> Uji Fungsional & SUS -> Cloud Production Deployment."
    )

    add_h3("4.2.1  Tugas dan Kegiatan Jalur Kritis")
    tbl_cp = doc.add_table(rows=8, cols=5)
    tbl_cp.alignment = WD_TABLE_ALIGNMENT.CENTER
    cp_widths = [1.8, 1.2, 1.2, 1.2, 1.6]
    cp_data = [
        ("Tugas", "PIC", "Peran", "Tonggak Sejarah", "Catatan"),
        ("Finalisasi SRS & User Stories", "Yulian", "Manajer Proyek", "Minggu 2", "Dasar arsitektur dan ruang lingkup koding"),
        ("Setup Framework & Database Supabase", "Ridhwan", "Tech Lead", "Minggu 3", "Konektivitas monolit Laravel 13 & React 19"),
        ("Pengembangan Core Showcase Landing Page", "Ridhwan", "Lead Developer", "Minggu 6", "Penyelesaian Sprint 1 & Blackbox Iterasi 1"),
        ("Integrasi Gemini AI & Filter Topik", "Ridhwan", "Fullstack Dev", "Minggu 10", "Penyelesaian Sprint 2 & Uji Akurasi AI"),
        ("Integrasi Payment Gateway & Live Tracker", "Ridhwan", "Fullstack Dev", "Minggu 13", "Penyelesaian Sprint 3 & Feature Complete"),
        ("Uji Fungsional Menyeluruh & Usability SUS", "Yulian & B", "QA & UI/UX", "Minggu 14", "Validasi kelayakan rilis (Skor SUS ≥ 75)"),
        ("Cloud Production Deployment & Go-Live", "TIM", "Triad Team", "Minggu 16", "Sistem operasional aktif di domain produksi")
    ]
    set_table_borders(tbl_cp)
    for r_idx, row in enumerate(tbl_cp.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(cp_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(cp_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=40, bottom=40, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx in [1, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # ==================== BAB 5: METODOLOGI PENGUJIAN ====================
    add_h1("5  Metodologi Pengujian")
    doc.add_paragraph(
        "Tujuan dari rencana pengujian adalah memvalidasi bahwa seluruh komponen sistem bekerja sesuai spesifikasi kebutuhan, "
        "bebas dari cacat kritis, memiliki tingkat keamanan tinggi, serta memberikan pengalaman pengguna yang unggul (ISO/IEC/IEEE 29119)."
    )

    add_h2("5.1  Ruang Lingkup Uji")
    doc.add_paragraph(
        "• Item yang Diuji: Komponen interaktif React 19, routing Inertia v3, akurasi asisten Gemini AI, efektivitas Out-of-Scope Interceptor, "
        "kalkulator estimasi biaya jasa, sistem live tracker 5-milestone, webhook payment gateway, otentikasi admin panel, performa Core Web Vitals.\n"
        "• Item yang Tidak Diuji: Layanan multi-tenant SaaS pihak ketiga, transaksi fisik/logistik, dan aplikasi native mobile iOS/Android."
    )

    add_h2("5.2  Strategi Pengujian")
    doc.add_paragraph(
        "Pendekatan pengujian menerapkan piramida pengujian terintegrasi yang mencakup 4 pilar pengujian:"
    )

    # 1. Pengujian Sistem (BlackBox)
    add_h3("A. Pengujian Sistem (BlackBox Functional Testing)")
    doc.add_paragraph(
        "Tujuan: Memvalidasi fungsionalitas end-to-end terhadap spesifikasi SRS tanpa melihat struktur kode internal.\n"
        "Kriteria Masuk: Fitur telah selesai dikompilasi pada branch staging dan lolos syntax linter.\n"
        "Teknik: Blackbox testing menggunakan matriks skenario kasus uji dengan parameter input dan output terukur.\n"
        "Kriteria Keluar: 100% kasus uji blackbox berstatus Passed dan tidak ada defect dengan keparahan High/Critical."
    )
    tbl_bb = doc.add_table(rows=6, cols=5)
    tbl_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    bb_widths = [1.1, 1.4, 1.9, 1.8, 0.8]
    bb_data = [
        ("Test Case ID", "Modul / Fitur", "Skenario Pengujian", "Hasil yang Diharapkan", "Status"),
        ("TC-AI-01", "AI Chatbot Gemini", "Tanya proyek spesifik: 'Proyek apa yang pakai Laravel?'", "AI menjawab akurat mengambil data Projects dari PostgreSQL", "Passed"),
        ("TC-AI-02", "AI Filter Topik", "Tanya di luar portofolio: 'Bagaimana resep rendang?'", "AI menolak sopan sesuai Out-of-Scope Interceptor", "Passed"),
        ("TC-AI-03", "Status Pesan", "Masukkan email di chat: 'Cek balasan pesan email@test.com'", "Sistem memproses token [CHECK_REPLY] & menampilkan isi balasan", "Passed"),
        ("TC-ADM-01", "Admin Panel", "Upload file sertifikat baru di panel admin", "File tersimpan & thumbnail .webp otomatis ter-generate", "Passed"),
        ("TC-SEC-01", "Proteksi Admin", "Akses URL default /admin tanpa autentikasi", "Sistem menampilkan halaman 404 Not Found (URL terisolasi)", "Passed")
    ]
    set_table_borders(tbl_bb)
    for r_idx, row in enumerate(tbl_bb.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(bb_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(bb_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=40, bottom=40, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 4:
                run.font.bold = True
                run.font.color.rgb = RGBColor(16, 120, 50)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().paragraph_format.space_after = Pt(3)

    # 2. Pengujian Unit
    add_h3("B. Pengujian Unit (Unit / WhiteBox Testing)")
    doc.add_paragraph(
        "Tujuan: Memvalidasi logika metode dan service layer terkecil pada backend PHP 8.3 & Laravel 13.\n"
        "Kriteria Masuk: Kode metode telah selesai ditulis bersamaan dengan unit test runner.\n"
        "Teknik: Automated WhiteBox testing menggunakan Pest PHP framework dan PHPUnit.\n"
        "Kriteria Keluar: Seluruh unit test suite lulus 100% tanpa error pada service GeminiChatService dan webhook payment handler."
    )

    # 3. Pengujian Kinerja
    add_h3("C. Pengujian Kinerja (Performance & Core Web Vitals)")
    doc.add_paragraph(
        "Tujuan: Memvalidasi kestabilan, kecepatan respon, dan efisiensi rendering halaman saat diakses publik.\n"
        "Kriteria Masuk: Sistem telah ter-deploy pada cloud server dengan aset yang dikompilasi via Vite 8.\n"
        "Teknik: Pengujian metrik Core Web Vitals menggunakan Google Lighthouse dan benchmarking latensi API Gemini.\n"
        "Kriteria Keluar: LCP (Largest Contentful Paint) < 1.8 detik, CLS < 0.05, latensi respon Gemini AI < 2.5 detik, dan animasi 60 FPS stabil."
    )

    # 4. Pengujian Penerimaan Pengguna
    add_h3("D. Pengujian Penerimaan Pengguna (System Usability Scale - SUS)")
    doc.add_paragraph(
        "Tujuan: Mengukur tingkat kepuasan, kemudahan navigasi, dan kegunaan antarmuka pengguna secara kuantitatif.\n"
        "Metode & Sampel: Menggunakan kuesioner baku 10 butir SUS (John Brooke, 1986) berskala Likert 1-5 kepada 20 responden profesional "
        "(tech recruiters, software engineers, dan tech leads).\n"
        "Target Skor: Nilai rata-rata skor SUS ≥ 75 (Grade B+ / Kategori Good to Excellent), membuktikan kelayakan antarmuka profesional."
    )

    add_h2("5.3  Alat Pengujian")
    tbl_tool = doc.add_table(rows=7, cols=5)
    tbl_tool.alignment = WD_TABLE_ALIGNMENT.CENTER
    tool_widths = [0.4, 1.5, 1.5, 2.6, 1.0]
    tool_data = [
        ("No", "Alat Pengujian", "Kategori / Level", "Tujuan Penggunaan", "Status Verifikasi"),
        ("1", "Pest PHP / PHPUnit", "Unit & Feature Test", "Validasi logika service layer backend & webhook handler", "Verified (Passed)"),
        ("2", "Larastan (PHPStan L8)", "Static Code Analysis", "Pemeriksaan tipe data statis ketat pada seluruh kelas PHP", "Verified (Zero Bug)"),
        ("3", "Laravel Pint", "Code Quality Linter", "Penegakan standar penulisan kode baku PSR-12 secara otomatis", "Compliant"),
        ("4", "TypeScript Compiler (tsc)", "Frontend Type Safety", "Pemeriksaan tipe ketat (tsc --noEmit) komponen React 19", "Verified (Zero Error)"),
        ("5", "Google Lighthouse", "Performance & SEO", "Audit Core Web Vitals, Accessibility, dan Best Practices", "Verified (Score > 90)"),
        ("6", "Postman / Thunder Client", "API & Webhook Testing", "Pengujian payload webhook callback payment gateway", "Verified (200 OK)")
    ]
    set_table_borders(tbl_tool)
    for r_idx, row in enumerate(tbl_tool.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(tool_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(tool_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=40, bottom=40, left=50, right=50)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(8.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 4:
                run.font.bold = True
                run.font.color.rgb = COLOR_SECONDARY
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # ==================== BAB 6: METODOLOGI IMPLEMENTASI ====================
    add_h1("6  Metodologi Implementasi")
    doc.add_paragraph(
        "Metodologi implementasi mengatur prasyarat teknis, konfigurasi lingkungan runtime, serta prosedur penyerahan dokumentasi "
        "guna menjamin stabilitas deployment sistem portofolio di lingkungan produksi."
    )

    add_h2("6.1  Prasyarat")
    doc.add_paragraph(
        "Prasyarat lingkungan pengembangan dan produksi yang wajib dipenuhi sebelum eksekusi sistem:\n"
        "• Runtime Backend: PHP v8.3 atau lebih tinggi dengan ekstensi pdo, pdo_pgsql, openssl, mbstring, curl, gd.\n"
        "• Runtime Frontend: Node.js v20+ LTS dan NPM v10+.\n"
        "• Dependensi Paket: Composer v2.x untuk dependensi Laravel 13; Vite v8 untuk bundler React 19.\n"
        "• Kredensial Pihak Ketiga: Google AI Studio API Key (model gemini-3.5-flash), Payment Gateway Server & Client Key, "
        "koneksi Supabase Connection Pooler URI (AWS ap-southeast-1 Singapura)."
    )

    add_h2("6.2  Data & Lingkungan")
    doc.add_paragraph(
        "1. Arsitektur Frontend: Menggunakan React 19 dengan adapter Inertia.js v3 yang memungkinkan perutean halaman single page application (SPA) langsung dari backend Laravel tanpa membuat REST API terpisah. Styling menggunakan TailwindCSS v4 (@tailwindcss/vite) dengan performa kompilasi instan. Dilengkapi antarmuka interaktif: efek kursor Aura Glow (ambient radial gradient), panel Glassmorphism semi-transparan (backdrop-filter: blur), animasi bertingkat (Motion/Framer Motion v12), dan ikonografi Lucide React.\n"
        "2. Arsitektur Backend & CMS: Ditenagai Laravel 13.x (PHP 8.3+) dengan keamanan Laravel Fortify dan Sanctum. Panel admin dibangun menggunakan React 19 pada rute terenkripsi khusus untuk mengamankan data dari serangan brute-force URL admin standar. Admin panel melayani pengelolaan Profiles, Projects, Tech Stacks, Certificates (dengan fitur pembuatan thumbnail .webp otomatis), serta Message inbox.\n"
        "3. Lapisan Integrasi AI: Inti asisten cerdas dikelola oleh GeminiChatService yang berkomunikasi dengan model gemini-3.5-flash. Service ini secara dinamis menyusun System Instruction berbasis data riil profil dan proyek dari database PostgreSQL. Dilengkapi Filter Topik cerdas untuk menolak pertanyaan di luar portofolio, serta pendeteksi token [CHECK_REPLY:email] untuk menampilkan balasan pesan kontak langsung di dalam chat.\n"
        "4. Payment Engine & Database Persistence: Layanan transaksi mengelola alur deposit, invoice, dan pelacakan pembayaran terhubung dengan payment gateway seperti Midtrans atau Xendit. Basis data utama menggunakan PostgreSQL pada Supabase Connection Pooler dengan jaminan integritas transaksi ACID."
    )

    add_h2("6.3  Dokumentasi")
    doc.add_paragraph(
        "Dokumentasi resmi yang diserahkan untuk pengoperasian dan pemeliharaan mencakup:\n"
        "• Skenario & Skrip Pengujian Blackbox: Panduan validasi fungsional fitur bagi penguji independen.\n"
        "• Manual Pengoperasian Panel Admin: Petunjuk pengelolaan konten portofolio, sertifikat, dan inbox pesan.\n"
        "• Prosedur Rilis & Deployment Baku: Urutan perintah deployment otomatis (composer install --no-dev, npm run build, "
        "php artisan migrate --force, php artisan config:cache, php artisan storage:link).\n"
        "• Prosedur Rollback Cepat: Protokol pemulihan versi rilis Git dan migrasi database dalam waktu kurang dari 10 menit jika terjadi kegagalan operasional."
    )

    # ==================== BAB 7: ASUMSI ====================
    add_h1("7  Asumsi")
    doc.add_paragraph(
        "Pengembangan dan operasional sistem portofolio https://ridhwananang.laravel.cloud/ didasarkan pada asumsi-asumsi berikut:\n"
        "1. Ketersediaan Layanan Cloud Pihak Ketiga: Google AI Studio API, Supabase Cloud PostgreSQL, dan Payment Gateway beroperasi stabil dengan SLA minimum 99.5%.\n"
        "2. Latensi Jaringan: Latensi koneksi internet antara server cloud dan basis data Supabase regional Singapura tetap stabil di bawah 80 ms.\n"
        "3. Peramban Web Pengguna: Pengunjung mengakses platform menggunakan browser web modern (Chrome, Edge, Safari, Firefox versi terbaru) yang mendukung CSS modern backdrop-filter dan CSS variables.\n"
        "4. Hak Akses Tim: Pengembang memiliki hak akses administratif penuh terhadap repositori GitHub, server hosting cloud, dan dashboard pengembang API.\n"
        "5. Validitas Data Profil: Data riil proyek, keahlian, dan sertifikasi yang dimasukkan ke basis data bersifat valid dan dapat diverifikasi keabsahannya."
    )

    doc.add_page_break()

    # ==================== BAB 8: LAMPIRAN ====================
    add_h1("8  Lampiran")

    add_h2("8.1  Lampiran A : Tanda tangan")
    doc.add_paragraph(
        "Dokumen ini telah ditinjau dan diterima oleh pihak yang bertanda tangan di bawah ini. Oleh karena itu, dokumen ini "
        "digunakan sebagai dasar untuk melakukan pemrosesan dan verifikasi lebih lanjut. Setiap penambahan dan/atau modifikasi "
        "dokumen ini tunduk pada persetujuan pihak yang bertanda tangan di bawah ini:"
    )

    # Executive Card Signature Table (Zero wrapping, perfectly symmetrical, professional layout)
    tbl_sign = doc.add_table(rows=5, cols=3)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_sign, color="CBD5E1", sz="6", val="single")

    sign_card_widths = [3.35, 0.30, 3.35]

    # Row 0: Headers for Pair 1
    r0 = tbl_sign.rows[0]
    set_row_properties(r0, height_dxa=280)
    for idx, c_idx in enumerate([0, 2]):
        cell = r0.cells[c_idx]
        set_cell_background(cell, COLOR_PRIMARY_HEX)
        set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run("MANAJER PROYEK & ANALIS SISTEM" if idx == 0 else "TECH LEAD & FULLSTACK ENGINEER")
        run.font.name = "Calibri"
        run.font.size = Pt(9.0)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    r0.cells[1].paragraphs[0].text = ""

    # Row 1: Content for Pair 1
    r1 = tbl_sign.rows[1]
    set_row_properties(r1, height_dxa=1600)
    data_p1 = [
        ("Yulian", "Manajer Proyek & Analis Sistem", "01 Oktober 2026"),
        ("Ridhwan Anang Ma'ruf", "Tech Lead & Fullstack Engineer", "01 Oktober 2026")
    ]

    for idx, c_idx in enumerate([0, 2]):
        cell = r1.cells[c_idx]
        set_cell_background(cell, "FFFFFF")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        
        name, title, date = data_p1[idx]
        
        r_sig = p.add_run("Tanda tangan :\n\n\n\n")
        r_sig.font.name = "Calibri"
        r_sig.font.size = Pt(9.0)
        r_sig.font.bold = True
        r_sig.font.color.rgb = COLOR_PRIMARY
        
        r_line = p.add_run("_________________________________________\n")
        r_line.font.name = "Calibri"
        r_line.font.size = Pt(9.0)
        r_line.font.bold = True
        r_line.font.color.rgb = COLOR_PRIMARY
        
        r_n_lbl = p.add_run("Nama     : ")
        r_n_lbl.font.name = "Calibri"
        r_n_lbl.font.size = Pt(9.0)
        r_n_lbl.font.bold = True
        r_n_val = p.add_run(f"{name}\n")
        r_n_val.font.name = "Calibri"
        r_n_val.font.size = Pt(9.0)
        r_n_val.font.bold = True
        
        r_t_lbl = p.add_run("Judul    : ")
        r_t_lbl.font.name = "Calibri"
        r_t_lbl.font.size = Pt(9.0)
        r_t_lbl.font.bold = True
        r_t_val = p.add_run(f"{title}\n")
        r_t_val.font.name = "Calibri"
        r_t_val.font.size = Pt(9.0)
        
        r_d_lbl = p.add_run("Tanggal  : ")
        r_d_lbl.font.name = "Calibri"
        r_d_lbl.font.size = Pt(9.0)
        r_d_lbl.font.bold = True
        r_d_val = p.add_run(f"{date}")
        r_d_val.font.name = "Calibri"
        r_d_val.font.size = Pt(9.0)

    # Row 2: Spacer
    r2 = tbl_sign.rows[2]
    set_row_properties(r2, height_dxa=200)

    # Row 3: Headers for Pair 2
    r3 = tbl_sign.rows[3]
    set_row_properties(r3, height_dxa=280)
    for idx, c_idx in enumerate([0, 2]):
        cell = r3.cells[c_idx]
        set_cell_background(cell, COLOR_PRIMARY_HEX)
        set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run("DESAINER UI/UX & RISET PRODUK" if idx == 0 else "KLIEN / PEMILIK SISTEM")
        run.font.name = "Calibri"
        run.font.size = Pt(9.0)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    r3.cells[1].paragraphs[0].text = ""

    # Row 4: Content for Pair 2
    r4 = tbl_sign.rows[4]
    set_row_properties(r4, height_dxa=1600)
    data_p2 = [
        ("B", "Desainer UI/UX & Riset Produk", "01 Oktober 2026"),
        ("( ............................................................ )", "Klien / Pemilik Proyek", "01 Oktober 2026")
    ]

    for idx, c_idx in enumerate([0, 2]):
        cell = r4.cells[c_idx]
        set_cell_background(cell, "FFFFFF")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        
        name, title, date = data_p2[idx]
        
        r_sig = p.add_run("Tanda tangan :\n\n\n\n")
        r_sig.font.name = "Calibri"
        r_sig.font.size = Pt(9.0)
        r_sig.font.bold = True
        r_sig.font.color.rgb = COLOR_PRIMARY
        
        r_line = p.add_run("_________________________________________\n")
        r_line.font.name = "Calibri"
        r_line.font.size = Pt(9.0)
        r_line.font.bold = True
        r_line.font.color.rgb = COLOR_PRIMARY
        
        r_n_lbl = p.add_run("Nama     : ")
        r_n_lbl.font.name = "Calibri"
        r_n_lbl.font.size = Pt(9.0)
        r_n_lbl.font.bold = True
        r_n_val = p.add_run(f"{name}\n")
        r_n_val.font.name = "Calibri"
        r_n_val.font.size = Pt(9.0)
        r_n_val.font.bold = True
        
        r_t_lbl = p.add_run("Judul    : ")
        r_t_lbl.font.name = "Calibri"
        r_t_lbl.font.size = Pt(9.0)
        r_t_lbl.font.bold = True
        r_t_val = p.add_run(f"{title}\n")
        r_t_val.font.name = "Calibri"
        r_t_val.font.size = Pt(9.0)
        
        r_d_lbl = p.add_run("Tanggal  : ")
        r_d_lbl.font.name = "Calibri"
        r_d_lbl.font.size = Pt(9.0)
        r_d_lbl.font.bold = True
        r_d_val = p.add_run(f"{date}")
        r_d_val.font.name = "Calibri"
        r_d_val.font.size = Pt(9.0)

    for row in tbl_sign.rows:
        for c_idx, w in enumerate(sign_card_widths):
            row.cells[c_idx].width = Inches(w)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_h2("8.2  Lampiran B: Dokumen Lain & Sejarah Dokumen")
    doc.add_paragraph("Dokumentasi terkait yang menjadi rujukan dalam rencana proyek ini:")
    doc.add_paragraph(
        "• Spesifikasi Kebutuhan Perangkat Lunak (SRS) Portofolio v1.0\n"
        "• Proposal Proyek Portofolio & Freelance Client Service Platform v1.0\n"
        "• Jadwal Proyek & WBS 16 Minggu (Bagan Gantt Detail)\n"
        "• Lembar Keterlibatan Pemangku Kepentingan & Matriks RACI\n"
        "• Daftar Risiko Proyek & Tindakan Mitigasi (ISO 31000)\n"
        "• Laporan Skenario Pengujian Blackbox & Kuesioner Usability SUS"
    )

    add_h3("Sejarah Dokumen (Document Revision History)")
    tbl_hist = doc.add_table(rows=4, cols=4)
    tbl_hist.alignment = WD_TABLE_ALIGNMENT.CENTER
    hist_widths = [0.8, 1.2, 3.4, 1.6]
    hist_data = [
        ("Versi", "Tanggal", "Mengubah Alasan", "Penulis"),
        ("0.1", "10/06/2026", "Inisiasi awal rencana proyek dan penyusunan WBS", "Yulian (Manajer Proyek)"),
        ("0.5", "12/08/2026", "Integrasi arsitektur Gemini AI, kalkulator layanan, dan penyesuaian jadwal sprint", "Ridhwan (Lead Dev)"),
        ("1.0", "01/10/2026", "Penyelarasan penuh struktur panduan resmi (Bab 1 s/d 8), analisis SWOT & TOWS, serta rilis operasional produksi", "Yulian & Tim Triad")
    ]
    set_table_borders(tbl_hist)
    for r_idx, row in enumerate(tbl_hist.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(hist_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(hist_widths[c_idx])
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
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 0:
                run.font.bold = True
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Save Document
    doc.save(output_path)
    print(f"Standard Aligned PMP Document successfully generated at: {output_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Panduan_Standard.docx"
    create_aligned_pmp_document(output_file)
