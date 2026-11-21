import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  Users,
  Plus,
  BookOpen,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRight,
  Shield,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  listDepartmentsFn,
  createDepartmentWithQuotaCheckFn,
  type Campus,
  type Department
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

interface CampusAdminDashboardProps {
  campus: Campus;
  onSelectDepartment?: (dept: Department) => void;
}

export function CampusAdminDashboard({ campus, onSelectDepartment }: CampusAdminDashboardProps) {
  const qc = useQueryClient();
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // Form state
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [mockCredits, setMockCredits] = useState<number>(1000);
  const [aiCredits, setAiCredits] = useState<number>(200);

  const listDepts = useServerFn(listDepartmentsFn);
  const createDeptWithQuota = useServerFn(createDepartmentWithQuotaCheckFn);

  const deptsQuery = useQuery({
    queryKey: ["campus-departments", campus.id],
    queryFn: () => listDepts({ data: { campus_id: campus.id } })
  });

  const departments: Department[] = deptsQuery.data || campus.departments || [];

  // Quota Calculations
  const totalAllocatedMocks = departments.reduce((acc, d) => acc + (d.allocated_mock_credits || 0), 0);
  const remainingCampusMocks = Math.max(0, campus.allocated_mock_credits - totalAllocatedMocks);
  const mockUtilizationPercent = Math.min(100, Math.round((totalAllocatedMocks / Math.max(campus.allocated_mock_credits, 1)) * 100));

  const totalAllocatedAI = departments.reduce((acc, d) => acc + (d.allocated_ai_interview_credits || 0), 0);
  const remainingCampusAI = Math.max(0, campus.allocated_ai_interview_credits - totalAllocatedAI);

  const totalStudents = departments.reduce((acc, d) => acc + (d.studentCount || 0), 0);

  const createMutation = useMutation({
    mutationFn: () =>
      createDeptWithQuota({
        data: {
          campus_id: campus.id,
          name: deptName,
          code: deptCode,
          allocated_mock_credits: Number(mockCredits),
          allocated_ai_interview_credits: Number(aiCredits)
        }
      }),
    onSuccess: (res) => {
      toast.success(`Department ${deptCode.toUpperCase()} created successfully with ${mockCredits} mock credits.`);
      setShowAddDeptModal(false);
      setDeptName("");
      setDeptCode("");
      qc.invalidateQueries({ queryKey: ["campus-departments", campus.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to provision department");
    }
  });

  return (
    <div className="space-y-6">
      {/* Institutional Co-Branded Welcome Hero */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {campus.logo_r2_url ? (
              <img
                src={campus.logo_r2_url}
                alt={campus.name}
                className="h-14 w-14 object-contain rounded-lg border border-slate-200 bg-white p-1"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-slate-900 text-white font-black text-xl flex items-center justify-center">
                {campus.slug.slice(0, 3).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {campus.name}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Campus Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Institutional Slug: <span className="font-mono font-bold text-slate-700">/c/{campus.slug}</span> • Maximum Student Quota: {campus.max_students}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddDeptModal(true)}
              className="text-xs font-bold gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Provision Department
            </Button>
          </div>
        </div>

        {/* Cascading Quota Gauge Cards */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Mock Test Credit Pool */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Campus Mock Credit Pool</span>
              <span className="font-mono font-bold text-slate-900">{mockUtilizationPercent}% Allocated</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {remainingCampusMocks.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {campus.allocated_mock_credits.toLocaleString()} Available
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  mockUtilizationPercent > 90 ? "bg-amber-600" : "bg-slate-900"
                }`}
                style={{ width: `${mockUtilizationPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-sans">
              Distributed across {departments.length} academic departments.
            </p>
          </div>

          {/* AI Interview Credit Pool */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>AI Technical Interview Credits</span>
              <span className="font-mono font-bold text-slate-900">
                {campus.allocated_ai_interview_credits - remainingCampusAI} Allocated
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {remainingCampusAI.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {campus.allocated_ai_interview_credits.toLocaleString()} Available
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-sans">
              Used for automated GATE PSU & M.Tech viva mock panels.
            </p>
          </div>

          {/* Enrolled Students & Cohorts */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Active Aspirant Cohorts</span>
              <span className="font-mono font-bold text-emerald-700">100% Verified</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900">
                {totalStudents.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {campus.max_students.toLocaleString()} Max Capacity
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-sans">
              Across all registered degree programs.
            </p>
          </div>
        </div>
      </div>

      {/* Departments Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Academic Departments & Distributed Quotas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cascading quotas enforced: Departments cannot exceed campus credit caps
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {departments.length} Departments Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">Code</th>
                <th className="py-3 px-4 font-bold">Department Name</th>
                <th className="py-3 px-4 font-bold">Allocated Mock Credits</th>
                <th className="py-3 px-4 font-bold">AI Interview Pool</th>
                <th className="py-3 px-4 font-bold">Enrolled Students</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-black text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {dept.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {dept.name}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900">{dept.allocated_mock_credits.toLocaleString()}</span>
                    <span className="text-slate-400 text-[11px] ml-1">credits</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900">{dept.allocated_ai_interview_credits.toLocaleString()}</span>
                    <span className="text-slate-400 text-[11px] ml-1">interviews</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {dept.studentCount || 0} students
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectDepartment?.(dept)}
                      className="h-7 text-xs font-bold gap-1 border-slate-300"
                    >
                      <span>Manage Cohort</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Department Modal */}
      <Dialog open={showAddDeptModal} onOpenChange={setShowAddDeptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Provision Academic Department
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Allocate mock tests and AI interview pools from your campus quota balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Remaining Quota Notice */}
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Available Mock Credits:</span>
                <span className="font-bold text-slate-900">{remainingCampusMocks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available AI Interview Credits:</span>
                <span className="font-bold text-slate-900">{remainingCampusAI.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department Name</label>
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Department of Computer Science & Engineering"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department Code</label>
              <Input
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                placeholder="e.g. CSE, AIML, ECE, ME"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mock Test Allocation</label>
                <Input
                  type="number"
                  value={mockCredits}
                  onChange={(e) => setMockCredits(Number(e.target.value))}
                  max={remainingCampusMocks}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">AI Interview Pool</label>
                <Input
                  type="number"
                  value={aiCredits}
                  onChange={(e) => setAiCredits(Number(e.target.value))}
                  max={remainingCampusAI}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {mockCredits > remainingCampusMocks && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Requested allocation exceeds available campus quota ({remainingCampusMocks}).</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDeptModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={
                !deptName ||
                !deptCode ||
                mockCredits <= 0 ||
                mockCredits > remainingCampusMocks ||
                createMutation.isPending
              }
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {createMutation.isPending ? "Allocating..." : "Provision Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
