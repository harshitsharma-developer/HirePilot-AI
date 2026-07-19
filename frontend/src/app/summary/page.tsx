"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFlow } from "@/lib/flow-context";

export default function SummaryPage() {
  const router = useRouter();
  const { resume, fileName, hydrated } = useFlow();

  useEffect(() => {
    if (hydrated && !resume) router.replace("/upload");
  }, [hydrated, resume, router]);

  if (!resume) {
    return (
      <PageShell>
        <p className="text-slate-600">Loading resume summary…</p>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
            Resume Summary
          </h1>
          <p className="mt-2 text-slate-600">
            {resume.name || "Candidate"}
            {fileName ? ` · ${fileName}` : ""}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/job">Continue to Job Description</Link>
        </Button>
      </div>

      {resume.summary ? (
        <Card className="mb-5">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700">{resume.summary}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resume.experience.length === 0 ? (
              <p className="text-sm text-slate-500">No experience extracted.</p>
            ) : (
              resume.experience.map((item, index) => (
                <div key={`${item.company}-${index}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">
                    {item.title || "Role"}
                    {item.company ? ` · ${item.company}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[item.start_date, item.end_date].filter(Boolean).join(" — ")}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                    {item.bullets.slice(0, 3).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {resume.skills.length === 0 ? (
              <p className="text-sm text-slate-500">No skills extracted.</p>
            ) : (
              resume.skills.map((skill) => (
                <Badge key={skill} variant="slate">
                  {skill}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resume.projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects extracted.</p>
            ) : (
              resume.projects.map((project, index) => (
                <div key={`${project.name}-${index}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{project.name || "Project"}</p>
                  <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resume.education.length === 0 ? (
              <p className="text-sm text-slate-500">No education extracted.</p>
            ) : (
              resume.education.map((edu, index) => (
                <div key={`${edu.institution}-${index}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">
                    {[edu.degree, edu.field].filter(Boolean).join(" in ") || "Education"}
                  </p>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
