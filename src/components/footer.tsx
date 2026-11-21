import { GraduationCap, BookOpen, ShieldCheck, Mail, MapPin, ExternalLink, CheckCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-sm bg-white text-slate-950 flex items-center justify-center font-black text-xs">
                GATE
              </div>
              <div>
                <h2 className="font-bold text-base text-white tracking-tight">AI GATE PREP</h2>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  Enterprise Platform
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Enterprise-grade GATE preparation platform featuring authentic CBT test engine, Cloudflare R2 PYQ vault, AI 3-part logical derivations, and All-India percentile tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-800 text-[11px] font-mono">
                <CheckCircle className="h-3 w-3 text-emerald-400" /> TCS iON Exam Standard
              </span>
            </div>
          </div>

          {/* GATE Engineering Branches */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Supported Branches
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>Computer Science &amp; IT</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">CS</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Data Science &amp; AI</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">DA</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Electronics &amp; Communication</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">EC</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Electrical Engineering</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">EE</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mechanical Engineering</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">ME</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Civil Engineering</span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">CE</span>
              </li>
            </ul>
          </div>
          
          {/* Secure Role Portals */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" /> Platform Portals
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <Link 
                to="/auth/intern" 
                className="group flex items-center justify-between p-2.5 rounded-sm bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 group-hover:text-white">Aspirant Portal</span>
                  <span className="text-[10px] text-slate-500">Mocks, Vault, Roadmap, Solver</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
              </Link>
              <Link 
                to="/auth/employee" 
                className="group flex items-center justify-between p-2.5 rounded-sm bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 group-hover:text-white">SME / Reviewer Desk</span>
                  <span className="text-[10px] text-slate-500">Breakdown Audit, Doubt Escalation</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
              </Link>
              <Link 
                to="/auth/admin" 
                className="group flex items-center justify-between p-2.5 rounded-sm bg-slate-900 border border-amber-950/60 hover:border-amber-800/80 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-amber-300 group-hover:text-amber-200">Admin Controller</span>
                  <span className="text-[10px] text-amber-500/70">Vault, Quotas, System Config</span>
                </div>
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* Verification & Academic Compliance */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white font-bold mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Examination Standard
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fully compliant with the official Graduate Aptitude Test in Engineering (GATE) syllabus and question types:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Multiple Choice Questions (MCQ)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Multiple Select Questions (MSQ)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Numerical Answer Type (NAT)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Virtual Scientific Calculator
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AI GATE Preparation Platform. All rights reserved.
          </div>
          <div className="text-[11px] text-slate-500 text-center md:text-right max-w-xl">
            Disclaimer: GATE is an examination administered by the Indian Institute of Science (IISc) and IITs on behalf of the National Coordination Board (NCB)-GATE. This platform provides independent educational and assessment tools.
          </div>
        </div>
      </div>
    </footer>
  );
}
