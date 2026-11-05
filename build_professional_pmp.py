import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_professional_capstone_pmp(output_path):
    doc = docx.Document()

    # Set Margins (0.75 in margins for balanced white space and readable line length)
    for section in doc.sections:
        section.top_margin = Inches(0.85)
        section.bottom_margin = Inches(0.85)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Corporate Professional Color Palette
    COLOR_PRIMARY_HEX = "0F2942"     # Deep Corporate Navy
    COLOR_SECONDARY_HEX = "2563EB"   # Modern Indigo / Royal Blue
    COLOR_DARK_TEXT_HEX = "1E293B"   # Slate 800 Dark
    COLOR_MUTED_HEX = "64748B"       # Slate 500 Muted
    COLOR_LIGHT_BG_HEX = "F8FAFC"    # Slate 50 Light Gray
    COLOR_BORDER_HEX = "CBD5E1"      # Slate 300 Clean Border
    COLOR_ACCENT_HEX = "D97706"      # Amber 600
    COLOR_CAT_BG_HEX = "E2E8F0"      # Slate 200 Header

    COLOR_PRIMARY = RGBColor(15, 41, 66)
    COLOR_SECONDARY = RGBColor(37, 99, 235)
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

    def set_cell_margins(cell, top=50, bottom=50, left=70, right=70):
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
    r_inst = p_inst.add_run("[PROGRAM STUDI TEKNIK INFORMATIKA / SISTEM INFORMASI]\n[FAKULTAS ILMU KOMPUTER - UNIVERSITAS ...]")
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_MUTED
    p_inst.paragraph_format.space_after = Pt(16)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("PROJECT MANAGEMENT PLAN (PMP)\nTUGAS AKHIR / CAPSTONE ENGINEERING PROJECT")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(21)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(6)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Dokumen Spesifikasi Rekayasa & Manajemen Perangkat Lunak Berstandar Global\nJudul Sistem: [Tuliskan Judul Sistem / Aplikasi Tugas Akhir Di Sini]")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY
    p_sub.paragraph_format.space_after = Pt(28)

    # Info Tim Capstone
    tbl_team = doc.add_table(rows=5, cols=3)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_widths = [2.2, 2.2, 2.6]
    t_data = [
        ("Nama Mahasiswa", "NIM", "Peran Rekayasa (Engineering Role)"),
        ("A", "[NIM Mahasiswa A]", "Project Manager & Systems Analyst"),
        ("B", "[NIM Mahasiswa B]", "UI/UX Designer & Product Researcher"),
        ("ANDA", "[NIM Anda]", "Tech Lead & Fullstack Developer"),
        ("Dosen Pembimbing:", "[Nama Lengkap Dosen, Gelar]", "Academic Advisor / Key Stakeholder")
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
    p_year.paragraph_format.space_before = Pt(32)
    p_year.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_y = p_year.add_run("Tahun Akademik 2026/2027")
    r_y.font.name = 'Calibri'
    r_y.font.size = Pt(11)
    r_y.font.bold = True
    r_y.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # ==================== BAB 1 ====================
    add_heading_1("1. INFORMASI PROYEK & TUJUAN PENGEMBANGAN")
    add_heading_2("1.1 Latar Belakang Masalah (Problem Statement & Business Context)")
    doc.add_paragraph("Transformasi digital pada era operasional modern menuntut ketersediaan sistem informasi yang andal, berlatensi rendah, serta berpusat pada pengguna (user-centric). Berdasarkan analisis lanskap operasional saat ini, ditemukan sejumlah permasalahan kritis (pain points) yang mendasari urgensi pembangunan sistem:")
    
    p_p1 = doc.add_paragraph()
    p_p1.add_run("1. Fragmentasi Data dan Inefisiensi Proses Manual:\n").bold = True
    p_p1.add_run("Pengelolaan data dan transaksi operasional saat ini masih bergantung pada sistem konvensional yang terpisah-pisah (siloed systems). Kondisi ini mengakibatkan tingginya tingkat kesalahan manusia (human error), redundansi input data, serta waktu pemrosesan transaksi yang mencapai 2–3 kali lebih lambat dari standar operasional yang diharapkan.")

    p_p2 = doc.add_paragraph()
    p_p2.add_run("2. Ketiadaan Visibilitas & Pelaporan Real-Time:\n").bold = True
    p_p2.add_run("Para pengambil keputusan mengalami hambatan dalam memperoleh laporan analitik secara langsung (real-time dashboard). Rekapitulasi laporan memerlukan proses konsolidasi manual yang memakan waktu berhari-hari, mengurangi ketepatan pengambilan keputusan strategis.")

    p_p3 = doc.add_paragraph()
    p_p3.add_run("3. Standar Keamanan dan Integritas Akses yang Rentan:\n").bold = True
    p_p3.add_run("Sistem yang berjalan belum menerapkan pembatasan hak akses berbasis peran (Role-Based Access Control - RBAC) secara ketat dan audit trail yang memadai, sehingga rentan terhadap manipulasi data dan pelanggaran privasi informasi.")

    p_hip = doc.add_paragraph()
    p_hip.add_run("Hipotesis Solusi: ").bold = True
    p_hip.add_run("Pembangunan platform perangkat lunak terintegrasi dengan arsitektur modular, antarmuka responsif, dan basis data terpusat diharapkan mampu memangkas waktu siklus proses hingga minimal 40%, menjamin akurasi data 99.9%, serta menyediakan auditabilitas yang menyeluruh bagi organisasi.")

    add_heading_2("1.2 Tujuan & Sasaran Pengembangan (Objectives & Key Results - OKRs)")
    doc.add_paragraph("Untuk memastikan keberhasilan rekayasa perangkat lunak terukur secara kuantitatif, proyek ini mengacu pada kerangka kerja sasaran berikut:")

    tbl_okr = doc.add_table(rows=5, cols=3)
    tbl_okr.alignment = WD_TABLE_ALIGNMENT.CENTER
    okr_widths = [1.6, 2.2, 3.2]
    okr_data = [
        ("Dimensi Sasaran", "Sasaran Strategis (Objective)", "Target Keberhasilan Terukur (Key Results / KPIs)"),
        ("Kinerja Teknis", "Menghasilkan platform dengan performa tinggi dan latensi rendah.", "• Response time API < 300 ms pada pengujian beban normal.\n• Core Web Vitals score antarmuka ≥ 85/100."),
        ("Kualitas Kode", "Menerapkan clean code dan arsitektur modular yang maintainable.", "• Cakupan pengujian unit (Code Coverage) ≥ 80%.\n• 0 kerentanan celah kritis pada pemindaian statis (SAST)."),
        ("Keandalan & Akses", "Memastikan ketersediaan layanan dan integritas otorisasi.", "• Waktu aktif (Uptime SLA) ≥ 99.5% selama masa rilis.\n• Penegakan hak akses RBAC 100% lolos uji keamanan."),
        ("Penerimaan Pengguna", "Membangun pengalaman pengguna yang intuitif dan mudah diadopsi.", "• Skor System Usability Scale (SUS) ≥ 70 (Kategori Good).\n• Waktu penyelesaian alur transaksi inti berkurang ≥ 30%.")
    ]
    set_table_borders(tbl_okr)
    for r_idx, row in enumerate(tbl_okr.rows):
        bg = COLOR_PRIMARY_HEX if r_idx == 0 else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
        for c_idx, val in enumerate(okr_data[r_idx]):
            cell = row.cells[c_idx]
            cell.width = Inches(okr_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=50, bottom=50, left=70, right=70)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.0)
            if r_idx == 0:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    add_heading_2("1.3 Profil Target Pengguna Akhir (User Personas & Ecosystem)")
    doc.add_paragraph("Sistem dirancang dengan pendekatan Human-Centered Design (HCD) yang berfokus pada dua persona pengguna representatif:")
    
    p_per1 = doc.add_paragraph()
    p_per1.add_run("Persona 1: Platform Administrator & Operational Controller\n").bold = True
    p_per1.add_run("• Peran & Karakteristik: Pengelola utama data master, konfigurasi sistem, dan pengawas transaksi. Mengakses aplikasi melalui browser desktop (PC/Laptop) dengan fokus pada volume data tinggi dan efisiensi navigasi keyboard/shortcut.\n"
                   "• Kebutuhan Utama: Dashboard monitoring transaksi secara visual dan komprehensif, fitur pencarian cepat, filtering multi-kriteria, ekspor data analitik (PDF/Excel), serta manajemen hak akses RBAC yang aman.\n"
                   "• Titik Masalah (Pain Points): Form input yang berbelit-belit, antarmuka lambat saat memuat data besar, dan tidak adanya rekapitulasi otomatis.")

    p_per2 = doc.add_paragraph()
    p_per2.add_run("Persona 2: Field Operator & End-User\n").bold = True
    p_per2.add_run("• Peran & Karakteristik: Pengguna operasional harian yang melakukan transaksi langsung di lapangan. Mengakses sistem melalui berbagai perangkat (smartphone/tablet/laptop) dengan ekspektasi alur interaksi yang singkat, responsif, dan minim gangguan.\n"
                   "• Kebutuhan Utama: Antarmuka bersih, ukuran tombol ergonomis, instruksi alur yang jelas, notifikasi status transaksi langsung (real-time feedback), dan kemudahan verifikasi akun.\n"
                   "• Titik Masalah (Pain Points): Tampilan tidak responsif di layar ponsel, proses verifikasi yang berulang, dan pesan error teknis yang membingungkan.")

    add_heading_2("1.4 Ruang Lingkup Proyek (Scope Boundaries)")
    doc.add_paragraph("Penetapan batasan ruang lingkup dilakukan secara ketat untuk mencegah terjadinya scope creep dan menjamin ketepatan waktu rilis produk:")
    
    p_in = doc.add_paragraph()
    p_in.add_run("Ruang Lingkup Termasuk (In-Scope):\n").bold = True
    p_in.add_run("1. Modul Keamanan & Autentikasi: JWT Token, Password Hashing Bcrypt, dan Role-Based Access Control (RBAC).\n"
                 "2. Modul Data Master & Manajemen Pengguna: Operasi CRUD komprehensif dengan validasi data terpusat.\n"
                 "3. Modul Proses Bisnis & Transaksi Utama: Logika alur transaksi inti yang menjadi objek rekayasa utama.\n"
                 "4. Modul Pelaporan & Dashboard Analitik: Rekapitulasi data statistik interaktif dan fitur export (PDF/Excel).\n"
                 "5. Antarmuka Web/Mobile Responsif: Implementasi Design System Figma ke dalam frontend modern.\n"
                 "6. RESTful Web API: Arsitektur modular memisahkan Controller, Service, dan Data Repository.\n"
                 "7. Otomasi CI/CD & Deployment Cloud: Pipeline pengujian otomatis dan hosting cloud publik live.")

    p_out = doc.add_paragraph()
    p_out.add_run("Di Luar Ruang Lingkup (Out-of-Scope):\n").bold = True
    p_out.add_run("1. Pengadaan infrastruktur server fisik on-premise mandiri (proyek 100% menggunakan arsitektur cloud).\n"
                  "2. Integrasi perangkat keras biometrik eksternal khusus di luar perangkat smartphone/browser standar.\n"
                  "3. Migrasi data historis berusia lebih dari 5 tahun dari sistem lama.\n"
                  "4. Kustomisasi alur di luar dokumen spesifikasi kebutuhan yang telah disetujui (SRS Baseline v1.0).")

    doc.add_page_break()

    # ==================== BAB 2 ====================
    add_heading_1("2. TATA KELOLA & PEMBAGIAN KERJA TIM (TRIAD)")
    doc.add_paragraph("Untuk memenuhi asas akuntabilitas individual dalam standar rekayasa perangkat lunak, pembagian peran diformulasikan secara tegas:")

    tbl_roles = doc.add_table(rows=4, cols=3)
    r_widths = [1.6, 2.0, 3.5]
    r_data = [
        ("Nama / NIM", "Peran Rekayasa Spesifik", "Fokus Tanggung Jawab & Deliverables"),
        ("A\n[NIM]", "Project Manager &\nSystems Analyst", "• Menyusun jadwal sprint, Gantt Chart linimasa, dan manajemen risiko.\n• Menyusun dokumen kebutuhan SRS dan user stories.\n• Melakukan pengujian fungsional (Blackbox Testing).\n• Koordinasi berkala dengan Academic Advisor / Stakeholder."),
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

    # ==================== BAB 3 ====================
    add_heading_1("3. METODOLOGI PENGEMBANGAN & BAGAN GANTT (GANTT CHART)")
    doc.add_paragraph("Pengembangan perangkat lunak menerapkan kerangka kerja Agile Scrum yang diorganisasikan ke dalam 3 fase utama: "
                      "(1) Fase Inisiasi & Konseptual (Sprint 0), "
                      "(2) Fase Pengembangan Inkremental (Sprint 1, 2, 3), dan "
                      "(3) Fase Rilis, Evaluasi Ilmiah & Sidang Akhir. "
                      "Di setiap akhir sprint pengembangan, tim mempresentasikan Product Increment berupa fitur aplikasi yang telah berjalan dan lolos pengujian di hadapan stakeholder.")

    add_heading_2("3.1 Bagan Gantt Jadwal Pelaksanaan (Gantt Chart 16 Minggu)")
    doc.add_paragraph("Tabel berikut menyajikan linimasa pelaksanaan proyek tugas akhir selama satu semester penuh (16 minggu). Garis balok horizontal berwarna biru merepresentasikan durasi pengerjaan aktif per aktivitas, sedangkan balok oranye merepresentasikan tonggak capaian kritis (sidang tugas akhir):")

    # ==================== GANTT CHART ====================
    col_widths = [0.35, 2.75, 0.60] + [0.2125] * 16

    gantt_data = [
        (True, "", "FASE 1: INISIASI & SPRINT 0", "", []),
        (False, "1", "Penggalian Kebutuhan & SRS", "A", [1, 2]),
        (False, "2", "Riset User Persona & Design System", "B", [2, 3]),
        (False, "3", "Desain Arsitektur DB (ERD) & CI/CD", "ANDA", [2, 3]),
        (False, "4", "Penyusunan Backlog & Sprint Plan", "TIM", [3]),
        
        (True, "", "FASE 2: SIKLUS SPRINT PENGEMBANGAN", "", []),
        (False, "5", "Sprint 1: Desain UI Auth & Master", "B", [4]),
        (False, "6", "Sprint 1: Koding API & Frontend", "ANDA", [4, 5, 6]),
        (False, "7", "Sprint 1: Blackbox Test & Review", "A", [6, 7]),
        (False, "8", "Sprint 2: Desain Alur Transaksi Utama", "B", [7, 8]),
        (False, "9", "Sprint 2: Koding Logika Bisnis & Core API", "ANDA", [8, 9, 10]),
        (False, "10", "Sprint 2: Blackbox Test & Review", "A", [10]),
        (False, "11", "Sprint 3: Desain UI Analytics & Report", "B", [11]),
        (False, "12", "Sprint 3: Koding Agregasi & Report", "ANDA", [11, 12]),
        (False, "13", "Sprint 3: Regression Test & Review", "A", [12, 13]),

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

    # Row 0
    r0 = tbl_gantt.rows[0]
    set_row_properties(r0, height_dxa=240)
    for c in r0.cells:
        set_cell_background(c, COLOR_PRIMARY_HEX)
        set_cell_margins(c, top=30, bottom=30, left=30, right=30)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    r0.cells[0].paragraphs[0].text = "No"
    r0.cells[1].paragraphs[0].text = "Tahapan & Aktivitas Proyek"
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
    doc.add_paragraph("Proses pengujian perangkat lunak menerapkan prinsip Shift-Left Testing yang mengacu pada standar internasional ISO/IEC/IEEE 29119 (Software Testing Standards) guna menjamin kestabilan fungsional dan kepuasan pengguna:")

    add_heading_2("4.1 Pengujian Teknis (Unit Testing & Code Quality Assurance)")
    doc.add_paragraph("• Fokus Pengujian: Memvalidasi kebenaran logika fungsi internal, kalkulasi matematika/bisnis, serta penanganan error (exception handling) hingga level metode terkecil.\n"
                      "• Metodologi: White-box Testing otomatis yang diintegrasikan ke dalam pipeline Git CI/CD.\n"
                      "• Ambang Batas Kualitas (Quality Gates):\n"
                      "  - Cakupan kode (Code Coverage): Minimal 80% untuk seluruh service dan business logic layer.\n"
                      "  - Analisis Kode Statis (SAST): 0 kerentanan celah keamanan kritis (Zero Critical/High Vulnerabilities) dan tingkat duplikasi kode < 5%.\n"
                      "  - Tooling yang Digunakan: Assertion Testing Framework modern (Jest, PyTest, JUnit, atau PHPUnit) dan Linter otomatis.")

    add_heading_2("4.2 Pengujian Fungsionalitas (System & Blackbox Testing)")
    doc.add_paragraph("• Fokus Pengujian: Menjamin bahwa seluruh fungsionalitas sistem berjalan presisi sesuai dokumen spesifikasi kebutuhan perangkat lunak tanpa perlu melihat kode internal.\n"
                      "• Metodologi Rekayasa: Penerapan teknik Equivalence Partitioning (menguji rentang input valid dan tidak valid) serta Boundary Value Analysis (menguji batasan nilai ekstrem).\n"
                      "• Kriteria Kelulusan Rilis (Exit Criteria): 100% skenario prioritas tinggi (Critical/Blocker) wajib berstatus Passed tanpa cacat terbuka (Zero Open Blocker Defect).")

    # Blackbox Sample Table
    tbl_bb = doc.add_table(rows=5, cols=5)
    tbl_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    bb_widths = [1.2, 1.4, 1.8, 1.8, 0.8]
    bb_data = [
        ("Test Case ID", "Modul Sistem", "Skenario Pengujian", "Hasil yang Diharapkan", "Status"),
        ("TC-AUTH-01", "Autentikasi", "Login dengan kredensial sah", "JWT token terbit, redirect ke Dashboard", "Passed"),
        ("TC-AUTH-02", "Keamanan Akun", "Proteksi brute force login 5x salah", "Akun terkunci otomatis selama 15 menit", "Passed"),
        ("TC-CORE-01", "Transaksi Inti", "Submit form dengan field wajib kosong", "Form menolak submit, alert validasi muncul", "Passed"),
        ("TC-DATA-01", "Konkurensi DB", "Eksekusi 2 transaksi simultan di 1 ID", "Database locking aktif, integritas data utuh", "Passed")
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
                run.font.color.rgb = RGBColor(16, 120, 50) # Green for Passed

    add_heading_2("4.3 Pengujian Penerimaan Pengguna (System Usability Scale - SUS)")
    doc.add_paragraph("• Fokus Pengujian: Mengukur tingkat kebergunaan (usability), kemudahan pemahaman antarmuka, dan tingkat kepuasan pengguna akhir secara empiris dan ilmiah.\n"
                      "• Metodologi Baku: Menggunakan instrumen kuesioner System Usability Scale (SUS) standar John Brooke (1986) yang terdiri dari 10 pertanyaan baku berskala Likert 1–5 (Sangat Tidak Setuju hingga Sangat Setuju).\n"
                      "• Formula Kalkulasi Skor:\n"
                      "  - Skor Positif (P1, P3, P5, P7, P9) = Nilai Skala - 1\n"
                      "  - Skor Negatif (P2, P4, P6, P8, P10) = 5 - Nilai Skala\n"
                      "  - Skor Akhir SUS = Total Skor Terbobot x 2.5\n"
                      "• Protokol Eksekusi: Pengujian berbasis tugas (task-based usability test) kepada 15–20 responden target pengguna riil.\n"
                      "• Standar Kelayakan: Target skor kelayakan minimum ditetapkan sebesar 70 (Grade B / Good - Acceptable).")

    # ==================== BAB 5 ====================
    add_heading_1("5. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR SISTEM")
    doc.add_paragraph("Pengembangan sistem mengadopsi pola Clean Architecture / 3-Tier Layered Architecture untuk memastikan keterpisahan kepentingan (Separation of Concerns), kemudahan perawatan kode (maintainability), serta skalabilitas tinggi:")
    
    p_arch1 = doc.add_paragraph()
    p_arch1.add_run("1. Presentation Layer (Client-Side Interface):\n").bold = True
    p_arch1.add_run("Dibangun menggunakan framework berbasis komponen reaktif modern (React / Next.js / Flutter) dengan styling Tailwind CSS yang terhubung langsung ke Design System Figma. Menggunakan state management terpusat dan caching data API client (TanStack Query/Axios) untuk navigasi instan tanpa reload.")

    p_arch2 = doc.add_paragraph()
    p_arch2.add_run("2. Application & Service Layer (Server-Side Backend):\n").bold = True
    p_arch2.add_run("Dibangun menggunakan RESTful Web API berbasis runtime performa tinggi (Node.js NestJS/Express, Python FastAPI, Go, atau Laravel). Menerapkan pola modular yang memisahkan Controller (routing & validasi DTO), Service Layer (aturan logika bisnis), dan Repository Layer (abstraksi query data). Keamanan diperkuat dengan autentikasi JWT Token, proteksi CORS, dan Rate Limiting.")

    p_arch3 = doc.add_paragraph()
    p_arch3.add_run("3. Data Persistence & Cloud Infrastructure:\n").bold = True
    p_arch3.add_run("Menggunakan Relational Database Management System (PostgreSQL / MySQL) yang menjamin integritas transaksi ACID (Atomicity, Consistency, Isolation, Durability) dan indeks teroptimasi. Deployment mengadopsi platform cloud modern (Vercel, Railway, Supabase, atau Cloud VPS) dengan koneksi terenkripsi penuh TLS 1.3 / HTTPS.")

    # ==================== BAB 6 ====================
    add_heading_1("6. MANAJEMEN RISIKO PROYEK REKAYASA (ENTERPRISE RISK MANAGEMENT)")
    doc.add_paragraph("Manajemen risiko menggunakan matriks kuadran formal Probabilitas (1–5) x Dampak (1–5) yang diadaptasi dari standar ISO 31000:")

    tbl_rsk = doc.add_table(rows=6, cols=7)
    tbl_rsk.alignment = WD_TABLE_ALIGNMENT.CENTER
    rsk_widths = [0.8, 1.8, 0.4, 0.4, 0.6, 1.8, 1.2]
    rsk_data = [
        ("ID", "Deskripsi Risiko Rekayasa", "P", "I", "Skor", "Tindakan Mitigasi Preventif", "Penanggung Jawab"),
        ("RSK-01", "Latensi & Timeout Integrasi API Pihak Ketiga", "3", "4", "12 (M)", "Membangun Mock Server & Adapter Pattern; implementasi caching data.", "ANDA (Tech Lead)"),
        ("RSK-02", "Degradasi Performa DB pada Volume Record Tinggi", "2", "4", "8 (M)", "Optimalisasi indexing skema basis data dan connection pooling.", "ANDA (Tech Lead)"),
        ("RSK-03", "Kesenjangan Antarmuka Koding vs Desain Figma", "3", "3", "9 (M)", "Penyusunan Design Token & sesi review antarmuka mingguan.", "B (UI/UX Designer)"),
        ("RSK-04", "Ketidaktercapaian Target Responden Usability SUS", "2", "4", "8 (M)", "Pool responden disiapkan sejak awal; uji coba daring termoderasi.", "B (UI/UX Designer)"),
        ("RSK-05", "Scope Creep Kritis yang Menggeser Jadwal Rilis", "3", "4", "12 (M)", "Kunci baseline SRS v1.0; terapkan trade-off analysis fitur.", "A (Project Manager)")
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
    doc.add_paragraph("Dokumen Spesifikasi Rekayasa & Manajemen Perangkat Lunak (PMP) ini disahkan sebagai acuan baku pelaksanaan tugas akhir / capstone engineering project.")

    tbl_sign = doc.add_table(rows=3, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [3.5, 3.6]
    
    sign_boxes = [
        ("TIM REKAYASA PENGEMBANG (ENGINEERING POD)", "PEMBIMBING AKADEMIK (KEY STAKEHOLDER)"),
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
    print(f"Professional Capstone PMP successfully created at: {output_path}")

if __name__ == "__main__":
    output_file = r"c:\Users\An\Herd\portofolio\Project_Management_Plan_Tugas_Akhir_Professional.docx"
    create_professional_capstone_pmp(output_file)
