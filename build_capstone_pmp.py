import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_capstone_pmp(output_path):
    doc = docx.Document()

    # Set Margins (0.7 in margins = 7.1 in printable width)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Color Palette Constants
    COLOR_PRIMARY_HEX = "1B365D"     # Oxford Deep Navy
    COLOR_SECONDARY_HEX = "2B6CB0"   # Corporate Royal Blue
    COLOR_DARK_TEXT_HEX = "2D3748"   # Charcoal Slate
    COLOR_MUTED_HEX = "718096"       # Cool Gray
    COLOR_LIGHT_BG_HEX = "F8FAFC"    # Soft Off-white
    COLOR_BORDER_HEX = "CBD5E1"      # Clean Slate Border
    COLOR_BAR_HEX = "2B6CB0"         # Gantt Bar Royal Blue
    COLOR_MILESTONE_HEX = "C55A11"   # Gantt Milestone Amber / Rust
    COLOR_CAT_BG_HEX = "E2E8F0"      # Category Header Slate

    COLOR_PRIMARY = RGBColor(27, 54, 93)
    COLOR_SECONDARY = RGBColor(43, 108, 176)
    COLOR_DARK_TEXT = RGBColor(45, 55, 72)
    COLOR_MUTED = RGBColor(113, 128, 150)

    # Configure Normal Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10)
    style_normal.font.color.rgb = COLOR_DARK_TEXT
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(4)

    # Helper XML functions
    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=40, bottom=40, left=50, right=50):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                          f'<w:top w:w="{top}" w:type="dxa"/>'
                          f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                          f'<w:left w:w="{left}" w:type="dxa"/>'
                          f'<w:right w:w="{right}" w:type="dxa"/>'
                          f'</w:tcMar>')
        tcPr.append(tcMar)

    def set_row_properties(row, height_dxa=260):
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
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(14)
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
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    # ==================== COVER PAGE ====================
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(28)
    
    p_inst = doc.add_paragraph()
    r_inst = p_inst.add_run("[PROGRAM STUDI TEKNIK INFORMATIKA / SISTEM INFORMASI]\n[FAKULTAS ILMU KOMPUTER - UNIVERSITAS ...]")
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_MUTED
    p_inst.paragraph_format.space_after = Pt(16)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("PROJECT MANAGEMENT PLAN (PMP)\nTUGAS AKHIR / CAPSTONE PROJECT")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(6)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Rencana Rekayasa & Manajemen Perangkat Lunak Berbasis Agile Scrum\nJudul: [Tuliskan Judul Sistem / Aplikasi Tugas Akhir Di Sini]")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY
    p_sub.paragraph_format.space_after = Pt(28)

    # Info Tim Capstone
    tbl_team = doc.add_table(rows=5, cols=3)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_widths = [2.2, 2.3, 2.6]
    t_data = [
        ("Nama Mahasiswa", "NIM", "Peran Utama di Tim"),
        ("A", "[NIM Mahasiswa A]", "Project Manager & System Analyst"),
        ("B", "[NIM Mahasiswa B]", "UI/UX Designer & Researcher"),
        ("ANDA", "[NIM Anda]", "Tech Lead & Fullstack Developer"),
        ("Dosen Pembimbing:", "[Nama Lengkap Dosen, Gelar]", "Dosen Pembimbing Tugas Akhir")
    ]
    set_table_borders(tbl_team)
    for r_idx, row in enumerate(tbl_team.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(t_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(t_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
    
    p_year = doc.add_paragraph()
    p_year.paragraph_format.space_before = Pt(36)
    p_year.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_y = p_year.add_run("Tahun Akademik 2026/2027")
    r_y.font.name = 'Calibri'
    r_y.font.size = Pt(11)
    r_y.font.bold = True
    r_y.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ==================== BAB 1 ====================
    add_heading_1("1. INFORMASI PROYEK & TUJUAN CAPSTONE")
    add_heading_2("1.1 Latar Belakang Masalah")
    doc.add_paragraph("[Uraikan permasalahan nyata yang melatarbelakangi pembuatan aplikasi tugas akhir ini. Jelaskan mengapa aplikasi ini penting untuk dibangun dan kesenjangan apa yang diselesaikan dibandingkan sistem yang ada saat ini.]")

    add_heading_2("1.2 Tujuan & Sasaran Pengembangan")
    doc.add_paragraph("Tujuan pengembangan perangkat lunak dalam tugas akhir ini mencakup dua dimensi utama:\n"
                      "1. Dimensi Produk (Fungsionalitas): Menghasilkan aplikasi yang mampu memecahkan masalah domain secara terintegrasi, andal, dan mudah digunakan oleh target pengguna.\n"
                      "2. Dimensi Rekayasa Perangkat Lunak: Menerapkan praktik industri modern (Agile Scrum, Clean Architecture, CI/CD, dan Pengujian Usability).")

    add_heading_2("1.3 Profil Target Pengguna Akhir (User Persona)")
    doc.add_paragraph("Sebagai produk perangkat lunak mandiri, sistem ditujukan langsung kepada pengguna riil yang dimodelkan dalam persona berikut:\n"
                      "• Persona 1 (Administrator / Operator): Bertanggung jawab atas pengelolaan data master, verifikasi transaksi, dan pemantauan analitik sistem melalui antarmuka web dashboard desktop.\n"
                      "• Persona 2 (Pengguna Publik / Layanan): Pengguna umum yang berinteraksi langsung dengan sistem untuk menikmati layanan utama secara cepat dan intuitif melalui perangkat mobile/browser.")

    add_heading_2("1.4 Ruang Lingkup Proyek (Scope Boundaries)")
    p_sc = doc.add_paragraph()
    p_sc.add_run("Ruang Lingkup Fitur (In-Scope):\n").bold = True
    p_sc.add_run("• Modul Otentikasi & Otorisasi Pengguna (Role-Based Access Control - RBAC).\n"
                 "• Modul Utama Transaksi / Fitur Unggulan Tugas Akhir.\n"
                 "• Antarmuka pengguna responsif (Desain Figma & implementasi Frontend).\n"
                 "• REST API Backend dengan arsitektur modular & basis data terelasi.\n"
                 "• Pengujian fungsionalitas (Blackbox), Unit Test, dan Usability Testing (SUS).\n"
                 "• Deployment cloud publik (misal: Vercel, Supabase, Railway, atau VPS).")

    # ==================== BAB 2 ====================
    add_heading_1("2. TATA KELOLA & PEMBAGIAN KERJA TIM (TRIAD)")
    doc.add_paragraph("Untuk memenuhi asas akuntabilitas individual dalam penilaian Tugas Akhir, pembagian peran diformulasikan secara tegas:")

    tbl_roles = doc.add_table(rows=4, cols=3)
    r_widths = [1.6, 2.0, 3.5]
    r_data = [
        ("Nama / NIM", "Peran Spesifik", "Fokus Tanggung Jawab & Deliverables"),
        ("A\n[NIM]", "Project Manager &\nSystem Analyst", "• Menyusun jadwal sprint, Gantt Chart linimasa, dan mitigasi risiko.\n• Menyusun dokumen kebutuhan SRS dan user stories.\n• Melakukan pengujian fungsional (Blackbox Testing).\n• Koordinasi berkala dengan Dosen Pembimbing."),
        ("B\n[NIM]", "UI/UX Designer &\nProduct Researcher", "• Riset user journey dan analisis kebutuhan antarmuka.\n• Pembuatan Wireframe & Design System di Figma.\n• Prototyping interaktif resolusi tinggi (High-Fi).\n• Eksekusi Usability Testing (metode SUS) kepada responden."),
        ("ANDA\n[NIM]", "Tech Lead &\nFullstack Developer", "• Merancang arsitektur sistem dan skema database (ERD).\n• Koding Backend RESTful API & Frontend Web/Mobile.\n• Setup CI/CD, Container (Docker), dan Cloud Hosting.\n• Koding Unit Testing dan penjaminan keamanan kode.")
    ]
    set_table_borders(tbl_roles)
    for r_idx, row in enumerate(tbl_roles.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(r_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(r_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.5)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    doc.add_page_break()

    # ==================== BAB 3: GANTT CHART RAPI ====================
    add_heading_1("3. METODOLOGI PENGEMBANGAN & BAGAN GANTT (GANTT CHART)")
    
    add_heading_2("3.1 Pendekatan Agile Scrum")
    doc.add_paragraph("Pengembangan perangkat lunak menerapkan kerangka kerja Agile Scrum yang diorganisasikan ke dalam 3 fase utama: "
                      "(1) Fase Inisiasi & Konseptual (Sprint 0), "
                      "(2) Fase Pengembangan Inkremental (Sprint 1, 2, 3), dan "
                      "(3) Fase Rilis, Evaluasi Ilmiah & Sidang Akhir. "
                      "Di setiap akhir sprint pengembangan, tim mempresentasikan Product Increment berupa fitur aplikasi yang telah berjalan dan lolos pengujian di hadapan Dosen Pembimbing.")

    add_heading_2("3.2 Bagan Gantt Jadwal Pelaksanaan (Gantt Chart 16 Minggu)")
    doc.add_paragraph("Tabel berikut menyajikan linimasa pelaksanaan proyek tugas akhir selama satu semester penuh (16 minggu). Garis balok horizontal berwarna biru merepresentasikan durasi pengerjaan aktif per aktivitas, sedangkan balok oranye merepresentasikan tonggak capaian kritis (sidang tugas akhir):")

    # ==================== GANTT CHART ENGINE ====================
    # Exact Widths: 0.35 + 2.75 + 0.60 + (16 * 0.2125 = 3.40) = 7.10 inches (Exact printable area)
    col_widths = [0.35, 2.75, 0.60] + [0.2125] * 16

    gantt_data = [
        # (IsCategory, No, Aktivitas, PIC, [ActiveWeeks 1..16])
        (True, "", "FASE 1: INISIASI & SPRINT 0", "", []),
        (False, "1", "Penggalian Kebutuhan & SRS", "A", [1, 2]),
        (False, "2", "Riset User Persona & Design System", "B", [2, 3]),
        (False, "3", "Desain Arsitektur DB (ERD) & CI/CD", "ANDA", [2, 3]),
        (False, "4", "Penyusunan Backlog & Sprint Plan", "TIM", [3]),
        
        (True, "", "FASE 2: SIKLUS SPRINT PENGEMBANGAN", "", []),
        (False, "5", "Sprint 1: Desain UI Auth & Master", "B", [4]),
        (False, "6", "Sprint 1: Koding API & Frontend", "ANDA", [4, 5, 6]),
        (False, "7", "Sprint 1: Blackbox Test & Demo Dosen", "A", [6, 7]),
        (False, "8", "Sprint 2: Desain Alur Transaksi Utama", "B", [7, 8]),
        (False, "9", "Sprint 2: Koding Logika Bisnis & Core API", "ANDA", [8, 9, 10]),
        (False, "10", "Sprint 2: Blackbox Test & Demo Dosen", "A", [10]),
        (False, "11", "Sprint 3: Desain UI Analytics & Report", "B", [11]),
        (False, "12", "Sprint 3: Koding Agregasi & Report", "ANDA", [11, 12]),
        (False, "13", "Sprint 3: Regression Test & Demo Dosen", "A", [12, 13]),

        (True, "", "FASE 3: PENGUJIAN AKHIR & SIDANG", "", []),
        (False, "14", "Pengujian Fungsional Blackbox Final", "A", [14]),
        (False, "15", "Pengujian Usability (Kuesioner SUS)", "B", [14]),
        (False, "16", "Cloud Live Deployment & Offline Prep", "ANDA", [15]),
        (False, "17", "Penyusunan Laporan Akhir Skripsi", "TIM", [15, 16]),
        (False, "18", "Pelaksanaan Sidang Tugas Akhir", "TIM", [16]),
    ]

    total_rows = 2 + len(gantt_data)
    tbl_gantt = doc.add_table(rows=total_rows, cols=19)
    tbl_gantt.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_gantt)

    # HEADER ROW 0: Bulan Grouping
    r0 = tbl_gantt.rows[0]
    set_row_properties(r0, height_dxa=240)
    for c in r0.cells:
        set_cell_background(c, COLOR_PRIMARY_HEX)
        set_cell_margins(c, top=30, bottom=30, left=30, right=30)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    r0.cells[0].paragraphs[0].text = "No"
    r0.cells[1].paragraphs[0].text = "Tahapan & Aktivitas Proyek"
    r0.cells[2].paragraphs[0].text = "PIC"

    # Merge Months
    m1 = r0.cells[3].merge(r0.cells[6])
    m1.paragraphs[0].text = "Bulan 1"
    m2 = r0.cells[7].merge(r0.cells[10])
    m2.paragraphs[0].text = "Bulan 2"
    m3 = r0.cells[11].merge(r0.cells[14])
    m3.paragraphs[0].text = "Bulan 3"
    m4 = r0.cells[15].merge(r0.cells[18])
    m4.paragraphs[0].text = "Bulan 4"

    # Format text row 0
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

    # HEADER ROW 1: Weeks 1..16
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

    # DATA ROWS
    for idx, (is_cat, num, act_name, pic, active_weeks) in enumerate(gantt_data):
        row = tbl_gantt.rows[2 + idx]
        set_row_properties(row, height_dxa=250)

        if is_cat:
            # Category Row: Merge Col 0 to 18
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
            # Regular Task Row
            # Col 0: No
            c0 = row.cells[0]
            c0.paragraphs[0].text = num
            c0.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Col 1: Aktivitas
            c1 = row.cells[1]
            c1.paragraphs[0].text = act_name
            c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            
            # Col 2: PIC
            c2 = row.cells[2]
            c2.paragraphs[0].text = pic
            c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

            # Format Col 0..2
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

            # Cols 3..18: Weeks (Gantt Bars)
            for w in range(1, 17):
                cell_w = row.cells[2 + w]
                set_cell_margins(cell_w, top=0, bottom=0, left=0, right=0)
                cell_w.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = cell_w.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                p.text = ""  # Clean empty space so cell color forms a smooth solid bar!

                if w in active_weeks:
                    # Active Week: Solid Color Bar Fill!
                    if num == "18":
                        set_cell_background(cell_w, COLOR_MILESTONE_HEX) # Amber milestone for defense
                    else:
                        set_cell_background(cell_w, COLOR_BAR_HEX)       # Solid Royal Blue bar
                else:
                    # Inactive Week: Clean light background with subtle grid
                    set_cell_background(cell_w, "FFFFFF" if idx % 2 == 0 else COLOR_LIGHT_BG_HEX)

    # Set Column Widths across all cells
    for row in tbl_gantt.rows:
        for i, w in enumerate(col_widths):
            if i < len(row.cells):
                row.cells[i].width = Inches(w)

    # ==================== GANTT CHART LEGEND BOX ====================
    tbl_leg = doc.add_table(rows=1, cols=4)
    tbl_leg.alignment = WD_TABLE_ALIGNMENT.CENTER
    leg_widths = [0.3, 3.2, 0.3, 3.3]
    
    # Legend Item 1 (Blue Bar)
    c_leg0 = tbl_leg.rows[0].cells[0]
    set_cell_background(c_leg0, COLOR_BAR_HEX)
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

    # Legend Item 2 (Orange Bar)
    c_leg2 = tbl_leg.rows[0].cells[2]
    set_cell_background(c_leg2, COLOR_MILESTONE_HEX)
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

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(8)

    # ==================== BAB 4 ====================
    add_heading_1("4. STRATEGI PENGUJIAN & VALIDASI ILMIAH")
    add_heading_2("4.1 Pengujian Teknis (Unit Testing & Code Quality)")
    doc.add_paragraph("Tech Lead (ANDA) mengimplementasikan pengujian otomatis unit test pada business logic backend menggunakan assertion framework untuk menjamin kestabilan kode saat refactoring.")

    add_heading_2("4.2 Pengujian Fungsionalitas (Blackbox Testing)")
    doc.add_paragraph("Project Manager (A) menyusun matriks uji skenario fungsional berdasarkan use case SRS (Equivalence Partitioning & Boundary Value Analysis). Seluruh skenario wajib berstatus 'Passed' sebelum sidang.")

    add_heading_2("4.3 Pengujian Penerimaan Pengguna (System Usability Scale - SUS)")
    doc.add_paragraph("UI/UX Designer (B) memimpin pengujian kelayakan antarmuka menggunakan standar kuesioner SUS kepada minimal 15–20 responden target pengguna. Target skor kelayakan minimum adalah 68 (kategori 'Good / Acceptable').")

    # ==================== BAB 5 ====================
    add_heading_1("5. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR")
    doc.add_paragraph("Teknologi yang dipilih dalam tugas akhir ini mempertimbangkan kecepatan pengembangan, keandalan performa, dan kemudahan deployment cloud:\n"
                      "• Lapisan Frontend (Antarmuka): Menggunakan framework berbasis komponen reaktif (React / Next.js / Vue / Flutter) untuk rendering dinamis, navigasi mulus, dan performa tinggi.\n"
                      "• Lapisan Backend (Service API): Menggunakan RESTful API berbasis runtime modern (Node.js / Python / Go / Laravel) dengan pola arsitektur modular yang memisahkan Controller, Service, dan Repository.\n"
                      "• Lapisan Basis Data: Menggunakan Relational Database Management System (PostgreSQL / MySQL / Supabase) dengan penegakan integritas data referensial (ACID) dan indeks optimal.\n"
                      "• Platform Desain & Kolaborasi: Menggunakan Figma untuk penyusunan wireframe, hi-fi UI, dan clickable interactive prototype.\n"
                      "• Lingkungan Cloud & Hosting: Menggunakan platform cloud modern (Vercel, Railway, Supabase, atau VPS Cloud) yang terintegrasi dengan Git untuk deployment otomatis.")

    # ==================== BAB 6 ====================
    add_heading_1("6. MANAJEMEN RISIKO CAPSTONE")
    doc.add_paragraph("Potensi kendala selama pengerjaan tugas akhir diidentifikasi dan dimitigasi melalui rencana berikut:\n"
                      "1. Risiko Perubahan Kebutuhan Mendadak (Scope Creep): Dosen pembimbing dapat meminta fitur baru di tengah jalan. Mitigasi: A (PM) menjaga batasan MVP; usulan baru dicatat sebagai saran pengembangan masa depan (Future Work) pada Bab 5 Skripsi.\n"
                      "2. Risiko Hambatan Integrasi API: Kesulitan menyambungkan frontend dan backend. Mitigasi: ANDA (Tech Lead) menyepakati spesifikasi kontrak API (Swagger / OpenAPI) sebelum koding dimulai.\n"
                      "3. Risiko Keterlambatan Responden SUS: Sulit mengumpulkan responden uji coba usability. Mitigasi: B (UI/UX) menyebarkan kuesioner uji coba sejak Sprint 2 menggunakan prototype Figma.\n"
                      "4. Risiko Kegagalan Server saat Sidang: Server cloud mati atau internet ruangan sidang lambat. Mitigasi: ANDA menyiapkan backup lingkungan localhost di laptop yang siap didemokan secara offline 100%.")

    # ==================== BAB 7: PENGESAHAN ====================
    add_heading_1("7. LEMBAR PENGESAHAN PROYEK TUGAS AKHIR")
    doc.add_paragraph("Dokumen Perencanaan Proyek Tugas Akhir (PMP) ini disusun dan disetujui bersama oleh seluruh anggota tim dan diajukan kepada Dosen Pembimbing sebagai dasar pelaksanaan tugas akhir.")

    tbl_sign = doc.add_table(rows=3, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [3.5, 3.6]
    
    sign_boxes = [
        ("TIM PENGEMBANG (MAHASISWA)", "PEMBIMBING AKADEMIK"),
        ("Disusun Oleh (Project Manager):\n\n\n\n___________________________________\nA\nNIM: [NIM Mahasiswa A]\nTanggal: DD/MM/YYYY",
         "Disetujui Oleh Dosen Pembimbing:\n\n\n\n___________________________________\n[Nama Lengkap Dosen, Gelar]\nNIP / NIDN: [NIP Dosen]\nTanggal: DD/MM/YYYY"),
        ("Tech Lead & Fullstack Developer:\n\n\n\n___________________________________\nANDA\nNIM: [NIM Anda]\nTanggal: DD/MM/YYYY",
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
    print(f"Refined Capstone PMP successfully created at: {output_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Tugas_Akhir_Refined.docx"
    create_capstone_pmp(output_file)
