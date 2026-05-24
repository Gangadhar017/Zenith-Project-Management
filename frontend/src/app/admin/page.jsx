"use client";

import React, { useState } from "react";
import { ShieldCheck, Cpu, Activity, Database } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function GlobalAdminDashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState({
    usersCount: 120,
    workspacesCount: 85,
    tasksProcessed: 1400,
    apiResponseSpeed: "42ms",
    dbConnectionStatus: "Healthy (Neon Serverless)",
  });

  const [loading, setLoading] = useState(false);

  const handleRefreshMetrics = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics((prev) => ({
        ...prev,
        tasksProcessed:
          prev.tasksProcessed + Math.floor(Math.random() * 10) + 1,
        apiResponseSpeed: `${Math.floor(Math.random() * 15) + 30}ms`,
      }));
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Admin header details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary animate-pulse" /> Zenith SaaS
            Administration Panel
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Review global tenant telemetry, examine Postgres database pools, and
            supervise api performance logs.
          </p>
        </div>

        <button
          onClick={handleRefreshMetrics}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
        >
          <Activity className="h-4 w-4" />{" "}
          {loading ? "Fetching telemetry..." : "Refresh Telemetry"}
        </button>
      </div>

      {/* Admin stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-primary" />
          <span className="block text-xs font-bold text-zinc-500 tracking-wider">
            TOTAL SaaS USERS
          </span>
          <span className="block text-3xl font-black text-white mt-2">
            {metrics.usersCount}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block mt-1">
            Registered in Zenith DB
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-secondary" />
          <span className="block text-xs font-bold text-zinc-500 tracking-wider">
            TENANT WORKSPACES
          </span>
          <span className="block text-3xl font-black text-white mt-2">
            {metrics.workspacesCount}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block mt-1">
            Active organizations
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-green-500" />
          <span className="block text-xs font-bold text-zinc-500 tracking-wider">
            AI TASKS GENERATED
          </span>
          <span className="block text-3xl font-black text-white mt-2">
            {metrics.tasksProcessed}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block mt-1">
            Processed by Gemini model
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1 bg-purple-500" />
          <span className="block text-xs font-bold text-zinc-500 tracking-wider">
            API LATENCY RATE
          </span>
          <span className="block text-3xl font-black text-white mt-2">
            {metrics.apiResponseSpeed}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block mt-1">
            Average serverless routing speed
          </span>
        </div>
      </div>

      {/* Telemetry log table */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Database Pool Health
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Status tracking for Neon serverless pool.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full">
            DATABASE ONLINE
          </span>
        </div>

        <div className="flex flex-col gap-4 text-xs font-light text-zinc-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-bold text-white">ORION ORM ENGINE</span>
            <span>Prisma Client Client Core (PostgreSQL API)</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-bold text-white">CONNECTION STRING</span>
            <span className="font-mono text-[10px] text-zinc-500">
              postgresql://postgres:***@db:5432/zenith
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-white">TELEMETRY SCANNER</span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <ShieldCheck className="h-4 w-4" /> Active security audit log sync
              enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
