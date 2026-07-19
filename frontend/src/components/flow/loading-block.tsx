"use client";

import { Loader2 } from "lucide-react";

export function LoadingBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 text-center">
      <Loader2 className="mb-3 h-6 w-6 animate-spin text-teal-600" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}
