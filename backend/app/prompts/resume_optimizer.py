RESUME_OPTIMIZER_PROMPT = """Rewrite this resume specifically for the given job.

Rules:
- Do NOT invent experience.
- Do NOT invent projects.
- Do NOT invent companies.
- Do NOT invent degrees, dates, or metrics.
- Improve wording only using facts already present.
- Use ATS-friendly keywords naturally when they already fit the candidate's background.
- Keep professional formatting in structured fields.
- Provide discrete changes that can be accepted or rejected individually.

Return ONLY JSON with this exact shape:
{
  "optimized_resume": {
    "name": "",
    "email": "",
    "phone": "",
    "summary": "",
    "experience": [],
    "education": [],
    "projects": [],
    "skills": [],
    "certifications": []
  },
  "changes": [
    {
      "id": "change-1",
      "section": "summary|experience|skills|projects|education",
      "original": "",
      "optimized": "",
      "reason": ""
    }
  ]
}

Resume JSON:
{resume_json}

Job JSON:
{job_json}

ATS Report JSON:
{ats_json}
"""
