import React, { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Calculator,
  Award
} from "lucide-react";
import { getCampusBySlugFn, type Campus, type Department } from "@/lib/gate-multi-tenant.functions";
import { CoBrandedHeader } from "@/components/CoBrandedHeader";
import { GateNewsWidget } from "@/components/GateNewsWidget";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/c/$campusSlug")({
  component: CampusPortalPage
});

function CampusPortalPage() {
  const params = useParams({ from: "/c/$campusSlug" });
  const campusSlug = params.campusSlug || "iitb";

  const getCampus = useServerFn(getCampusBySlugFn);
  const campusQuery = useQuery({
    queryKey: ["campus-portal", campusSlug],
    queryFn: () => getCampus({ data: { slug: campusSlug } })
  });

  const campus: Campus | null = campusQuery.data || null;

  if (campusQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-slate-500">
        Loading Institutional Examination Suite...
      </div>
    );
  }

  if (!campus) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="h-12 w-12 text-slate-400 mb-3" />
        <h1 className="text-xl font-bold text-slate-900">Campus Not Found</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No active institutional GATE preparation portal configured under slug{" "}
          <span className="font-mono font-bold text-slate-800">/{campusSlug}</span>.
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 rounded bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
        >
          Return to All-India Platform
        </Link>
      </div>
    );
  }

  const departments: Department[] = campus.departments || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
      <div>
        {/* Co-Branded Header */}
        <CoBrandedHeader campus={campus} />

        {/* Institutional Hero Banner */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold mb-5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                Vyntyra Enterprise Campus Partner • GATE 2026/2027 Ready
              </div>

              <div className="flex items-center gap-4 mb-4">
                {campus.logo_r2_url && (
                  <img
                    src={campus.logo_r2_url}
                    alt={campus.name}
                    className="h-16 w-16 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-2xs shrink-0"
                  />
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  {campus.name}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Dedicated Computer Based Testing (CBT) portal, TCS iON simulation arena, 3-part AI pedagogical breakdowns, and institutional department leaderboards for all enrolled engineering candidates.
              </p>

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/auth/intern"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
                >
                  <GraduationCap className="h-4 w-4" /> Aspirant Student Login
                </Link>

                <Link
                  to="/auth/employee"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
                >
                  <Shield className="h-4 w-4" /> Faculty & SME Review Desk
                </Link>

                <Link
                  to="/auth/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
                >
                  <Building2 className="h-4 w-4" /> Campus Admin Controller
                </Link>
              </div>
            </div>

            {/* Campus Credit & Activity Ledger Summary */}
            <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="font-mono text-2xl font-black text-slate-900">
                  {campus.allocated_mock_credits.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Mock Test Credit Pool</div>
              </div>

              <div>
                <div className="font-mono text-2xl font-black text-slate-900">
                  {campus.allocated_ai_interview_credits.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">AI Interview Quota</div>
              </div>

              <div>
                <div className="font-mono text-2xl font-black text-slate-900">
                  {departments.length}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Academic Departments</div>
              </div>

              <div>
                <div className="font-mono text-2xl font-black text-slate-900">
                  {campus.max_students}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Max Candidate Seats</div>
              </div>
            </div>
          </div>
        </div>

        {/* Departments Grid & Verified Updates Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Academic Departments */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Academic Departments & Allocated Exam Arenas
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your registered department to view curriculum tests and benchmarks
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-black text-xs text-slate-900 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {dept.code}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {dept.allocated_mock_credits.toLocaleString()} Mocks
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mb-1">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Aligned with latest official syllabus. Standard 65-question computer based simulation.
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        {dept.studentCount || 0} active candidates
                      </span>

                      <Link
                        to="/auth/intern"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition"
                      >
                        <span>Access Arena</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Verified GATE 2027 Official Updates Widget */}
            <div className="space-y-4">
              <GateNewsWidget maxItems={4} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
