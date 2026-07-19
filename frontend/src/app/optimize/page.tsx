"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFlow } from "@/lib/flow-context";
import type { ResumeData } from "@/lib/types";

function applyAcceptedChanges(
  base: ResumeData,
  optimized: ResumeData,
  decisions: Record<string, "accepted" | "rejected" | "pending">,
  changes: { id: string; section: string }[],
): ResumeData {
  const acceptedSections = new Set(
    changes
      .filter((change) => decisions[change.id] === "accepted")
      .map((change) => change.section.toLowerCase()),
  );

  // If user accepts any change in a section, prefer optimized section content.
  // Pending changes default to optimized for a smoother demo path.
  const useOptimized = (section: string) => {
    const key = section.toLowerCase();
    const relevant = changes.filter((c) => c.section.toLowerCase() === key);
    if (relevant.length === 0) return true;
    const rejectedAll = relevant.every((c) => decisions[c.id] === "rejected");
    if (rejectedAll) return false;
    return (
      acceptedSections.has(key) ||
      relevant.some((c) => decisions[c.id] !== "rejected")
    );
  };

  return {
    ...base,
    summary: useOptimized("summary") ? optimized.summary : base.summary,
    experience: useOptimized("experience") ? optimized.experience : base.experience,
    skills: useOptimized("skills") ? optimized.skills : base.skills,
    projects: useOptimized("projects") ? optimized.projects : base.projects,
    education: useOptimized("education") ? optimized.education : base.education,
    certifications: useOptimized("certifications")
      ? optimized.certifications
      : base.certifications,
  };
}

export default function OptimizePage() {
  const router = useRouter();
  const {
    resume,
    optimizedResume,
    changes,
    decisions,
    setDecision,
    setFinalResume,
    hydrated,
  } = useFlow();

  useEffect(() => {
    if (hydrated && (!resume || !optimizedResume)) {
      router.replace(resume ? "/report" : "/upload");
    }
  }, [hydrated, resume, optimizedResume, router]);

  const preview = useMemo(() => {
    if (!resume || !optimizedResume) return null;
    return applyAcceptedChanges(resume, optimizedResume, decisions, changes);
  }, [resume, optimizedResume, decisions, changes]);

  if (!resume || !optimizedResume || !preview) {
    return (
      <PageShell>
        <p className="text-slate-600">Loading optimization…</p>
      </PageShell>
    );
  }

  function goToPreview() {
    setFinalResume(preview);
    router.push("/preview");
  }

  return (
    <PageShell wide>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
            Resume Optimization
          </h1>
          <p className="mt-2 text-slate-600">
            Compare old vs new wording. Accept or reject each suggestion.
          </p>
        </div>
        <Button size="lg" onClick={goToPreview}>
          Preview Resume
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OLD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>{resume.summary || "No summary"}</p>
            {(resume.experience[0]?.bullets || []).slice(0, 3).map((bullet) => (
              <p key={bullet} className="rounded-lg bg-slate-50 px-3 py-2">
                {bullet}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle>NEW</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>{optimizedResume.summary || "No summary"}</p>
            {(optimizedResume.experience[0]?.bullets || []).slice(0, 3).map((bullet) => (
              <p key={bullet} className="rounded-lg bg-teal-50 px-3 py-2">
                {bullet}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {changes.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-slate-600">
              No discrete changes returned. You can still preview the optimized resume.
            </CardContent>
          </Card>
        ) : (
          changes.map((change, index) => {
            const decision = decisions[change.id] || "pending";
            return (
              <motion.div
                key={change.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base capitalize">
                        {change.section || "Update"}
                      </CardTitle>
                      <p className="mt-1 text-sm text-slate-500">{change.reason}</p>
                    </div>
                    <Badge
                      variant={
                        decision === "accepted"
                          ? "default"
                          : decision === "rejected"
                            ? "rose"
                            : "slate"
                      }
                    >
                      {decision}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Old
                      </p>
                      {change.original || "—"}
                    </div>
                    <div className="rounded-xl bg-teal-50 p-3 text-sm text-slate-800">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
                        New
                      </p>
                      {change.optimized || "—"}
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <Button
                        size="sm"
                        onClick={() => setDecision(change.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDecision(change.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
