import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateHighScoreRoadmapFn } from "@/lib/gate-ai.functions";
import { 
  Target, Compass, Calendar, CheckCircle2, TrendingUp, 
  Sparkles, Award, RefreshCw, BookOpen, AlertCircle, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GateHighScoreRoadmapProps {
  studentId: string;
  branchCode?: string;
  recentAccuracy?: number;
  weakSubjects?: string[];
  strongSubjects?: string[];
}

export function GateHighScoreRoadmap({
  studentId,
  branchCode = "CS",
  recentAccuracy = 65,
  weakSubjects = ["Engineering Mathematics", "Algorithms", "Operating Systems"],
  strongSubjects = ["General Aptitude", "Databases"]
}: GateHighScoreRoadmapProps) {
  const [targetScore, setTargetScore] = useState(75);
  const [targetYear, setTargetYear] = useState(2026);

  const getRoadmap = useServerFn(generateHighScoreRoadmapFn);

  const { data: roadmap, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["gate_roadmap", studentId, branchCode, targetScore, targetYear],
    queryFn: () => getRoadmap({
      data: {
        studentId,
        branchCode,
        targetScore,
        targetYear,
        recentAccuracy,
        weakSubjects,
        strongSubjects
      }
    }),
    staleTime: 1000 * 60 * 60 * 24 // 24 hours
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Personalized GATE High-Score Preparation Roadmap
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic study strategy tailored to syllabus weightage in {branchCode} and your mock test performance diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Target Score</div>
            <div className="text-base font-black text-emerald-400 font-mono">{targetScore}+ Marks</div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Exam Cycle</div>
            <div className="text-base font-black text-slate-200 font-mono">GATE {targetYear}</div>
          </div>
          <Button
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefetching ? "animate-spin" : ""}`} /> Recalibrate
          </Button>
        </div>
      </div>

      {/* Diagnostics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Baseline Accuracy</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{recentAccuracy}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Calculated across your allocated mock tests</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Priority Weak Areas</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {weakSubjects.map((s, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] bg-rose-50 text-rose-800 border-rose-200 font-semibold">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Verified Strong Areas</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {strongSubjects.map((s, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Milestones Roadmap */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white border border-slate-200 rounded-xl">
          Computing high-yield subject weightage & generating weekly milestones...
        </div>
      ) : roadmap ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">{roadmap.targetMilestone || "Target: AIR Top 100"}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{roadmap.summary}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Week-by-Week Action Plan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.weeklyMilestones?.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Week {m.week}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono">
                        {m.targetQuestionsPerDay} Qs / Day
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900">{m.phase}</h5>
                    <div className="text-xs text-indigo-700 font-semibold mt-0.5">{m.focusSubject}</div>

                    <div className="mt-2.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Target Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {m.topics?.map((t: string, tIdx: number) => (
                          <span key={tIdx} className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Strategy: {m.revisionStrategy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
