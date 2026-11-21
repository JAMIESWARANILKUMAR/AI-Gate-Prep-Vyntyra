import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Shield,
  Target,
  Award,
  Layers,
  Sparkles,
  Calculator,
  FileText,
  Clock,
  Compass,
  Building,
  School,
  ExternalLink
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GATE Examination — Structure, Conducting Institutes & AI Platform" },
      {
        name: "description",
        content:
          "Comprehensive guide to the Graduate Aptitude Test in Engineering (GATE), organized by IISc Bangalore and the 7 IITs on behalf of NCB-GATE. Learn about exam pattern, marking scheme, and AI preparation tools.",
      },
      { property: "og:title", content: "About GATE Examination & AI Platform" },
    ],
  }),
  component: AboutGatePage,
});

const CONDUCTING_INSTITUTES = [
  { name: "IISc Bangalore", role: "Organizing & Coordinating Body", code: "IISc" },
  { name: "IIT Bombay", role: "Zone 1 Zonal Center", code: "IITB" },
  { name: "IIT Delhi", role: "Zone 2 Zonal Center", code: "IITD" },
  { name: "IIT Guwahati", role: "Zone 3 Zonal Center", code: "IITG" },
  { name: "IIT Kanpur", role: "Zone 4 Zonal Center", code: "IITK" },
  { name: "IIT Kharagpur", role: "Zone 5 Zonal Center", code: "IITKGP" },
  { name: "IIT Madras", role: "Zone 6 Zonal Center", code: "IITM" },
  { name: "IIT Roorkee", role: "Zone 7 Zonal Center", code: "IITR" }
];

const EXAM_SECTIONS = [
  {
    title: "General Aptitude (GA)",
    questions: "10 Questions",
    marks: "15 Marks",
    desc: "Verbal Ability, Numerical Ability, Spatial Aptitude, and Analytical Reasoning common across all engineering branches."
  },
  {
    title: "Engineering Mathematics",
    questions: "10–12 Questions",
    marks: "13–15 Marks",
    desc: "Linear Algebra, Calculus, Differential Equations, Complex Analysis, Probability & Statistics, Numerical Methods (varies by paper)."
  },
  {
    title: "Subject Core Technical",
    questions: "43–45 Questions",
    marks: "70–72 Marks",
    desc: "Discipline-specific fundamental and advanced engineering concepts evaluated via rigorous numerical, multi-select, and conceptual problems."
  }
];

function AboutGatePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="bg-slate-50 border-b border-slate-200 py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold shadow-2xs">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              National Coordination Board (NCB) — GATE
            </div>
            
            <div className="flex justify-center py-2">
              <img src="/gate-logo.svg" alt="Official GATE Logo" className="h-16 w-auto" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              About the Graduate Aptitude Test in Engineering
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              GATE is an all-India examination administered jointly by the Indian Institute of Science (IISc) and seven Indian Institutes of Technology (IITs) on behalf of the National Coordination Board (NCB)-GATE, Department of Higher Education, Ministry of Education (MoE), Government of India.
            </p>
          </div>
        </section>

        {/* Organizing Body Authority Strip */}
        <section className="py-6 px-4 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto">
            <img src="/iit-iisc-banner.svg" alt="NCB GATE Authorities" className="w-full h-auto" />
          </div>
        </section>

        {/* Conducting Institutes Grid */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Organizing &amp; Zonal Institutes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              GATE governance rotates among eight premier autonomous national institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONDUCTING_INSTITUTES.map((inst) => (
              <div key={inst.code} className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="h-7 w-7 rounded bg-[#0A1F44] text-white flex items-center justify-center font-mono font-bold text-xs mb-2">
                    {inst.code.slice(0, 3)}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{inst.name}</h3>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">{inst.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Exam Structure & Question Formats */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Authentic GATE Examination Blueprint
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Total 65 Questions • 100 Maximum Marks • 180 Minutes (3 Hours) Duration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {EXAM_SECTIONS.map((sec, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      Section {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">{sec.marks}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{sec.title}</h3>
                  <div className="text-xs font-mono font-semibold text-slate-500">{sec.questions}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                </div>
              ))}
            </div>

            {/* Three Question Types Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                The Three Standard GATE Question Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm">1. Multiple Choice Questions (MCQ)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Objective 4-option questions where only one option is correct. Negative marking: 1/3 mark deducted for 1-mark questions; 2/3 mark deducted for 2-mark questions.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm">2. Multiple Select Questions (MSQ)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Objective questions where one or more options are correct. Full marks awarded only if all correct choices are checked. Zero negative marking.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm">3. Numerical Answer Type (NAT)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Answer is a real number entered via the on-screen virtual keypad or keyboard. Accepts specific range tolerance. Zero negative marking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Gateway */}
        <section className="py-16 px-4 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Ready to Test Your GATE Preparedness?</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Experience our TCS iON standard CBT simulation with virtual scientific calculator, instant 3-part pedagogical derivations, and All-India percentile benchmarks.
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
              Back to Overview
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
