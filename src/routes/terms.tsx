import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AI GATE Preparation Platform" },
      { name: "description", content: "Terms of service and honor code for the AI GATE Preparation Platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14 flex-1">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Platform Overview
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Academic Terms &amp; Honor Code</div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-1">Effective: November 2026</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-sm">
          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">1. Platform Scope &amp; Disclaimer</h2>
            <p>
              AI GATE Preparation Platform is an independent preparation, assessment, and analytics platform. GATE is a registered examination administered by the Indian Institute of Science (IISc) and IITs on behalf of the National Coordination Board (NCB)-GATE.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">2. Candidate Honor Code</h2>
            <p>
              Aspirants are expected to complete allocated full-length mock examinations under authentic examination conditions. Attempting to tamper with client-side timers, automated proctoring flags, or virtual calculators is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">3. Intellectual Property</h2>
            <p>
              AI-generated derivations, question breakdowns, and test layouts are proprietary to the platform. Official previous year question papers remain the property of the respective GATE organizing committees.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
