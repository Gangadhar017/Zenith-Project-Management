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

  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

      // Transition to OTP verification step
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed. Please check the code.");
      }

      // Store credentials and redirect to dashboard
      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {showOtp ? (
        /* OTP Verification View */
        <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-2xl border border-white/10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-[80%] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="h-10 w-10 rounded-xl bg-zenith-glow p-0.5 flex items-center justify-center shadow-lg shadow-primary/25">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
              Verify Your Email
            </h2>
            <p className="text-xs text-zinc-400 font-light max-w-xs mt-1">
              We sent a secure 6-digit verification code to <span className="text-secondary font-medium">{email}</span>.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold text-zinc-400 text-center tracking-wider"
                htmlFor="otpCode"
              >
                ENTER 6-DIGIT CODE
              </label>
              <input
                id="otpCode"
                type="text"
                required
                maxLength={6}
                className="glass-input p-4 text-center text-2xl font-mono tracking-[0.75em] focus:border-primary/50"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otpCode.length !== 6}
              className="w-full mt-2 bg-zenith-glow hover:opacity-90 disabled:opacity-55 text-white font-medium text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {verifying ? "Verifying Credentials..." : "Complete Setup"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-zinc-400 flex flex-col gap-3">
            <span>
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="text-primary hover:underline font-medium focus:outline-none"
              >
                Resend Code
              </button>
            </span>
            <span>
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setError("");
                  setOtpCode("");
                }}
                className="text-zinc-500 hover:text-zinc-300 transition font-medium focus:outline-none mt-1"
              >
                ← Edit Register Details
              </button>
            </span>
          </div>
        </div>
      ) : (
        /* Standard Register Form View */
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
      )}
    </div>
  );
}
