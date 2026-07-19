from __future__ import annotations

from fastapi import HTTPException, UploadFile

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",
}


def validate_resume_file(file: UploadFile, max_bytes: int) -> str:
    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    lower = filename.lower()
    if not any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are supported")

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        # Some browsers send odd MIME types; extension check above is primary.
        if not (lower.endswith(".pdf") or lower.endswith(".docx")):
            raise HTTPException(status_code=400, detail="Unsupported file type")

    return lower


async def read_upload_limited(file: UploadFile, max_bytes: int) -> bytes:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {max_bytes // (1024 * 1024)}MB limit")
    return data
