import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Shield,
  Target,
  Trophy,
  Award,
  Layers,
  Sparkles,
  Calculator,
  Download,
  FileText,
  BrainCircuit,
  MessageSquare,
  Clock,
  Compass,
  Check,
  CheckCheck
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI GATE Preparation Platform — Enterprise Assessment & Engineering Analytics" },
      {
        name: "description",
        content:
          "Enterprise AI GATE Preparation Platform. Full-length mock tests (MCQ, MSQ, NAT), official GATE virtual calculator, R2 Previous Year Question vault, AI 3-part breakdown solutions, and All-India live rank analytics.",
      },
      { property: "og:title", content: "AI GATE Preparation Platform" },
      {
        property: "og:description",
        content:
          "Official GATE exam simulation, PYQ archive, 3-part derivation breakdowns, and contextual AI doubt solving.",
      },
    ],
  }),
  component: HomePage,
});

const GATE_DISCIPLINES = [
  {
    code: "CS",
    title: "Computer Science & IT (CS)",
    desc: "Algorithms, Data Structures, Operating Systems, DBMS, Theory of Computation, Computer Networks & Digital Logic.",
    weightage: "100 Marks • 65 Questions",
    tags: ["Algorithms", "OS", "DBMS", "Networks"]
  },
  {
    code: "DA",
    title: "Data Science & Artificial Intelligence (DA)",
    desc: "Probability & Statistics, Linear Algebra, Machine Learning, Deep Learning, AI Search, and Python Programming.",
    weightage: "100 Marks • 65 Questions",
    tags: ["ML", "Deep Learning", "Linear Algebra", "Python"]
  },
  {
    code: "EC",
    title: "Electronics & Communication (EC)",
    desc: "Signals & Systems, Analog & Digital Circuits, Semiconductor Devices, Communications, and Control Systems.",
    weightage: "100 Marks • 65 Questions",
    tags: ["Signals", "Semiconductors", "Communications", "Analog"]
  },
  {
    code: "EE",
    title: "Electrical Engineering (EE)",
    desc: "Electric Circuits, Electrical Machines, Power Systems, Control Systems, Power Electronics & Measurements.",
    weightage: "100 Marks • 65 Questions",
    tags: ["Power Systems", "Machines", "Circuits", "Control"]
  },
  {
    code: "ME",
    title: "Mechanical Engineering (ME)",
    desc: "Engineering Mechanics, Strength of Materials, Thermodynamics, Fluid Mechanics, Vibrations & Manufacturing.",
    weightage: "100 Marks • 65 Questions",
    tags: ["Thermodynamics", "Fluids", "Mechanics", "Manufacturing"]
  },
  {
    code: "CE",
    title: "Civil Engineering (CE)",
    desc: "Structural Analysis, Geotechnical Engineering, Water Resources, Transportation & Environmental Engineering.",
    weightage: "100 Marks • 65 Questions",
    tags: ["Structures", "Geotechnical", "Transportation", "Water"]
  }
];

const PLATFORM_PILLARS = [
  {
    icon: BrainCircuit,
    title: "Authentic GATE CBT Simulation",
    desc: "Timed examination interface replicating the official TCS iON GATE exam environment with MCQ, MSQ (multi-select), and NAT (numerical with virtual keypad) formats and official scientific calculator."
  },
  {
    icon: BookOpen,
    title: "R2-Backed PYQ & Syllabus Vault",
    desc: "Filterable archive of authentic GATE question papers (2000-2025), official syllabus copies, and formula sheets stored on Cloudflare R2 with dual-mode PDF viewing and official print-ready generation."
  },
  {
    icon: Sparkles,
    title: "AI 3-Part Solution Breakdown",
    desc: "Structured pedagogical breakdowns for every question cached in Cloudflare D1: (1) Core Theoretical Concept, (2) Step-by-Step Logical Derivation, and (3) Common Traps & Edge Cases."
  },
  {
    icon: MessageSquare,
    title: "Contextual AI Doubt Solver",
    desc: "Side-panel mentor chat scoped to the active question with verified answer keys pre-injected to prevent mathematical hallucinations, with 1-click escalation to Subject Matter Experts."
  },
  {
    icon: Target,
    title: "Personalized High-Score Roadmap",
    desc: "Algorithmic study strategy computing weak areas from mock test diagnostics against historical GATE syllabus weightages to deliver high-yield week-by-week targets."
  },
  {
    icon: Trophy,
    title: "All-India Live Ranking Engine",
    desc: "Real-time rank, percentile, and sectional accuracy analytics across all registered aspirants with full auditability for administrators and mentors."
  }
];

