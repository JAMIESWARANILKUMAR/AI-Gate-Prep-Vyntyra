import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/admin")({
  head: () => ({ meta: [{ title: "Admin Sign In — AI GATE Prep Platform" }] }),
  component: AdminAuthPage,
});

function AdminAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (level && level.nextLevel === 'aal2' && level.currentLevel !== 'aal2') {
           setShowMfa(true);
           const factors = session.user.factors || [];
           const totp = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');
           if (totp) setMfaFactorId(totp.id);
           return;
        }

        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id);
        const role = roles?.[0]?.role;
        if (role === 'employee') navigate({ to: "/employee" });
        else if (role === 'intern') navigate({ to: "/intern" });
        else navigate({ to: "/admin" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactorId || !mfaCode) return;
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.data.id, code: mfaCode });
      if (verify.error) throw verify.error;
      
      toast.success("Welcome back, Platform Administrator");
    } catch(err: any) {
      toast.error(err.message || "Invalid authenticator code");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: password.trim() 
        });
        if (error) throw error;
        toast.success("Welcome back, Platform Administrator");
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
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <span className="mt-3 text-slate-400 tracking-[0.2em] uppercase text-[11px] font-mono font-bold">
            AI GATE Preparation Platform
          </span>
        </a>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold mb-4">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> Master Platform Controller
          </div>
          <h1 className="text-xl font-bold text-white text-center mb-1">Administrator Sign In</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Enter credentials to access examination and content hubs</p>

          {showMfa ? (
            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Authenticator Code</Label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    className="bg-slate-950 border-slate-800 text-white text-center font-mono tracking-widest h-11 pl-10 text-sm focus:border-slate-600 rounded-lg"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Verify & Authenticate"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Admin Email</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    required
                    placeholder="admin@gateprep.ai"
                    className="bg-slate-950 border-slate-800 text-white h-11 pl-10 text-xs focus:border-slate-600 rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Security Password</Label>
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
                className="w-full h-11 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign In to Controller"}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Role: Master Administrator • ISO-27001 TLS 1.3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
