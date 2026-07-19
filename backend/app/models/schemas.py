from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ExperienceItem(BaseModel):
    company: str = ""
    title: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    details: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)


class ResumeData(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


class JobAnalysis(BaseModel):
    job_title: str = ""
    company: str = ""
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    years_of_experience: str = ""
    responsibilities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class WhyScore(BaseModel):
    positives: list[str] = Field(default_factory=list)
    negatives: list[str] = Field(default_factory=list)
    interview_probability: Literal["High", "Medium", "Low"] = "Medium"
    rationale: str = ""


class ATSReport(BaseModel):
    ats_score: int = 0
    match_percentage: int = 0
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    why_score: WhyScore = Field(default_factory=WhyScore)


class AnalyzeJobRequest(BaseModel):
    resume: ResumeData
    job_description: str


class AnalyzeJobResponse(BaseModel):
    job: JobAnalysis
    ats_report: ATSReport


class ResumeChange(BaseModel):
    id: str = ""
    section: str = ""
    original: str = ""
    optimized: str = ""
    reason: str = ""


class OptimizeResumeRequest(BaseModel):
    resume: ResumeData
    job: JobAnalysis
    ats_report: ATSReport


class OptimizeResumeResponse(BaseModel):
    optimized_resume: ResumeData
    changes: list[ResumeChange] = Field(default_factory=list)


class GeneratePdfRequest(BaseModel):
    resume: ResumeData


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "HirePilot AI"


class ErrorResponse(BaseModel):
    detail: str
    extras: dict[str, Any] = Field(default_factory=dict)
