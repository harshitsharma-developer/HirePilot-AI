"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const steps = [
  { href: "/upload", label: "Upload" },
  { href: "/summary", label: "Summary" },
  { href: "/job", label: "Job" },
  { href: "/report", label: "ATS" },
  { href: "/optimize", label: "Optimize" },
  { href: "/preview", label: "Preview" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const showSteps = pathname !== "/";

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="group flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition group-hover:scale-105">
          HP
        </span>
        <div className="leading-tight">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-900">
            HirePilot AI
          </p>
          <p className="text-xs text-slate-500">Your AI Career Copilot</p>
        </div>
      </Link>

      {showSteps ? (
        <nav className="hidden items-center gap-1 md:flex">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <span
                key={step.href}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500",
                )}
              >
                {step.label}
              </span>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
