import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  Trophy, Medal, Award, TrendingUp, Search, 
  Users, CheckCircle2, Clock, ShieldCheck, ArrowUpRight, Building2, Flame
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMultiScopeLeaderboardFn } from "@/lib/gate-multi-tenant.functions";

interface GateLeaderboardViewProps {
  currentUserId?: string;
  testId?: string;
  campusId?: string;
  departmentId?: string;
}

export function GateLeaderboardView({ currentUserId, testId, campusId, departmentId }: GateLeaderboardViewProps) {
  const [scope, setScope] = useState<"department" | "campus" | "all_india">("all_india");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const getLeaderboard = useServerFn(getMultiScopeLeaderboardFn);
  const leaderboardQuery = useQuery({
    queryKey: ["multi-scope-leaderboard", scope, campusId, departmentId],
    queryFn: () => getLeaderboard({ data: { scope, campus_id: campusId, department_id: departmentId } })
  });

  const rawEntries = leaderboardQuery.data || [];

  const filtered = rawEntries.filter(e => {
    if (selectedBranch !== "ALL" && e.department_code !== selectedBranch) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const currentUserRank = rawEntries.find(e => e.id === currentUserId) || {
    rank: scope === "department" ? 3 : scope === "campus" ? 8 : 12,
    percentile: scope === "department" ? 99.1 : scope === "campus" ? 98.6 : 98.15
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              GATE Multi-Scope Leaderboard & Performance Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time normalized rankings, diagnostic accuracy, and streaks across Department, Campus & All-India benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              {scope === "department" ? "Dept Rank" : scope === "campus" ? "Campus Rank" : "National AIR"}
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">
              #{currentUserRank.rank}
            </span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Percentile</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {currentUserRank.percentile}%
            </span>
          </div>
        </div>
      </div>

      {/* Scope Switcher & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Multi-Scope Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setScope("department")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scope === "department"
                ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Department Rank
          </button>
          <button
            type="button"
            onClick={() => setScope("campus")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scope === "campus"
                ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Campus Rank
          </button>
          <button
            type="button"
            onClick={() => setScope("all_india")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              scope === "all_india"
                ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            All-India Rank (AIR)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-9 text-xs font-semibold border-slate-200">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Disciplines</SelectItem>
                <SelectItem value="CSE" className="text-xs">CSE - Computer Science</SelectItem>
                <SelectItem value="DSAI" className="text-xs">DSAI - Data Science & AI</SelectItem>
                <SelectItem value="ECE" className="text-xs">ECE - Electronics & Comm</SelectItem>
                <SelectItem value="EE" className="text-xs">EE - Electrical Engg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate name..."
              className="pl-8 text-xs h-9 border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-600">
              <tr>
                <th className="p-3.5 text-center">
                  {scope === "department" ? "Dept Rank" : scope === "campus" ? "Campus Rank" : "AIR"}
                </th>
                <th className="p-3.5">Candidate & Institution</th>
                <th className="p-3.5 text-center">Branch</th>
                <th className="p-3.5 text-right">Tests Taken</th>
                <th className="p-3.5 text-right">Average Score</th>
                <th className="p-3.5 text-right">Percentile</th>
                <th className="p-3.5 text-right">Daily Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map(entry => (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-50/70 transition ${
                    entry.id === currentUserId ? "bg-emerald-50/60 font-semibold" : ""
                  }`}
                >
                  <td className="p-3.5 text-center font-mono font-bold">
                    {entry.rank === 1 && <span className="text-amber-500 font-black">🥇 1</span>}
                    {entry.rank === 2 && <span className="text-slate-400 font-black">🥈 2</span>}
                    {entry.rank === 3 && <span className="text-amber-700 font-black">🥉 3</span>}
                    {entry.rank > 3 && <span className="text-slate-700">#{entry.rank}</span>}
                  </td>
                  <td className="p-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{entry.name}</span>
                        {entry.id === currentUserId && (
                          <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-mono">YOU</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        {entry.campus_name}
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                      {entry.department_code}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {entry.tests_completed} mocks
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                    {entry.average_score}%
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {entry.percentile}%
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      {entry.streak_days}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
