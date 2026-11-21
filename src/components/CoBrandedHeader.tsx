import React from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Building2, GraduationCap, ChevronDown, Check, LogOut, ExternalLink, Sparkles } from "lucide-react";
import type { Campus, Department, GateRole } from "@/lib/gate-multi-tenant.functions";

interface CoBrandedHeaderProps {
  campus?: Campus | null;
  department?: Department | null;
  currentRole?: GateRole;
  userName?: string;
  onRoleChange?: (role: GateRole) => void;
  mockCreditsRemaining?: number;
  totalMocksAllowed?: number;
}

export function CoBrandedHeader({
  campus,
  department,
  currentRole = "STUDENT",
  userName = "Aspirant",
  onRoleChange,
  mockCreditsRemaining,
  totalMocksAllowed
}: CoBrandedHeaderProps) {
  const isCoBranded = !!campus;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 select-none">
      {/* Top Academic Status Accent Bar */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: campus?.primary_accent_hex || "#0f172a" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Dynamic Co-Branding Lockup */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Primary Platform Mark */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="h-9 w-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-black font-mono text-sm tracking-wider shadow-2xs">
              <img src="/gate-emblem.svg" alt="GATE Emblem" className="h-6 w-6 object-contain" />
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-slate-700 transition">
                VYNTYRA
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-medium -mt-0.5">
                GATE AI
              </span>
            </div>
          </Link>

          {/* Institutional Co-Branding Separator & Campus Details */}
          {isCoBranded ? (
            <>
              <span className="text-slate-300 font-mono text-lg font-light select-none">×</span>

              <div className="flex items-center gap-2.5 min-w-0">
                {campus.logo_r2_url ? (
                  <img
                    src={campus.logo_r2_url}
                    alt={campus.name}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-md object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                    onError={(e) => {
                      // Fallback to stylized monogram if R2 logo is loading or empty
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {campus.slug.slice(0, 3).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {campus.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
                      /{campus.slug}
                    </span>
                  </div>

                  {department && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
                      <span className="font-semibold text-slate-800">{department.code}</span>
                      <span className="opacity-40">·</span>
                      <span className="truncate">{department.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-xs text-slate-500 font-medium">National Examination Suite</span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                GATE 2026/2027
              </span>
            </div>
          )}
        </div>

        {/* Right: Role Switcher & Student Quota Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Student Quota Counter Pill */}
          {currentRole === "STUDENT" && mockCreditsRemaining !== undefined && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono">
              <span className="text-slate-500">Mocks:</span>
              <span className={`font-bold ${mockCreditsRemaining > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                {mockCreditsRemaining}/{totalMocksAllowed || 10}
              </span>
            </div>
          )}

          {/* 4-Tier Role Indicator & Tester Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-1.5 hidden md:inline">
              Role:
            </span>
            {(["SUPER_ADMIN", "CAMPUS_ADMIN", "DEPT_ADMIN", "STUDENT"] as GateRole[]).map((r) => {
              const active = currentRole === r;
              const labels: Record<GateRole, string> = {
                SUPER_ADMIN: "Super Admin",
                CAMPUS_ADMIN: "Campus",
                DEPT_ADMIN: "Dept",
                STUDENT: "Student"
              };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange?.(r)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    active
                      ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  title={`Switch to ${labels[r]} view`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* Quick Home / Portal Link */}
          <Link
            to="/auth/intern"
            className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition"
          >
            Aspirant Desk
          </Link>

          <Link
            to="/auth/admin"
            className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition shadow-2xs"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin Hub</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
