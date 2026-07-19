"use client";

import { CheckCircle2, CircleAlert, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ScoreRing } from "@/components/flow/score-ring";
import { SectionList } from "@/components/flow/section-list";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizeResume } from "@/lib/api";
import { useFlow } from "@/lib/flow-context";

export default function ReportPage() {
  const router = useRouter();
  const {
    resume,
    job,
    atsReport,
    setOptimization,
    hydrated,
  } = useFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && (!resume || !atsReport || !job)) {
      router.replace(resume ? "/job" : "/upload");
    }
  }, [hydrated, resume, atsReport, job, router]);

  async function onOptimize() {
    if (!resume || !job || !atsReport) return;
    setLoading(true);
    setError(null);
    try {
      const result = await optimizeResume(resume, job, atsReport);
      setOptimization(result.optimized_resume, result.changes);
      router.push("/optimize");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  if (!atsReport || !job) {
    return (
      <PageShell>
        <p className="text-slate-600">Loading ATS report…</p>
      </PageShell>
    );
  }

  const why = atsReport.why_score;
  const probabilityTone =
    why.interview_probability === "High"
      ? "default"
      : why.interview_probability === "Medium"
        ? "amber"
        : "rose";

  return (
    <PageShell wide>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
            ATS Report
          </h1>
          <p className="mt-2 text-slate-600">
            {job.job_title || "Target role"}
            {job.company ? ` at ${job.company}` : ""}
          </p>
        </div>
        <Button size="lg" onClick={() => void onOptimize()} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Optimizing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Optimize Resume
            </>
          )}
        </Button>
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card className="grid place-items-center p-6">
          <ScoreRing score={atsReport.ats_score} />
          <p className="mt-2 text-sm text-slate-500">
            Resume Match: {atsReport.match_percentage}%
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why this score?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={probabilityTone}>
                Interview Probability: {why.interview_probability}
              </Badge>
              {why.rationale ? (
                <p className="text-sm text-slate-600">{why.rationale}</p>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Working in your favor
                </p>
                {(why.positives.length ? why.positives : atsReport.strengths).map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                  Holding the score down
                </p>
                {(why.negatives.length
                  ? why.negatives
                  : atsReport.missing_skills.map((skill) => `${skill} not mentioned`)
                ).map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-900"
                  >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SectionList
          title="Strengths"
          items={atsReport.strengths}
          empty="No clear strengths extracted for this role."
        />
        <SectionList
          title="Weaknesses"
          items={atsReport.weaknesses}
          empty="No major weaknesses detected."
        />
        <SectionList
          title="Missing Skills"
          items={atsReport.missing_skills}
          empty="No missing skills detected."
          asBadges
        />
        <SectionList
          title="Missing Keywords"
          items={atsReport.missing_keywords}
          empty="No missing keywords detected."
          asBadges
        />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {atsReport.suggestions.length === 0 ? (
            <p className="text-sm text-slate-500">No suggestions available.</p>
          ) : (
            <ul className="space-y-2">
              {atsReport.suggestions.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PageShell>
  );
}
