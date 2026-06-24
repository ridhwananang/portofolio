import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_path = r"c:\Users\An\Herd\portofolio\public\images\Profile.pdf"
    
    # Page setup - A4 size
    # Width: 595.27, Height: 841.89
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=24,
        bottomMargin=24
    )

    styles = getSampleStyleSheet()

    # Custom styles
    name_style = ParagraphStyle(
        'NameStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=1, # Center
        textColor=colors.HexColor('#0F172A')
    )

    sub_style = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=1, # Center
        textColor=colors.HexColor('#4F46E5')
    )

    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        alignment=1, # Center
        textColor=colors.HexColor('#334155')
    )

    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    job_title_style = ParagraphStyle(
        'JobTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )

    job_desc_style = ParagraphStyle(
        'JobDescStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        leftIndent=12,
        firstLineIndent=-8,
        textColor=colors.HexColor('#334155')
    )

    edu_title_style = ParagraphStyle(
        'EduTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )

    edu_sub_style = ParagraphStyle(
        'EduSubStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )

    story = []

    # Title section
    story.append(Paragraph("RIDHWAN ANANG MA'RUF", name_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Full Stack Developer | Informatics Engineering Student", sub_style))
    story.append(Spacer(1, 2))
    
    contact_text = (
        "Tangerang Selatan, Indonesia &bull; +62 812-9850-2177 &bull; "
        "ridhwananang@gmail.com &bull; github.com/ridhwananang &bull; "
        "linkedin.com/in/ridhwan-anang-ma-ruf/"
    )
    story.append(Paragraph(contact_text, contact_style))
    story.append(Spacer(1, 6))

    # Helper function for section headings with a bottom border line
    def add_section_heading(title_text):
        p = Paragraph(title_text, heading_style)
        t = Table([[p]], colWidths=[A4[0] - 72])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 0.75, colors.HexColor('#CBD5E1')), # Slate-300 line
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(t)
        story.append(Spacer(1, 4))

    # 1. Summary
    add_section_heading("SUMMARY")
    summary_text = (
        "Dedicated Full Stack Developer and Computer Science student focused on engineering reliable, "
        "scalable, and secure end-to-end software applications. Experienced in developing backend "
        "architectures using Laravel, designing secure RESTful APIs, and integrating interactive modern "
        "frontends with React and TypeScript. Skilled in database optimization (PostgreSQL, MySQL, MongoDB) "
        "and implementing organized DevOps workflows to deploy production-ready applications in real-scale environments."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 6))

    # 2. Professional Experience
    add_section_heading("PROFESSIONAL EXPERIENCE")

    def add_job(title, date, bullets):
        p_title = Paragraph(title, job_title_style)
        p_date = Paragraph(date, ParagraphStyle('JobDate', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, alignment=2, textColor=colors.HexColor('#475569')))
        t = Table([[p_title, p_date]], colWidths=[A4[0] - 72 - 150, 150])
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ('TOPPADDING', (0,0), (-1,-1), 1),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(t)
        story.append(Spacer(1, 2))
        for bullet in bullets:
            story.append(Paragraph(f"&bull; {bullet}", job_desc_style))
        story.append(Spacer(1, 4))

    # Job 1
    add_job(
        "Full Stack Developer &ndash; SkillVentura (RPG Gamified LMS)",
        "November 2025 &ndash; Present",
        [
            "Engineered a gamified Learning Management System (LMS) with RPG elements, boosting student engagement metrics by 25%.",
            "Structured database systems using MongoDB and integrated 15+ secure RESTful APIs via Inertia.js.",
            "Deployed 4 core interactive features (character selection, leveling, XP, and certification), increasing student course completion rates by 15%."
        ]
    )

    # Job 2
    add_job(
        "Full Stack Developer &ndash; SIPresensi (Attendance Management System)",
        "April 2026 &ndash; Present",
        [
            "Created a real-time employee and school attendance system, reducing monthly reporting processing time by 50% via automated generation.",
            "Programmed backend services with Laravel and PostgreSQL, combined with a React frontend supporting 100+ active daily users.",
            "Implemented granular user role management and 12+ secure API endpoints, guaranteeing 100% data access compliance."
        ]
    )

    # Job 3
    add_job(
        "Full Stack Developer &ndash; NutriVision (AI-Powered Nutrition Assistant)",
        "February 2026 &ndash; Present",
        [
            "Collaborated in a 4-member development team to build an AI-powered instant nutrition analysis and calorie detection application.",
            "Architected backend services using Laravel and PostgreSQL, optimizing AI model API response times to under 500ms.",
            "Designed 8+ responsive dashboard interfaces using React and TypeScript, enhancing mobile layout usability score by 40%."
        ]
    )

    # Job 4
    add_job(
        "Full Stack Developer &ndash; MTs Baitis Salmah Academic Portal",
        "May 2026 &ndash; June 2026",
        [
            "Delivered an integrated academic information portal and official news CMS serving 300+ students and staff.",
            "Built automated grading modules, reducing teachers' report card preparation time by 30%.",
            "Utilized Laravel, MySQL, React, and TypeScript to sustain 99.9% system uptime and operational stability for administrative workflows."
        ]
    )
    story.append(Spacer(1, 2))

    # 3. Skills
    add_section_heading("SKILLS")
    skills_data = [
        ("Programming Languages", "JavaScript, TypeScript, PHP, SQL, HTML5, CSS3, Python"),
        ("Frameworks & Libraries", "Laravel, React.js, Tailwind CSS, Inertia.js, FastAPI, Bootstrap"),
        ("Databases", "PostgreSQL, MongoDB, MySQL, SQLite, Relational Database Design"),
        ("Tools & DevOps", "Git, GitHub, RESTful API, Postman, DevOps Workflow, Clean Architecture"),
        ("Soft Skills", "Problem Solving, Team Collaboration, Analytical Thinking, Adaptability")
    ]
    for label, items in skills_data:
        p = Paragraph(f"<b>{label}:</b> {items}", body_style)
        story.append(p)
        story.append(Spacer(1, 1))
    story.append(Spacer(1, 4))

    # 4. Certifications
    add_section_heading("CERTIFICATIONS")
    cert_text = (
        "<b>Dicoding Indonesia:</b> "
        "Belajar Fundamental Back-End dengan JavaScript (L4PQ9L2Q4PO1) &bull; "
        "Belajar Back-End Pemula dengan JavaScript (DC-BE-JS) &bull; "
        "Belajar Membuat Aplikasi Web dengan React (DC-APP-RCT) &bull; "
        "Belajar Fundamental Aplikasi Web dengan React (DC-FUND-RCT)"
    )
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 6))

    # 5. Education
    add_section_heading("EDUCATION")

    def add_edu(school, date, degree):
        p_school = Paragraph(school, edu_title_style)
        p_date = Paragraph(date, ParagraphStyle('EduDate', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, alignment=2, textColor=colors.HexColor('#475569')))
        t = Table([[p_school, p_date]], colWidths=[A4[0] - 72 - 150, 150])
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ('TOPPADDING', (0,0), (-1,-1), 1),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(t)
        story.append(Spacer(1, 1))
        story.append(Paragraph(degree, edu_sub_style))
        story.append(Spacer(1, 4))

    add_edu(
        "Coding Camp 2026 - Powered by DBS Foundation",
        "February 2026 - July 2026",
        "Full-Stack Web Developer"
    )
    add_edu(
        "Universitas Pamulang",
        "March 2024 &ndash; Present",
        "B.S. in Informatics Engineering &ndash; Software Engineering Focus"
    )
    add_edu(
        "SMK Telekomunikasi Tunas Harapan",
        "July 2014 &ndash; June 2017",
        "Computer & Network Engineering / Software Engineering"
    )

    doc.build(story)
    print(f"Successfully generated PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
