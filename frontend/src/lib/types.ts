export type ExperienceItem = {
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  bullets: string[];
};

export type EducationItem = {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  details: string;
};

export type ProjectItem = {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
};

export type ResumeData = {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: string[];
  certifications: string[];
};

export type JobAnalysis = {
  job_title: string;
  company: string;
  required_skills: string[];
  preferred_skills: string[];
  years_of_experience: string;
  responsibilities: string[];
  keywords: string[];
};

export type WhyScore = {
  positives: string[];
  negatives: string[];
  interview_probability: "High" | "Medium" | "Low";
  rationale: string;
};

export type ATSReport = {
  ats_score: number;
  match_percentage: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  missing_keywords: string[];
  suggestions: string[];
  why_score: WhyScore;
};

export type ResumeChange = {
  id: string;
  section: string;
  original: string;
  optimized: string;
  reason: string;
};

export type AnalyzeJobResponse = {
  job: JobAnalysis;
  ats_report: ATSReport;
};

export type OptimizeResumeResponse = {
  optimized_resume: ResumeData;
  changes: ResumeChange[];
};

export type ChangeDecision = "accepted" | "rejected" | "pending";
