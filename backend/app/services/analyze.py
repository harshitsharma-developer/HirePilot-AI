from __future__ import annotations

import json
import re

from app.models.schemas import ATSReport, JobAnalysis, ResumeData, WhyScore
from app.prompts.ats_engine import ATS_ENGINE_PROMPT
from app.prompts.job_analyzer import JOB_ANALYZER_PROMPT
from app.services.gemini import GeminiService


def analyze_job_description(gemini: GeminiService, job_description: str) -> JobAnalysis:
    payload = gemini.generate_json(JOB_ANALYZER_PROMPT + job_description)
    return JobAnalysis.model_validate(payload)


def _resume_blob(resume: ResumeData) -> str:
    parts: list[str] = [
        resume.summary,
        " ".join(resume.skills),
        " ".join(resume.certifications),
    ]
    for item in resume.experience:
        parts.extend([item.company, item.title, item.location, " ".join(item.bullets)])
    for project in resume.projects:
        parts.extend(
            [
                project.name,
                project.description,
                " ".join(project.technologies),
                " ".join(project.bullets),
            ]
        )
    for edu in resume.education:
        parts.extend([edu.institution, edu.degree, edu.field, edu.details])
    return " ".join(part for part in parts if part).lower()


def _normalize_term(term: str) -> str:
    return re.sub(r"\s+", " ", term.strip().lower())


def _term_present(term: str, blob: str) -> bool:
    cleaned = _normalize_term(term)
    if not cleaned:
        return True
    # Exact phrase or compact form (e.g. react.js -> react js / reactjs)
    compact = re.sub(r"[^a-z0-9]+", "", cleaned)
    blob_compact = re.sub(r"[^a-z0-9]+", "", blob)
    if cleaned in blob or compact in blob_compact:
        return True
    # Token fallback for multi-word tools
    tokens = [t for t in re.split(r"[^a-z0-9.+#]+", cleaned) if len(t) > 1]
    if len(tokens) >= 2 and all(token in blob_compact for token in tokens):
        return True
    return False


def _unique(items: list[str], limit: int | None = None) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = _normalize_term(item)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item.strip())
        if limit is not None and len(result) >= limit:
            break
    return result


def compute_gaps(resume: ResumeData, job: JobAnalysis) -> tuple[list[str], list[str]]:
    blob = _resume_blob(resume)
    skill_pool = _unique([*job.required_skills, *job.preferred_skills])
    keyword_pool = _unique([*job.keywords, *job.required_skills, *job.preferred_skills])

    missing_skills = [skill for skill in skill_pool if not _term_present(skill, blob)]
    missing_keywords = [kw for kw in keyword_pool if not _term_present(kw, blob)]
    return missing_skills, missing_keywords


def enrich_ats_report(resume: ResumeData, job: JobAnalysis, report: ATSReport) -> ATSReport:
    missing_skills, missing_keywords = compute_gaps(resume, job)

    if not report.missing_skills:
        report.missing_skills = missing_skills[:12]
    else:
        report.missing_skills = _unique([*report.missing_skills, *missing_skills], limit=12)

    if not report.missing_keywords:
        report.missing_keywords = missing_keywords[:12]
    else:
        report.missing_keywords = _unique([*report.missing_keywords, *missing_keywords], limit=12)

    if not report.weaknesses:
        report.weaknesses = [
            f"Resume does not clearly mention {skill}."
            for skill in report.missing_skills[:4]
        ]
        if not report.weaknesses:
            report.weaknesses = [
                "Resume could mirror more exact keywords from the job description.",
                "Add stronger quantified outcomes tied to this role's responsibilities.",
            ]

    if not report.suggestions:
        report.suggestions = [
            f"Add or emphasize '{skill}' only if you already have real experience with it."
            for skill in report.missing_skills[:3]
        ]
        report.suggestions.extend(
            [
                "Mirror exact job keywords naturally in summary and experience bullets.",
                "Rewrite bullets to highlight impact, scale, and collaboration for this role.",
            ]
        )
        report.suggestions = _unique(report.suggestions, limit=6)

    if not report.strengths:
        report.strengths = [
            f"Relevant skill present: {skill}"
            for skill in resume.skills[:4]
        ] or ["Resume includes transferable experience for this role."]

    why = report.why_score or WhyScore()
    if not why.positives:
        why.positives = report.strengths[:4]
    if not why.negatives:
        why.negatives = [
            f"{skill} not mentioned"
            for skill in report.missing_skills[:4]
        ] or report.weaknesses[:3]
    if not why.rationale:
        gap_count = len(report.missing_skills)
        why.rationale = (
            f"Score reflects solid overlap with clear gaps in {gap_count} skill/keyword areas."
            if gap_count
            else "Score reflects strong overlap with this job description."
        )

    # Recalibrate score if Gemini was overly optimistic while gaps exist.
    skill_pool = _unique([*job.required_skills, *job.preferred_skills]) or job.keywords
    if skill_pool:
        matched = max(0, len(skill_pool) - len(missing_skills))
        coverage = int(round((matched / len(skill_pool)) * 100))
        report.match_percentage = coverage
        # Blend model score with coverage so empty-gap reports can't stay unrealistically high.
        blended = int(round((report.ats_score * 0.45) + (coverage * 0.55)))
        if missing_skills and blended > 88:
            blended = 88
        if len(missing_skills) >= 4 and blended > 78:
            blended = 78
        report.ats_score = max(0, min(100, blended))

    if report.ats_score >= 85 and len(report.missing_skills) <= 1:
        why.interview_probability = "High"
    elif report.ats_score >= 65:
        why.interview_probability = "Medium"
    else:
        why.interview_probability = "Low"

    report.why_score = why
    report.ats_score = max(0, min(100, int(report.ats_score)))
    report.match_percentage = max(0, min(100, int(report.match_percentage)))
    return report


def run_ats_engine(gemini: GeminiService, resume: ResumeData, job: JobAnalysis) -> ATSReport:
    prompt = (
        ATS_ENGINE_PROMPT.replace(
            "{resume_json}",
            json.dumps(resume.model_dump(), ensure_ascii=True),
        ).replace(
            "{job_json}",
            json.dumps(job.model_dump(), ensure_ascii=True),
        )
    )
    payload = gemini.generate_json(prompt)
    report = ATSReport.model_validate(payload)
    return enrich_ats_report(resume, job, report)
