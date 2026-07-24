import os
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def convert_webp_to_jpg(webp_path):
    jpg_path = webp_path.replace('.webp', '_temp.jpg')
    if os.path.exists(webp_path):
        img = PILImage.open(webp_path).convert('RGB')
        img.thumbnail((800, 600), PILImage.Resampling.LANCZOS)
        img.save(jpg_path, 'JPEG', quality=80, optimize=True)
        return jpg_path
    return None

def generate_portfolio_pdf():
    pdf_path = r"c:\Users\An\Herd\portofolio\public\images\Portofolio_Ridhwan_Anang_Maruf.pdf"
    img_dir = r"c:\Users\An\Herd\portofolio\public\images"

    # Page setup - A4 Landscape or Portrait?
    # Portrait A4: 595.27 x 841.89
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        alignment=0, # Left
        textColor=colors.HexColor('#0F172A')
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=0,
        textColor=colors.HexColor('#4F46E5')
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A')
    )

    proj_title_style = ParagraphStyle(
        'ProjTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    proj_desc_style = ParagraphStyle(
        'ProjDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    tag_style = ParagraphStyle(
        'TagStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#4F46E5')
    )

    story = []

    # ----------------------------------------------------
    # COVER / HEADER SECTION
    # ----------------------------------------------------
    story.append(Paragraph("RIDHWAN ANANG MA'RUF", title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("FULL STACK DEVELOPER &bull; PORTFOLIO SHOWCASE", subtitle_style))
    story.append(Spacer(1, 6))

    contact_info = (
        "<b>Website:</b> <a href='https://ridhwananang.id/'>https://ridhwananang.id/</a> &bull; "
        "<b>Email:</b> ridhwananang@gmail.com &bull; "
        "<b>Location:</b> Tangerang Selatan, Indonesia &bull; "
        "<b>GitHub:</b> github.com/ridhwananang &bull; "
        "<b>LinkedIn:</b> linkedin.com/in/ridhwan-anang-ma-ruf/"
    )
    story.append(Paragraph(contact_info, meta_style))
    story.append(Spacer(1, 10))

    # Divider line
    def add_line():
        t = Table([[""]], colWidths=[A4[0] - 72])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

    add_line()

    # Function to add a project showcase block
    temp_files_to_clean = []

    def add_project_card(title, tags_str, description, features_str, webp_filename):
        webp_path = os.path.join(img_dir, webp_filename)
        jpg_path = convert_webp_to_jpg(webp_path)
        
        img_cell = ""
        if jpg_path and os.path.exists(jpg_path):
            temp_files_to_clean.append(jpg_path)
            # Image aspect ratio constraint
            # Width ~195, Height ~105
            img_cell = RLImage(jpg_path, width=195, height=105)

        # Right side info
        info_elements = [
            Paragraph(f"<b>{title}</b>", proj_title_style),
            Spacer(1, 1),
            Paragraph(f"<b>Tech Stack:</b> {tags_str}", tag_style),
            Spacer(1, 2),
            Paragraph(description, proj_desc_style),
            Spacer(1, 2),
            Paragraph(f"<b>Key Highlights:</b> {features_str}", proj_desc_style),
        ]

        card_table = Table([[img_cell, info_elements]], colWidths=[205, A4[0] - 72 - 215])
        card_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))

        story.append(card_table)
        story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # FEATURED PROJECTS
    # ----------------------------------------------------
    story.append(Paragraph("FEATURED PROJECTS & APPLICATIONS", heading_style))
    story.append(Spacer(1, 8))

    # Project 1: LMS SkillVentura
    add_project_card(
        "1. LMS SkillVentura (RPG Gamified Learning Management System)",
        "LARAVEL &bull; INERTIA.JS &bull; REACT &bull; TYPESCRIPT &bull; MONGODB &bull; RESTful API",
        "A modern Learning Management System (LMS) engineered with RPG gamification elements (XP, leveling, character selection, and automatic PDF certificates) boosting student course completion rates.",
        "Gamified progress tracking, 15+ secure RESTful APIs via Inertia.js, scalable MongoDB structure.",
        "lms-skillventura.webp"
    )

    # Project 2: Nutrivision
    add_project_card(
        "2. Nutrivision (AI-Powered Instant Nutrition Assistant)",
        "PYTHON &bull; FASTAPI &bull; REACT &bull; TYPESCRIPT &bull; POSTGRESQL &bull; COMPUTER VISION",
        "AI-powered nutrition analysis and calorie detection application capable of extracting instant food macronutrients (protein, carbs, fat, calories) directly from user-uploaded meal photos.",
        "FastAPI backend optimized for <500ms AI model response time, PostgreSQL nutrition log.",
        "nutrivision.webp"
    )

    # Project 3: SmartBanana
    add_project_card(
        "3. SmartBanana (AI Computer Vision Supply Chain Monitoring)",
        "PYTHON &bull; FLASK &bull; DEEP LEARNING &bull; REACT &bull; TYPESCRIPT &bull; MYSQL",
        "Supply chain monitoring and real-time banana ripeness classification platform utilizing AI Computer Vision deep learning algorithms to track fruit quality throughout distribution.",
        "Real-time image inferencing engine, distribution analytics dashboard, inventory management.",
        "smartbanana.webp"
    )

    # Project 4: ProManageSys
    add_project_card(
        "4. ProManageSys (Enterprise Team Collaboration & Kanban System)",
        "LARAVEL &bull; REACT &bull; TYPESCRIPT &bull; MYSQL &bull; CLEAN ARCHITECTURE",
        "Comprehensive project management platform facilitating seamless team collaboration, interactive Kanban task boards, role delegation (admin/manager/member), and progress charts.",
        "Interactive drag-and-drop Kanban, MySQL many-to-many relationship query optimizations.",
        "promanagesys.webp"
    )

    # Project 5: SiPresens
    add_project_card(
        "5. SiPresens (Real-Time Geofenced Attendance System)",
        "LARAVEL &bull; REACT &bull; TYPESCRIPT &bull; POSTGRESQL &bull; GEOFENCING API",
        "Employee and school attendance management system with real-time GPS coordinate check-ins, anti-mock location detection, and automated HR monthly report generation.",
        "50% reporting time reduction via automated generation, 100+ active daily users supported.",
        "sipresens.webp"
    )

    # Project 6: MyClassyTask
    add_project_card(
        "6. MyClassyTask (AI-Driven Intelligent Task Scheduler)",
        "LARAVEL &bull; GEMINI AI &bull; REACT &bull; TYPESCRIPT &bull; MYSQL",
        "AI-assisted task management application that parses natural language task descriptions into subtasks, priorities, and deadlines automatically using Gemini AI integration.",
        "Smart priority scheduling, automated task nesting, Gemini LLM text parsing.",
        "myclassytask.webp"
    )

    # Project 7: SportIn
    add_project_card(
        "7. SportIn (Sports Venue Booking & Player Matchmaking Platform)",
        "LARAVEL &bull; REACT &bull; TYPESCRIPT &bull; MYSQL &bull; PESSIMISTIC LOCKING",
        "Online sports field booking and player matchmaking platform connecting sports enthusiasts, managing real-time slot reservations, and handling group player chats.",
        "Pessimistic transaction locking in MySQL to prevent double-booking, booking state-chart.",
        "sportin.webp"
    )

    # Project 8: Finverra
    add_project_card(
        "8. Finverra (Warehouse Financial Management System)",
        "LARAVEL &bull; REACT &bull; TYPESCRIPT &bull; MYSQL &bull; REPOSITORY PATTERN",
        "Warehouse financial management application for cashflow tracking, real-time profit/loss reporting, warehouse rental billing, and inventory integration.",
        "Clean Architecture repository pattern, automated real-time financial reporting.",
        "finverra.webp"
    )

    # Project 9: Mts Baitis Salmah
    add_project_card(
        "9. Mts Baitis Salmah (Academic Portal & News CMS)",
        "LARAVEL &bull; REACT &bull; TYPESCRIPT &bull; MYSQL &bull; INERTIA.JS",
        "Integrated academic information portal and official news CMS serving 300+ students and administrative staff, featuring automated student report card grading modules.",
        "30% report card preparation time reduction, 99.9% uptime for administrative workflows.",
        "mts-baitis-salmah.webp"
    )

    # ----------------------------------------------------
    # CERTIFICATION & FOOTER SECTION
    # ----------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("PRIMARY CERTIFICATION", heading_style))
    story.append(Spacer(1, 4))
    
    cert_box_text = (
        "<b>Coding Camp 2026 powered by DBS Foundation &ndash; Full-Stack Web Developer</b><br/>"
        "<font size=8 color='#475569'>Issued by <b>Dicoding Indonesia & DBS Foundation</b> (July 2026)</font>"
    )
    cert_table = Table([[Paragraph(cert_box_text, proj_desc_style)]], colWidths=[A4[0] - 72])
    cert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EEF2FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#6366F1')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cert_table)

    doc.build(story)
    print(f"Successfully generated Portfolio PDF at: {pdf_path}")

    # Clean up temp PNG files
    for tmp in temp_files_to_clean:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except Exception:
                pass

if __name__ == "__main__":
    generate_portfolio_pdf()
