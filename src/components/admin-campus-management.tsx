import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  Plus,
  Coins,
  Users,
  Search,
  ExternalLink,
  Shield,
  CheckCircle2,
  Mail,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import {
  listCampusesFn,
  createCampusFn,
  topUpCampusCreditsFn,
  type Campus
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

export function AdminCampusManagement() {
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Campus Form
  const [campusName, setCampusName] = useState("");
  const [campusSlug, setCampusSlug] = useState("");
  const [logoR2Url, setLogoR2Url] = useState("");
  const [accentHex, setAccentHex] = useState("#0284c7");
  const [maxStudents, setMaxStudents] = useState<number>(1000);
  const [mockCredits, setMockCredits] = useState<number>(10000);
  const [aiCredits, setAiCredits] = useState<number>(2000);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");

  // Top Up Form
  const [addMocks, setAddMocks] = useState<number>(5000);
  const [addAI, setAddAI] = useState<number>(1000);

  const listCampuses = useServerFn(listCampusesFn);
  const createCampus = useServerFn(createCampusFn);
  const topUpCredits = useServerFn(topUpCampusCreditsFn);

  const campusesQuery = useQuery({
    queryKey: ["admin-campuses-list"],
    queryFn: () => listCampuses()
  });

  const campuses: Campus[] = campusesQuery.data || [];

  const createMutation = useMutation({
    mutationFn: () =>
      createCampus({
        data: {
          name: campusName,
          slug: campusSlug,
          logo_r2_url: logoR2Url,
          primary_accent_hex: accentHex,
          max_students: Number(maxStudents),
          allocated_mock_credits: Number(mockCredits),
          allocated_ai_interview_credits: Number(aiCredits),
          admin_email: adminEmail,
          admin_name: adminName
        }
      }),
    onSuccess: (res: any) => {
      toast.success(`Campus ${campusName} provisioned! Resend credentials dispatched.`);
      setShowCreateModal(false);
      setCampusName("");
      setCampusSlug("");
      setAdminEmail("");
      qc.invalidateQueries({ queryKey: ["admin-campuses-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create campus");
    }
  });

  const topUpMutation = useMutation({
    mutationFn: () =>
      topUpCredits({
        data: {
          campus_id: selectedCampus?.id || "",
          add_mock_credits: Number(addMocks),
          add_ai_interview_credits: Number(addAI)
        }
      }),
    onSuccess: () => {
      toast.success(`Allocated +${addMocks} mocks to ${selectedCampus?.name}`);
      setShowTopUpModal(false);
      qc.invalidateQueries({ queryKey: ["admin-campuses-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Top-up failed");
    }
  });

  const filteredCampuses = campuses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCampuses = campuses.length;
  const totalAllocatedMocks = campuses.reduce((acc, c) => acc + (c.allocated_mock_credits || 0), 0);
  const totalStudents = campuses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const totalDepartments = campuses.reduce((acc, c) => acc + (c.departments?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* 360° Global Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Partner Campuses</span>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-900">
            {totalCampuses}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Active white-label institutional deployments
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Academic Departments</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-900">
            {totalDepartments}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            CSE, DSAI, ECE, EE, ME & CE test centers
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Global Mock Credit Pool</span>
            <Coins className="h-4 w-4 text-slate-400" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-900">
            {totalAllocatedMocks.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Distributed cascading credits across all campuses
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>System Infrastructure</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 mt-1">
            D1 + R2 + OpenRouter
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-sans">
            Edge multi-tenant architecture operational
          </p>
        </div>
      </div>

      {/* Campus Management & White-Label Studio Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Institutional Campuses & White-Label Studio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision partner colleges, upload R2 logos, top-up credit pools, and manage campus administrator credentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full sm:w-60">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus or slug..."
                className="h-8 text-xs bg-white"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-8 text-xs font-bold gap-1 bg-slate-900 text-white hover:bg-slate-800 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Provision Campus
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                <th className="py-3 px-4 font-bold">Campus / Institute</th>
                <th className="py-3 px-4 font-bold">Slug URL</th>
                <th className="py-3 px-4 font-bold">Accent</th>
                <th className="py-3 px-4 font-bold">Mock Credit Pool</th>
                <th className="py-3 px-4 font-bold">AI Interview Pool</th>
                <th className="py-3 px-4 font-bold">Departments</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampuses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {c.logo_r2_url ? (
                        <img
                          src={c.logo_r2_url}
                          alt={c.name}
                          className="h-9 w-9 rounded-md object-contain border border-slate-200 bg-white p-0.5"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-md bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          {c.slug.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {c.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <a
                      href={`/c/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-800 hover:text-blue-600 transition"
                    >
                      <span>/c/{c.slug}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-300 inline-block shadow-2xs"
                        style={{ backgroundColor: c.primary_accent_hex }}
                      />
                      <span>{c.primary_accent_hex}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">{c.allocated_mock_credits.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.mockTestsUsed ? `${c.mockTestsUsed.toLocaleString()} used` : "0 used"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">{c.allocated_ai_interview_credits.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.aiInterviewsUsed ? `${c.aiInterviewsUsed} used` : "0 used"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {c.departments?.length || 0} depts
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampus(c);
                          setShowTopUpModal(true);
                        }}
                        className="h-7 text-xs font-bold border-slate-300 gap-1"
                      >
                        <Plus className="h-3 w-3" /> Top-Up
                      </Button>

                      <a
                        href={`/c/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 px-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                        title="View Co-Branded Portal"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Campus Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Provision Institutional Campus & White-Label Studio
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create dedicated co-branded portal with cascading credit allocations and administrator access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campus / Institution Name</label>
              <Input
                value={campusName}
                onChange={(e) => {
                  setCampusName(e.target.value);
                  if (!campusSlug) {
                    setCampusSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }
                }}
                placeholder="e.g. IIT Delhi — Hauz Khas Campus"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institutional Slug</label>
                <div className="flex items-center">
                  <span className="text-slate-400 font-mono text-xs pr-1">/c/</span>
                  <Input
                    value={campusSlug}
                    onChange={(e) => setCampusSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="iitd"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Brand Accent Color Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="h-8 w-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <Input
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Institutional Emblem / Logo R2 URL
              </label>
              <Input
                value={logoR2Url}
                onChange={(e) => setLogoR2Url(e.target.value)}
                placeholder="https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/campuses/iitd.png"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Max Students</label>
                <Input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initial Mock Credits</label>
                <Input
                  type="number"
                  value={mockCredits}
                  onChange={(e) => setMockCredits(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">AI Interview Pool</label>
                <Input
                  type="number"
                  value={aiCredits}
                  onChange={(e) => setAiCredits(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-slate-900 mb-2">Campus Administrator Assignment</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Admin Full Name</label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Prof. K. Sharma"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Admin Email (Resend)</label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@iitd.ac.in"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={!campusName || !campusSlug || createMutation.isPending}
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {createMutation.isPending ? "Provisioning..." : "Provision Campus & Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Up Credit Pool Modal */}
      <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Top-Up Campus Credit Pool
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Increase test or AI interview allowances for {selectedCampus?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Mock Pool:</span>
                <span className="font-bold text-slate-900">
                  {selectedCampus?.allocated_mock_credits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current AI Interview Pool:</span>
                <span className="font-bold text-slate-900">
                  {selectedCampus?.allocated_ai_interview_credits.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Additional Full-Length Mock Credits
              </label>
              <Input
                type="number"
                value={addMocks}
                onChange={(e) => setAddMocks(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Additional AI Interview Credits
              </label>
              <Input
                type="number"
                value={addAI}
                onChange={(e) => setAddAI(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTopUpModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => topUpMutation.mutate()}
              disabled={topUpMutation.isPending}
              className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {topUpMutation.isPending ? "Allocating..." : "Confirm Top-Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
