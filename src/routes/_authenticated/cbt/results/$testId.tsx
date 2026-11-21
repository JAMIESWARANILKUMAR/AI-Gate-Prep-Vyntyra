import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInternSubmissionResultFn } from "@/lib/cbt.functions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Trophy, XCircle, BrainCircuit, Activity, Clock, ShieldAlert, ArrowLeft, 
  Download, CheckCircle2, AlertTriangle, Sparkles, Target, Lightbulb, FileText, 
  CheckCircle, RotateCcw, MessageSquare, ShieldCheck, X 
} from "lucide-react";
import { 
  downloadCbtDetailedReportPdf, 
  generateNextAttemptSuggestions, 
  CbtQuestionAudit 
} from "@/lib/cbt-report";
import { GateBreakdownViewer } from "@/components/gate-breakdown-viewer";
import { GateDoubtSolverPanel } from "@/components/gate-doubt-solver-panel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/cbt/results/$testId")({
  component: CbtResults,
});

function CbtResults() {
  const { testId } = Route.useParams();
  const getResultsFn = useServerFn(getInternSubmissionResultFn);

  const [breakdownModalQ, setBreakdownModalQ] = useState<any>(null);
  const [doubtModalQ, setDoubtModalQ] = useState<any>(null);

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["cbt-result", testId],
    queryFn: () => {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const subId = urlParams ? urlParams.get('submissionId') : undefined;
      return getResultsFn({ data: { testId, submissionId: subId || undefined } });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 font-mono text-xs">
        Loading GATE Examination Results & Accuracy Analytics...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex h-screen items-center justify-center text-rose-500 font-mono text-xs">
        Error loading assessment results. Please check your network connection.
      </div>
    );
  }

  const isTerminated = result.status === "terminated_cheating";
  const strikes = (result.proctoring_logs as any[])?.length || 0;

  const questionsList: any[] = (result.questionsReview && result.questionsReview.length > 0) 
    ? result.questionsReview 
    : (result.questions || []);
  const answersList: any[] = result.answers || [];

  const pointsFromAnswers = answersList.reduce((acc: number, a: any) => acc + (Number(a.ai_score) || 0), 0);
  const totalScore = Math.max(Number(result.score) || 0, pointsFromAnswers);
  const totalQuestions = questionsList.length || 0;

  const correctCount = questionsList.filter((q: any) => {
    const ans = answersList.find((a: any) => a.question_id === (q.question_id || q.id));
    const pts = q.score ?? ans?.ai_score ?? 0;
    const max = q.max_points || 10;
    return pts >= max;
  }).length;

  const partialCount = questionsList.filter((q: any) => {
    const ans = answersList.find((a: any) => a.question_id === (q.question_id || q.id));
    const pts = q.score ?? ans?.ai_score ?? 0;
    const max = q.max_points || 10;
    return pts > 0 && pts < max;
  }).length;

  const incorrectCount = Math.max(0, totalQuestions - correctCount - partialCount);
  const accuracyRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const maxScore = Number(result.maxScore) || questionsList.reduce((acc: number, q: any) => acc + (Number(q.max_points) || 10), 0) || 100;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : (Number(result.percentage) || 0);
  const passingScore = Number(result.passingScore) || Number(result.cbt_exams?.passing_score) || 50;
  const passed = percentage >= passingScore;
  const isGraded = result.status === "graded" || answersList.length > 0 || totalScore > 0;

  const questionAudits: CbtQuestionAudit[] = questionsList.map((q: any, i: number) => {
    const answerRow = answersList.find((a: any) => a.question_id === (q.question_id || q.id));
    const isCorrect = q.is_correct ?? (answerRow ? (Number(answerRow.ai_score) >= (q.max_points || 10)) : false);
    const pts = q.score ?? answerRow?.ai_score ?? 0;
    const maxPts = q.max_points || 10;
    const candidateAns = q.intern_answer || answerRow?.selected_option || answerRow?.subjective_answer || "(Skipped)";
    
    let cleanCandidateAns = candidateAns;
    if (typeof candidateAns === "object" && candidateAns !== null) {
      cleanCandidateAns = candidateAns.text ? `[${candidateAns.id || ''}] ${candidateAns.text}` : (candidateAns.id || JSON.stringify(candidateAns));
    }

    return {
      question_id: q.question_id || q.id || `q_${i + 1}`,
      question_number: i + 1,
      question_text: q.question_text,
      question_type: q.question_type || "mcq",
      max_points: maxPts,
      awarded_score: pts,
      is_correct: isCorrect,
      candidate_answer: String(cleanCandidateAns),
      correct_answer: typeof q.correct_answer === "object" ? JSON.stringify(q.correct_answer) : String(q.correct_answer || "Refer to explanation"),
      explanation: q.explanation,
      feedback: q.feedback || answerRow?.ai_feedback
    };
  });

  const suggestions = generateNextAttemptSuggestions(questionAudits, passingScore, percentage, totalScore, maxScore);

  const handleDownloadPdf = () => {
    downloadCbtDetailedReportPdf({
      candidateName: result.profiles?.full_name || result.intern_id || "GATE Candidate",
      candidateEmail: result.profiles?.email || "",
      internId: result.profiles?.intern_id || result.intern_id || "GATE-ASPIRANT",
      examTitle: result.cbt_exams?.title || "GATE Mock Examination",
      examDescription: result.cbt_exams?.description || "",
      submittedAt: new Date(result.submitted_at || result.created_at || Date.now()).toLocaleString(),
      submissionId: result.id || testId,
      totalScore,
      maxScore,
      percentage,
      passingScore,
      passed,
      totalQuestions,
      correctCount,
      partialCount,
      incorrectCount,
      accuracyRate,
      infractionsCount: strikes,
      malpracticeLogs: result.proctoring_logs,
      questions: questionAudits,
      suggestions
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.history.back()} className="rounded-lg h-9 w-9 p-0 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                GATE Examination Mark Sheet & Solution Audit
              </h1>
              <p className="text-slate-500 font-medium text-xs">
                {result.cbt_exams?.title || "Official GATE Mock Test"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={handleDownloadPdf}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Download Official Scorecard (PDF)
            </Button>
            {result.canRetake && (
              <Button
                onClick={() => window.location.href = `/cbt/${testId}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> Retake Test
              </Button>
            )}
          </div>
        </div>

        {isTerminated ? (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-xl text-center">
            <ShieldAlert className="h-16 w-16 text-rose-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-rose-800 mb-1">Session Terminated</h2>
            <p className="text-rose-700 text-xs mb-4">Exam terminated due to proctoring policy violations.</p>
            <div className="inline-block bg-white text-rose-700 px-4 py-2 rounded-lg font-mono text-xs font-bold border border-rose-200">
              {strikes} Violation(s) Logged
            </div>
          </div>
        ) : !isGraded ? (
          <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900 mb-1">Evaluating Answers...</h2>
            <p className="text-slate-500 text-xs">AI grading engine is auditing numerical tolerances and MSQ exact matches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Scorecard & Sectional Stats */}
            <div className="md:col-span-1 space-y-4">
              
              {/* Score Tile */}
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xs text-center">
                <Trophy className="h-10 w-10 mx-auto mb-2 text-amber-400" />
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Total Marks Awarded
                </div>
                <div className="text-4xl font-black font-mono text-white mb-1">
                  {totalScore} <span className="text-base text-slate-400 font-normal">/ {maxScore}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mb-3 font-mono">
                  Accuracy: {accuracyRate}% • Score: {percentage}%
                </div>
                <div className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                  passed ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"
                }`}>
                  {passed ? "QUALIFIED GATE BENCHMARK" : "BELOW CUTOFF SCORE"}
                </div>
              </div>

              {/* GATE Sectional Breakdown */}
              <div className="bg-white p-5 rounded-xl shadow-2xs border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-900" /> Sectional Accuracy
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Correct Questions:
                    </span>
                    <span className="font-mono font-black text-emerald-800">{correctCount} / {totalQuestions}</span>
                  </div>

                  {partialCount > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Partial Credit:
                      </span>
                      <span className="font-mono font-black text-amber-800">{partialCount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
                    <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-rose-600" /> Incorrect / Skipped:
                    </span>
                    <span className="font-mono font-black text-rose-800">{incorrectCount}</span>
                  </div>
                </div>
              </div>

              {/* All-India Rank Benchmark Estimation */}
              <div className="bg-white p-5 rounded-xl shadow-2xs border border-slate-200 space-y-2 font-mono text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Predicted Benchmark</div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Estimated AIR:</span>
                  <span className="font-bold text-slate-900">AIR Top {Math.max(10, Math.round(500 - (percentage * 4)))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Percentile:</span>
                  <span className="font-bold text-emerald-700">{Math.min(99.9, Math.max(50, percentage * 1.15)).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Question Review & AI Breakdown Launchers */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-900" />
                    Question-Level Solutions & Theoretical Derivations
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {totalQuestions} Questions Audited
                  </span>
                </div>

                <div className="space-y-4">
                  {questionsList.map((qItem: any, i: number) => {
                    const answerRow = answersList.find((a: any) => a.question_id === (qItem.question_id || qItem.id));
                    const isCorrect = qItem.is_correct ?? (answerRow ? (Number(answerRow.ai_score) >= (qItem.max_points || 10)) : false);
                    const pts = qItem.score ?? answerRow?.ai_score ?? 0;
                    const maxPts = qItem.max_points || 10;
                    const displayAns = qItem.intern_answer || answerRow?.selected_option || answerRow?.subjective_answer || "(Skipped)";

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isCorrect
                            ? "bg-white border-emerald-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                              Q.{i + 1}
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                              {(qItem.question_type || "mcq").toUpperCase()}
                            </span>
                          </div>
                          <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                            isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {pts} / {maxPts} Marks
                          </span>
                        </div>

                        <div className="text-xs font-medium text-slate-900 leading-relaxed">
                          {qItem.question_text}
                        </div>

                        {/* Candidate response vs Key */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Your Response:</span>
                            <span className={isCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                              {typeof displayAns === "object" ? JSON.stringify(displayAns) : String(displayAns)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded bg-emerald-50/50 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">Verified Solution Key:</span>
                            <span className="text-slate-900 font-bold">
                              {typeof qItem.correct_answer === "object" ? JSON.stringify(qItem.correct_answer) : String(qItem.correct_answer || "Refer to breakdown")}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: 3-Part Breakdown & Contextual Doubt Chat */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                          <span className="text-[10px] font-mono text-slate-400">
                            {qItem.question_type === "msq" || qItem.question_type === "nat" ? "Zero Negative Marking" : "-0.33 Negative Marking"}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBreakdownModalQ(qItem)}
                              className="text-xs font-bold text-slate-800 border-slate-300 hover:bg-slate-50 h-8 flex items-center gap-1.5"
                            >
                              <BrainCircuit className="h-3.5 w-3.5 text-emerald-600" /> View 3-Part Solution
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDoubtModalQ(qItem)}
                              className="text-xs font-bold text-slate-800 border-slate-300 hover:bg-slate-50 h-8 flex items-center gap-1.5"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-sky-600" /> Ask AI Doubt
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Part Breakdown Modal */}
        {breakdownModalQ && (
          <Dialog open={Boolean(breakdownModalQ)} onOpenChange={() => setBreakdownModalQ(null)}>
            <DialogContent className="max-w-3xl bg-white p-6 rounded-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <GateBreakdownViewer
                questionId={breakdownModalQ.question_id || breakdownModalQ.id || "q"}
                questionText={breakdownModalQ.question_text}
                questionType={breakdownModalQ.question_type || "mcq"}
                options={breakdownModalQ.options}
                correctAnswer={typeof breakdownModalQ.correct_answer === "object" ? JSON.stringify(breakdownModalQ.correct_answer) : String(breakdownModalQ.correct_answer || "")}
                subject={breakdownModalQ.subject}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Contextual AI Doubt Solver Modal */}
        {doubtModalQ && (
          <Dialog open={Boolean(doubtModalQ)} onOpenChange={() => setDoubtModalQ(null)}>
            <DialogContent className="max-w-lg bg-white p-0 rounded-xl border border-slate-200 h-[650px]">
              <GateDoubtSolverPanel
                questionId={doubtModalQ.question_id || doubtModalQ.id || "q"}
                questionText={doubtModalQ.question_text}
                options={doubtModalQ.options}
                correctAnswer={typeof doubtModalQ.correct_answer === "object" ? JSON.stringify(doubtModalQ.correct_answer) : String(doubtModalQ.correct_answer || "")}
                onClose={() => setDoubtModalQ(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
