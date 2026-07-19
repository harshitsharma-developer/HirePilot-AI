from fastapi import APIRouter
from fastapi.responses import Response

from app.models.schemas import GeneratePdfRequest
from app.services.pdf import build_resume_pdf

router = APIRouter(tags=["pdf"])


@router.post("/generate-pdf")
async def generate_pdf(payload: GeneratePdfRequest) -> Response:
    pdf_bytes = build_resume_pdf(payload.resume)
    filename = (payload.resume.name or "hirepilot-resume").replace(" ", "-").lower()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}-optimized.pdf"'},
    )
