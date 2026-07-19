from fastapi import APIRouter

from app.models.schemas import OptimizeResumeRequest, OptimizeResumeResponse
from app.services.gemini import get_gemini
from app.services.optimize import optimize_resume

router = APIRouter(tags=["optimize"])


@router.post("/optimize-resume", response_model=OptimizeResumeResponse)
async def optimize_resume_endpoint(payload: OptimizeResumeRequest) -> OptimizeResumeResponse:
    gemini = get_gemini()
    return optimize_resume(gemini, payload.resume, payload.job, payload.ats_report)
