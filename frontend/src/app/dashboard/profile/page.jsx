"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sparkles,
  User,
  ShieldAlert,
  ShieldCheck,
  Save,
  RotateCcw,
  Lock,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, setAuth } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarSeed, setAvatarSeed] = useState(user?.name || "seed123");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("zenith_token") || "";
    try {
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          image: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(avatarSeed)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile details.");
      }
      setAuth(token, data.user);
      setSuccess(
        "Profile details successfully saved to PostgreSQL and synchronized across workspaces!",
      );
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      setError("Both current and new passwords are required.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("zenith_token") || "";
    try {
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to change password.");
      }
      setSuccess(
        "Password successfully modified in secure PostgreSQL database.",
      );
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Profile Settings
        </h1>
        <p className="text-xs text-zinc-400 font-light mt-1">
          Configure your personal credentials and customize your collaborative
          avatar.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2 animate-pulse">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* AVATAR SELECTOR */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center gap-4 relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

          <img
            src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(avatarSeed)}`}
            alt="profile preview"
            className="h-28 w-28 rounded-full border-2 border-primary bg-zinc-800 p-1"
          />

          <div className="w-full flex flex-col gap-2 text-center">
            <span className="text-xs font-bold text-white uppercase">
              AVATAR GENERATOR
            </span>
            <input
              type="text"
              className="glass-input p-2 text-xs text-center font-semibold"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              placeholder="seed input"
            />

            <span className="text-[9px] text-zinc-500">
              Type any seed name to randomize your custom card avatar.
            </span>
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Main Info Profile Details */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-transparent to-transparent" />

            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary" /> Account
              Specifications
            </h3>

            <form
              onSubmit={handleUpdateProfile}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  className="glass-input p-2.5 text-xs focus:border-secondary/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  className="glass-input p-2.5 text-xs focus:border-secondary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-secondary text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="h-4 w-4" />{" "}
                {loading ? "Saving details..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Secure details password */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" /> Modify Password
            </h3>

            <form
              onSubmit={handleUpdatePassword}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">
                    CURRENT PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="glass-input p-2.5 text-xs focus:border-primary/50"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="glass-input p-2.5 text-xs focus:border-primary/50"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <RotateCcw className="h-4 w-4" /> Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
