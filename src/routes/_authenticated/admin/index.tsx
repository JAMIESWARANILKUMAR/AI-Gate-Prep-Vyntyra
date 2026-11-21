import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  Users,
  BookOpen,
  Award,
  Bell,
  Coins,
  Shield,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  LogOut,
  BrainCircuit,
  Sliders,
  DollarSign,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  Lock,
  Cpu,
  Database,
  Cloud
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// GATE Specific Admin Components
import { AdminCampusManagement } from "@/components/admin-campus-management";
import { CampusAdminDashboard } from "@/components/campus-admin-dashboard";
import { DeptAdminDashboard } from "@/components/dept-admin-dashboard";
import { GateVaultView } from "@/components/gate-vault-view";
import { GateNewsWidget } from "@/components/GateNewsWidget";
import { GateLeaderboardView } from "@/components/gate-leaderboard-view";
import {
  listCampusesFn,
  listDepartmentsFn,
  listCohortStudentsFn,
  type Campus,
  type Department
} from "@/lib/gate-multi-tenant.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Super Admin Controller — AI GATE Preparation Platform" },
      {
        name: "description",
        content:
          "Enterprise Multi-Tenant Super Administrator Console for AI GATE Preparation Suite. Manage institutional campuses, cascading credit pools, official PYQs, and verified GATE 2027 announcements."
      }
    ]
  }),
  component: SuperAdminControllerPage
});

type AdminTab =
  | "overview"
  | "campuses"
  | "campus_admin"
  | "dept_admin"
  | "vault"
  | "gate_news"
  | "leaderboard"
  | "system";

function SuperAdminControllerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("campuses");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Queries for live metrics
  const listCampuses = useServerFn(listCampusesFn);
  const listDepts = useServerFn(listDepartmentsFn);
  const listStudents = useServerFn(listCohortStudentsFn);

  const campusesQ = useQuery({
    queryKey: ["admin-all-campuses"],
    queryFn: () => listCampuses()
  });

  const deptsQ = useQuery({
    queryKey: ["admin-all-departments"],
    queryFn: () => listDepts({ data: {} })
  });

  const studentsQ = useQuery({
    queryKey: ["admin-all-students"],
    queryFn: () => listStudents({ data: {} })
  });

  const campuses: Campus[] = campusesQ.data || [];
  const departments: Department[] = deptsQ.data || [];
  const students = studentsQ.data || [];

  // Selected campus for nested management
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const activeCampus = selectedCampus || campuses[0] || {
    id: "camp_iitb",
    name: "IIT Bombay — Powai Campus",
    slug: "iitb",
    logo_r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/campuses/iitb-emblem.png",
    primary_accent_hex: "#0284c7",
    status: "active",
    max_students: 1500,
    allocated_mock_credits: 15000,
    allocated_ai_interview_credits: 3000,
    allocated_ai_doubt_tokens: 1500000,
    created_at: new Date().toISOString()
  };

  const activeDept: Department = activeCampus.departments?.[0] || {
    id: "dept_iitb_cse",
    campus_id: activeCampus.id,
    name: "Department of Computer Science & Engineering",
    code: "CSE",
    allocated_mock_credits: 5000,
    allocated_ai_interview_credits: 1000,
    created_at: new Date().toISOString()
  };

  // Metrics
  const totalMocks = campuses.reduce((acc, c) => acc + (c.allocated_mock_credits || 0), 0);
  const totalAIMocks = campuses.reduce((acc, c) => acc + (c.allocated_ai_interview_credits || 0), 0);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate({ to: "/auth/admin" });
    } catch {
      navigate({ to: "/auth/admin" });
    }
  };

  const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: any; count?: number | null }> = [
    { id: "campuses", label: "Campuses & White-Label", icon: Building2, count: campuses.length },
    { id: "campus_admin", label: "Campus Admin Portal", icon: Layers, count: null },
    { id: "dept_admin", label: "Dept Cohort Monitor", icon: Users, count: students.length },
    { id: "vault", label: "GATE R2 Vault & PYQs", icon: BookOpen, count: null },
    { id: "gate_news", label: "GATE 2027 Official News", icon: Bell, count: 5 },
    { id: "leaderboard", label: "Multi-Scope Leaderboard", icon: Award, count: null },
    { id: "system", label: "Cloudflare D1/R2 & Keys", icon: Database, count: null }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* ─── SIDEBAR NAVIGATION (Desktop) ─── */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 z-40 select-none overflow-hidden shrink-0 transition-all ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-black">
                <img src="/gate-emblem.svg" alt="GATE" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  SUPER ADMIN
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium -mt-0.5">
                  AI GATE Prep Suite
                </span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto">
              <img src="/gate-emblem.svg" alt="GATE" className="h-7 w-7 object-contain" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Institutional Operations
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          active
                            ? "bg-slate-800 text-slate-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User & Sign Out */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2 shrink-0">
          {!sidebarCollapsed && (
            <div className="px-2 py-1">
              <div className="text-[11px] font-bold text-slate-900 truncate">Platform Controller</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">superadmin@vyntyra.in</div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className={`w-full text-xs font-bold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 ${
              sidebarCollapsed ? "px-0 justify-center" : ""
            }`}
          >
            <LogOut className="h-3.5 w-3.5" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md border border-slate-200 text-slate-700"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  SUPER ADMIN CONSOLE
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">•</span>
                <span className="hidden sm:inline text-xs text-slate-600 font-medium">
                  National Coordination Board Aligned
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/intern"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition"
            >
              Student Portal View
            </Link>

            <Link
              to="/"
              className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition shadow-2xs"
            >
              Public Exam Portal
            </Link>
          </div>
        </header>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex">
            <div className="w-72 bg-white h-full flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">Admin Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                        activeTab === item.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full text-xs font-bold gap-1.5 border-slate-300"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Executive GATE Statistics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Partner Campuses</div>
              <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                {campuses.length}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">IITB, BITS, Anna Univ</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Global Mock Pool</div>
              <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                {totalMocks.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-1">Active Cascading Pool</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">AI Interview Credits</div>
              <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                {totalAIMocks.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Viva & PSU Simulation</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">Infrastructure</div>
              <div className="font-mono text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Cloudflare D1 & R2
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">OpenRouter AI Active</div>
            </div>
          </div>

          {/* TAB 1: CAMPUS MANAGEMENT & WHITE-LABEL STUDIO */}
          {activeTab === "campuses" && (
            <div className="space-y-6">
              <AdminCampusManagement />
            </div>
          )}

          {/* TAB 2: CAMPUS ADMIN PORTAL VIEW */}
          {activeTab === "campus_admin" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Campus Administrator Preview & Quota Allocation Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Switch between campuses to view how institutional administrators provision departments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Active Campus:</span>
                  <select
                    value={activeCampus.id}
                    onChange={(e) => {
                      const found = campuses.find((c) => c.id === e.target.value);
                      if (found) setSelectedCampus(found);
                    }}
                    className="text-xs h-8 rounded border border-slate-300 px-2 font-mono bg-white"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CampusAdminDashboard
                campus={activeCampus}
                onSelectDepartment={() => {
                  setActiveTab("dept_admin");
                }}
              />
            </div>
          )}

          {/* TAB 3: DEPARTMENT ADMIN & COHORT MONITORING */}
          {activeTab === "dept_admin" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Department Admin & Cohort Monitoring Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Onboard candidates via CSV, assign individual test quotas, and track completion streaks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Campus:</span>
                  <span className="text-xs font-bold text-slate-800">{activeCampus.name}</span>
                </div>
              </div>

              <DeptAdminDashboard campus={activeCampus} department={activeDept} />
            </div>
          )}

          {/* TAB 4: GATE VAULT & PYQS */}
          {activeTab === "vault" && (
            <div className="space-y-6">
              <GateVaultView />
            </div>
          )}

          {/* TAB 5: GATE 2027 OFFICIAL VERIFIED NEWS & CIRCULARS */}
          {activeTab === "gate_news" && (
            <div className="space-y-6">
              <GateNewsWidget isAdmin={true} />
            </div>
          )}

          {/* TAB 6: MULTI-SCOPE LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <GateLeaderboardView campusId={activeCampus.id} departmentId={activeDept.id} />
            </div>
          )}

          {/* TAB 7: SYSTEM KEYS & INFRASTRUCTURE */}
          {activeTab === "system" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Infrastructure, Edge Storage & Key Pool Health
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active Cloudflare D1 database, R2 document bucket, and OpenRouter multi-model rotation
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-700" /> Cloudflare D1 SQLite
                    </span>
                    <span className="text-emerald-700">Connected</span>
                  </div>
                  <div className="text-slate-500">Database: ai_gate_prep_vyntyra</div>
                  <div className="text-slate-500">ID: ec50eaa4-9e6b-4eb2-961f-ce5af28ea44a</div>
                  <div className="text-slate-500">Tables: 12 Active Tables</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-slate-700" /> Cloudflare R2 Storage
                    </span>
                    <span className="text-emerald-700">Connected</span>
                  </div>
                  <div className="text-slate-500">Bucket: ai-gate-prep-vyntyra</div>
                  <div className="text-slate-500 truncate">
                    Public: https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev
                  </div>
                  <div className="text-slate-500">KV Namespace: GATE_KV (a3cd172cd407456bba1d4e9a146a5062)</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-slate-700" /> OpenRouter Reasoning Pool
                    </span>
                    <span className="text-emerald-700">Active</span>
                  </div>
                  <div className="text-slate-500">Model: Gemini 2.5 Flash + Claude 3.5 Sonnet fallback</div>
                  <div className="text-slate-500">Pedagogical Derivations: 3-Part Cached in D1</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-700" /> Resend Email Gateway
                    </span>
                    <span className="text-emerald-700">Operational</span>
                  </div>
                  <div className="text-slate-500">Sender: admissions@vyntyraconsultancyservices.in</div>
                  <div className="text-slate-500">Campus Onboarding & Candidate Credentials Active</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
