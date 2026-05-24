"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Sparkles, Bot, LineChart } from "lucide-react";

export default function WorkspaceAnalyticsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId;

  const { tasks } = useWorkspaceStore();

  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Parse task counts for Recharts charts
  const total = tasks.length;
  const todo = tasks.filter(
    (t) => t.status === "TODO" || t.status === "BACKLOG",
  ).length;
  const inProgress = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW",
  ).length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const barData = [
    { name: "Todo / Backlog", count: todo, fill: "#52525b" },
    { name: "In Progress / Review", count: inProgress, fill: "#a855f7" },
    { name: "Completed Done", count: done, fill: "#22c55e" },
  ];

  // Burn-down Mock Timeline Data based on active board metrics
  const burndownData = [
    { day: "Day 1", remaining: total },
    { day: "Day 3", remaining: Math.max(0, total - Math.floor(done * 0.2)) },
    { day: "Day 5", remaining: Math.max(0, total - Math.floor(done * 0.5)) },
    { day: "Day 7", remaining: Math.max(0, total - Math.floor(done * 0.8)) },
    { day: "Day 10", remaining: total - done },
  ];

  // Fetch AI productivity recommendations
  const handleTriggerInsights = async () => {
    setLoadingInsights(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        "http://localhost:8000/api/ai/productivity-insights",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setInsights(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    handleTriggerInsights();
  }, [workspaceId]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Analytics Header details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" /> Velocity Analytics
            Hub
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Aggregated statistics, burn-down metrics, and AI health scores.
          </p>
        </div>
      </div>

      {/* Grid containing charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: BURN-DOWN RATE */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
          <span className="text-xs font-bold text-white tracking-wide block">
            SPRINT BURN-DOWN SPEED
          </span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={burndownData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} />
                <YAxis stroke="#a1a1aa" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#fafafa",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#a855f7", fontSize: "11px" }}
                />

                <Line
                  type="monotone"
                  dataKey="remaining"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: KANBAN DISTRIBUTION */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
          <span className="text-xs font-bold text-white tracking-wide block">
            KANBAN LANES ALLOCATIONS
          </span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
                <YAxis stroke="#a1a1aa" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#fafafa",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#a855f7", fontSize: "11px" }}
                />

                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GEMINI AI PRODUCTIVITY ADVICE DRAWER */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                AI Productivity Insights{" "}
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Agile workspace logs analyzed dynamically by Gemini engine
                models.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerInsights}
            disabled={loadingInsights}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
          >
            {loadingInsights
              ? "Analyzing focus patterns..."
              : "Regenerate Analysis"}
          </button>
        </div>

        {loadingInsights ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
          </div>
        ) : (
          insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-zinc-500 font-bold mb-1 uppercase">
                    EFFICIENCY RATING
                  </span>
                  <p className="text-2xl font-black text-white">
                    {insights.efficiencyScore}%
                  </p>
                  <p className="text-[10px] text-zinc-400 font-light mt-2 leading-relaxed">
                    Overall performance score determined based on sprint
                    completion speeds and resolution volumes.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-zinc-500 font-bold mb-1 uppercase">
                    FOCUS METRIC
                  </span>
                  <p className="text-2xl font-black text-white">
                    {insights.focusHoursPerDay} hrs/day
                  </p>
                  <p className="text-[10px] text-zinc-400 font-light mt-2 leading-relaxed">
                    Average continuous deep work focus duration logged through
                    task Pomodoro widgets.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                <span className="block text-[10px] text-zinc-500 font-bold uppercase">
                  ACTIONABLE ADVICE:
                </span>
                {insights.actionableTips?.map((tip, i) => (
                  <p
                    key={i}
                    className="text-zinc-300 font-light leading-relaxed flex gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{" "}
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
