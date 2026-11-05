import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_pmp_document(output_path):
    doc = docx.Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Color Palette Constants
    COLOR_PRIMARY_HEX = "1F3864"     # Deep Navy
    COLOR_SECONDARY_HEX = "2E75B6"   # Classic Steel Blue
    COLOR_DARK_TEXT_HEX = "262626"   # Off Black
    COLOR_MUTED_HEX = "595959"       # Muted Gray
    COLOR_LIGHT_BG_HEX = "F2F4F7"    # Very light cool gray
    COLOR_BORDER_HEX = "D9D9D9"      # Subtle border gray
    COLOR_ACCENT_HEX = "C55A11"      # Rust/Orange Accent for warnings/critical

    COLOR_PRIMARY = RGBColor(31, 56, 100)
    COLOR_SECONDARY = RGBColor(46, 117, 182)
    COLOR_DARK_TEXT = RGBColor(38, 38, 38)
    COLOR_MUTED = RGBColor(89, 89, 89)

    # Configure Normal Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = COLOR_DARK_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(4)

    # Helper XML functions
    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                          f'<w:top w:w="{top}" w:type="dxa"/>'
                          f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                          f'<w:left w:w="{left}" w:type="dxa"/>'
                          f'<w:right w:w="{right}" w:type="dxa"/>'
                          f'</w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table, border_color=COLOR_BORDER_HEX):
        tblPr = table._tbl.tblPr
        borders_xml = f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:left w:val="none"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{COLOR_PRIMARY_HEX}"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
        '''
        tblPr.append(parse_xml(borders_xml))

    def format_table(table, col_widths, col_alignments, header_bg=COLOR_PRIMARY_HEX):
        set_table_borders(table)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Format Header (Row 0)
        hdr_cells = table.rows[0].cells
        for i, cell in enumerate(hdr_cells):
            set_cell_background(cell, header_bg)
            set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                p.alignment = col_alignments[i] if i < len(col_alignments) else WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_after = Pt(0)
                for run in p.runs:
                    run.font.name = 'Calibri'
                    run.font.bold = True
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(255, 255, 255)

        # Format Data Rows
        for r_idx, row in enumerate(table.rows[1:], start=1):
            bg_color = COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell in enumerate(row.cells):
                set_cell_background(cell, bg_color)
                set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                for p in cell.paragraphs:
                    p.alignment = col_alignments[c_idx] if c_idx < len(col_alignments) else WD_ALIGN_PARAGRAPH.LEFT
                    p.paragraph_format.space_after = Pt(0)
                    for run in p.runs:
                        run.font.name = 'Calibri'
                        run.font.size = Pt(9.5)

        # Set Column Widths
        for row in table.rows:
            for i, w in enumerate(col_widths):
                if i < len(row.cells):
                    row.cells[i].width = Inches(w)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12.5)
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
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK_TEXT
        return p

    def add_callout(text, title=None, border_color="2E75B6", bg_color="F2F4F7"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.rows[0].cells[0]
        cell.width = Inches(6.5)
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=100, bottom=100, left=160, right=140)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders_xml = f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:top w:val="none"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
        '''
        tcPr.append(parse_xml(borders_xml))
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        if title:
            run_t = p.add_run(title + "\n")
            run_t.font.name = 'Calibri'
            run_t.font.bold = True
            run_t.font.size = Pt(10)
            run_t.font.color.rgb = COLOR_PRIMARY
        
        run_b = p.add_run(text)
        run_b.font.name = 'Calibri'
        run_b.font.size = Pt(9.5)
        run_b.font.color.rgb = COLOR_DARK_TEXT
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)

    # ==================== COVER PAGE ====================
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(40)
    
    p_cat = doc.add_paragraph()
    r_cat = p_cat.add_run("ENTERPRISE IT PROJECT MANAGEMENT STANDARDS")
    r_cat.font.name = 'Calibri'
    r_cat.font.size = Pt(11)
    r_cat.font.bold = True
    r_cat.font.color.rgb = COLOR_SECONDARY
    p_cat.paragraph_format.space_after = Pt(8)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("PROJECT MANAGEMENT PLAN (PMP)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(26)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(4)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Standard Operating Procedure & Execution Baseline (Tailored Lean Agile 3x3 Pod Model)")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = COLOR_MUTED
    p_sub.paragraph_format.space_after = Pt(40)

    # Metadata Box (Table)
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Nama Proyek / Sistem", "[Nama Proyek / Aplikasi Perusahaan]"),
        ("Nomor Dokumen", "PMP-CORP-[KODE_PROYEK]-001"),
        ("Versi Baseline", "Versi 1.0 (Final Approved)"),
        ("Tingkat Kerahasiaan", "Confidential / Restricted / Internal Only"),
        ("Tanggal Terbit", "30 September 2026"),
        ("Disusun Bersama Oleh", "A (Project Manager) & ANDA (Tech Lead & Fullstack)")
    ]
    for idx, (label, val) in enumerate(meta_data):
        c_lbl = tbl_meta.rows[idx].cells[0]
        c_val = tbl_meta.rows[idx].cells[1]
        c_lbl.width = Inches(2.2)
        c_val.width = Inches(4.3)
        set_cell_background(c_lbl, COLOR_LIGHT_BG_HEX)
        set_cell_background(c_val, "FFFFFF")
        set_cell_margins(c_lbl, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c_val, top=70, bottom=70, left=100, right=100)
        
        p0 = c_lbl.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_PRIMARY
        
        p1 = c_val.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.size = Pt(9.5)

    set_table_borders(tbl_meta)
    doc.add_page_break()

    # ==================== BAGIAN 1 ====================
    add_heading_1("BAGIAN 1: OBSERVASI & ANALISA KRITIS TEMPLATE ASLI")
    
    p = doc.add_paragraph("Analisis komprehensif ini mengevaluasi template lama (format Word 2005) terhadap standar manajemen proyek modern berskala global (PMBOK 7th Edition, ISO/IEC/IEEE 12207, ISO 27001, dan Lean Agile Strike Team practices).")
    
    add_heading_2("1.1 Kelebihan Template Asli (Existing Strengths)")
    p = doc.add_paragraph("Template warisan (legacy) memiliki beberapa fondasi penting yang patut dipertahankan:\n"
                          "1. Pembagian Siklus Hidup Dasar: Mencakup fase inisiasi, analisa, desain, coding, testing, dan deployment.\n"
                          "2. Akuntabilitas Formal: Menyediakan lembar tanda tangan (sign-off) persetujuan di akhir dokumen.\n"
                          "3. Rencana Monitoring Awal: Mengakomodasi kebutuhan pemantauan berkala.")

    add_heading_2("1.2 Kesenjangan (Gap Analysis) & Rekomendasi Transformasi Global")
    
    tbl_gap = doc.add_table(rows=7, cols=4)
    gap_widths = [1.3, 1.6, 1.8, 1.8]
    gap_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    gap_data = [
        ("Area Fokus", "Kondisi Template Lama (2005)", "Standar Global Modern (2026+)", "Rekomendasi Transformasi"),
        ("Definisi 'User'", "Vague & ambigu ('Meeting dengan user'); tidak ada pembagian peran klien.", "Struktur 3 Lapis Klien (Sponsor Strategis, Business PO, Key User/Tester).", "Pecah peran user ke dalam 3 level otoritas: User 1, User 2, dan User 3."),
        ("Struktur Tim Teknis", "Banyak peran fiktif usang: DBA, Web Designer, Software Designer, Tester manual.", "Lean Pod / Fullstack Engineering (Tech Lead Fullstack + UI/UX + PM).", "Sesuaikan 1:1 dengan struktur tim nyata: ANDA (Lead/Fullstack), A (PM), B (UI/UX)."),
        ("Metodologi Proyek", "Pure Waterfall kaku; mengasumsikan requirement statis di muka.", "Hybrid Agile-Waterfall (Sprint 2 mingguan + Governance ketat).", "Gunakan sprint-based delivery, feedback loop cepat, dan WBS terstruktur."),
        ("Otomasi & Operasional", "Aktivitas manual usang: 'Virus-Check', 'FP Count', 'Produce Storage Media'.", "Cloud-Native, GitOps, CI/CD otomatis, containerization.", "Otomatisasi pengujian, SAST/DAST, dan deployment pipeline via Cloud/IaC."),
        ("Manajemen Risiko", "Tabel 4 kolom sederhana, tanpa skoring numerik atau trigger.", "RAID Log Komprehensif (Probability vs Impact 1-5, Contingency, Owner).", "Terapkan matriks kuadran 5x5, contingency action terukur, dan RACI PIC."),
        ("Keamanan & Kepatuhan", "Tidak ada klausul privasi data, enkripsi, atau audit kepatuhan.", "DevSecOps, ISO 27001, OWASP Top 10, UU PDP / GDPR.", "Wajibkan SAST/DAST, enkripsi data saat diam & transit, dan least privilege.")
    ]
    
    for r_idx, row in enumerate(tbl_gap.rows):
        for c_idx, val in enumerate(gap_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
            
    format_table(tbl_gap, gap_widths, gap_align)
    
    add_callout("Model tata kelola pada Bagian 2 telah disesuaikan secara khusus untuk struktur Lean Strike Team: 3 Orang Tim Pengembang (A, B, Anda) berhadapan dengan 3 Orang Pihak User (User 1, User 2, User 3).", 
                title="PANDUAN MODEL 3 x 3:", border_color="1F3864", bg_color="F2F4F7")

    doc.add_page_break()

    # ==================== BAGIAN 2: MASTER PMP ====================
    add_heading_1("BAGIAN 2: MASTER PROJECT MANAGEMENT PLAN (PMP)")
    
    # Lembar Kontrol Dokumen
    add_heading_2("Dokumentasi Kontrol & Riwayat Revisi")
    tbl_rev = doc.add_table(rows=3, cols=5)
    rev_widths = [0.8, 1.0, 1.4, 1.5, 1.8]
    rev_align = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    rev_data = [
        ("Versi", "Tanggal", "Disusun Oleh", "Ditinjau Oleh", "Ringkasan Perubahan"),
        ("1.0", "DD/MM/YYYY", "A (Project Manager)", "ANDA (Tech Lead & Fullstack)", "Rilis baseline tata kelola model 3x3"),
        ("1.1", "DD/MM/YYYY", "A (Project Manager)", "User 1 (Project Sponsor)", "Persetujuan baseline ruang lingkup")
    ]
    for r_idx, row in enumerate(tbl_rev.rows):
        for c_idx, val in enumerate(rev_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_rev, rev_widths, rev_align)

    # 1. INFORMASI & INISIASI PROYEK
    add_heading_2("1. Informasi & Inisiasi Proyek")
    add_heading_3("1.1 Executive Summary")
    doc.add_paragraph("[Tuliskan ringkasan eksekutif 1-2 paragraf mengenai latar belakang kebutuhan bisnis, solusi teknologi yang dibangun, target pengguna, dan nilai tambah yang diharapkan bagi organisasi.]")

    add_heading_3("1.2 Sasaran & Kriteria Sukses Proyek (OKRs / KPIs)")
    tbl_okr = doc.add_table(rows=4, cols=4)
    okr_widths = [1.0, 2.0, 1.8, 1.7]
    okr_align = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    okr_data = [
        ("Kode", "Sasaran Bisnis / Objektif", "Key Result / Target Sukses", "Metode Verifikasi"),
        ("OBJ-01", "Peningkatan Performa Sistem", "Latensi API < 500ms pada beban 1000 RPS", "Performance Benchmark di Staging"),
        ("OBJ-02", "Keandalan Layanan (Reliability)", "Ketersediaan (uptime) sistem min. 99.9%", "APM Tool Monitoring (Datadog/NewRelic)"),
        ("OBJ-03", "Penerimaan Pengguna Bisnis", "Tingkat persetujuan UAT > 95% pada putaran pertama", "Form Berita Acara UAT")
    ]
    for r_idx, row in enumerate(tbl_okr.rows):
        for c_idx, val in enumerate(okr_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_okr, okr_widths, okr_align)

    add_heading_3("1.3 Ruang Lingkup Proyek (Project Scope)")
    p = doc.add_paragraph()
    p.add_run("Ruang Lingkup Termasuk (In-Scope):\n").bold = True
    p.add_run("• UI/UX Design System, Interactive Prototype di Figma, dan validasi bersama User 2 & User 3.\n"
              "• Arsitektur teknis dan pengembangan Fullstack (Backend API, Frontend Web, Basis Data) oleh Tech Lead.\n"
              "• Setup Cloud Environment, CI/CD pipeline, dan pengujian otomatis (Unit, Integration, Security).\n"
              "• Sesi UAT terstruktur bersama User 3 (Lead Tester) dan sign-off formal dari User 2.\n"
              "• Deployment Production (Blue-Green/Canary) dan masa stabilisasi (Hypercare 14 hari).")
    
    p = doc.add_paragraph()
    p.add_run("Di Luar Ruang Lingkup (Out-of-Scope):\n").bold = True
    p.add_run("• Pengadaan hardware on-premise (proyek 100% menggunakan cloud infrastructure).\n"
              "• Pembersihan data historis yang sudah kadaluarsa lebih dari 5 tahun.\n"
              "• Permintaan fitur baru di luar baseline SRS tanpa melalui persetujuan Change Request resmi (User 1).")

    # 2. TATA KELOLA & RACI (MODEL 3x3)
    add_heading_2("2. Tata Kelola & Struktur Tim (Model Lean Pod 3 x 3)")
    add_heading_3("2.1 Definisi Peran Tim Pengembang & Tim Klien")
    
    p = doc.add_paragraph()
    p.add_run("A. Tim Pengembang (Internal Pod):\n").bold = True
    p.add_run("1. A (Project Manager): Bertanggung jawab atas timeline, budget, mitigasi risiko, koordinasi sprint, komunikasi resmi dengan klien, dan kontrol dokumen.\n"
              "2. B (UI/UX Designer): Bertanggung jawab atas user research, wireframing, high-fidelity UI design, prototype interaktif, dan design handover.\n"
              "3. ANDA (Tech Lead & Fullstack): Bertanggung jawab atas arsitektur software, backend API, frontend web, database, DevOps/CI-CD, security, dan integrasi teknis.\n\n")
    p.add_run("B. Tim Klien / User (Client Stakeholders):\n").bold = True
    p.add_run("1. User 1 (Project Sponsor / Decision Maker): Otoritas tertinggi pengambil keputusan strategis, pemilik anggaran, persetujuan kontrak baseline, dan pengesahan akhir (BAST).\n"
              "2. User 2 (Business Product Owner / Lead PIC): PIC operasional harian, penentu prioritas backlog, validator SRS, dan penilai kelayakan hasil demo sprint.\n"
              "3. User 3 (Key User / SME / Lead Tester): Subject Matter Expert yang menguasai aturan bisnis lapangan, penyedia data uji, dan eksekutor utama skenario UAT.")

    add_heading_3("2.2 RACI Matrix Spesifik (6 Peran)")
    tbl_raci = doc.add_table(rows=12, cols=7)
    raci_widths = [2.2, 0.7, 0.7, 0.8, 0.7, 0.7, 0.7]
    raci_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    raci_data = [
        ("Aktivitas / Deliverables", "A (PM)", "B (UI/UX)", "ANDA (Lead)", "User 1", "User 2", "User 3"),
        ("1. PMP & Scope Baseline", "A", "I", "C", "Approval", "C", "I"),
        ("2. Requirement (SRS)", "R", "C", "C", "I", "A", "R"),
        ("3. Wireframe & Prototype", "C", "R", "C", "I", "A", "C"),
        ("4. Architecture & DB Spec", "I", "I", "A", "I", "C", "I"),
        ("5. Fullstack Coding & API", "C", "C", "R", "I", "I", "I"),
        ("6. Bi-Weekly Sprint Demo", "R", "R", "R", "I", "A", "C"),
        ("7. Persiapan Skenario UAT", "A", "C", "C", "I", "C", "R"),
        ("8. Eksekusi Pengujian UAT", "C", "C", "C", "I", "A", "R"),
        ("9. UAT Sign-Off Certificate", "C", "I", "I", "I", "Approval", "R"),
        ("10. Cloud Deployment (Prod)", "A", "I", "R", "I", "I", "I"),
        ("11. Change Request (RFC)", "R", "C", "C", "Approval", "C", "I")
    ]
    for r_idx, row in enumerate(tbl_raci.rows):
        for c_idx, val in enumerate(raci_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_raci, raci_widths, raci_align)
    
    p_note = doc.add_paragraph("Keterangan: R = Responsible (Pelaksana), A = Accountable (Penanggung Jawab), C = Consulted (Konsultasi), I = Informed (Informasi).")
    p_note.runs[0].font.size = Pt(8.5)
    p_note.runs[0].font.italic = True

    add_heading_3("2.3 Matriks Jalur Komunikasi Proyek")
    tbl_com = doc.add_table(rows=5, cols=5)
    com_widths = [1.4, 1.1, 1.5, 1.2, 1.3]
    com_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    com_data = [
        ("Forum / Pertemuan", "Frekuensi", "Peserta", "Media / Saluran", "Tujuan Utama"),
        ("Internal Sync (Team)", "Harian (15m)", "A (PM), B (UI), ANDA (Lead)", "Slack / Huddle", "Penyelarasan harian & unblocking"),
        ("Sprint Demo & Review", "2 Mingguan", "Team Internal + User 2 & User 3", "Video Call & Demo", "Evaluasi deliverable software"),
        ("Weekly Progress Report", "Mingguan", "A (PM) ke User 1 & User 2", "PDF Dashboard", "Laporan status progres & RAG status"),
        ("Change Request Review", "Ad-hoc", "A (PM), ANDA, User 1, User 2", "Formal Meeting", "Otorisasi penambahan fitur/jadwal")
    ]
    for r_idx, row in enumerate(tbl_com.rows):
        for c_idx, val in enumerate(com_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_com, com_widths, com_align)

    # 3. JADWAL PROYEK & WBS
    add_heading_2("3. Jadwal Proyek, WBS & Critical Path")
    add_heading_3("3.1 Work Breakdown Structure (WBS) Sesuai PIC Nyata")
    
    tbl_wbs = doc.add_table(rows=11, cols=6)
    wbs_widths = [0.8, 2.2, 0.7, 0.8, 1.0, 1.0]
    wbs_align = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    wbs_data = [
        ("WBS ID", "Uraian Aktivitas", "Durasi", "Pred.", "PIC Utama", "Deliverable"),
        ("1.1", "Project Charter & Kickoff", "3 Hari", "-", "A (PM)", "Approved Charter"),
        ("1.2", "Requirement Gathering & SRS", "5 Hari", "1.1", "A (PM), User 2, 3", "SRS Document v1.0"),
        ("1.3", "UI/UX Wireframe & Prototype", "7 Hari", "1.2", "B (UI/UX)", "Figma Prototype"),
        ("1.4", "Architecture, DB & DevOps Setup", "5 Hari", "1.2", "ANDA (Lead Dev)", "ERD & IaC Sandbox"),
        ("2.1", "Sprint 1: Core Backend & Auth", "10 Hari", "1.3, 1.4", "ANDA (Lead Dev)", "Auth & Core API"),
        ("2.2", "Sprint 2: Business Logic & UI Frontend", "10 Hari", "2.1", "ANDA (Lead Dev)", "Integrated Web App"),
        ("2.3", "Sprint 3: Payment & External Integrations", "10 Hari", "2.2", "ANDA (Lead Dev)", "Feature Complete v0.9"),
        ("3.1", "SIT, Bug Fixing & Security Scan", "5 Hari", "2.3", "ANDA (Lead Dev)", "Clean SIT Report"),
        ("4.1", "User Acceptance Testing (UAT)", "5 Hari", "3.1", "User 3, User 2", "Signed UAT Certificate"),
        ("5.1", "Production Cutover & Go-Live", "1 Hari", "4.1", "ANDA, A (PM)", "Live Production")
    ]
    for r_idx, row in enumerate(tbl_wbs.rows):
        for c_idx, val in enumerate(wbs_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_wbs, wbs_widths, wbs_align)

    add_heading_3("3.2 Analisa Jalur Kritis (Critical Path)")
    p_cp = doc.add_paragraph("Jalur Kritis (Critical Path) proyek yang menentukan tanggal rilis akhir:\n")
    p_cp.add_run("1.2 (SRS) → 1.3 (Figma UI/UX) → 1.4 (Arch/DB Setup) → 2.1..2.3 (Sprint Development) → 3.1 (SIT) → 4.1 (UAT) → 5.1 (Go-Live). ").bold = True
    p_cp.add_run("Keterlambatan feedback dari User 2 & User 3 pada fase UI/UX atau UAT akan menggeser tanggal peluncuran sistem secara langsung.")

    # 4. MANAJEMEN KUALITAS & PENGUJIAN
    add_heading_2("4. Manajemen Kualitas & Strategi Pengujian (QA)")
    add_heading_3("4.1 Pendekatan Pengujian oleh Tech Lead & Fullstack")
    p_qa = doc.add_paragraph("Mengingat pengujian teknis dikawal langsung oleh Tech Lead & Fullstack, efisiensi diwujudkan melalui otomatisasi:\n"
                             "• Automated Unit Testing: Dijalankan otomatis di pipeline CI/CD sebelum kode di-merge ke branch utama (target coverage ≥ 80%).\n"
                             "• API Contract Testing: Menggunakan koleksi automated test (Postman/Newman) untuk memastikan payload dan endpoint valid.\n"
                             "• Security & Dependency Scan: Automated SAST (SonarQube/GitHub Actions) untuk mencegah celah OWASP Top 10 dan kebocoran secrets.\n"
                             "• Business Acceptance: Pengujian manual berfokus pada UAT yang dieksekusi oleh User 3 dengan supervisi User 2.")

    add_heading_3("4.2 Kriteria Gerbang Kualitas (Quality Gates)")
    p_qg = doc.add_paragraph("Ambang batas penerimaan rilis (Quality Gate Threshold):\n"
                             "• Severity 1 (Blocker/Critical): Wajib 0 Open Defect (Pembatal rilis mutlak).\n"
                             "• Severity 2 (Major): Wajib 0 Open Defect tanpa persetujuan workaround tertulis dari User 2.\n"
                             "• Severity 3 (Minor): Maksimal ≤ 3 Open Defect (Dijadwalkan pada sprint maintenance).")

    # 5. MANAJEMEN RISIKO (RAID)
    add_heading_2("5. Manajemen Risiko, Asumsi, Isu & Dependensi (RAID)")
    add_heading_3("5.1 Log Risiko & Rencana Mitigasi Spesifik")
    
    tbl_rsk = doc.add_table(rows=5, cols=7)
    rsk_widths = [0.8, 1.6, 0.4, 0.4, 0.6, 1.5, 1.2]
    rsk_align = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    rsk_data = [
        ("ID", "Uraian Risiko", "P", "I", "Skor", "Tindakan Mitigasi Preventif", "Rencana Kontinjensi"),
        ("RSK-01", "Keterlambatan feedback/approval dari User 2", "3", "4", "12 (M)", "Jadwalkan review demo rutin tiap 2 minggu; SLA review max 48 jam", "Eskalasi ke User 1 oleh PM (A)"),
        ("RSK-02", "User 3 meminta fitur baru di tengah UAT", "4", "3", "12 (M)", "Kunci baseline scope; edukasi alur Change Request formal", "Fitur dimasukkan ke Backlog Fase 2"),
        ("RSK-03", "Bottleneck pada peran Lead/Fullstack", "2", "5", "10 (M)", "Modular architecture; dokumentasi koding standar; CI/CD otomatis", "Alokasi bantuan resource eksternal"),
        ("RSK-04", "Integrasi API eksternal pihak ke-3 lambat/down", "3", "4", "12 (M)", "Tech Lead membangun Mock Server sejak Sprint 1", "Pengujian offline simulasi dummy")
    ]
    for r_idx, row in enumerate(tbl_rsk.rows):
        for c_idx, val in enumerate(rsk_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_rsk, rsk_widths, rsk_align)

    # 6. DEPLOYMENT & DEVOPS
    add_heading_2("6. Strategi Deployment, Lingkungan Cloud & DevOps")
    add_heading_3("6.1 Arsitektur Lingkungan & Hak Akses")
    tbl_env = doc.add_table(rows=4, cols=4)
    env_widths = [1.2, 2.0, 1.8, 1.5]
    env_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    env_data = [
        ("Lingkungan", "Tujuan Utama", "Pengguna Akses", "Mekanisme Rilis"),
        ("Development", "Koding harian & integrasi servis", "ANDA (Lead Dev), B (UI/UX)", "Otomatis via push branch 'dev'"),
        ("Staging (UAT)", "Pengujian fungsional & verifikasi bisnis", "User 2 (PO), User 3 (Tester), A (PM)", "Otomatis via release-tag 'rc-*'"),
        ("Production", "Operasional langsung pengguna akhir", "End Users / Publik", "Approval User 1 & A (PM)")
    ]
    for r_idx, row in enumerate(tbl_env.rows):
        for c_idx, val in enumerate(env_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_env, env_widths, env_align)

    add_heading_3("6.2 Strategi Rilis & Prosedur Rollback")
    p_rel = doc.add_paragraph("Tech Lead akan menerapkan strategi rilis Blue-Green atau Canary. Seluruh migrasi database memiliki skrip down-migration otomatis. Jika dalam 30 menit pasca rilis terdeteksi error transaksi > 0.5%, rollback ke kluster stabil sebelumnya dieksekusi dalam waktu < 10 menit.")

    # 7. TRANSISI & HYPERCARE SLA
    add_heading_2("7. Transisi Operasional & Hypercare Support")
    add_heading_3("7.1 Periode Hypercare & Service Level Agreement (SLA)")
    p_hyp = doc.add_paragraph("Masa stabilisasi (Hypercare) berlangsung selama 14 hari kalender pasca Go-Live dengan komitmen SLA respon dan pemulihan insiden sebagai berikut:")
    
    tbl_sla = doc.add_table(rows=5, cols=4)
    sla_widths = [1.5, 2.2, 1.3, 1.5]
    sla_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    sla_data = [
        ("Tingkat Keparahan", "Kriteria Dampak Operasional", "Waktu Respon", "Target Resolusi"),
        ("Sev 1 (Critical)", "Sistem mati total, proses bisnis inti terhenti", "< 15 Menit", "< 2 Jam"),
        ("Sev 2 (Major)", "Fitur krusial gagal, tidak ada jalan pintas (workaround)", "< 30 Menit", "< 6 Jam"),
        ("Sev 3 (Minor)", "Gangguan parsial, proses bisnis tetap dapat berjalan", "< 2 Jam", "< 24 Jam"),
        ("Sev 4 (Cosmetic)", "Pertanyaan operasional atau perbaikan label antarmuka", "< 4 Jam", "Next Maintenance")
    ]
    for r_idx, row in enumerate(tbl_sla.rows):
        for c_idx, val in enumerate(sla_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_sla, sla_widths, sla_align)

    # 8. KONTROL PERUBAHAN
    add_heading_2("8. Tata Kelola Kontrol Perubahan (Change Management)")
    p_cm = doc.add_paragraph("Untuk menjaga fokus tim yang lean dan mencegah pembengkakan jadwal:\n"
                            "1. User 3 atau User 2 mengajukan usulan fitur baru melalui formulir RFC.\n"
                            "2. ANDA (Tech Lead) menghitung dampak teknis/man-hours, dan A (PM) menghitung dampak jadwal/biaya.\n"
                            "3. User 1 (Project Sponsor) memutuskan apakah perubahan disetujui beserta kompensasi waktu/biaya.")

    # 9. PENGESAHAN DOKUMEN (SIGN-OFF BLOCK)
    add_heading_2("9. Lembar Pengesahan Baseline (Sign-Off Block)")
    p_sign_intro = doc.add_paragraph("Dokumen Project Management Plan (PMP) ini telah ditelaah dan disepakati bersama sebagai baseline operasional pelaksanaan proyek.")

    tbl_sign = doc.add_table(rows=3, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [3.2, 3.3]
    
    sign_boxes = [
        ("PIHAK PENGEMBANG / PELAKSANA", "PIHAK PEMBERI KERJA / KLIEN"),
        ("Disusun Oleh:\n\n\n\n___________________________________\nA\nProject Manager Lead\nTanggal: DD/MM/YYYY",
         "Ditinjau & Disetujui Oleh:\n\n\n\n___________________________________\nUser 2\nBusiness Product Owner / Lead PIC\nTanggal: DD/MM/YYYY"),
        ("Diverifikasi Secara Teknis Oleh:\n\n\n\n___________________________________\nANDA\nTech Lead & Fullstack Developer\nTanggal: DD/MM/YYYY",
         "Disahkan Oleh:\n\n\n\n___________________________________\nUser 1\nProject Sponsor / Executive Decision Maker\nTanggal: DD/MM/YYYY")
    ]
    
    # Headers
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

    # Row 1 Signatures
    r1_c0 = tbl_sign.rows[1].cells[0]
    r1_c1 = tbl_sign.rows[1].cells[1]
    r1_c0.paragraphs[0].text = sign_boxes[1][0]
    r1_c1.paragraphs[0].text = sign_boxes[1][1]
    set_cell_background(r1_c0, "FFFFFF")
    set_cell_background(r1_c1, "FFFFFF")

    # Row 2 Signatures
    r2_c0 = tbl_sign.rows[2].cells[0]
    r2_c1 = tbl_sign.rows[2].cells[1]
    r2_c0.paragraphs[0].text = sign_boxes[2][0]
    r2_c1.paragraphs[0].text = sign_boxes[2][1]
    set_cell_background(r2_c0, COLOR_LIGHT_BG_HEX)
    set_cell_background(r2_c1, COLOR_LIGHT_BG_HEX)

    for r in tbl_sign.rows:
        for i, c in enumerate(r.cells):
            c.width = Inches(sign_widths[i])
            set_cell_margins(c, top=100, bottom=100, left=120, right=120)
    
    set_table_borders(tbl_sign)
    doc.add_page_break()

    # ==================== BAGIAN 3: TOOLKIT OPERASIONAL ====================
    add_heading_1("BAGIAN 3: ARTEFAK & TOOLKIT OPERASIONAL PENDUKUNG")
    
    # Lampiran 1: RFC Form
    add_heading_2("LAMPIRAN 1: FORMULIR KONTROL PERUBAHAN (REQUEST FOR CHANGE - RFC)")
    p_rfc = doc.add_paragraph("Gunakan formulir standar ini untuk setiap permohonan modifikasi ruang lingkup, jadwal, atau alokasi biaya:")
    
    tbl_rfc = doc.add_table(rows=7, cols=2)
    rfc_widths = [2.0, 4.5]
    rfc_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    rfc_fields = [
        ("Nomor Pelacakan RFC", "CR-[KODE_PROYEK]-YYYYMMDD-001"),
        ("Tanggal & Pemohon", "DD/MM/YYYY | [Diajukan oleh User 2 / User 3]"),
        ("Tingkat Urgensi", "[  ] Low    [  ] Medium    [  ] High    [  ] Critical"),
        ("Deskripsi Perubahan", "[Uraikan rincian perubahan fitur, logika bisnis, atau antarmuka]"),
        ("Justifikasi Bisnis", "[Alasan strategis mengapa perubahan ini dibutuhkan di tengah proyek]"),
        ("Analisis Dampak (PM & Lead Dev)", "• Estimasi Koding (ANDA): 24 Man-Hours\n• Dampak UI/UX (B): Revisi 2 Flow Screen\n• Dampak Jadwal (A): +3 Hari Kerja pada Sprint berjalan"),
        ("Keputusan User 1 (Sponsor)", "[  ] DISETUJUI      [  ] DITOLAK      [  ] DITUNDA KE FASE 2\n\nTanda Tangan User 1: ___________________   Tanggal: ________")
    ]
    for r_idx, row in enumerate(tbl_rfc.rows):
        row.cells[0].paragraphs[0].text = rfc_fields[r_idx][0]
        row.cells[1].paragraphs[0].text = rfc_fields[r_idx][1]
        row.cells[0].paragraphs[0].runs[0].font.bold = True
    format_table(tbl_rfc, rfc_widths, rfc_align)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Lampiran 2: UAT Signoff
    add_heading_2("LAMPIRAN 2: BERITA ACARA UAT (ACCEPTANCE CERTIFICATE)")
    p_uat = doc.add_paragraph("Dokumen formal bukti penyelesaian dan penerimaan sistem oleh User 2 & User 3:")
    
    tbl_uat = doc.add_table(rows=6, cols=2)
    uat_widths = [2.0, 4.5]
    uat_align = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    uat_fields = [
        ("Nomor Berita Acara", "UAT-CERT/[KODE_PROYEK]/YYYY/MM-001"),
        ("Periode Pengujian", "DD/MM/YYYY s.d. DD/MM/YYYY | Lingkungan Staging"),
        ("Pelaksana Uji Utama", "User 3 (Key User / SME / Lead Tester)"),
        ("Hasil Eksekusi Skenario", "• Total Test Cases: 120 Skenario\n• Passed: 118 (98.3%)\n• Failed: 0\n• Deferred: 2 (Non-kritis, disepakati ditunda)"),
        ("Status Open Defect", "Sev 1: 0  |  Sev 2: 0  |  Sev 3: 2 Defect"),
        ("Pernyataan Penerimaan", "Pihak Pengguna menyatakan bahwa sistem telah memenuhi persyaratan fungsionalitas bisnis dan LAYAK dideploy ke lingkungan Produksi.\n\nDisetujui Oleh (User 2 - Lead PO): ___________________")
    ]
    for r_idx, row in enumerate(tbl_uat.rows):
        row.cells[0].paragraphs[0].text = uat_fields[r_idx][0]
        row.cells[1].paragraphs[0].text = uat_fields[r_idx][1]
        row.cells[0].paragraphs[0].runs[0].font.bold = True
    format_table(tbl_uat, uat_widths, uat_align)

    doc.add_page_break()

    # Lampiran 3: Cutover Runbook
    add_heading_2("LAMPIRAN 3: CUTOVER RUNBOOK (JADWAL GO-LIVE HARI-H)")
    p_run = doc.add_paragraph("Panduan eksekusi operasional peluncuran sistem ke lingkungan produksi menit-demi-menit:")
    
    tbl_run = doc.add_table(rows=9, cols=5)
    run_widths = [1.1, 2.0, 1.0, 1.0, 1.4]
    run_align = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    run_data = [
        ("Waktu (T)", "Aktivitas Pekerjaan", "Pelaksana", "Verifikator", "Rencana Kontinjensi"),
        ("T - 24 Jam", "Code Freeze repositori & snapshot backup Staging", "ANDA (Lead)", "A (PM)", "Tunda cutover 12 jam jika gagal"),
        ("T - 04 Jam", "Aktivasi maintenance window notification", "A (PM)", "User 2", "Gunakan fallback static notice page"),
        ("T - 02 Jam", "Traffic cut & Full database backup production", "ANDA (Lead)", "A (PM)", "Jika checksum korup, batalkan cutover"),
        ("T - 01 Jam", "Eksekusi script migrasi skema & transform data", "ANDA (Lead)", "User 3", "Jalankan rollback down-migration SQL"),
        ("T - 00 Jam", "Deploy container v1.0 (Canary 10% traffic)", "ANDA (Lead)", "A (PM)", "Jika error 5xx > 0.5%, rollback image"),
        ("T + 30 Min", "Smoke testing transaksi di production", "User 3", "User 2", "Validasi audit log & payment gateway"),
        ("T + 60 Min", "Switching 100% traffic route ke kluster baru", "ANDA (Lead)", "A (PM)", "Monitor APM CPU, Mem, Latency"),
        ("T + 02 Jam", "Pernyataan resmi Go-Live sukses ke stakeholder", "A (PM)", "User 1", "Buka masa Hypercare 14 hari")
    ]
    for r_idx, row in enumerate(tbl_run.rows):
        for c_idx, val in enumerate(run_data[r_idx]):
            row.cells[c_idx].paragraphs[0].text = val
    format_table(tbl_run, run_widths, run_align)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Lampiran 4: Security Checklist
    add_heading_2("LAMPIRAN 4: DAFTAR PERIKSA KESIAPAN KEAMANAN & PRIVASI (ISO 27001 / OWASP)")
    chk_items = [
        "Zero Hardcoded Credentials: Tidak ada password, private key, atau token API yang tersimpan di source code.",
        "Data at Rest Encryption: Basis data dan file storage terenkripsi menggunakan algoritma standar AES-256.",
        "Data in Transit Encryption: Seluruh komunikasi internal dan eksternal menggunakan TLS 1.3 / HTTPS.",
        "Sanitasi PII: Data sensitif (kata sandi, NIK, kartu) di-hash satu arah (Bcrypt/Argon2) atau di-masking.",
        "Principle of Least Privilege: Akses server produksi terbatas via IAM Role & MFA tanpa hak root langsung.",
        "Audit Trail Terpusat: Log aktivitas login dan transaksi bersifat immutable (WORM) dan dipantau real-time.",
        "Disaster Recovery (DRP): RPO maksimal 15 menit dan RTO maksimal 60 menit teruji secara berkala."
    ]
    for item in chk_items:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.space_after = Pt(3)
        r_box = p_c.add_run("☑  ")
        r_box.font.name = 'Segoe UI Symbol'
        r_box.font.bold = True
        r_box.font.color.rgb = COLOR_SECONDARY
        r_txt = p_c.add_run(item)
        r_txt.font.size = Pt(9.5)

    # Save Document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Master_Template.docx"
    create_pmp_document(output_file)
