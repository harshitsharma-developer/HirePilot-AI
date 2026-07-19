"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" />

      <SiteHeader />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`relative z-10 mx-auto w-full px-6 pb-16 ${
          wide ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {children}
      </motion.main>
    </div>
  );
}
