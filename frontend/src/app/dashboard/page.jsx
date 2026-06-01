"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE } from "@/lib/api";
import {
  Sparkles,
  Layers,
  ShieldAlert,
  Star,
  Folder,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  ArrowUpRight,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentWorkspace, projects, fetchProjects, toggleStarProject } =
    useWorkspaceStore();

  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    healthScore: 100,
  });

  const [aiRisk, setAiRisk] = useState(null);

  const [loadingRisk, setLoadingRisk] = useState(false);

  // Projects filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [starredFilter, setStarredFilter] = useState("ALL");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      p.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesStarred =
      starredFilter === "ALL" || (starredFilter === "STARRED" && p.isStarred);
    return matchesSearch && matchesStatus && matchesStarred;
  });

  // Dashboard Checklist tasks mock for high-fidelity interactive list
  const [checklistTasks, setChecklistTasks] = useState([
    {
      id: "1",
      title: "Migrate active database schemas to Neon PostgreSQL",
      priority: "HIGH",
      status: "OVERDUE",
      done: false,
    },
    {
      id: "2",
      title: "Bind responsive theme switch toggler to layout",
      priority: "HIGH",
      status: "ACTIVE",
      done: true,
    },
    {
      id: "3",
      title: "Verify real-time socket events sync endpoints",
      priority: "MEDIUM",
      status: "ACTIVE",
      done: false,
    },
    {
      id: "4",
      title: "Build Clerk account details profile modal overlay",
      priority: "HIGH",
      status: "ACTIVE",
      done: false,
    },
    {
      id: "5",
      title: "Polish visual aesthetics and Tailwind slate styles",
      priority: "LOW",
      status: "ACTIVE",
      done: false,
    },
  ]);

  const toggleTaskDone = (id) => {
    setChecklistTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  // Fetch metrics & AI risk scans
  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects(currentWorkspace.id);
      // Fetch Workspace metrics stats
      const token = useAuthStore.getState().token;
      fetch(
        `${API_BASE}/workspaces/${currentWorkspace.id}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));

      // Trigger AI Risk Shield scan
      setLoadingRisk(true);
      fetch(
        `${API_BASE}/ai/workspace-risks/${currentWorkspace.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data) => setAiRisk(data))
        .catch((err) => console.error(err))
        .finally(() => setLoadingRisk(false));
    }
  }, [currentWorkspace, fetchProjects]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-1">
      {/* Greetings Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {user?.name.split(" ")[0] || "Member"}{" "}
            <span className="animate-waving-hand">👋</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-1">
            Here is the visual operations center for{" "}
            {currentWorkspace?.name || "your active workspace"} today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Professional Enterprise Tier
          Active
        </div>
      </div>

      {/* Metrics Row - 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              TOTAL ACTIVE BOARDS
            </span>
            <span className="block text-3xl font-black text-foreground mt-1.5">
              {stats.projects}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Operational sprint boards
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition duration-300">
            <Folder className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Projects Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-secondary/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              COMPLETED TASKS
            </span>
            <span className="block text-3xl font-black text-foreground mt-1.5">
              {stats.completedTasks}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              out of {stats.tasks} total items
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition duration-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* My Tasks Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              PENDING TASKS
            </span>
            <span className="block text-3xl font-black text-foreground mt-1.5">
              {stats.tasks - stats.completedTasks < 0
                ? 0
                : stats.tasks - stats.completedTasks}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Backlog tasks queue
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition duration-300">
            <ListTodo className="h-6 w-6" />
          </div>
        </div>

        {/* Overdue Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-red-500/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-red-500 dark:text-red-400 tracking-wider">
              CRITICAL OVERDUE
            </span>
            <span className="block text-3xl font-black text-red-600 dark:text-red-400 mt-1.5">
              {
                checklistTasks.filter((t) => t.status === "OVERDUE" && !t.done)
                  .length
              }
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Requires immediate review
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition duration-300 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* AI Risk Monitor Box */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                AI Risk Shield Monitor{" "}
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                Gemini real-time bottleneck & delay risk scanning engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500">
              OVERALL THREAT INDEX:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${aiRisk?.overallRisk === "HIGH" ? "bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30 animate-pulse" : aiRisk?.overallRisk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30" : "bg-green-500/20 text-green-500 border border-green-500/30"}`}
            >
              {loadingRisk
                ? "SCANNING WORKSPACE..."
                : aiRisk?.overallRisk || "LOW"}
            </span>
          </div>
        </div>

        {loadingRisk ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full bg-card-border/10 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-card-border/10 rounded animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {aiRisk?.riskFactors && aiRisk.riskFactors.length > 0 ? (
              aiRisk.riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 text-xs bg-card/25 p-3 rounded-lg border border-card-border/50"
                >
                  <span className="font-bold text-primary shrink-0 uppercase">
                    [{rf.source}]
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-300 font-light">
                    {rf.description}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 shrink-0 ml-auto font-semibold">
                    ({rf.severity} RISK)
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic">
                No critical bottleneck variables detected. Workspace is running
                optimally.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Column Lane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (65%): Project Overview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Active Project Boards
            </h2>
            <span className="text-[10px] bg-card border border-card-border px-2.5 py-1 rounded-full text-zinc-500 font-semibold uppercase">
              {projects.length} Total
            </span>
          </div>

          {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 bg-card border border-card-border p-3 rounded-xl mb-2 text-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:border-primary/50 text-foreground"
                  placeholder="Search active project boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <select
                  className="bg-background border border-card-border rounded-lg px-3 py-2 text-foreground font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PLANNING">Planning</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select
                  className="bg-background border border-card-border rounded-lg px-3 py-2 text-foreground font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
                  value={starredFilter}
                  onChange={(e) => setStarredFilter(e.target.value)}
                >
                  <option value="ALL">All Boards</option>
                  <option value="STARRED">Starred Only</option>
                </select>
              </div>
            </div>
          )}

          {projects.length > 0 ? (
            filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card rounded-2xl overflow-hidden border border-card-border relative group flex flex-col justify-between h-48 bg-card/10 hover:bg-card/20 transition-all duration-300"
                  >
                    {/* Project cover top border */}
                    <div
                      className="h-2 w-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${p.coverImage})` }}
                    />

                    <div className="p-5 flex flex-col justify-between gap-4 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/workspace/${currentWorkspace?.id}/project/${p.id}`}
                          className="block flex-1 group-hover:text-primary transition"
                        >
                          <span className="block text-sm font-bold text-foreground leading-tight group-hover:text-primary transition">
                            {p.name}
                          </span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-light mt-1 line-clamp-2">
                            {p.description || "No description provided."}
                          </span>
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarProject(p.id);
                          }}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition border shrink-0 ${p.isStarred ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-card border-card-border text-zinc-400 hover:text-foreground"}`}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center border-t border-card-border pt-3">
                        <span className="text-[9px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary font-semibold uppercase tracking-wider">
                          {p.status}
                        </span>

                        <Link
                          href={`/workspace/${currentWorkspace?.id}/project/${p.id}`}
                          className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1"
                        >
                          Launch Board <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-card-border rounded-2xl p-10 text-center bg-card/5 animate-in fade-in duration-200">
                <Search className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-foreground">
                  No matches found
                </h3>
                <p className="text-xs text-zinc-500 font-light mt-1">
                  Try adjusting your filters or search keywords.
                </p>
              </div>
            )
          ) : (
            <div className="border border-dashed border-card-border rounded-2xl p-12 text-center bg-card/5">
              <Folder className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground">
                No active project boards
              </h3>
              <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto mt-1 mb-6">
                Create your first agile scrum board by clicking the plus (+)
                icon inside the header project dropdown.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (35%): Interactive Work Backlog & Checklist */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-secondary" /> Personal Operations
            Checklist
          </h2>

          <div className="glass-panel p-5 rounded-2xl border border-card-border bg-card/10 flex flex-col gap-4">
            {/* Header info */}
            <div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                ACTIVE backlog list
              </span>
              <span className="text-xs text-zinc-500 mt-0.5 font-light block">
                Directly check-off tasks to complete developer milestones.
              </span>
            </div>

            {/* Checklist Items list */}
            <div className="flex flex-col gap-3">
              {checklistTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskDone(t.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${t.done ? "bg-zinc-500/5 border-card-border text-zinc-400 opacity-60 line-through" : t.status === "OVERDUE" ? "bg-red-500/5 border-red-500/10 text-foreground" : "bg-card border-card-border text-foreground hover:bg-card-border/10"}`}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => {}} // Swapped via div click handler for better tapping targets
                    className="h-4.5 w-4.5 rounded border-card-border text-primary focus:ring-primary shrink-0 mt-0.5 cursor-pointer accent-primary"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold leading-normal truncate">
                      {t.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 ${t.priority === "HIGH" ? "bg-red-500/10 text-red-500" : t.priority === "MEDIUM" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "bg-zinc-500/15 text-zinc-500"}`}
                      >
                        {t.priority}
                      </span>
                      {t.status === "OVERDUE" && !t.done && (
                        <span className="text-[8px] bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
