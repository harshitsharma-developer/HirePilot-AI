"use client";

import { motion } from "framer-motion";
import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { uploadResume } from "@/lib/api";
import { useFlow } from "@/lib/flow-context";

const ACCEPTED = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function UploadPage() {
  const router = useRouter();
  const { setFileName, setResume } = useFlow();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (!(lower.endsWith(".pdf") || lower.endsWith(".docx"))) {
        setError("Please upload a PDF or DOCX resume.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be 5MB or smaller.");
        return;
      }

      setError(null);
      setSelectedName(file.name);
      setLoading(true);
      try {
        const parsed = await uploadResume(file);
        setFileName(file.name);
        setResume(parsed);
        router.push("/summary");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
      }
    },
    [router, setFileName, setResume],
  );

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-900 md:text-4xl">
          Upload Resume
        </h1>
        <p className="mt-2 text-slate-600">
          Drop a PDF or DOCX. We&apos;ll extract a structured summary next.
        </p>
      </div>

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        animate={{
          borderColor: dragging ? "rgb(13 148 136)" : "rgba(148,163,184,0.7)",
          scale: dragging ? 1.01 : 1,
        }}
        className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed bg-white/70 px-6 py-12 text-center shadow-sm"
      >
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
        </div>
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
          Drop Resume Here
        </p>
        <p className="mt-2 text-sm text-slate-500">or</p>
        <label className="mt-4 inline-flex cursor-pointer">
          <input
            type="file"
            accept={ACCEPTED}
            className="hidden"
            disabled={loading}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <span className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-500">
            Browse File
          </span>
        </label>
        {selectedName ? (
          <p className="mt-4 text-sm text-slate-600">Selected: {selectedName}</p>
        ) : null}
        {loading ? (
          <p className="mt-3 text-sm font-medium text-teal-700">
            Parsing resume with Gemini…
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </motion.div>
    </PageShell>
  );
}
