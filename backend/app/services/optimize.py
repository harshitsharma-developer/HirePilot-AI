from __future__ import annotations

import json
import uuid

from app.models.schemas import ATSReport, JobAnalysis, OptimizeResumeResponse, ResumeChange, ResumeData
from app.prompts.resume_optimizer import RESUME_OPTIMIZER_PROMPT
from app.services.gemini import GeminiService


def optimize_resume(
    gemini: GeminiService,
    resume: ResumeData,
    job: JobAnalysis,
    ats_report: ATSReport,
) -> OptimizeResumeResponse:
    prompt = (
        RESUME_OPTIMIZER_PROMPT.replace(
            "{resume_json}",
            json.dumps(resume.model_dump(), ensure_ascii=True),
        )
        .replace(
            "{job_json}",
            json.dumps(job.model_dump(), ensure_ascii=True),
        )
        .replace(
            "{ats_json}",
            json.dumps(ats_report.model_dump(), ensure_ascii=True),
        )
    )
    payload = gemini.generate_json(prompt)
    optimized = ResumeData.model_validate(payload.get("optimized_resume", {}))
    raw_changes = payload.get("changes") or []
    changes: list[ResumeChange] = []
    for index, item in enumerate(raw_changes):
        change = ResumeChange.model_validate(item if isinstance(item, dict) else {})
        if not change.id:
            change.id = f"change-{index + 1}-{uuid.uuid4().hex[:8]}"
        changes.append(change)
    return OptimizeResumeResponse(optimized_resume=optimized, changes=changes)
