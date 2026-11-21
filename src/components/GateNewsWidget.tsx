import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  ExternalLink,
  ShieldCheck,
  Pin,
  Filter,
  RefreshCw,
  Plus,
  Calendar,
  BookOpen,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  listGateUpdatesFn,
  createOrVerifyGateUpdateFn,
  syncGateNewsCronFn,
  type GateUpdate
} from "@/lib/gate-multi-tenant.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GateNewsWidgetProps {
  isAdmin?: boolean;
  maxItems?: number;
}

const CATEGORIES = [
  "All",
  "Exam Schedule",
  "Syllabus & Pattern",
  "Registration / GOAPS",
  "Admit Card & Results"
];

export function GateNewsWidget({ isAdmin = false, maxItems }: GateNewsWidgetProps) {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newCategory, setNewCategory] = useState<GateUpdate["category"]>("Exam Schedule");
  const [newSourceName, setNewSourceName] = useState("NCB-GATE 2027 Committee");
  const [newSourceUrl, setNewSourceUrl] = useState("https://gate2027.iisc.ac.in");
  const [newIsPinned, setNewIsPinned] = useState(false);

  // Queries & Mutations
  const listUpdates = useServerFn(listGateUpdatesFn);
  const createUpdate = useServerFn(createOrVerifyGateUpdateFn);
  const syncNews = useServerFn(syncGateNewsCronFn);

  const updatesQuery = useQuery({
    queryKey: ["gate-updates", selectedCategory, searchQuery],
    queryFn: () => listUpdates({ data: { category: selectedCategory, search: searchQuery } }),
    staleTime: 1000 * 60 * 5
  });

  const syncMutation = useMutation({
    mutationFn: () => syncNews(),
    onSuccess: (data: any) => {
      toast.success(data?.synced?.title ? `Synced: ${data.synced.title}` : "Official GATE 2027 feeds verified");
      qc.invalidateQueries({ queryKey: ["gate-updates"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to trigger official feed synchronization");
    }
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createUpdate({
        data: {
          title: newTitle,
          summary: newSummary,
          category: newCategory,
          source_name: newSourceName,
          source_url: newSourceUrl,
          is_pinned: newIsPinned
        }
      }),
    onSuccess: () => {
      toast.success("Verified notice published to GATE 2027 live feed");
      setShowAddModal(false);
      setNewTitle("");
      setNewSummary("");
      qc.invalidateQueries({ queryKey: ["gate-updates"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish announcement");
    }
  });

  const updates = (updatesQuery.data || []).slice(0, maxItems || 50);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                GATE 2027 Verified Official Updates
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live notifications strictly verified against MoE, IISc & organizing IIT portals
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="h-8 text-xs font-semibold gap-1.5 border-slate-300"
            title="Poll official government endpoints"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Check Official Feeds</span>
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="h-8 text-xs font-bold gap-1 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Notice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 sm:px-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars, topics..."
            className="h-8 text-xs bg-slate-50 border-slate-200 pl-3"
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {updatesQuery.isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            Checking official GATE coordination board records...
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No official circulars found in this category.
          </div>
        ) : (
          updates.map((item) => (
            <article
              key={item.id}
              className={`p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col gap-2.5 ${
                item.is_pinned ? "bg-amber-50/20" : ""
              }`}
            >
              {/* Meta row */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2">
                  {item.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold">
                      <Pin className="h-2.5 w-2.5 rotate-45" /> PINNED CIRCULAR
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(item.published_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {/* Source Verification Badge */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <span className="font-semibold text-slate-700">{item.source_name}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>

              {/* Title */}
              <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {item.title}
              </h4>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {item.summary}
              </p>

              {/* Bottom Actions */}
              <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-blue-600 transition group text-xs"
                >
                  <span>Verify Official Source Notice</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
                </a>

                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {item.id}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Admin Post Notice Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Publish Verified GATE 2027 Circular
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add an authorized notice with direct official domain validation (*.gov.in / *.ac.in).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Announcement Headline
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Official Clarification on Virtual Calculator Numerical Rounding"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs h-9 rounded-md border border-slate-300 px-2.5 bg-white"
                >
                  <option value="Exam Schedule">Exam Schedule</option>
                  <option value="Syllabus & Pattern">Syllabus & Pattern</option>
                  <option value="Registration / GOAPS">Registration / GOAPS</option>
                  <option value="Admit Card & Results">Admit Card & Results</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Issuing Authority
                </label>
                <Input
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. NCB-GATE 2027 Secretariat"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Direct Official Verification URL (*.ac.in / *.gov.in)
              </label>
              <Input
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://gate2027.iisc.ac.in/announcements/circular-04.pdf"
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Factual Summary & Bullet Points
              </label>
              <Textarea
                rows={4}
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Structured summary of the decision, affected branches, effective dates, and compliance mandates..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinNotice"
                checked={newIsPinned}
                onChange={(e) => setNewIsPinned(e.target.checked)}
                className="rounded border-slate-300 h-4 w-4 text-slate-900 focus:ring-0"
              />
              <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700">
                Pin this notice to top of aspirant feed
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={!newTitle || !newSummary || createMutation.isPending}
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {createMutation.isPending ? "Publishing..." : "Publish Verified Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
