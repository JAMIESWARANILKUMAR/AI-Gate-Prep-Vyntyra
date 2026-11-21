import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Shield,
  Target,
  Sparkles,
  Calculator,
  User,
  School,
  Mail,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Register as GATE Aspirant — AI GATE Preparation Platform" },
      {
        name: "description",
        content:
          "Register for free full-length mock tests, PYQ vault downloads, AI-powered 3-part solution derivations, and All-India percentile tracking.",
      },
    ],
  }),
  component: GateRegistrationPage,
});

function GateRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    college: "",
    branch: "CS",
    targetYear: "2026",
    targetScore: "80"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Please fill in your full name and email address.");
      return;
    }
    setIsSubmitting(true);

    try {
      localStorage.setItem("gate_aspirant_profile", JSON.stringify(formData));
      toast.success("Registration successful! Redirecting to Aspirant Portal...");
      setTimeout(() => {
        navigate({ to: "/auth/intern" });
      }, 800);
    } catch {
      navigate({ to: "/auth/intern" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-xl mx-auto">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-bold mb-3">
                <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                GATE 2026-2027 Cohort
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Aspirant Registration &amp; Onboarding
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Set up your academic profile to begin mock tests, access the R2 PYQ vault, and generate your high-score roadmap.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9 h-10 text-sm border-slate-300"
                    placeholder="e.g. Rahul Sharma"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    className="pl-9 h-10 text-sm border-slate-300"
                    placeholder="e.g. rahul@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">College / Institution</Label>
                <div className="relative mt-1">
                  <School className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9 h-10 text-sm border-slate-300"
                    placeholder="e.g. National Institute of Technology"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Engineering Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(val) => setFormData({ ...formData, branch: val })}
                  >
                    <SelectTrigger className="h-10 text-sm mt-1 border-slate-300">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS">Computer Science &amp; IT (CS)</SelectItem>
                      <SelectItem value="DA">Data Science &amp; AI (DA)</SelectItem>
                      <SelectItem value="EC">Electronics &amp; Comm (EC)</SelectItem>
                      <SelectItem value="EE">Electrical Engineering (EE)</SelectItem>
                      <SelectItem value="ME">Mechanical Engineering (ME)</SelectItem>
                      <SelectItem value="CE">Civil Engineering (CE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Target GATE Year</Label>
                  <Select
                    value={formData.targetYear}
                    onValueChange={(val) => setFormData({ ...formData, targetYear: val })}
                  >
                    <SelectTrigger className="h-10 text-sm mt-1 border-slate-300">
                      <SelectValue placeholder="Target Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">GATE 2026</SelectItem>
                      <SelectItem value="2027">GATE 2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Target Score Goal (out of 100)</Label>
                <Select
                  value={formData.targetScore}
                  onValueChange={(val) => setFormData({ ...formData, targetScore: val })}
                >
                  <SelectTrigger className="h-10 text-sm mt-1 border-slate-300">
                    <SelectValue placeholder="Select Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="65">65+ (Qualify &amp; NIT Admission)</SelectItem>
                    <SelectItem value="75">75+ (Top IIT M.Tech)</SelectItem>
                    <SelectItem value="85">85+ (IISc &amp; PSU Recruitment)</SelectItem>
                    <SelectItem value="90">90+ (Top 100 AIR / Direct Ph.D. PMRF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#0A1F44] hover:bg-[#122b5c] text-white font-bold text-sm rounded-md transition-colors mt-2"
              >
                {isSubmitting ? "Setting up Profile..." : "Complete Registration & Launch Portal"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Already registered?</span>
              <Link to="/auth/intern" className="text-blue-700 font-bold hover:underline">
                Sign In to Aspirant Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
