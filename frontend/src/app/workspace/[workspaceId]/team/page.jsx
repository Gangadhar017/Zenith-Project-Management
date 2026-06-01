"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE } from "@/lib/api";
import {
  Users,
  UserPlus,
  Trash2,
  ShieldAlert,
  Shield,
  ArrowRight,
  Search,
  Layers,
  ListTodo,
} from "lucide-react";

export default function WorkspaceTeamPage() {
  const params = useParams();
  const workspaceId = params.workspaceId;

  const { currentWorkspace, projects } = useWorkspaceStore();

  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Search query states
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch workspace membership logs
  const fetchMembers = () => {
    if (!workspaceId) return;
    const token = useAuthStore.getState().token;
    // Quick direct query to backend workspaces invite listing
    fetch(`${API_BASE}/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const activeWs = data.find((w) => w.id === workspaceId);
        if (activeWs) {
          setMembers(activeWs.memberships || []);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  // Handle invite member
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return;

    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        `${API_BASE}/workspaces/${workspaceId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, role }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invitation failed. Verify email.");
      }

      setSuccess(
        `User successfully added and synchronized with ${role} permissions!`,
      );
      setEmail("");
      fetchMembers();
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  };

  // Remove member from workspace
  const handleRemoveMember = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to remove this member from the workspace?",
      )
    )
      return;
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        `${API_BASE}/workspaces/${workspaceId}/members/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setSuccess("Member successfully removed from organization workspace.");
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    const nameMatches = (m.user?.name || "").toLowerCase().includes(query);
    const emailMatches = (m.user?.email || "").toLowerCase().includes(query);
    return nameMatches || emailMatches;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* 3-Panel Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              TOTAL MEMBERS
            </span>
            <span className="block text-2xl font-black text-foreground mt-1.5">
              {members.length} Users
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Workspace size
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition duration-300">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-secondary/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              ACTIVE BOARDS
            </span>
            <span className="block text-2xl font-black text-foreground mt-1.5">
              {projects.length} Boards
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Total workspace projects
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition duration-300">
            <Layers className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center justify-between group hover:border-purple-500/30 transition-all duration-300">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 tracking-wider">
              PENDING BACKLOG
            </span>
            <span className="block text-2xl font-black text-foreground mt-1.5">
              12 Tasks
            </span>
            <span className="text-[9px] text-zinc-400 font-medium block mt-1">
              Assigned milestones backlog
            </span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <ListTodo className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* COLUMN 1 & 2: MEMBERS LIST WITH TABLE */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-card-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Workspace Membership
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                  List of all active developers, admins, and viewers inside this
                  workspace.
                </p>
              </div>
            </div>
          </div>

          {/* Member Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary/50 text-foreground text-xs"
              placeholder="Search team members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Team Table Grid */}
          {filteredMembers.length > 0 ? (
            <div className="overflow-x-auto border border-card-border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-card border-b border-card-border text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Name / Identity</th>
                    <th className="p-4 font-bold">Email address</th>
                    <th className="p-4 font-bold">Permission role</th>
                    <th className="p-4 font-bold text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border bg-card/5">
                  {filteredMembers.map((m) => {
                    const nameStr = m.user?.name || "Workspace Member";
                    const emailStr = m.user?.email || "N/A";
                    const initial = nameStr.charAt(0).toUpperCase();
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-card/10 transition-colors"
                      >
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 uppercase text-xs">
                            {initial}
                          </div>
                          <span className="font-bold text-foreground">
                            {nameStr}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 dark:text-zinc-400 font-medium">
                          {emailStr}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border tracking-wider uppercase ${m.role === "OWNER" ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-500" : m.role === "ADMIN" ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "bg-zinc-500/15 border-zinc-500/30 text-zinc-500"}`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {m.role !== "OWNER" && (
                            <button
                              onClick={() => handleRemoveMember(m.userId)}
                              className="h-8 w-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-zinc-500 hover:text-red-400 transition"
                              title="Revoke Access"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-card-border rounded-xl p-8 text-center bg-card/5 animate-in fade-in duration-200">
              <Search className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              <h3 className="text-xs font-bold text-foreground">
                No matching workspace members
              </h3>
              <p className="text-[10px] text-zinc-500 font-light mt-1">
                Try adjusting your search query keyword.
              </p>
            </div>
          )}
        </div>

        {/* COLUMN 3: INVITATION PANEL */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-transparent to-transparent" />

          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Invite Team Member
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                Add user emails to collaborate.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2 animate-pulse">
              <Shield className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="coworker@domain.com"
                className="glass-input p-2.5 text-xs focus:border-secondary/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500">
                MEMBERSHIP ROLE
              </label>
              <select
                className="bg-card border border-card-border rounded-lg text-xs font-semibold p-2.5 text-foreground cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="MEMBER" className="bg-background">
                  MEMBER (Write & Edit boards)
                </option>
                <option value="ADMIN" className="bg-background">
                  ADMIN (Full invites & deletions)
                </option>
                <option value="VIEWER" className="bg-background">
                  VIEWER (Read-only boards)
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-zenith-glow hover:opacity-90 transition text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
            >
              Provision Member Access <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
