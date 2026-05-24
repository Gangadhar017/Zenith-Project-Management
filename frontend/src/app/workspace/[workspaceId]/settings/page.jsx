"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sparkles,
  Settings,
  Trash2,
  AlertTriangle,
  Save,
  Key,
  ShieldCheck,
} from "lucide-react";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { currentWorkspace, selectWorkspace, fetchWorkspaces } =
    useWorkspaceStore();

  const [name, setName] = useState(currentWorkspace?.name || "");
  const [desc, setDesc] = useState(currentWorkspace?.description || "");
  const [inviteToken, setInviteToken] = useState("zenith-invite-token-987-xyz");

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    const token = useAuthStore.getState().token;
    try {
      // Simulate saving changes
      setTimeout(async () => {
        if (currentWorkspace) {
          selectWorkspace({
            ...currentWorkspace,
            name,
            description: desc,
          });
          setSuccess(
            "Workspace details successfully saved and synchronized across active channels.",
          );
        }
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerateToken = () => {
    const randomHex = Math.random().toString(16).slice(2, 10);
    setInviteToken(`zenith-invite-${randomHex}`);
    setSuccess(
      "New invite token generated. Share this token with your teammates to allow direct workspace registration.",
    );
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    if (currentWorkspace.userRole !== "OWNER") {
      alert("Only the OWNER can delete this workspace.");
      return;
    }

    if (
      confirm(
        `CRITICAL WARNING: Are you sure you want to delete workspace "${currentWorkspace.name}"? This action is permanent and deletes all databases records, projects cards, subtasks checklists, and documents!`,
      )
    ) {
      setLoading(true);
      // Simulate deletion
      setTimeout(() => {
        alert("Workspace successfully purged from Zenith servers.");
        fetchWorkspaces();
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Workspace Configuration
        </h1>
        <p className="text-xs text-zinc-400 font-light mt-1">
          Manage overall tenant policies, rename workspaces, and generate invite
          tokens.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2 animate-pulse">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CORE EDIT FORM */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Main Info */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Workspace Metadata
            </h3>

            <form
              onSubmit={handleUpdateWorkspace}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  WORKSPACE NAME
                </label>
                <input
                  type="text"
                  required
                  className="glass-input p-2.5 text-xs focus:border-primary/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  DESCRIPTION
                </label>
                <textarea
                  className="glass-input p-2.5 text-xs h-24 resize-none focus:border-primary/50"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="h-4 w-4" /> Save Workspace Settings
              </button>
            </form>
          </div>

          {/* Invite Token Generators */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-transparent to-transparent" />

            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-secondary" /> Dynamic Invite Keys
            </h3>
            <p className="text-xs text-zinc-400 font-light mb-6">
              Create tokens to bypass individual email invite rules during
              client registration.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  className="flex-1 glass-input p-2.5 text-xs font-mono text-zinc-300"
                  value={inviteToken}
                />

                <button
                  onClick={handleGenerateToken}
                  className="bg-secondary text-white text-xs font-semibold px-4 rounded-lg"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PURGE / DELETE COLUMN (OWNER ONLY) */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-red-500/10 flex flex-col gap-4 relative overflow-hidden h-fit bg-red-500/[0.01]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500 via-transparent to-transparent" />

            <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Purging the workspace deletes all projects, tasks history,
              comments, Wikis, files, and members lists permanently.
            </p>

            <button
              onClick={handleDeleteWorkspace}
              disabled={loading}
              className="w-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              <Trash2 className="h-4 w-4" /> Purge Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
