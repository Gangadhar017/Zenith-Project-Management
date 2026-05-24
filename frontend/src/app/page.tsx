'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Sparkles, 
  Layers, 
  Clock, 
  Zap, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  Kanban,
  LineChart,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-zenith-dark text-foreground flex flex-col relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] neon-glow-purple pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] neon-glow-blue pointer-events-none" />

      {/* Grid Canvas Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-zenith-glow p-0.5 flex items-center justify-center shadow-lg shadow-primary/25">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Zenith
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm text-zinc-400 font-medium">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#ai" className="hover:text-primary transition flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Engine</a>
          <a href="#pricing" className="hover:text-primary transition">Pricing</a>
          <a href="#documentation" className="hover:text-primary transition">Docs</a>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              href="/dashboard" 
              className="bg-zenith-glow hover:opacity-90 text-white font-medium text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              Enter Hub <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-[1.02]"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 text-center pt-20 pb-16 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-primary shadow-sm mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" /> Next-Generation Project Management Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-gradient leading-[1.1] mb-6">
          Enterprise Project Management <br />
          <span className="text-gradient-purple">Next-Generation Platform</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-10">
          Streamline your team sprints, track tasks in real-time, and leverage context-aware intelligence to ship code faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link 
            href="/register" 
            className="bg-zenith-glow hover:opacity-95 text-white font-medium text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all hover:scale-[1.03] group"
          >
            Create Your Workspace <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features" 
            className="glass-card hover:bg-white/5 text-white font-medium text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            Explore Features
          </a>
        </div>

        {/* Board Preview Container */}
        <div className="w-full max-w-5xl rounded-2xl glass-panel border border-white/10 p-2 shadow-2xl relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-10 bg-primary/20 blur-[30px]" />
          <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-950/80 aspect-[16/9] p-6 text-left flex flex-col gap-6">
            
            {/* Mock Dashboard Top */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">Z</div>
                <div className="h-4 w-32 bg-white/10 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="h-3 w-3 bg-red-500/80 rounded-full" />
                <div className="h-3 w-3 bg-yellow-500/80 rounded-full" />
                <div className="h-3 w-3 bg-green-500/80 rounded-full" />
              </div>
            </div>

            {/* Mock Board Lanes */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-zinc-400">BACKLOG</span>
                  <span className="h-5 w-5 bg-white/5 rounded text-xs flex items-center justify-center">3</span>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-3 flex flex-col gap-2">
                  <div className="h-3.5 w-full bg-white/10 rounded" />
                  <div className="h-2 w-1/2 bg-white/5 rounded" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">AI generated</span>
                    <span className="h-4 w-4 rounded-full bg-zinc-700" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-primary">IN PROGRESS</span>
                  <span className="h-5 w-5 bg-primary/10 text-primary rounded text-xs flex items-center justify-center">1</span>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-1 w-full bg-zenith-glow" />
                  <div className="h-3.5 w-full bg-white/10 rounded" />
                  <div className="h-2.5 w-3/4 bg-white/5 rounded" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded">Active Sprint</span>
                    <div className="flex -space-x-1.5">
                      <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white">A</span>
                      <span className="h-4 w-4 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-zinc-400">DONE</span>
                  <span className="h-5 w-5 bg-white/5 rounded text-xs flex items-center justify-center">8</span>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-3 flex flex-col gap-2 opacity-60">
                  <div className="h-3.5 w-full bg-white/10 rounded line-through" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Resolved</span>
                    <span className="h-4 w-4 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gradient">
            Powering Your High-Velocity Sprints
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Everything your team needs to plan, track, and ship code faster, consolidated into one high-performance interface.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
              <Kanban className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Dynamic Kanban Board</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Drag and drop task cards with zero delay. Syncs instantly across all connected screens via our Socket.io presence engine.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Agile Project Analytics</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Beautiful charts depicting burn-down rates, historical team velocity, time trackers, and project health scores.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Workspace AI Brain</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A context-aware AI chatbot sidebar. Ask complex questions about backlog status, user assignments, or document wikis.
            </p>
          </div>
        </div>
      </section>

      {/* AI Features Matrix */}
      <section id="ai" className="py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5 z-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative">
          <div className="flex-1 text-left flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit">
              <Cpu className="h-3.5 w-3.5 animate-spin" /> Zenith AI Suite
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient">
              11 Groundbreaking AI Tools <br />
              At Your Fingertips.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Why use simple task managers when you can have a collaborative teammate? Zenith is armed with Gemini AI models that analyze real-time project metrics, estimate release deadlines, and resolve development blockers.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-primary" /> Prompt-to-Tasks
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-primary" /> Sprint Planning
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-primary" /> Risk Detection
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-primary" /> Bug Solver Code
              </div>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-primary">RISK DETECTOR</span>
              <p className="text-sm font-semibold text-white">AI predicts: 2 days delay threat</p>
              <p className="text-xs text-zinc-400 leading-normal">Capacity warning on user assignment. Shift pending Database migration checks forward.</p>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border-primary/30">
              <span className="text-xs font-bold text-secondary">DAILY STANDUP</span>
              <p className="text-xs text-zinc-400 italic">"Yesterday: Finalized Express routing middlewares. Today: Launching Socket.io room joins."</p>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col gap-2 col-span-1 sm:col-span-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1"><Bot className="h-3 w-3" /> GPT / Gemini Workspace Chat</span>
              <p className="text-xs text-zinc-400 italic">"Who is currently working on database migration schemas?"</p>
              <p className="text-xs text-white bg-white/5 p-2 rounded-lg mt-1 border border-white/5">
                "Currently, **Gangadhar** is assigned to the database branch with 2 subtasks pending."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gradient">
            Clear, Transparent Pricing
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Get started for free, then scale up features seamlessly as your product team completes sprints.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-white/5 relative">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Hobby</h3>
              <p className="text-zinc-400 text-sm mb-6">Perfect for solo developers and quick side integrations.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-zinc-400 text-sm font-medium">/ month</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> 1 Active Workspace</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Max 3 Active Projects</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Realtime Sockets Kanban board</li>
                <li className="flex items-center gap-3 text-zinc-500"><ShieldCheck className="h-4 w-4 text-zinc-500" /> Advanced AI analytics suite</li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="w-full text-center bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition"
            >
              Get Started
            </Link>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-bl-lg uppercase">
              PRO MIGRATION
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Zenith Pro <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </h3>
              <p className="text-zinc-400 text-sm mb-6">Designed for scale-ups and fast-paced high-velocity tech teams.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-gradient">$19</span>
                <span className="text-zinc-400 text-sm font-medium">/ month</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Unlimited Active Workspaces</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Unlimited Projects</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Full real-time synchronization</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> **11 Gemini AI Suite Modules** included</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Advanced Gantt charts & wikis</li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="w-full text-center bg-zenith-glow hover:opacity-95 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20 transition"
            >
              Upgrade to Pro
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 z-10 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-semibold text-zinc-300">Zenith Platform Inc.</span>
        </div>
        <p>© 2026 Zenith. Designed for Silicon Valley high-performance dev teams.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-300 transition">Terms</a>
          <a href="#" className="hover:text-zinc-300 transition">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition">GitHub</a>
        </div>
      </footer>

    </div>
  );
}
