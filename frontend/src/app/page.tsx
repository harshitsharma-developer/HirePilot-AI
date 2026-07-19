"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

const flow = [
  {
    title: "Upload Resume",
    copy: "Drop a PDF or DOCX and we extract a clean structured summary.",
  },
  {
    title: "Analyze the Role",
    copy: "Paste any job description to unlock ATS match insights.",
  },
  {
    title: "Optimize & Apply",
    copy: "Rewrite with ATS-friendly wording, then download a polished PDF.",
  },
];

export default function LandingPage() {
  return (
    <PageShell wide>
      <section className="hero-plane relative overflow-hidden rounded-[2rem] px-8 py-16 text-white shadow-2xl shadow-slate-900/20 md:px-14 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl"
        >
          <p className="mb-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight md:text-6xl">
            HirePilot AI
          </p>
          <h1 className="mb-4 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-teal-50 md:text-5xl">
            Land More Interviews with AI
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-100/90 md:text-lg">
            Upload your resume. Paste any Job Description. Get ATS Score.
            Optimize instantly.
          </p>
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-teal-50">
            <Link href="/upload">Get Started</Link>
          </Button>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="pointer-events-none absolute -right-10 bottom-0 hidden h-72 w-72 rounded-full border border-white/20 md:block"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-16 top-16 hidden h-28 w-28 rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm md:block"
        />
      </section>

      <section className="mt-14">
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
          From resume to ready-to-apply
        </h2>
        <p className="mb-8 max-w-2xl text-slate-600">
          A focused three-step flow designed for hackathon demos and real applications.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {flow.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-200/70 bg-white/70 p-6"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Step {index + 1}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
