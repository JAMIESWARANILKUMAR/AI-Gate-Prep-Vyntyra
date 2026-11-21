import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, Medal, Award, TrendingUp, Search, 
  Users, CheckCircle2, Clock, ShieldCheck, ArrowUpRight 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  branch: string;
  totalScore: number;
  maxScore: number;
  percentile: number;
  accuracy: number;
  timeTakenMinutes: number;
  isCurrentUser?: boolean;
}

interface GateLeaderboardViewProps {
  currentUserId?: string;
  testId?: string;
}

export function GateLeaderboardView({ currentUserId, testId }: GateLeaderboardViewProps) {
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo Live Leaderboard Data (Simulated All-India Benchmark)
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      studentId: "AIR-001",
      studentName: "Aditya Verma",
      branch: "CS",
      totalScore: 92.67,
      maxScore: 100,
      percentile: 99.98,
      accuracy: 96,
      timeTakenMinutes: 162
    },
    {
      rank: 2,
      studentId: "AIR-002",
      studentName: "Sneha Reddy",
      branch: "DA",
      totalScore: 89.33,
      maxScore: 100,
      percentile: 99.91,
      accuracy: 93,
      timeTakenMinutes: 170
    },
    {
      rank: 3,
      studentId: "AIR-003",
      studentName: "Karthik Nair",
      branch: "CS",
      totalScore: 86.00,
      maxScore: 100,
      percentile: 99.80,
      accuracy: 91,
      timeTakenMinutes: 155
    },
    {
      rank: 4,
      studentId: "AIR-004",
      studentName: "Rohan Kulkarni",
      branch: "EC",
      totalScore: 84.33,
      maxScore: 100,
      percentile: 99.65,
      accuracy: 89,
      timeTakenMinutes: 175
    },
    {
      rank: 5,
      studentId: "AIR-005",
      studentName: "Priya Sundaram",
      branch: "CS",
      totalScore: 82.67,
      maxScore: 100,
      percentile: 99.42,
      accuracy: 88,
      timeTakenMinutes: 168
    },
    {
      rank: 12,
      studentId: currentUserId || "USER-CURRENT",
      studentName: "You (Current Aspirant)",
      branch: "CS",
      totalScore: 74.33,
      maxScore: 100,
      percentile: 98.15,
      accuracy: 82,
      timeTakenMinutes: 160,
      isCurrentUser: true
    }
  ];

  const filtered = entries.filter(e => {
    if (selectedBranch !== "ALL" && e.branch !== selectedBranch) return false;
    if (searchQuery && !e.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              All-India Live GATE Leaderboard & Percentile Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time normalized scores, section-wise accuracy, and comparative percentile distribution across all registered aspirants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Your Current AIR</span>
            <span className="text-lg font-black text-amber-400 font-mono">AIR 12</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Percentile</span>
            <span className="text-lg font-black text-emerald-400 font-mono">98.15%</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="w-full sm:w-64">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="h-9 text-xs font-semibold border-slate-200">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Engineering Disciplines</SelectItem>
              <SelectItem value="CS" className="text-xs">CS - Computer Science & IT</SelectItem>
              <SelectItem value="DA" className="text-xs">DA - Data Science & AI</SelectItem>
              <SelectItem value="EC" className="text-xs">EC - Electronics & Communication</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search aspirant name or roll number..."
            className="pl-8 text-xs h-9 border-slate-200"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-600">
              <tr>
                <th className="p-3.5 text-center">AIR</th>
                <th className="p-3.5">Aspirant</th>
                <th className="p-3.5 text-center">Branch</th>
                <th className="p-3.5 text-right">Score</th>
                <th className="p-3.5 text-right">Percentile</th>
                <th className="p-3.5 text-right">Accuracy</th>
                <th className="p-3.5 text-right">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map(entry => (
                <tr
                  key={entry.studentId}
                  className={`hover:bg-slate-50/70 transition ${
                    entry.isCurrentUser ? "bg-emerald-50/60 font-semibold" : ""
                  }`}
                >
                  <td className="p-3.5 text-center font-mono font-bold">
                    {entry.rank === 1 && <span className="text-amber-500 font-black">🥇 1</span>}
                    {entry.rank === 2 && <span className="text-slate-400 font-black">🥈 2</span>}
                    {entry.rank === 3 && <span className="text-amber-700 font-black">🥉 3</span>}
                    {entry.rank > 3 && <span className="text-slate-700">#{entry.rank}</span>}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{entry.studentName}</span>
                      {entry.isCurrentUser && (
                        <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-mono">YOU</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                      {entry.branch}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-slate-900">
                    {entry.totalScore.toFixed(2)} / {entry.maxScore}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                    {entry.percentile.toFixed(2)}%
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700">
                    {entry.accuracy}%
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-500">
                    {entry.timeTakenMinutes} mins
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
