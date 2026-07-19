from __future__ import annotations

import io

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer

from app.models.schemas import ResumeData


def build_resume_pdf(resume: ResumeData) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleCustom",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=6,
        textColor="#0f172a",
    )
    heading = ParagraphStyle(
        "HeadingCustom",
        parent=styles["Heading2"],
        fontSize=12,
        spaceBefore=14,
        spaceAfter=6,
        textColor="#0f766e",
    )
    body = ParagraphStyle(
        "BodyCustom",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        textColor="#1e293b",
    )
    subtle = ParagraphStyle(
        "SubtleCustom",
        parent=styles["BodyText"],
        fontSize=9,
        textColor="#475569",
        spaceAfter=8,
    )

    story: list = []
    story.append(Paragraph(resume.name or "Optimized Resume", title))
    contact = " | ".join([part for part in [resume.email, resume.phone] if part])
    if contact:
        story.append(Paragraph(contact, subtle))

    if resume.summary:
        story.append(Paragraph("Summary", heading))
        story.append(Paragraph(resume.summary, body))

    if resume.experience:
        story.append(Paragraph("Experience", heading))
        for item in resume.experience:
            header = " — ".join([part for part in [item.title, item.company] if part])
            dates = " | ".join([part for part in [item.start_date, item.end_date] if part])
            story.append(Paragraph(header or "Role", body))
            if dates or item.location:
                story.append(Paragraph(" · ".join([p for p in [dates, item.location] if p]), subtle))
            if item.bullets:
                story.append(
                    ListFlowable(
                        [ListItem(Paragraph(bullet, body)) for bullet in item.bullets if bullet],
                        bulletType="bullet",
                        leftIndent=12,
                    )
                )
            story.append(Spacer(1, 6))

    if resume.projects:
        story.append(Paragraph("Projects", heading))
        for project in resume.projects:
            story.append(Paragraph(project.name or "Project", body))
            if project.description:
                story.append(Paragraph(project.description, subtle))
            if project.technologies:
                story.append(Paragraph("Tech: " + ", ".join(project.technologies), subtle))
            if project.bullets:
                story.append(
                    ListFlowable(
                        [ListItem(Paragraph(bullet, body)) for bullet in project.bullets if bullet],
                        bulletType="bullet",
                        leftIndent=12,
                    )
                )

    if resume.skills:
        story.append(Paragraph("Skills", heading))
        story.append(Paragraph(", ".join(resume.skills), body))

    if resume.education:
        story.append(Paragraph("Education", heading))
        for edu in resume.education:
            line = " — ".join([part for part in [edu.degree, edu.field, edu.institution] if part])
            story.append(Paragraph(line or edu.institution or "Education", body))
            dates = " | ".join([part for part in [edu.start_date, edu.end_date] if part])
            if dates:
                story.append(Paragraph(dates, subtle))
            if edu.details:
                story.append(Paragraph(edu.details, subtle))

    if resume.certifications:
        story.append(Paragraph("Certifications", heading))
        story.append(Paragraph(", ".join(resume.certifications), body))

    doc.build(story)
    return buffer.getvalue()
