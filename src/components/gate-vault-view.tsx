import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  listGateVaultDocumentsFn, 
  uploadGateVaultDocumentFn, 
  incrementGateVaultDownloadFn, 
  GateVaultItem 
} from "@/lib/gate-vault.functions";
import { 
  FileText, Download, Upload, Filter, Search, BookOpen, 
  Calendar, Layers, CheckCircle2, ExternalLink, Sparkles, Plus, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GATE_BRANCHES = [
  { code: "ALL", name: "All Engineering Branches" },
  { code: "CS", name: "Computer Science & IT (CS)" },
  { code: "DA", name: "Data Science & AI (DA)" },
  { code: "EC", name: "Electronics & Communication (EC)" },
  { code: "EE", name: "Electrical Engineering (EE)" },
  { code: "ME", name: "Mechanical Engineering (ME)" },
  { code: "CE", name: "Civil Engineering (CE)" }
];

const CATEGORIES = [
  { id: "ALL", label: "All Vault Materials" },
  { id: "pyq", label: "Official Previous Year Papers (PYQs)" },
  { id: "syllabus", label: "Branch Syllabus Copies" },
  { id: "study_notes", label: "High-Yield Notes" },
  { id: "formula_sheet", label: "Formula Handbooks" }
];

interface GateVaultViewProps {
  isAdmin?: boolean;
  onOpenGeneratedPaper?: (doc: GateVaultItem) => void;
}

export function GateVaultView({ isAdmin = false, onOpenGeneratedPaper }: GateVaultViewProps) {
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form State (for Admin)
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadBranch, setUploadBranch] = useState("CS");
  const [uploadCategory, setUploadCategory] = useState<"pyq" | "syllabus" | "study_notes" | "formula_sheet">("pyq");
  const [uploadYear, setUploadYear] = useState(2025);
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadDirectUrl, setUploadDirectUrl] = useState("");

  const listDocs = useServerFn(listGateVaultDocumentsFn);
  const uploadDoc = useServerFn(uploadGateVaultDocumentFn);
  const incDownload = useServerFn(incrementGateVaultDownloadFn);
  const qc = useQueryClient();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ["gate_vault_docs", selectedBranch, selectedCategory, selectedYear],
    queryFn: () => listDocs({ data: { branch: selectedBranch, category: selectedCategory, year: selectedYear } })
  });

  const filteredDocs = documents.filter(doc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      doc.branch_code.toLowerCase().includes(q)
    );
  });

  const handleDownload = async (doc: GateVaultItem) => {
    try {
      await incDownload({ data: { docId: doc.id } });
      window.open(doc.r2_url, "_blank", "noopener,noreferrer");
      toast.success("Opening official document stream...");
    } catch {
      window.open(doc.r2_url, "_blank");
    }
  };

  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    try {
      await uploadDoc({
        data: {
          title: uploadTitle.trim(),
          branch_code: uploadBranch,
          category: uploadCategory,
          year: uploadYear,
          description: uploadDesc,
          directUrl: uploadDirectUrl.trim() || undefined
        }
      });
      toast.success("Document uploaded & indexed into R2 Vault successfully!");
      setUploadModalOpen(false);
      setUploadTitle("");
      setUploadDesc("");
      setUploadDirectUrl("");
      qc.invalidateQueries({ queryKey: ["gate_vault_docs"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              GATE PYQ, Syllabus & Study Material Vault
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official previous years question papers (PYQs), branch-wise syllabus documents, and high-yield engineering notes backed by Cloudflare R2 storage.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Upload Document to R2
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Engineering Branch</label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="bg-white text-xs font-semibold h-9 border-slate-200">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {GATE_BRANCHES.map(b => (
                <SelectItem key={b.code} value={b.code} className="text-xs">{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Material Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white text-xs font-semibold h-9 border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Exam Year</label>
          <Select 
            value={selectedYear ? String(selectedYear) : "ALL"} 
            onValueChange={v => setSelectedYear(v === "ALL" ? undefined : Number(v))}
          >
            <SelectTrigger className="bg-white text-xs font-semibold h-9 border-slate-200">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Years (2000 - 2026)</SelectItem>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
                <SelectItem key={y} value={String(y)} className="text-xs">GATE {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Search Vault</label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topic, paper, year..."
              className="pl-8 bg-white text-xs h-9 border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white border border-slate-200 rounded-xl">
          Indexing Cloudflare R2 Vault Documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
          <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No documents found matching the filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or selecting another branch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const isPyq = doc.category === "pyq";
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border-slate-300">
                      {doc.branch_code} {doc.year ? `• ${doc.year}` : ""}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.category.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-mono">
                    {doc.download_count} accesses
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Mode A: Original Uploaded PDF */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-8 px-2.5 flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Original PDF
                    </Button>

                    {/* Mode B: Official GATE Format Dynamically Generated Paper */}
                    {isPyq && (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (onOpenGeneratedPaper) {
                            onOpenGeneratedPaper(doc);
                          } else {
                            toast.info(`Generating print-ready Official GATE ${doc.branch_code} paper from D1 question bank...`);
                            window.open(`/cbt/paper-preview?docId=${doc.id}&branch=${doc.branch_code}`, "_blank");
                          }
                        }}
                        className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-8 px-2.5 flex items-center gap-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-400" /> Get Paper
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Upload Modal */}
      {isAdmin && (
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="max-w-lg bg-white p-6 rounded-xl border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">Upload Document to Cloudflare R2 Vault</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Index official GATE PYQs, syllabus guides, or notes into R2 object storage.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAdminUpload} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document Title *</label>
                <Input
                  required
                  placeholder="e.g. GATE 2025 Computer Science & IT Official Paper"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Branch</label>
                  <Select value={uploadBranch} onValueChange={setUploadBranch}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GATE_BRANCHES.filter(b => b.code !== "ALL").map(b => (
                        <SelectItem key={b.code} value={b.code} className="text-xs">{b.code} - {b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <Select value={uploadCategory} onValueChange={(v: any) => setUploadCategory(v)}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pyq" className="text-xs">Official PYQ Paper</SelectItem>
                      <SelectItem value="syllabus" className="text-xs">Syllabus Copy</SelectItem>
                      <SelectItem value="study_notes" className="text-xs">Study Notes</SelectItem>
                      <SelectItem value="formula_sheet" className="text-xs">Formula Sheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Exam Year</label>
                <Input
                  type="number"
                  value={uploadYear}
                  onChange={e => setUploadYear(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Direct PDF URL (or R2 Public Link)</label>
                <Input
                  placeholder="https://pub-....r2.dev/gate-vault/..."
                  value={uploadDirectUrl}
                  onChange={e => setUploadDirectUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Notes</label>
                <Input
                  placeholder="Key topics, organizing institute, master solution notes..."
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 text-white font-bold text-xs">
                  Save & Index to Vault
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
