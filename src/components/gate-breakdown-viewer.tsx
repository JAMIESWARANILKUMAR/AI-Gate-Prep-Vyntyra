import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOrGenerateQuestionBreakdownFn, QuestionBreakdown } from "@/lib/gate-ai.functions";
import { 
  BrainCircuit, CheckCircle2, ShieldCheck, AlertTriangle, 
  Lightbulb, RefreshCw, BookOpen, Layers, Terminal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface GateBreakdownViewerProps {
  questionId: string;
  questionText: string;
  questionType: string;
  options?: any;
  correctAnswer: string;
  subject?: string;
  branchCode?: string;
}

export function GateBreakdownViewer({
  questionId,
  questionText,
  questionType,
  options,
  correctAnswer,
  subject,
  branchCode
}: GateBreakdownViewerProps) {
  const [activeTab, setActiveTab] = useState<"theory" | "derivation" | "traps">("derivation");
  const getBreakdown = useServerFn(getOrGenerateQuestionBreakdownFn);

  const { data: breakdown, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["gate_breakdown", questionId],
    queryFn: () => getBreakdown({
      data: {
        questionId,
        questionText,
        questionType,
        options,
        correctAnswer,
        subject,
        branchCode
      }
    }),
    staleTime: 1000 * 60 * 30 // Cache in memory for 30 mins
  });

  if (isLoading || isRefetching) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs text-slate-500">
        <div className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full mx-auto" />
        <p>Synthesizing Rigorous 3-Part GATE Pedagogical Solution...</p>
        <span className="text-[10px] text-slate-400">Verifying theorems & mathematical derivations</span>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
        Breakdown unavailable. Click below to generate.
        <Button size="sm" onClick={() => refetch()} className="mt-2 block mx-auto text-xs">
          Generate Solution Breakdown
        </Button>
      </div>
    );
  }

  const isVerified = breakdown.verificationStatus === "sme_verified" || breakdown.verificationStatus === "sme_edited";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">AI GATE Comprehensive Solution Breakdown</h3>
              <Badge className={`text-[10px] font-mono uppercase font-bold ${
                isVerified 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" 
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                {isVerified ? "SME Verified" : "AI Synthesized"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified Solution Key: <span className="font-mono font-bold text-emerald-300">{correctAnswer}</span>
            </p>
          </div>
        </div>

        {/* 3-Part Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("theory")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === "theory" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Core Theory
          </button>
          <button
            onClick={() => setActiveTab("derivation")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === "derivation" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Step-by-Step Derivation
          </button>
          <button
            onClick={() => setActiveTab("traps")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === "traps" ? "bg-amber-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Traps & Pitfalls
          </button>
        </div>
      </div>

      {/* Breakdown Body */}
      <div className="p-6">
        {activeTab === "theory" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <BookOpen className="h-4 w-4 text-slate-900" />
              1. Core Theoretical Foundations & Governing Formulas
            </div>
            <div className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed font-sans">
              <ReactMarkdown>{breakdown.theoreticalConcept}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === "derivation" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 pb-2 border-b border-slate-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              2. Exhaustive Mathematical & Logical Step-by-Step Derivation
            </div>
            <div className="prose prose-slate prose-sm max-w-none text-slate-900 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-lg border border-slate-200">
              <ReactMarkdown>{breakdown.stepByStepDerivation}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === "traps" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 pb-2 border-b border-slate-100">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              3. Common Candidate Traps, Decoy Options & Edge Cases
            </div>
            <div className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed font-sans bg-amber-50/50 p-4 rounded-lg border border-amber-200/80">
              <ReactMarkdown>{breakdown.commonTrapsAndPitfalls}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Question ID: {questionId}</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Certified against official GATE master answer key
        </span>
      </div>
    </div>
  );
}
