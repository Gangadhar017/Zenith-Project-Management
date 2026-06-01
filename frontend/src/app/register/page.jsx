"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE } from "@/lib/api";
import { Layers, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Registration failed. Try a different email.",
        );
      }

      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-2xl border border-white/10 relative shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-[80%] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Link
            href="/"
            className="h-10 w-10 rounded-xl bg-zenith-glow p-0.5 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Layers className="h-6 w-6 text-white" />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
            Get Started
          </h2>
          <p className="text-sm text-zinc-400 font-light">
            Set up your enterprise agile platform in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-zinc-400"
              htmlFor="fullName"
            >
              FULL NAME
            </label>
            <input
              id="fullName"
              type="text"
              required
              className="glass-input p-3 text-sm focus:border-secondary/50"
              placeholder="Gangadhar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-zinc-400"
              htmlFor="email"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              required
              className="glass-input p-3 text-sm focus:border-secondary/50"
              placeholder="creator@zenith.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-zinc-400"
              htmlFor="password"
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              className="glass-input p-3 text-sm focus:border-secondary/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-zenith-glow hover:opacity-90 disabled:opacity-55 text-white font-medium text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? "Configuring Node Space..." : "Register Workspace"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
