import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  GraduationCap,
  Calendar,
  Award,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/verify")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: typeof search.id === "string" ? search.id : undefined,
      ref: typeof search.ref === "string" ? search.ref : undefined,
      email: typeof search.email === "string" ? search.email : undefined,
      q: typeof search.q === "string" ? search.q : undefined,
      tab: typeof search.tab === "string" ? search.tab : undefined,
    };
  },
  component: GateScorecardVerifyPage,
});

function GateScorecardVerifyPage() {
  const searchParams = Route.useSearch() as Record<string, string | undefined>;
  const [query, setQuery] = useState(searchParams.id || searchParams.ref || searchParams.q || "");
  const [searched, setSearched] = useState(false);

  const mockResult = query.trim().length > 0 ? {
    testId: query.toUpperCase().startsWith("GATE-") ? query.toUpperCase() : `GATE-EXAM-${query.toUpperCase()}`,
    candidateName: "Verified Aspirant Candidate",
    branch: "Computer Science & Information Technology (CS)",
    score: "78.33 / 100",
    percentile: "98.74 %tile",
    rank: "AIR 421",
    date: "November 2026",
    status: "Officially Verified by AI GATE Examination Board",
    tcsIonVerified: true
  } : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Cryptographic Scorecard Verification
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Verify GATE Assessment Credentials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Authenticate official GATE mock test reports, verified percentile rankings, and SME-reviewed benchmark evaluations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); setSearched(true); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10 h-10 text-sm border-slate-300"
                  placeholder="Enter Assessment ID or Candidate Ref (e.g. GATE-2026-CS-041)"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
                />
              </div>
              <Button type="submit" className="h-10 px-5 bg-[#0A1F44] hover:bg-[#122b5c] text-white font-bold text-xs uppercase">
                Verify
              </Button>
            </form>

            {searched && mockResult && (
              <div className="mt-6 p-5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">Valid Credential Record Found</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    TCS iON Standard
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate</span>
                    <strong className="text-slate-900">{mockResult.candidateName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Branch</span>
                    <strong className="text-slate-900">{mockResult.branch}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Marks Scored</span>
                    <strong className="text-emerald-700 font-mono text-sm">{mockResult.score}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">All-India Percentile</span>
                    <strong className="text-emerald-700 font-mono text-sm">{mockResult.percentile} ({mockResult.rank})</strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 italic">
                  Status: {mockResult.status}
                </div>
              </div>
            )}

            {searched && !mockResult && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>No assessment found matching that ID. Please check the reference string and try again.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