function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Platform Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/gate-emblem.svg" alt="GATE Official Emblem" className="h-10 w-10 object-contain" />
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block">AI GATE Prep Platform</span>
              <span className="text-[10px] text-slate-500 font-mono block">National Coordination Board (NCB) Aligned</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/intern"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded hover:bg-slate-100 transition"
            >
              Aspirant Portal
            </Link>
            <Link
              to="/auth/employee"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded hover:bg-slate-100 transition"
            >
              SME Reviewer Desk
            </Link>
            <Link
              to="/auth/admin"
              className="text-xs font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded hover:bg-slate-800 transition"
            >
              Admin Controller
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Official GATE Emblem & NCB Banner */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <img src="/gate-logo.svg" alt="Official GATE Logo" className="h-16 sm:h-20 max-w-full object-contain" />
          <img src="/iit-iisc-banner.svg" alt="IISc Bangalore and 7 IITs National Coordination Board" className="w-full max-w-xl object-contain rounded-md border border-slate-200 shadow-2xs" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold mb-6">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          GATE 2026 Ready • Computer Science, Data Science, EC, EE, ME, CE
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight">
          Precision Engineering for the <span className="text-slate-900 underline decoration-slate-300">GATE Examination</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Master the Graduate Aptitude Test in Engineering with authentic CBT exam simulations, instant 3-part AI pedagogical breakdowns, Cloudflare R2 PYQ vault access, and real-time All-India ranking benchmarks.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth/intern"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-xs"
          >
            Attempt Allocated Mock Test <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth/intern"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-200 transition"
          >
            <BookOpen className="h-4 w-4" /> Explore PYQ & Syllabus Vault
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-y border-slate-200 py-6">
          <div>
            <div className="font-mono text-2xl font-black text-slate-900">65 Qs</div>
            <div className="text-xs text-slate-500 mt-0.5">MCQ, MSQ & NAT Types</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-slate-900">2000-2025</div>
            <div className="text-xs text-slate-500 mt-0.5">Official R2 PYQ Papers</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-slate-900">3-Part</div>
            <div className="text-xs text-slate-500 mt-0.5">Cached D1 Breakdowns</div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-slate-900">AIR Matrix</div>
            <div className="text-xs text-slate-500 mt-0.5">Live Percentile Scoring</div>
          </div>
        </div>
      </section>

      {/* Engineering Disciplines Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto bg-slate-50/70 border-y border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comprehensive Branch Coverage
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Standardized curriculum maps and question banks structured according to the latest official GATE syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GATE_DISCIPLINES.map(b => (
            <div key={b.code} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {b.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{b.weightage}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                {b.tags.map(t => (
                  <span key={t} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider mb-2">
            Engineering Excellence & Pedagogy
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Six Pillars of the AI GATE Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every feature is designed with mathematical rigor, zero decorative clutter, and authentic exam compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Gateways Section */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto bg-slate-900 text-white rounded-2xl mb-20 shadow-md">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Your Examination Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Select your designated platform role to enter</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/auth/intern"
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition group text-left block"
          >
            <GraduationCap className="h-6 w-6 text-emerald-400 mb-3" />
            <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition">GATE Aspirant Portal</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Attempt allocated mocks, access PYQ vault & AI doubt solver.</p>
          </Link>

          <Link
            to="/auth/employee"
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 transition group text-left block"
          >
            <CheckCheck className="h-6 w-6 text-sky-400 mb-3" />
            <div className="font-bold text-sm text-white group-hover:text-sky-400 transition">SME Reviewer Desk</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Verify 3-part breakdowns, audit questions & resolve escalations.</p>
          </Link>

          <Link
            to="/auth/admin"
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition group text-left block"
          >
            <Shield className="h-6 w-6 text-amber-400 mb-3" />
            <div className="font-bold text-sm text-white group-hover:text-amber-400 transition">Admin Controller</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Manage R2 vault, test allocations, AIR rankings & API rotation.</p>
          </Link>
        </div>
      </section>

      {/* Global Minimalist Footer */}
      <footer className="border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <span>AI GATE Preparation Platform • Edge Architecture on Cloudflare D1 & R2</span>
          <span>Aligned with National GATE Syllabus • All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
}
