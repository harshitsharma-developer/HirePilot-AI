from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeJobRequest, AnalyzeJobResponse
from app.services.analyze import analyze_job_description, run_ats_engine
from app.services.gemini import get_gemini

router = APIRouter(tags=["analysis"])


@router.post("/analyze-job", response_model=AnalyzeJobResponse)
async def analyze_job(payload: AnalyzeJobRequest) -> AnalyzeJobResponse:
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    gemini = get_gemini()
    job = analyze_job_description(gemini, payload.job_description.strip())
    ats_report = run_ats_engine(gemini, payload.resume, job)
    return AnalyzeJobResponse(job=job, ats_report=ats_report)
