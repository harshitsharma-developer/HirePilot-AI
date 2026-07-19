"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeJob } from "@/lib/api";
import { useFlow } from "@/lib/flow-context";

export default function JobPage() {
  const router = useRouter();
  const {
    resume,
    jobDescription,
    setJobDescription,
    setJob,
    setAtsReport,
    hydrated,
  } = useFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !resume) router.replace("/upload");
  }, [hydrated, resume, router]);

  async function onAnalyze() {
    if (!resume) return;
    if (!jobDescription.trim()) {
      setError("Paste a job description to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeJob(resume, jobDescription.trim());
      setJob(result.job);
      setAtsReport(result.ats_report);
      router.push("/report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
          Job Description
        </h1>
        <p className="mt-2 text-slate-600">
          Paste a LinkedIn or company job description for ATS analysis.
        </p>
      </div>

      <Textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste LinkedIn or Company Job Description"
        className="min-h-[320px]"
        disabled={loading}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={() => void onAnalyze()} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing with Gemini…
            </>
          ) : (
            "Analyze"
          )}
        </Button>
        {loading ? (
          <p className="text-sm text-slate-500">
            Extracting role requirements and computing ATS score…
          </p>
        ) : null}
      </div>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PageShell>
  );
}
