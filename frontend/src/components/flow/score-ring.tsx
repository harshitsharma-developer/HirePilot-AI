"use client";

import { motion } from "framer-motion";

export function ScoreRing({
  score,
  label = "ATS Score",
}: {
  score: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid h-40 w-40 place-items-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="10"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-900">
            {clamped}%
          </p>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
