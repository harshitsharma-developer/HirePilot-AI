import type {
  AnalyzeJobResponse,
  ATSReport,
  JobAnalysis,
  OptimizeResumeResponse,
  ResumeData,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    return JSON.stringify(data);
  } catch {
    return response.statusText || "Request failed";
  }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Is the backend running? Start it with: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`,
    );
  }
}

export async function uploadResume(file: File): Promise<ResumeData> {
  const form = new FormData();
  form.append("file", file);
  const response = await apiFetch("/upload-resume", {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function analyzeJob(
  resume: ResumeData,
  jobDescription: string,
): Promise<AnalyzeJobResponse> {
  const response = await apiFetch("/analyze-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, job_description: jobDescription }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function optimizeResume(
  resume: ResumeData,
  job: JobAnalysis,
  atsReport: ATSReport,
): Promise<OptimizeResumeResponse> {
  const response = await apiFetch("/optimize-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, job, ats_report: atsReport }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function generatePdf(resume: ResumeData): Promise<Blob> {
  const response = await apiFetch("/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.blob();
}
