"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useShallow } from "zustand/react/shallow";
import { API_BASE } from "@/lib/api";
import {
  Layers,
  Sparkles,
  Kanban,
  LineChart,
  FileText,
  Users,
  Bot,
  Plus,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  Settings,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  // Mark as mounted after first client render (localStorage is available)
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const {
    token,
    user,
    isAuthenticated,
    clearAuth,
    setAuth,
    isDarkMode,
    toggleDarkMode,
  } = useAuthStore();
  const {
    workspaces,
    currentWorkspace,
    projects,
    currentProject,
    allTasks,
    documents,
    fetchWorkspaces,
    selectWorkspace,
    createWorkspace,
    createProject,
    selectProject,
    fetchAllWorkspaceTasks,
  } = useWorkspaceStore(
    useShallow((state) => ({
      workspaces: state.workspaces,
      currentWorkspace: state.currentWorkspace,
      projects: state.projects,
      currentProject: state.currentProject,
      allTasks: state.allTasks,
      documents: state.documents,
      fetchWorkspaces: state.fetchWorkspaces,
      selectWorkspace: state.selectWorkspace,
      createWorkspace: state.createWorkspace,
      createProject: state.createProject,
      selectProject: state.selectProject,
      fetchAllWorkspaceTasks: state.fetchAllWorkspaceTasks,
    }))
  );

  // Global Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Focus search input on Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search workspace..."]',
        );
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear currentProject when navigating to non-project pages
  useEffect(() => {
    if (pathname && !pathname.includes("/project/")) {
      useWorkspaceStore.setState({ currentProject: null });
    }
  }, [pathname]);

  // Search across projects, allTasks, and documents
  const q = globalSearchQuery.toLowerCase();
  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      )
    : [];

  const matchedTasks = q
    ? allTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      )
    : [];

  const matchedDocs = q
    ? documents.filter(
        (d) =>
          (d.title || "").toLowerCase().includes(q) ||
          (d.content || "").toLowerCase().includes(q),
      )
    : [];

  // Clerk Modal states
  const [showClerkModal, setShowClerkModal] = useState(false);
  const [clerkTab, setClerkTab] = useState("profile");
  const [clerkName, setClerkName] = useState(user?.name || "");
  const [clerkEmail, setClerkEmail] = useState(user?.email || "");
  const [clerkAvatarSeed, setClerkAvatarSeed] = useState(user?.name || "");
  const [clerkCurrentPassword, setClerkCurrentPassword] = useState("");
  const [clerkNewPassword, setClerkNewPassword] = useState("");
  const [clerkSuccess, setClerkSuccess] = useState("");
  const [clerkError, setClerkError] = useState("");
  const [clerkLoading, setClerkLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setClerkName(user.name);
      setClerkEmail(user.email);
      if (!clerkAvatarSeed) setClerkAvatarSeed(user.name);
    }
  }, [user]);

  const handleClerkUpdateProfile = async (e) => {
    e.preventDefault();
    setClerkError("");
    setClerkSuccess("");
    setClerkLoading(true);
    const token = localStorage.getItem("zenith_token") || "";
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clerkName,
          email: clerkEmail,
          image: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(clerkAvatarSeed)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");
      setAuth(token, data.user);
      setClerkSuccess("Profile successfully synchronized with Clerk auth layers!");
    } catch (err) {
      setClerkError(err.message || "An error occurred.");
    } finally {
      setClerkLoading(false);
    }
  };

  const handleClerkUpdatePassword = async (e) => {
    e.preventDefault();
    setClerkError("");
    setClerkSuccess("");
    if (!clerkCurrentPassword || !clerkNewPassword) {
      setClerkError("Both current and new passwords are required.");
      return;
    }
    setClerkLoading(true);
    const token = localStorage.getItem("zenith_token") || "";
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: clerkCurrentPassword,
          newPassword: clerkNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setClerkSuccess("Password successfully modified in database.");
      setClerkCurrentPassword("");
      setClerkNewPassword("");
    } catch (err) {
      setClerkError(err.message || "An error occurred.");
    } finally {
      setClerkLoading(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "info",
      message: "Welcome to Zenith! Your workspace has been provisioned.",
      time: "Just now",
      read: false,
    },
    {
      id: "2",
      type: "alert",
      message: "High priority task dependency check recommended by AI.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "success",
      message: "Gangadhar successfully updated system rate limiters.",
      time: "1 day ago",
      read: true,
    },
  ]);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");

  // Authentication check + workspace fetch
  // hasMounted guard prevents acting on stale SSR state before localStorage is read
  useEffect(() => {
    if (!hasMounted) return;
    if (!isAuthenticated || !user || !token) {
      clearAuth();
      router.replace("/login");
    } else {
      fetchWorkspaces();
    }
  }, [hasMounted, isAuthenticated, user, token, router, fetchWorkspaces, clearAuth]);

  // Show a minimal spinner until the client has hydrated and auth state is confirmed.
  // Using router.replace (not push) avoids adding the broken dashboard to browser history.
  if (!hasMounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 rounded-xl bg-zenith-glow p-0.5 animate-bounce">
          <Layers className="h-9 w-9 text-white" />
        </div>
        <span className="text-sm font-medium tracking-wide">
          {hasMounted && !isAuthenticated ? "Redirecting to login..." : "Syncing secure token credentials..."}
        </span>
      </div>
    );
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    await createWorkspace(newWsName, newWsDesc);
    setNewWsName("");
    setNewWsDesc("");
    setShowWorkspaceModal(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim() || !currentWorkspace) return;
    await createProject({
      name: newProjName,
      description: newProjDesc,
      workspaceId: currentWorkspace.id,
    });
    // Re-fetch all tasks after creating a project
    fetchAllWorkspaceTasks();
    setNewProjName("");
    setNewProjDesc("");
    setShowProjectModal(false);
  };

  const activeLinkClass =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold text-sm transition-all";
  const inactiveLinkClass =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.02] border border-transparent text-sm transition-all";

  const wsId = currentWorkspace?.id || "1";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden transition-colors duration-200">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-card-border flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-card-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zenith-glow p-0.5 flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-foreground text-base">
                Zenith PM
              </span>
            </Link>
            <button
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="p-4 border-b border-card-border">
            <label className="text-[9px] font-bold text-zinc-500 tracking-wider block mb-1.5">
              ACTIVE WORKSPACE
            </label>
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 bg-card border border-card-border rounded-lg text-xs font-semibold p-2 focus:outline-none focus:border-primary/50 text-foreground cursor-pointer"
                value={currentWorkspace?.id || ""}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) selectWorkspace(ws);
                }}
              >
                {!currentWorkspace && (
                  <option value="" disabled className="bg-background text-zinc-500">
                    Loading workspaces...
                  </option>
                )}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id} className="bg-background text-foreground">
                    {ws.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowWorkspaceModal(true)}
                className="h-8 w-8 rounded-lg bg-card border border-card-border flex items-center justify-center text-zinc-400 hover:text-primary transition hover:bg-card-border/10"
                title="Create Workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1 overflow-y-auto">
            {/* HOME */}
            <label className="text-[9px] font-bold text-zinc-500 tracking-wider block mb-1.5 px-3">
              HOME
            </label>
            <Link
              href="/dashboard"
              onClick={() => useWorkspaceStore.setState({ currentProject: null })}
              className={pathname === "/dashboard" ? activeLinkClass : inactiveLinkClass}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>

            {/* PROJECT CONTROLS */}
            <label className="text-[9px] font-bold text-zinc-500 tracking-wider block mt-4 mb-1.5 px-3">
              PROJECT CONTROLS
            </label>

            {currentProject ? (
              <Link
                href={`/workspace/${wsId}/project/${currentProject.id}`}
                className={pathname.includes("/project/") ? activeLinkClass : inactiveLinkClass}
              >
                <Kanban className="h-4 w-4" /> Kanban Board
              </Link>
            ) : (
              <div className="text-xs text-zinc-500 italic p-3 text-center border border-dashed border-card-border rounded-lg bg-card/20">
                Select a project to open board
              </div>
            )}

            <Link
              href={`/workspace/${wsId}/analytics`}
              className={pathname.includes("/analytics") ? activeLinkClass : inactiveLinkClass}
            >
              <LineChart className="h-4 w-4" /> Velocity Charts
            </Link>

            <Link
              href={`/workspace/${wsId}/calendar`}
              className={pathname.includes("/calendar") ? activeLinkClass : inactiveLinkClass}
            >
              <Calendar className="h-4 w-4" /> Calendar Planner
            </Link>

            {/* ORGANIZATION TOOLS */}
            <label className="text-[9px] font-bold text-zinc-500 tracking-wider block mt-4 mb-1.5 px-3">
              ORGANIZATION TOOLS
            </label>

            <Link
              href={`/workspace/${wsId}/wiki`}
              className={pathname.includes("/wiki") ? activeLinkClass : inactiveLinkClass}
            >
              <FileText className="h-4 w-4" /> Knowledge Wiki
            </Link>

            <Link
              href={`/workspace/${wsId}/ai-assistant`}
              className={pathname.includes("/ai-assistant") ? activeLinkClass : inactiveLinkClass}
            >
              <Bot className="h-4 w-4 text-purple-400" /> Workspace AI Bot
            </Link>

            <Link
              href={`/workspace/${wsId}/team`}
              className={pathname.includes("/team") ? activeLinkClass : inactiveLinkClass}
            >
              <Users className="h-4 w-4" /> Team Management
            </Link>

            <Link
              href={`/workspace/${wsId}/settings`}
              className={pathname.includes("/settings") ? activeLinkClass : inactiveLinkClass}
            >
              <Settings className="h-4 w-4" /> Workspace Settings
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-card-border bg-card/10 group">
          <button
            onClick={() => setShowClerkModal(true)}
            className="w-full flex items-center gap-3 mb-4 p-1.5 rounded-xl hover:bg-card-border/10 border border-transparent hover:border-card-border transition flex-row"
          >
            <img
              src={
                user.image ||
                `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.name}`
              }
              alt="avatar"
              className="h-9 w-9 rounded-full bg-zinc-800 border border-card-border group-hover:border-primary transition"
            />
            <div className="flex-1 overflow-hidden text-left">
              <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition">
                {user.name}
              </span>
              <span className="block text-[9px] text-zinc-500 truncate">
                {user.email}
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              clearAuth();
              router.replace("/login");
            }}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2.5 rounded-lg transition border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" /> Log Out Session
          </button>
        </div>
      </aside>

      {/* Main Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-card-border flex items-center justify-between glass-panel z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-zinc-400 hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
              <Link
                href="/dashboard"
                onClick={() => useWorkspaceStore.setState({ currentProject: null })}
                className="text-zinc-500 hover:text-foreground transition"
              >
                Workspace
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              <Link
                href="/dashboard"
                onClick={() => useWorkspaceStore.setState({ currentProject: null })}
                className="text-zinc-400 hover:text-foreground transition"
              >
                {currentWorkspace?.name || "Loading..."}
              </Link>
              {currentProject && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                  <Link
                    href={`/workspace/${wsId}/project/${currentProject.id}`}
                    className="text-primary hover:text-primary-hover font-semibold transition"
                  >
                    {currentProject.name}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search workspace..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-card border border-card-border pl-9 pr-12 py-1.5 rounded-lg text-xs focus:outline-none focus:border-primary/50 text-foreground transition-all duration-200"
              />
              <kbd className="absolute right-2 top-2 bg-zinc-800/20 dark:bg-zinc-800 px-1 rounded text-zinc-400 text-[9px] pointer-events-none">
                ⌘K
              </kbd>

              {showSearchResults && globalSearchQuery && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSearchResults(false)}
                  />
                  <div className="absolute right-0 top-10 w-96 bg-card border border-card-border rounded-xl shadow-xl z-50 p-3 max-h-96 overflow-y-auto glass-panel">
                    <div className="text-[10px] font-bold text-zinc-500 tracking-wider mb-2">
                      SEARCH RESULTS
                    </div>

                    {/* Projects */}
                    {matchedProjects.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[9px] font-black text-zinc-400 uppercase mb-1">
                          Projects ({matchedProjects.length})
                        </div>
                        <div className="flex flex-col gap-1">
                          {matchedProjects.map((p) => (
                            <button
                              key={p.id}
                              onClick={async () => {
                                await selectProject(p.id);
                                setShowSearchResults(false);
                                setGlobalSearchQuery("");
                                router.push(`/workspace/${wsId}/project/${p.id}`);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-foreground font-semibold flex items-center justify-between group transition"
                            >
                              <span className="truncate group-hover:text-primary transition">
                                {p.name}
                              </span>
                              <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shrink-0">
                                BOARD
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {matchedTasks.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[9px] font-black text-zinc-400 uppercase mb-1">
                          Tasks ({matchedTasks.length})
                        </div>
                        <div className="flex flex-col gap-1">
                          {matchedTasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={async () => {
                                await selectProject(t.projectId);
                                setShowSearchResults(false);
                                setGlobalSearchQuery("");
                                router.push(`/workspace/${wsId}/project/${t.projectId}`);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-foreground font-semibold flex items-center justify-between group transition"
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate group-hover:text-primary transition">
                                  {t.title}
                                </span>
                                {t.projectName && (
                                  <span className="text-[9px] text-zinc-500 truncate">
                                    in {t.projectName}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shrink-0">
                                {t.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {matchedDocs.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[9px] font-black text-zinc-400 uppercase mb-1">
                          Docs ({matchedDocs.length})
                        </div>
                        <div className="flex flex-col gap-1">
                          {matchedDocs.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => {
                                setShowSearchResults(false);
                                setGlobalSearchQuery("");
                                router.push(`/workspace/${wsId}/wiki`);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-foreground font-semibold flex items-center justify-between group transition"
                            >
                              <span className="truncate group-hover:text-primary transition">
                                {d.title}
                              </span>
                              <span className="text-[8px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shrink-0">
                                WIKI
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedProjects.length === 0 && matchedTasks.length === 0 && matchedDocs.length === 0 && (
                      <div className="text-xs text-zinc-500 italic text-center py-4">
                        No results found inside workspace.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Project Selector */}
            {currentWorkspace && (
              <div className="flex items-center gap-2">
                <select
                  className="bg-card border border-card-border rounded-lg text-xs font-semibold p-2 focus:outline-none focus:border-primary/50 text-foreground cursor-pointer"
                  value={currentProject?.id || ""}
                  onChange={(e) => selectProject(e.target.value)}
                >
                  <option value="" disabled className="bg-background text-zinc-500">
                    Select Project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-background text-foreground">
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition"
                  title="Create Project"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="h-8 w-8 rounded-lg hover:bg-card-border/10 border border-card-border/20 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-white transition"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-8 w-8 rounded-lg hover:bg-card-border/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-foreground transition"
                title="Workspace Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#060a09] border border-white/10 rounded-xl shadow-2xl p-4 z-[99] text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3">
                    <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-primary" />{" "}
                      NOTIFICATIONS ({notifications.filter((n) => !n.read).length})
                    </span>
                    <button
                      onClick={() =>
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                      }
                      className="text-[9px] text-zinc-500 hover:text-primary transition"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id ? { ...item, read: true } : item,
                            ),
                          )
                        }
                        className={`p-2.5 rounded-lg border text-[10px] leading-relaxed transition cursor-pointer ${n.read ? "bg-white/[0.01] border-white/5 text-zinc-500" : "bg-primary/5 border-primary/20 text-zinc-300 font-semibold"}`}
                      >
                        <div className="flex gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${n.type === "alert" ? "bg-red-400 animate-pulse" : n.type === "success" ? "bg-green-400" : "bg-primary"}`}
                          />
                          <span className="flex-1 leading-normal">{n.message}</span>
                        </div>
                        <span className="block text-[8px] text-zinc-600 text-right mt-1.5">
                          {n.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>

      {/* ── CLERK PROFILE MODAL ── */}
      {showClerkModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[600px] bg-background border border-card-border rounded-2xl shadow-2xl flex overflow-hidden relative animate-in zoom-in duration-200">
            <button
              className="absolute top-4 right-4 text-zinc-500 hover:text-foreground z-10 p-1 rounded-lg hover:bg-card-border/10"
              onClick={() => {
                setShowClerkModal(false);
                setClerkSuccess("");
                setClerkError("");
              }}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-64 bg-zinc-50/50 dark:bg-zinc-900/30 border-r border-card-border p-6 flex flex-col justify-between shrink-0">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-zenith-glow p-0.5 flex items-center justify-center">
                    <Layers className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground tracking-tight">
                    Clerk Profile
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { setClerkTab("profile"); setClerkSuccess(""); setClerkError(""); }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${clerkTab === "profile" ? "bg-primary/10 border border-primary/20 text-primary" : "text-zinc-500 hover:text-foreground hover:bg-card-border/10 border border-transparent"}`}
                  >
                    <User className="h-4 w-4" /> Account details
                  </button>
                  <button
                    onClick={() => { setClerkTab("security"); setClerkSuccess(""); setClerkError(""); }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${clerkTab === "security" ? "bg-primary/10 border border-primary/20 text-primary" : "text-zinc-500 hover:text-foreground hover:bg-card-border/10 border border-transparent"}`}
                  >
                    <Lock className="h-4 w-4" /> Password security
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-t border-card-border pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-widest text-zinc-400">clerk</span>
                  <span className="text-[8px] bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">DEV MODE</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-light">Secured by Clerk developer endpoints.</span>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-card/5">
              {clerkSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2 animate-pulse">
                  <Shield className="h-4 w-4 shrink-0 text-green-500" />
                  <span>{clerkSuccess}</span>
                </div>
              )}
              {clerkError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{clerkError}</span>
                </div>
              )}

              {clerkTab === "profile" ? (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Profile Information</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-light">Configure your collaborative credentials and custom account seeds.</p>
                  </div>
                  <form onSubmit={handleClerkUpdateProfile} className="flex flex-col gap-5">
                    <div className="flex items-center gap-4 bg-card border border-card-border p-4 rounded-xl">
                      <img
                        src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(clerkAvatarSeed)}`}
                        alt="Avatar"
                        className="h-16 w-16 rounded-full border border-primary bg-zinc-800 p-0.5 shrink-0"
                      />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500">AVATAR GENERATOR SEED</label>
                        <input
                          type="text"
                          required
                          className="glass-input p-2 text-xs font-semibold max-w-xs focus:border-primary/50"
                          value={clerkAvatarSeed}
                          onChange={(e) => setClerkAvatarSeed(e.target.value)}
                          placeholder="adventurer seed"
                        />
                        <span className="text-[9px] text-zinc-500 italic">Type to dynamically randomize your customized card.</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500">FULL NAME</label>
                      <input type="text" required className="glass-input p-2.5 text-xs focus:border-primary/50" value={clerkName} onChange={(e) => setClerkName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500">EMAIL ADDRESS</label>
                      <input type="email" required className="glass-input p-2.5 text-xs focus:border-primary/50" value={clerkEmail} onChange={(e) => setClerkEmail(e.target.value)} />
                    </div>
                    <button type="submit" disabled={clerkLoading} className="w-full mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
                      {clerkLoading ? "Synchronizing with Clerk..." : "Save Profile details"}
                    </button>
                  </form>
                  <div className="border-t border-card-border my-2" />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wider">EMAIL ADDRESSES</label>
                    <div className="flex justify-between items-center bg-card border border-card-border p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span className="text-xs font-medium text-foreground">{clerkEmail}</span>
                        <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded-full font-semibold">Primary</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full shrink-0" /> Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wider">CONNECTED OAUTH ACCOUNTS</label>
                    <div className="flex justify-between items-center bg-card border border-card-border p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-red-500/20">G</div>
                        <span className="text-xs font-medium text-foreground">Google</span>
                      </div>
                      <span className="text-[10px] text-green-500 font-semibold">Connected</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Password Security</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-light">Modify your secure credentials stored inside the PostgreSQL tenant registry.</p>
                  </div>
                  <form onSubmit={handleClerkUpdatePassword} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500">CURRENT PASSWORD</label>
                      <input type="password" placeholder="••••••••" className="glass-input p-2.5 text-xs focus:border-primary/50" value={clerkCurrentPassword} onChange={(e) => setClerkCurrentPassword(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-500">NEW PASSWORD</label>
                      <input type="password" placeholder="••••••••" className="glass-input p-2.5 text-xs focus:border-primary/50" value={clerkNewPassword} onChange={(e) => setClerkNewPassword(e.target.value)} />
                    </div>
                    <button type="submit" disabled={clerkLoading} className="w-full mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
                      {clerkLoading ? "Processing request..." : "Change secure credentials"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE WORKSPACE MODAL ── */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-card-border shadow-2xl relative">
            <button className="absolute top-4 right-4 text-zinc-500 hover:text-foreground" onClick={() => setShowWorkspaceModal(false)}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Plus className="text-primary h-5 w-5" /> Create Workspace
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-light">Group your projects under a central tenant workspace hub.</p>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500">WORKSPACE NAME</label>
                <input type="text" required placeholder="e.g. Zenith Core Team" className="glass-input p-2.5 text-sm" value={newWsName} onChange={(e) => setNewWsName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500">DESCRIPTION (OPTIONAL)</label>
                <textarea placeholder="What is this workspace focused on?" className="glass-input p-2.5 text-sm h-20 resize-none" value={newWsDesc} onChange={(e) => setNewWsDesc(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-zenith-glow hover:opacity-95 text-white font-medium text-xs py-3 rounded-xl shadow-lg transition">
                Provision Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE PROJECT MODAL ── */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-card-border shadow-2xl relative">
            <button className="absolute top-4 right-4 text-zinc-500 hover:text-foreground" onClick={() => setShowProjectModal(false)}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" /> Create Project
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-light">Add a brand new agile scrum or task board to your active space.</p>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500">PROJECT NAME</label>
                <input type="text" required placeholder="e.g. NextJS Migration v15" className="glass-input p-2.5 text-sm" value={newProjName} onChange={(e) => setNewProjName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-500">DESCRIPTION (OPTIONAL)</label>
                <textarea placeholder="Outline the scopes, templates, and goals." className="glass-input p-2.5 text-sm h-20 resize-none" value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium text-xs py-3 rounded-xl shadow-lg transition">
                Provision Project Board
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
