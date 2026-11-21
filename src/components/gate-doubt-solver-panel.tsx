import React, { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askContextualQuestionDoubtFn } from "@/lib/gate-ai.functions";
import { 
  MessageSquare, Send, Sparkles, Bot, User, 
  HelpCircle, AlertTriangle, ShieldCheck, ArrowRight, CornerDownLeft, Loader2, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface GateDoubtSolverPanelProps {
  questionId: string;
  questionText: string;
  options?: any;
  correctAnswer: string;
  onClose?: () => void;
}

export function GateDoubtSolverPanel({
  questionId,
  questionText,
  options,
  correctAnswer,
  onClose
}: GateDoubtSolverPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: "student" | "ai"; content: string; time: string }>>([
    {
      role: "ai",
      content: `Hello! I am your **GATE Technical Doubt Mentor**. I am strictly grounded in this question and the verified answer key (**${correctAnswer}**).\n\nAsk me anything: conceptual doubts, alternative solution methods, or where your calculation might have diverged!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const askDoubt = useServerFn(askContextualQuestionDoubtFn);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userText = query.trim();
    const newMsg = {
      role: "student" as const,
      content: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setQuery("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await askDoubt({
        data: {
          questionId,
          questionText,
          options,
          correctAnswer,
          studentQuery: userText,
          history
        }
      });

      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          content: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      toast.error("Failed to connect to AI Doubt Solver. Please retry.");
      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I encountered a temporary connection issue. Please retry your question or escalate to a Subject Matter Expert.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateToSme = () => {
    setIsEscalated(true);
    toast.success("This question and your doubt discussion have been escalated to the SME Review Desk.");
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
              Contextual AI Doubt Solver
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                Grounded Mode
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Scoped strictly to Question #{questionId}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Key Anchor Badge */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1 font-semibold text-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Key: {correctAnswer}
        </span>
        <button
          onClick={handleEscalateToSme}
          disabled={isEscalated}
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
            isEscalated
              ? "bg-slate-200 text-slate-500"
              : "bg-amber-100 hover:bg-amber-200 text-amber-800"
          }`}
        >
          {isEscalated ? "Escalated to SME ✓" : "Escalate to SME"}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "student" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 leading-relaxed shadow-2xs font-sans ${
                m.role === "student"
                  ? "bg-slate-900 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none"
              }`}
            >
              <div className="prose prose-slate prose-xs max-w-none dark:prose-invert">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 font-mono">{m.time}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] p-2 bg-slate-50 rounded border border-slate-200 w-fit">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            Analyzing question context & formulating derivation...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask your doubt regarding this question..."
          className="text-xs h-9 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-900"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-3 shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
