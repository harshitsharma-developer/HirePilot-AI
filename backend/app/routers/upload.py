from fastapi import APIRouter, File, UploadFile

from app.config import get_settings
from app.models.schemas import ResumeData
from app.services.gemini import get_gemini
from app.services.parser import extract_resume_text, parse_resume_with_gemini
from app.utils.files import read_upload_limited, validate_resume_file

router = APIRouter(tags=["resume"])


@router.post("/upload-resume", response_model=ResumeData)
async def upload_resume(file: UploadFile = File(...)) -> ResumeData:
    settings = get_settings()
    filename = validate_resume_file(file, settings.max_upload_bytes)
    data = await read_upload_limited(file, settings.max_upload_bytes)
    text = extract_resume_text(filename, data)
    gemini = get_gemini()
    return parse_resume_with_gemini(gemini, text)
