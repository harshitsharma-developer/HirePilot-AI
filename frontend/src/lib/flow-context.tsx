"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ATSReport,
  ChangeDecision,
  JobAnalysis,
  ResumeChange,
  ResumeData,
} from "@/lib/types";

const STORAGE_KEY = "hirepilot-flow-v1";

type FlowState = {
  fileName: string | null;
  resume: ResumeData | null;
  jobDescription: string;
  job: JobAnalysis | null;
  atsReport: ATSReport | null;
  optimizedResume: ResumeData | null;
  changes: ResumeChange[];
  decisions: Record<string, ChangeDecision>;
  finalResume: ResumeData | null;
};

type FlowContextValue = FlowState & {
  setFileName: (name: string | null) => void;
  setResume: (resume: ResumeData | null) => void;
  setJobDescription: (value: string) => void;
  setJob: (job: JobAnalysis | null) => void;
  setAtsReport: (report: ATSReport | null) => void;
  setOptimization: (optimized: ResumeData, changes: ResumeChange[]) => void;
  setDecision: (id: string, decision: ChangeDecision) => void;
  setFinalResume: (resume: ResumeData | null) => void;
  resetFlow: () => void;
  hydrated: boolean;
};

const emptyState: FlowState = {
  fileName: null,
  resume: null,
  jobDescription: "",
  job: null,
  atsReport: null,
  optimizedResume: null,
  changes: [],
  decisions: {},
  finalResume: null,
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function AppFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState({ ...emptyState, ...JSON.parse(raw) });
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      hydrated,
      setFileName: (fileName) => setState((prev) => ({ ...prev, fileName })),
      setResume: (resume) => setState((prev) => ({ ...prev, resume })),
      setJobDescription: (jobDescription) =>
        setState((prev) => ({ ...prev, jobDescription })),
      setJob: (job) => setState((prev) => ({ ...prev, job })),
      setAtsReport: (atsReport) => setState((prev) => ({ ...prev, atsReport })),
      setOptimization: (optimizedResume, changes) =>
        setState((prev) => ({
          ...prev,
          optimizedResume,
          changes,
          decisions: Object.fromEntries(
            changes.map((change) => [change.id, "pending" as ChangeDecision]),
          ),
          finalResume: null,
        })),
      setDecision: (id, decision) =>
        setState((prev) => ({
          ...prev,
          decisions: { ...prev.decisions, [id]: decision },
        })),
      setFinalResume: (finalResume) =>
        setState((prev) => ({ ...prev, finalResume })),
      resetFlow: () => {
        setState(emptyState);
        sessionStorage.removeItem(STORAGE_KEY);
      },
    }),
    [state, hydrated],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used within AppFlowProvider");
  return ctx;
}
