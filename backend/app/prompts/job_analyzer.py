JOB_ANALYZER_PROMPT = """Analyze this job description for ATS matching.

Extract as many concrete skills and keywords as possible.

Rules:
- required_skills: must-have tools, languages, frameworks, platforms
- preferred_skills: nice-to-have tools/skills
- keywords: ATS keywords including role terms, soft skills, methods, tools (8-20 items)
- Do not invent requirements not present in the text
- Prefer short skill names (e.g. "React.js", "Node.js", "PostgreSQL")

Return ONLY JSON with this exact shape:
{
  "job_title": "",
  "company": "",
  "required_skills": [],
  "preferred_skills": [],
  "years_of_experience": "",
  "responsibilities": [],
  "keywords": []
}

Job description:
"""
