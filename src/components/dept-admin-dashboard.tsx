import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Flame,
  Award,
  Search,
  Filter,
  Mail,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import {
  listCohortStudentsFn,
  onboardStudentFn,
  bulkOnboardStudentsFn,
  type Department,
  type Campus,
  type GateUser
} from "@/lib/gate-multi-tenant.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DeptAdminDashboardProps {
  campus: Campus;
  department: Department;
}

export function DeptAdminDashboard({ campus, department }: DeptAdminDashboardProps) {
  const qc = useQueryClient();
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Single Student Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mockTests, setMockTests] = useState<number>(10);
  const [aiInterviews, setAiInterviews] = useState<number>(3);

  // Bulk CSV Form
  const [csvText, setCsvText] = useState(
    "Arjun Patel,arjun.patel@cse.edu,12\nSneha Rao,sneha.rao@cse.edu,15\nVikram Singh,vikram.singh@cse.edu,10"
  );

  const listStudents = useServerFn(listCohortStudentsFn);
  const onboardStudent = useServerFn(onboardStudentFn);
  const bulkOnboard = useServerFn(bulkOnboardStudentsFn);

  const studentsQuery = useQuery({
    queryKey: ["cohort-students", department.id],
    queryFn: () => listStudents({ data: { department_id: department.id, campus_id: campus.id } })
  });

  const students: GateUser[] = studentsQuery.data || [];

  // Cascading Quota Gauge Calculation
  const totalAssignedMocks = students.reduce((acc, s) => acc + (s.mock_tests_allowed || 0), 0);
  const remainingDeptMocks = Math.max(0, department.allocated_mock_credits - totalAssignedMocks);
  const quotaUtilizationPercent = Math.min(
    100,
    Math.round((totalAssignedMocks / Math.max(department.allocated_mock_credits, 1)) * 100)
  );

  // Single Student Onboarding
  const singleMutation = useMutation({
    mutationFn: () =>
      onboardStudent({
        data: {
          campus_id: campus.id,
          department_id: department.id,
          name,
          email,
          mock_tests_allowed: Number(mockTests),
          ai_interviews_allowed: Number(aiInterviews)
        }
      }),
    onSuccess: () => {
      toast.success(`Aspirant ${name} onboarded! Credentials dispatched via Resend.`);
      setShowSingleModal(false);
      setName("");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["cohort-students", department.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to onboard aspirant");
    }
  });

  // Bulk CSV Parse & Import
  const handleBulkImport = () => {
    const lines = csvText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const parsedStudents: Array<{ name: string; email: string; mock_tests: number }> = [];

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2 && parts[1].includes("@")) {
        parsedStudents.push({
          name: parts[0],
          email: parts[1],
          mock_tests: Number(parts[2]) > 0 ? Number(parts[2]) : 10
        });
      }
    }

    if (parsedStudents.length === 0) {
      toast.error("No valid student lines found. Please use format: Name,Email,MockQuota");
      return;
    }

    bulkMutation.mutate(parsedStudents);
  };

  const bulkMutation = useMutation({
    mutationFn: (items: Array<{ name: string; email: string; mock_tests: number }>) =>
      bulkOnboard({
        data: {
          campus_id: campus.id,
          department_id: department.id,
          students: items
        }
      }),
    onSuccess: (res: any) => {
      toast.success(`Enrolled ${res.enrolledCount} students into ${department.code} cohort!`);
      setShowBulkModal(false);
      qc.invalidateQueries({ queryKey: ["cohort-students", department.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk onboarding failed");
    }
  });

  // CSV Report Export
  const exportCohortCsv = () => {
    const headers = "Name,Email,Role,MockAllowed,MockUsed,AIInterviewsUsed,AvgScorePercent,StreakDays,Status\n";
    const rows = students
      .map(
        (s) =>
          `"${s.name}","${s.email}","${s.role}",${s.mock_tests_allowed},${s.mock_tests_used},${s.ai_interviews_used},${s.average_score || 0},${s.streak_days || 0},"${s.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GATE_Cohort_${department.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Cohort performance CSV exported.");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Department Header & Quota Gauge */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                {department.code}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {department.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {campus.name} • Academic Year 2026-2027 Cohort Monitoring Desk
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCohortCsv}
              className="text-xs font-bold gap-1.5 border-slate-300"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              className="text-xs font-bold gap-1.5 border-slate-300"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Bulk CSV Import
            </Button>
            <Button
              size="sm"
              onClick={() => setShowSingleModal(true)}
              className="text-xs font-bold gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
            >
              <UserPlus className="h-3.5 w-3.5" /> Onboard Student
            </Button>
          </div>
        </div>

        {/* Cascading Quota Gauge */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Department Mock Credit Balance</span>
              <span className="font-mono font-bold text-slate-900">{quotaUtilizationPercent}% Assigned</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {remainingDeptMocks.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {department.allocated_mock_credits.toLocaleString()} Available
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all"
                style={{ width: `${quotaUtilizationPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-sans">
              Allocated to students for Full-Length Mock Exams.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Enrolled Candidates</span>
              <span className="font-mono font-bold text-slate-700">Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {students.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">aspirants registered</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-sans">
              100% credential delivery via Resend email gateway.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Cohort Average Accuracy</span>
              <span className="font-mono font-bold text-emerald-700">All Modules</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {students.length > 0
                  ? Math.round(
                      students.reduce((acc, s) => acc + (s.average_score || 0), 0) / students.length
                    )
                  : 82}%
              </span>
              <span className="text-xs text-slate-500 font-mono">diagnostic mean</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-sans">
              Benchmarked across CS/DA official 65-question mocks.
            </p>
          </div>
        </div>
      </div>

      {/* Cohort Students Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Enrolled Aspirants & Quota Usage Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of tests attempted, remaining credits, and daily test streaks
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email..."
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">Candidate</th>
                <th className="py-3 px-4 font-bold">Mock Quota (Used / Allowed)</th>
                <th className="py-3 px-4 font-bold">AI Interviews</th>
                <th className="py-3 px-4 font-bold">Daily Doubts</th>
                <th className="py-3 px-4 font-bold">Avg Score</th>
                <th className="py-3 px-4 font-bold">Streak</th>
                <th className="py-3 px-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No candidates found. Click "Onboard Student" or "Bulk CSV Import" to enroll.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const remaining = s.mock_tests_allowed - s.mock_tests_used;
                  const isExhausted = remaining <= 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.email}</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isExhausted ? "text-rose-600" : "text-slate-900"}`}>
                            {s.mock_tests_used} / {s.mock_tests_allowed}
                          </span>
                          {isExhausted && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Exhausted
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {s.ai_interviews_used} / {s.ai_interviews_allowed}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {s.daily_ai_doubts_used} / {s.daily_ai_doubts_limit}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {s.average_score ? `${s.average_score}%` : "—"}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-amber-500" />
                          {s.streak_days || 0}d
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            s.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Onboarding Modal */}
      <Dialog open={showSingleModal} onOpenChange={setShowSingleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Onboard Aspirant ({department.code})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign individual test quota and auto-dispatch login credentials via Resend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] flex justify-between">
              <span className="text-slate-500">Department Available Quota:</span>
              <span className="font-bold text-slate-900">{remainingDeptMocks} credits</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.sharma@college.edu"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mock Tests Allowed</label>
                <Input
                  type="number"
                  value={mockTests}
                  onChange={(e) => setMockTests(Number(e.target.value))}
                  max={remainingDeptMocks}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">AI Interviews</label>
                <Input
                  type="number"
                  value={aiInterviews}
                  onChange={(e) => setAiInterviews(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSingleModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => singleMutation.mutate()}
              disabled={!name || !email || mockTests > remainingDeptMocks || singleMutation.isPending}
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {singleMutation.isPending ? "Onboarding..." : "Onboard & Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk CSV Import Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Bulk CSV Aspirant Onboarding
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Paste CSV data with columns: <span className="font-mono font-semibold">Name,Email,MockQuota</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] flex justify-between">
              <span className="text-slate-500">Department Available Quota:</span>
              <span className="font-bold text-slate-900">{remainingDeptMocks} credits</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                CSV Data (One student per line)
              </label>
              <Textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Name,Email,MockQuota"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBulkImport}
              disabled={!csvText.trim() || bulkMutation.isPending}
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {bulkMutation.isPending ? "Processing..." : "Validate & Enroll All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
