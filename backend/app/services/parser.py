from __future__ import annotations

import io

import fitz
from docx import Document
from fastapi import HTTPException

from app.models.schemas import ResumeData
from app.prompts.resume_parser import RESUME_PARSER_PROMPT
from app.services.gemini import GeminiService


def extract_text_from_pdf(data: bytes) -> str:
    try:
        with fitz.open(stream=data, filetype="pdf") as doc:
            chunks = [page.get_text("text") for page in doc]
        return "\n".join(chunks).strip()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {exc}") from exc


def extract_text_from_docx(data: bytes) -> str:
    try:
        document = Document(io.BytesIO(data))
        paragraphs = [p.text.strip() for p in document.paragraphs if p.text and p.text.strip()]
        return "\n".join(paragraphs).strip()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to read DOCX: {exc}") from exc


def extract_resume_text(filename: str, data: bytes) -> str:
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(data)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(data)
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are supported")

    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume")
    return text


def parse_resume_with_gemini(gemini: GeminiService, resume_text: str) -> ResumeData:
    payload = gemini.generate_json(RESUME_PARSER_PROMPT + resume_text)
    return ResumeData.model_validate(payload)
