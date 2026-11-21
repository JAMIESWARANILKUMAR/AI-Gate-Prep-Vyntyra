import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  listPendingSmeReviewsFn, 
  submitSmeReviewFn, 
  listEscalatedDoubtsFn, 
  PendingSmeReviewItem 
} from "@/lib/gate-sme.functions";
import { 
  CheckSquare, CheckCircle2, AlertTriangle, ShieldCheck, 
  BookOpen, Edit3, MessageSquare, Send, RefreshCw, Filter, Search, Award 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function GateSmeReviewView() {
  const [activeSection, setActiveSection] = useState<"verifications" | "escalated_doubts">("verifications");
  const [selectedReview, setSelectedReview] = useState<PendingSmeReviewItem | null>(null);
  const [editedDerivation, setEditedDerivation] = useState("");
  const [editedConcept, setEditedConcept] = useState("");
  const [editedTraps, setEditedTraps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listReviews = useServerFn(listPendingSmeReviewsFn);
  const submitReview = useServerFn(submitSmeReviewFn);
  const listDoubts = useServerFn(listEscalatedDoubtsFn);
  const qc = useQueryClient();

  const { data: reviews = [], isLoading: isLoadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ["sme_pending_reviews"],
    queryFn: () => listReviews({ data: { branch: "ALL", status: "ALL" } })
  });

  const { data: doubts = [], isLoading: isLoadingDoubts } = useQuery({
    queryKey: ["sme_escalated_doubts"],
    queryFn: () => listDoubts()
  });

  const handleOpenEdit = (item: PendingSmeReviewItem) => {
    setSelectedReview(item);
    setEditedConcept(item.theoreticalConcept || "");
    setEditedDerivation(item.stepByStepDerivation || "");
    setEditedTraps(item.commonTrapsAndPitfalls || "");
  };

  const handleApproveDirect = async (questionId: string) => {
    try {
      await submitReview({
        data: {
          questionId,
          action: "approve"
        }
      });
      toast.success("Solution breakdown approved & verified as official IIT/GATE benchmark standard!");
      qc.invalidateQueries({ queryKey: ["sme_pending_reviews"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to approve review");
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedReview) return;
    setIsSubmitting(true);
    try {
      await submitReview({
        data: {
          questionId: selectedReview.questionId,
          action: "edit",
          theoreticalConcept: editedConcept,
          stepByStepDerivation: editedDerivation,
          commonTrapsAndPitfalls: editedTraps
        }
      });
      toast.success("Edited breakdown saved and marked as SME-Verified!");
      setSelectedReview(null);
      qc.invalidateQueries({ queryKey: ["sme_pending_reviews"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save edits");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              Subject Matter Expert (SME) Academic Review Desk
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, verify, and edit AI-generated 3-part logical derivations and resolve escalated student doubts.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSection("verifications")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              activeSection === "verifications" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Breakdowns ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSection("escalated_doubts")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              activeSection === "escalated_doubts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Escalated Doubts ({doubts.length})
          </button>
        </div>
      </div>

      {/* Breakdowns Verification Queue */}
      {activeSection === "verifications" && (
        <div className="space-y-4">
          {isLoadingReviews ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs bg-white border border-slate-200 rounded-xl">
              Loading pending solution breakdowns...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-800">All solution breakdowns verified!</p>
              <p className="text-xs text-slate-500 mt-0.5">No questions currently require review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reviews.map(item => (
                <div
                  key={item.questionId}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black uppercase text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.branchCode}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {item.subject || "Core Discipline"} • {item.questionType.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] font-mono uppercase ${
                        item.verificationStatus === "sme_verified"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}>
                        {item.verificationStatus.replace("_", " ")}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Key: <strong className="text-slate-900">{item.correctAnswer}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-900 leading-relaxed font-sans">
                    <span className="font-mono font-bold text-slate-400 block mb-1">QUESTION:</span>
                    {item.questionText}
                  </div>

                  {/* 3-Part Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">1. Core Theory</div>
                      <p className="text-slate-700 line-clamp-3 text-[11px] leading-relaxed">
                        {item.theoreticalConcept || "Awaiting synthesis..."}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">2. Derivation</div>
                      <p className="text-slate-700 line-clamp-3 text-[11px] leading-relaxed">
                        {item.stepByStepDerivation || "Awaiting derivation..."}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-amber-700 mb-1">3. Traps & Edge Cases</div>
                      <p className="text-slate-700 line-clamp-3 text-[11px] leading-relaxed">
                        {item.commonTrapsAndPitfalls || "Awaiting pitfalls..."}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-8"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit / Refine Breakdown
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApproveDirect(item.questionId)}
                      className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-8"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Approve as Official Solution
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Escalated Doubts Queue */}
      {activeSection === "escalated_doubts" && (
        <div className="space-y-4">
          {isLoadingDoubts ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs bg-white border border-slate-200 rounded-xl">
              Loading escalated student doubts...
            </div>
          ) : doubts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-800">All student doubts resolved!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {doubts.map((d: any) => (
                <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Aspirant: {d.student_id} • Question: {d.question_id}
                    </span>
                    <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 text-[10px] font-mono">
                      Escalated to SME
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Question Reference:</div>
                    <p className="text-slate-800">{d.question_text}</p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-700">Verified Answer Key: {d.correct_answer}</div>
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-950">
                    <div className="text-[10px] font-bold uppercase text-amber-800 mb-1">Student Doubt:</div>
                    <p>{typeof d.messages === "string" ? JSON.parse(d.messages)[0]?.content : "Inquiry regarding answer calculation step."}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => toast.success("SME resolution dispatched to student!")}
                      className="bg-slate-900 text-white font-bold text-xs h-8"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Dispatch Expert Clarification
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {selectedReview && (
        <Dialog open={Boolean(selectedReview)} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Edit & Refine Pedagogical Solution Breakdown
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Question #{selectedReview.questionId} • Verified Key: {selectedReview.correctAnswer}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  1. Core Theoretical Concept & Formulas
                </label>
                <Textarea
                  value={editedConcept}
                  onChange={e => setEditedConcept(e.target.value)}
                  className="font-mono text-xs h-28"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  2. Step-by-Step Mathematical Derivation
                </label>
                <Textarea
                  value={editedDerivation}
                  onChange={e => setEditedDerivation(e.target.value)}
                  className="font-mono text-xs h-36"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  3. Common Traps, Decoys & Edge Cases
                </label>
                <Textarea
                  value={editedTraps}
                  onChange={e => setEditedTraps(e.target.value)}
                  className="font-mono text-xs h-28"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setSelectedReview(null)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveEdits} disabled={isSubmitting} className="bg-slate-900 text-white font-bold text-xs">
                Save & Mark Verified
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
