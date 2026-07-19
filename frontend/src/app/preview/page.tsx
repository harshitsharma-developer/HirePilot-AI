"use client";

import { Download, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePdf } from "@/lib/api";
import { useFlow } from "@/lib/flow-context";

export default function PreviewPage() {
  const router = useRouter();
  const { finalResume, optimizedResume, resume, resetFlow, hydrated } = useFlow();
  const preview = finalResume || optimizedResume || resume;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !preview) router.replace("/upload");
  }, [hydrated, preview, router]);

  async function onDownload() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await generatePdf(preview);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(preview.name || "hirepilot-resume").replace(/\s+/g, "-").toLowerCase()}-optimized.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setLoading(false);
    }
  }

  function onStartAgain() {
    resetFlow();
    router.push("/");
  }

  if (!preview) {
    return (
      <PageShell>
        <p className="text-slate-600">Loading preview…</p>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
            Preview Resume
          </h1>
          <p className="mt-2 text-slate-600">
            Review the final version, download as PDF, or start again.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => void onDownload()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button size="lg" variant="outline" onClick={onStartAgain}>
            <RotateCcw className="h-4 w-4" />
            Start Again
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)] text-2xl">
            {preview.name || "Optimized Resume"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {[preview.email, preview.phone].filter(Boolean).join(" · ")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {preview.summary ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
                Summary
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">{preview.summary}</p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              Experience
            </h3>
            <div className="space-y-4">
              {preview.experience.map((item, index) => (
                <div key={`${item.company}-${index}`}>
                  <p className="font-semibold text-slate-900">
                    {item.title}
                    {item.company ? ` · ${item.company}` : ""}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {preview.skills.map((skill) => (
                <Badge key={skill} variant="slate">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {preview.projects.length > 0 ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
                Projects
              </h3>
              <div className="space-y-3">
                {preview.projects.map((project, index) => (
                  <div key={`${project.name}-${index}`}>
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <p className="text-sm text-slate-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PageShell>
  );
}
