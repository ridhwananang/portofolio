import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_path = r"c:\Users\An\Herd\portofolio\public\images\Profile.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    # Page setup - A4 size (595.2756 x 841.8898 pt)
    # Note: ReportLab SimpleDocTemplate Frame adds 6pt leftPadding and 6pt rightPadding by default.
    margin_x = 36
    margin_top = 24
    margin_bottom = 22
    content_width = A4[0] - (margin_x * 2) - 12  # Exact usable frame width (511.2756 pt -> x=42.0 to x=553.3)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=margin_x,
        rightMargin=margin_x,
        topMargin=margin_top,
        bottomMargin=margin_bottom,
        title="Ridhwan Anang Ma'ruf - Full Stack Developer Resume",
        author="Ridhwan Anang Ma'ruf",
        subject="Full Stack Software Engineer Curriculum Vitae (ATS Optimized)",
        keywords=(
            "Full Stack Developer, Software Engineer, Laravel, PHP, React.js, TypeScript, "
            "JavaScript, Node.js, Python, FastAPI, PostgreSQL, MongoDB, MySQL, Redis, "
            "RabbitMQ, AWS S3, Cloudflare R2, RESTful API, Clean Architecture"
        ),
        creator="Ridhwan Anang Ma'ruf"
    )

    styles = getSampleStyleSheet()

    # Typography Styles (Standard ATS-Safe Helvetica Type1 Family)
    name_style = ParagraphStyle(
        'NameStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17.5,
        leading=21,
        alignment=1,  # Center
        textColor=colors.HexColor('#0F172A')
    )

    role_style = ParagraphStyle(
        'RoleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=1,  # Center
        textColor=colors.HexColor('#3730A3')
    )

    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.5,
        alignment=1,  # Center
        textColor=colors.HexColor('#334155')
    )

    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.3,
        leading=11.5,
        textColor=colors.HexColor('#0F172A')
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.4,
        leading=11.6,
        textColor=colors.HexColor('#1E293B')
    )

    skill_style = ParagraphStyle(
        'SkillStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.3,
        textColor=colors.HexColor('#1E293B')
    )

    entry_title_style = ParagraphStyle(
        'EntryTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=11.5,
        textColor=colors.HexColor('#0F172A')
    )

    entry_date_style = ParagraphStyle(
        'EntryDateStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.3,
        leading=11.5,
        alignment=2,  # Right
        textColor=colors.HexColor('#475569')
    )

    entry_sub_style = ParagraphStyle(
        'EntrySubStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.2,
        leading=10.8,
        textColor=colors.HexColor('#475569')
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.2,
        leftIndent=10,
        firstLineIndent=-7,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # ==================== HEADER ====================
    story.append(Paragraph("RIDHWAN ANANG MA'RUF", name_style))
    story.append(Spacer(1, 1.5))
    story.append(Paragraph("Full Stack Developer", role_style))
    story.append(Spacer(1, 2.5))

    contact_line_1 = (
        "Tangerang Selatan, Indonesia &bull; +62 812-9850-2177 &bull; "
        "<a href='mailto:ridhwananang@gmail.com'>ridhwananang@gmail.com</a>"
    )
    contact_line_2 = (
        "<a href='https://ridhwananang.id'>ridhwananang.id</a> &bull; "
        "<a href='https://github.com/ridhwananang'>github.com/ridhwananang</a> &bull; "
        "<a href='https://www.linkedin.com/in/ridhwan-anang-ma-ruf/'>linkedin.com/in/ridhwan-anang-ma-ruf</a>"
    )
    story.append(Paragraph(contact_line_1, contact_style))
    story.append(Paragraph(contact_line_2, contact_style))
    story.append(Spacer(1, 5))

    # Helper for Section Headings (100% aligned to content_width)
    def add_section_heading(title_text):
        p = Paragraph(title_text, heading_style)
        t = Table([[p]], colWidths=[content_width])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.75, colors.HexColor('#CBD5E1')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t)
        story.append(Spacer(1, 3.5))

    # Helper for Entry Header Row (Title on left, Date on right, zero margin overhang)
    def add_entry_header(title_html, date_text, subtitle_text=None):
        date_col_width = 115
        title_col_width = content_width - date_col_width
        p_title = Paragraph(title_html, entry_title_style)
        p_date = Paragraph(date_text, entry_date_style)
        t = Table([[p_title, p_date]], colWidths=[title_col_width, date_col_width])
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0.5),
            ('TOPPADDING', (0, 0), (-1, -1), 0.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t)
        if subtitle_text:
            story.append(Spacer(1, 1))
            story.append(Paragraph(subtitle_text, entry_sub_style))
        story.append(Spacer(1, 1.5))

    def add_bullets(bullets):
        for b in bullets:
            story.append(Paragraph(f"&bull; {b}", bullet_style))
        story.append(Spacer(1, 4))

    # ==================== 1. PROFESSIONAL SUMMARY ====================
    add_section_heading("PROFESSIONAL SUMMARY")
    summary_text = (
        "Results-driven Full Stack Developer with end-to-end experience engineering scalable, production-ready web applications "
        "from concept to deployment. Proficient in designing robust backend architectures using Laravel, Node.js, and Python (FastAPI), "
        "alongside responsive single-page interfaces with React.js and TypeScript, backed by relational and NoSQL databases "
        "(PostgreSQL, MySQL, MongoDB). Adept at applying Clean Architecture principles, asynchronous queue pipelines, cloud object "
        "storage (AWS S3, Cloudflare R2), and WebAuthn biometric authentication to deliver high-reliability software systems."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 5))

    # ==================== 2. WORK EXPERIENCE ====================
    add_section_heading("WORK EXPERIENCE")

    # Job 1 (Most recent completion: Jun 2026)
    add_entry_header(
        "Full Stack Developer &ndash; SiPresens (Integrated School Attendance &amp; Academic System)",
        "Apr 2026 &ndash; Jun 2026"
    )
    add_bullets([
        "Engineered an end-to-end academic attendance ecosystem serving 100+ active daily users across 4 role-based portals (Admin, Teachers, Parents, and Students) with 100% access control compliance.",
        "Built an asynchronous WhatsApp notification pipeline via Laravel Queue Jobs, dispatching real-time attendance alerts and absence reports directly to parents within seconds.",
        "Integrated Cloudflare R2 object storage for medical leave documentation and deployed passwordless biometric authentication using WebAuthn Passkeys.",
        "Automated a multi-format reporting engine delivering streaming CSV/Excel exports and print-ready PDF summaries, reducing administrative processing time by 50%."
    ])

    # Job 2 (Nov 2025 - May 2026)
    add_entry_header(
        "Full Stack Developer &ndash; SkillVentura (RPG Gamified LMS &amp; P2P Quest Marketplace)",
        "Nov 2025 &ndash; May 2026"
    )
    add_bullets([
        "Designed and developed a gamified Learning Management System (LMS) and P2P Quest Marketplace using Laravel, React.js, and TypeScript, boosting student course completion rates by 15%.",
        "Orchestrated core marketplace workflows from scratch, including P2P freelance bidding, escrow down-payment validation, multi-stage revision cycles, and an automated dispute arbitration engine.",
        "Modeled scalable NoSQL data schemas in MongoDB to manage stateful user progression, dynamic character leveling, and real-time XP calculation, increasing student engagement metrics by 25%.",
        "Delivered an automated digital credential pipeline utilizing DomPDF, dynamic canvas signatures, and direct AWS S3 storage with unique cryptographic verification IDs."
    ])

    # ==================== 3. FEATURED TECHNICAL PROJECTS ====================
    add_section_heading("FEATURED TECHNICAL PROJECTS")

    add_entry_header(
        "Full Stack Developer &amp; System Architect &ndash; NutriVision (AI Dietary &amp; Nutrition Platform)",
        "Jan 2026 &ndash; Jun 2026",
        "DBS Foundation Coding Camp &ndash; Capstone Project (4-Member Team &bull; Cohort ID: CC26-PSU071)"
    )
    add_bullets([
        "Developed a full-stack AI dietary intelligence platform in a 4-person agile team, synchronizing client interfaces, relational database schemas, and external AI inference services.",
        "Implemented Clean Architecture using the Repository Pattern with dynamic driver binding to decouple core business logic from Supabase PostgreSQL data persistence.",
        "Streamlined a multi-modal AI integration pipeline combining Python FastAPI Computer Vision microservices for meal detection with Groq LLaMA 3.3 LLMs, achieving sub-500ms API response times.",
        "Crafted 8+ responsive React.js and TypeScript dashboard interfaces featuring real-time camera streaming via browser MediaDevices, dynamic macro tracking, and an interactive AI chatbot, improving mobile usability scores by 40%."
    ])

    # ==================== 4. SKILLS ====================
    add_section_heading("SKILLS")
    skills_data = [
        ("Programming Languages", "JavaScript (ES6+), TypeScript, PHP, Python, SQL, HTML5, CSS3"),
        ("Frameworks &amp; Libraries", "Laravel, React.js, Node.js (Hapi/Express), FastAPI, Inertia.js, Tailwind CSS, Bootstrap"),
        ("Databases &amp; Cloud Storage", "PostgreSQL (Supabase), MySQL, MongoDB, Redis, SQLite, AWS (S3, EC2, RDS, IAM), Cloudflare R2"),
        ("Tools &amp; Architecture", "Git, GitHub, RESTful API Design, RabbitMQ, Queue Jobs, WebAuthn Passkeys, Postman, Clean Architecture"),
        ("Soft Skills", "Critical Thinking, Analytical Problem Solving, Structured Execution, End-to-End Ownership, Team Collaboration")
    ]
    for label, items in skills_data:
        story.append(Paragraph(f"<b>{label}:</b> {items}", skill_style))
        story.append(Spacer(1, 1.5))
    story.append(Spacer(1, 4.5))

    # ==================== 5. CERTIFICATIONS ====================
    add_section_heading("CERTIFICATIONS")

    add_entry_header(
        "Coding Camp 2026 Powered by DBS Foundation &ndash; Full-Stack Web Developer",
        "Issued Jul 2026",
        "Dicoding Indonesia &amp; DBS Foundation &bull; Credential ID: CC26/GRAD/XXVI-07/CFCC288D6Y1198 (943 Learning Hours)"
    )
    story.append(Spacer(1, 2.5))

    add_entry_header(
        "Back-End Development, React, Cloud Computing &amp; AI Specializations",
        "2024 &ndash; 2026",
        "Dicoding Indonesia &amp; AWS &bull; Back-End JS (L4PQ9L2Q4PO1), React Web Apps (KEXLQW78YPG2), AWS Cloud &amp; Gen AI (L4PQ9MY0OPO1), SQL (6RPN1JQO8X2M), JavaScript ES6+ (JLX1VD7NNZ72), AI Fundamentals (QLZ97EME9P5D)"
    )
    story.append(Spacer(1, 4.5))

    # ==================== 6. EDUCATION ====================
    add_section_heading("EDUCATION")

    add_entry_header(
        "Universitas Pamulang &ndash; B.S. in Informatics Engineering (Software Engineering Focus)",
        "Mar 2024 &ndash; Present",
        "Expected Graduation: 2028 &bull; Tangerang Selatan, Indonesia &bull; Coursework: Software Engineering, Data Structures, Relational Databases"
    )

    doc.build(story)
    print(f"Successfully generated ATS-optimized PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
