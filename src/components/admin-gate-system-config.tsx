import React, { useState } from "react";
import { 
  Cpu, KeyRound, Server, Database, Mail, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertTriangle, Eye, EyeOff, Save 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function AdminGateSystemConfig() {
  const [showKeys, setShowKeys] = useState(false);
  const [openRouterKey, setOpenRouterKey] = useState("sk-or-v1-********************************");
  const [geminiKey, setGeminiKey] = useState("AIzaSy********************************");
  const [resendKey, setResendKey] = useState("re_********************************");
  const [d1DatabaseName, setD1DatabaseName] = useState("gate-d1-production");
  const [r2BucketName, setR2BucketName] = useState("vynexa-storage");
  const [r2PublicUrl, setR2PublicUrl] = useState("https://pub-31cdacf0ce134d38bfc7490b92bbcb00.r2.dev");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("AI GATE Platform system configurations saved to environment vault!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              AI GATE System Infrastructure & Key Rotation Config
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-provider LLM failover, Cloudflare D1/R2 bindings, and Resend transactional notification keys.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowKeys(!showKeys)}
          className="text-xs font-bold text-slate-700 border-slate-300 h-8"
        >
          {showKeys ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
          {showKeys ? "Hide Secret Keys" : "Reveal API Keys"}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Multi-Provider AI Gateway & Fallback Models */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Multi-Provider AI Gateway (LLM Router)</h3>
            </div>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-[10px]">
              Active Auto-Failover
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Provider Key (Google AI Studio / Gemini)
              </label>
              <Input
                type={showKeys ? "text" : "password"}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default Model: gemini-2.5-flash (Low-latency math parsing)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Secondary / Failover Provider Key (OpenRouter API)
              </label>
              <Input
                type={showKeys ? "text" : "password"}
                value={openRouterKey}
                onChange={e => setOpenRouterKey(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Pool Models: llama-3.3-70b-instruct, deepseek-chat, gpt-4o-mini</span>
            </div>
          </div>
        </div>

        {/* 2. Cloudflare D1 & R2 Service Bindings */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Cloudflare Edge Storage Bindings (D1 & R2)</h3>
            </div>
            <Badge className="bg-sky-50 text-sky-800 border-sky-300 font-mono text-[10px]">
              Edge Replicated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">D1 Database Binding Name</label>
              <Input
                value={d1DatabaseName}
                onChange={e => setD1DatabaseName(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">SQLite edge relational instance (env.DB)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">R2 Storage Bucket Name</label>
              <Input
                value={r2BucketName}
                onChange={e => setR2BucketName(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Stores PYQs, syllabus & generated papers</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">R2 Public Endpoint URL</label>
              <Input
                value={r2PublicUrl}
                onChange={e => setR2PublicUrl(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Public CDN domain for streaming official PDFs</span>
            </div>
          </div>
        </div>

        {/* 3. Resend Transactional Email Gateway */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Resend Transactional Email Engine</h3>
            </div>
            <Badge className="bg-amber-50 text-amber-800 border-amber-300 font-mono text-[10px]">
              Transactional Alerts
            </Badge>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Resend API Key</label>
            <Input
              type={showKeys ? "text" : "password"}
              value={resendKey}
              onChange={e => setResendKey(e.target.value)}
              className="font-mono text-xs max-w-md"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Used for test allocation alerts, scorecard dispatches & AIR announcements</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 h-10 shadow-xs flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving Configuration..." : "Save System Bindings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
