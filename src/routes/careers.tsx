import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Shield,
  TrendingUp,
  Briefcase,
  Globe,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "GATE Career Pathways — PSU Recruitment & Premier M.Tech/Ph.D. Opportunities" },
      {
        name: "description",
        content:
          "Explore career avenues unlocked by a high GATE score: PSU Maharatna recruitments (IOCL, ONGC, NTPC, BARC, DRDO) and postgraduate research admissions at IISc & IITs.",
      },
    ],
  }),
  component: GateCareersPage,
});

const PSU_RECRUITERS = [
  {
    category: "Maharatna PSUs",
    companies: [
      { name: "IOCL", full: "Indian Oil Corporation Limited", role: "Executive Engineer", ctc: "₹18–22 LPA" },
      { name: "ONGC", full: "Oil & Natural Gas Corporation", role: "Graduate Trainee", ctc: "₹21–24 LPA" },
      { name: "NTPC", full: "National Thermal Power Corporation", role: "Executive Trainee", ctc: "₹16–20 LPA" },
      { name: "PGCIL", full: "Power Grid Corporation of India", role: "Executive Trainee", ctc: "₹17–21 LPA" },
      { name: "BHEL", full: "Bharat Heavy Electricals Limited", role: "Engineer Trainee", ctc: "₹14–18 LPA" },
      { name: "GAIL", full: "Gas Authority of India Limited", role: "Executive Trainee", ctc: "₹18–22 LPA" }
    ]
  },
  {
    category: "Research & Defense Organizations",
    companies: [
      { name: "BARC", full: "Bhabha Atomic Research Centre", role: "Scientific Officer (OCES/DGFS)", ctc: "Level 10 Pay Matrix" },
      { name: "DRDO", full: "Defence Research & Development Org", role: "Scientist 'B'", ctc: "Level 10 Pay Matrix" },
      { name: "ISRO", full: "Indian Space Research Organisation", role: "Scientist / Engineer 'SC'", ctc: "Level 10 Pay Matrix" },
      { name: "NPCIL", full: "Nuclear Power Corporation of India", role: "Executive Trainee", ctc: "₹16–20 LPA" }
    ]
  }
];

const ACADEMIC_PATHWAYS = [
  {
    title: "M.Tech / M.E. at IISc & IITs",
    desc: "Postgraduate specialization with ₹12,400/month MoE Teaching Assistantship stipend. Unlocks top-tier deep tech R&D and engineering roles.",
    badge: "Master's Degree"
  },
  {
    title: "Direct Ph.D. with PMRF Scheme",
    desc: "Prime Minister's Research Fellowship (PMRF) offering up to ₹80,000/month stipend plus ₹2,00,000/year contingency research grant for exceptional GATE rankers.",
    badge: "Doctoral Research"
  },
  {
    title: "International Master's Programs",
    desc: "Prestigious global universities including National University of Singapore (NUS), Nanyang Technological University (NTU), TU Munich, and RWTH Aachen accept GATE scores.",
    badge: "Global Universities"
  }
];

function GateCareersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-slate-50 border-b border-slate-200 py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold shadow-2xs">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
              Professional &amp; Academic Horizons
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              GATE Career Pathways &amp; PSU Opportunities
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              A competitive GATE percentile serves as the gateway to premier public sector employment (PSUs), doctoral research with PMRF fellowships, and master's degrees at IISc Bangalore, IITs, and top global technical universities.
            </p>
          </div>
        </section>

        {/* PSU Recruitment Highlights */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Premier PSU Recruitment through GATE
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Over 50+ central public sector enterprises utilize GATE scores for direct Class-1 Gazetted and Executive Trainee appointments.
            </p>
          </div>

          <div className="space-y-8">
            {PSU_RECRUITERS.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-[#0A1F44]" />
                  {cat.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.companies.map((psu, pIdx) => (
                    <div key={pIdx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-black text-sm text-[#0A1F44] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {psu.name}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {psu.ctc}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900">{psu.full}</h4>
                        <div className="text-[11px] text-slate-500 mt-1">Post: <strong className="text-slate-700">{psu.role}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Academic & Research Section */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Higher Education &amp; Funded Research
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Funded postgraduate education and fellowships supported by the Ministry of Education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ACADEMIC_PATHWAYS.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0A1F44] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-3 mb-2">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 px-4 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Start Your High-Percentile Preparation</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Achieve target cutoffs with high-frequency mock tests, verified answer breakdowns, and algorithmic study roadmaps.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/intern"
              className="inline-flex items-center gap-2 bg-[#0A1F44] hover:bg-[#122b5c] text-white px-6 py-3 rounded-md font-bold text-sm transition-colors"
            >
              <GraduationCap className="h-4 w-4" /> Enter Aspirant Portal
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-6 py-3 rounded-md font-bold text-sm transition-colors"
            >
              Platform Overview
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
