import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AI GATE Preparation Platform" },
      { name: "description", content: "Privacy Policy of AI GATE Preparation Platform covering student data and mock test evaluations." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-14 flex-1">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Platform Overview
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Legal · Academic Compliance</div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: November 2026</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-sm">
          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">1. Educational Data Collection</h2>
            <p>
              The AI GATE Preparation Platform collects student profile data (name, email, engineering discipline, and target exam year) solely to administer mock tests, generate diagnostic high-score study roadmaps, and calculate percentile rankings.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">2. Assessment Analytics &amp; AI Mentorship</h2>
            <p>
              Test submissions and sectional timing metrics are processed through our AI pedagogical engine to generate 3-part structured solution breakdowns and weak topic identification. Doubt chat logs are retained strictly for academic escalation and review by Subject Matter Experts.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-base text-slate-900 mb-2">3. Cloudflare Edge &amp; Storage Security</h2>
            <p>
              All test sessions and question assets are encrypted in transit and at rest using Cloudflare D1 and Cloudflare R2 object storage with strict enterprise access controls.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
