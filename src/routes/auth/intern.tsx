import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordInternLoginSessionFn } from "@/lib/cbt.functions";

export const Route = createFileRoute("/auth/intern")({
  head: () => ({ meta: [{ title: "GATE Aspirant Portal — Sign In" }] }),
  component: InternAuthPage,
});

function InternAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const recordSession = useServerFn(recordInternLoginSessionFn);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id);
        const role = roles?.[0]?.role;
        if (role === 'employee') navigate({ to: "/employee" });
        else if (role === 'admin') navigate({ to: "/admin" });
        else navigate({ to: "/intern" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: password.trim() 
        });
        if (error) throw error;

        // Generate a 24-hour cryptographically secured session
        const newSessionId = "sess_" + crypto.randomUUID();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const expiresAt = Date.now() + oneDayMs;

        localStorage.setItem("vyntyra_intern_session_id", newSessionId);
        localStorage.setItem("vyntyra_intern_session_expiry", expiresAt.toString());
        localStorage.setItem("vyntyra_intern_session_started", Date.now().toString());

        try {
          document.cookie = `vyntyra_intern_session_id=${newSessionId}; max-age=86400; path=/; SameSite=Lax`;
          document.cookie = `vyntyra_intern_session_expiry=${expiresAt}; max-age=86400; path=/; SameSite=Lax`;
        } catch (_) {}

        try {
          await recordSession({
            data: {
              sessionId: newSessionId,
              expiresAt,
              userAgent: navigator.userAgent
            }
          });
        } catch (_) {}

        toast.success("Welcome back, GATE Aspirant");
    } catch(error: any) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 font-sans">
      <div className="w-full max-w-md">
        <a href="/" className="flex flex-col items-center justify-center mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <GraduationCap className="h-8 w-8 text-emerald-400" />
          </div>
          <span className="mt-3 text-slate-400 tracking-[0.2em] uppercase text-[11px] font-mono font-bold">
            GATE Aspirant Portal
          </span>
        </a>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mb-4">
            <Target className="h-3.5 w-3.5 text-emerald-400" /> AI GATE Preparation & Assessment
          </div>
          <h1 className="text-xl font-bold text-white text-center mb-1">Aspirant Sign In</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Access mock tests, PYQ vault, AI doubts, and AIR analytics</p>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Registered Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  required
                  placeholder="student@gateaspirant.com"
                  className="bg-slate-950 border-slate-800 text-white h-11 pl-10 text-xs focus:border-slate-600 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Account Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="bg-slate-950 border-slate-800 text-white h-11 pl-10 text-xs focus:border-slate-600 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign In to Candidate Dashboard"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>24-Hour Active Session Token</span>
            <span className="text-slate-400 font-bold">GATE 2026 Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
