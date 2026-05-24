'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Layers, 
  Activity, 
  Clock, 
  CheckSquare, 
  Cpu 
} from 'lucide-react';

export default function AIAssistantHubPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const { currentWorkspace, projects } = useWorkspaceStore();
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'USER' | 'ZENITH'; content: string }>>([
    { sender: 'ZENITH', content: 'Hello! I am Zenith Brain, your enterprise agile assistant. Ask me anything about active projects, card assignments, or document wikis.' }
  ]);

  const [botLoading, setBotLoading] = useState(false);

  // Daily standup states
  const [standup, setStandup] = useState<any>(null);
  const [standupLoading, setStandupLoading] = useState(false);

  // Project health summary states
  const [selectedProj, setSelectedProj] = useState('');
  const [projSummary, setProjSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Chat message submit handles
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || botLoading) return;

    const text = chatMessage;
    setChatMessage('');
    setChatLogs(prev => [...prev, { sender: 'USER', content: text }]);
    setBotLoading(true);

    const token = useAuthStore.getState().token;
    try {
      const res = await fetch('http://localhost:8000/api/ai/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId, message: text })
      });
      const data = await res.json();
      if (res.ok) {
        setChatLogs(prev => [...prev, { sender: 'ZENITH', content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBotLoading(false);
    }
  };

  // Standup generator handles
  const handleGenerateStandup = async () => {
    setStandupLoading(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch('http://localhost:8000/api/ai/daily-standup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStandup(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStandupLoading(false);
    }
  };

  // Project Executive summary generators
  const handleGenerateProjectSummary = async () => {
    if (!selectedProj) return;
    setSummaryLoading(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`http://localhost:8000/api/ai/project-summary/${selectedProj}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto h-full items-start">
      
      {/* COLUMN 1 & 2: INTERACTIVE CHATBOT */}
      <div className="lg:col-span-2 glass-panel rounded-2xl border-white/5 flex flex-col h-[75vh] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />
        
        {/* Chat header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">Zenith Workspace AI Brain</span>
            <span className="block text-[10px] text-zinc-500 font-light">Interactive chatbot synchronized across all cards.</span>
          </div>
        </div>

        {/* Chats stream */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {chatLogs.map((chat, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 text-xs max-w-[85%] ${chat.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${chat.sender === 'USER' ? 'bg-zinc-800' : 'bg-primary/20 text-primary'}`}>
                {chat.sender === 'USER' ? 'U' : <Bot className="h-4.5 w-4.5" />}
              </div>
              <div className={`p-3.5 rounded-2xl leading-relaxed font-light ${chat.sender === 'USER' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 text-zinc-300 border border-white/5 rounded-tl-none'}`}>
                {chat.content}
              </div>
            </div>
          ))}

          {botLoading && (
            <div className="flex gap-3 text-xs max-w-[85%] animate-pulse">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-white/5">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 text-zinc-500 border border-white/5 rounded-tl-none font-light">
                Zenith Brain is scanning workspace databases...
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-2">
          <input 
            type="text" 
            placeholder="Type your workspace inquiry (e.g. Which projects are Starred?)..."
            className="flex-1 glass-input px-4 py-3 text-xs focus:border-primary/50"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-zenith-glow text-white rounded-xl px-5 flex items-center justify-center shadow transition hover:opacity-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* COLUMN 3: DAILY STANDUP & PROJECT EXECUTIVE SUMMARIES */}
      <div className="flex flex-col gap-6">
        
        {/* Daily Standup generator */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-transparent to-transparent" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" /> AI Standup Generator
          </h3>
          <p className="text-[10px] text-zinc-400 font-light mb-4">Compose your daily standup text based on actual database logs.</p>

          <button 
            onClick={handleGenerateStandup}
            disabled={standupLoading}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold py-2.5 rounded-xl transition"
          >
            {standupLoading ? 'Analyzing sessional logs...' : 'Generate Daily Standup'}
          </button>

          {standup && (
            <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-3 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-secondary uppercase mb-0.5">YESTERDAY:</span>
                <p className="text-zinc-300 font-light leading-normal">{standup.yesterday}</p>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-secondary uppercase mb-0.5">TODAY:</span>
                <p className="text-zinc-300 font-light leading-normal">{standup.today}</p>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-secondary uppercase mb-0.5">BLOCKERS:</span>
                <p className="text-zinc-300 font-light leading-normal">{standup.blockers}</p>
              </div>
            </div>
          )}
        </div>

        {/* Executive project summaries */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-primary" /> AI Project Summaries
          </h3>
          <p className="text-[10px] text-zinc-400 font-light mb-4">Generate executive metrics reports for select scrum boards.</p>

          <div className="flex flex-col gap-3">
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-semibold p-2.5 text-white cursor-pointer"
              value={selectedProj}
              onChange={(e) => setSelectedProj(e.target.value)}
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-500">Select Project Board</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleGenerateProjectSummary}
              disabled={summaryLoading || !selectedProj}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2.5 rounded-xl transition"
            >
              {summaryLoading ? 'Aggregating milestones...' : 'Compile Project Summary'}
            </button>

            {projSummary && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-3 text-xs mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-zinc-500">PROJECT HEALTH:</span>
                  <span className="font-extrabold text-green-400">{projSummary.healthScore}% HEALTH</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-primary uppercase mb-0.5">EXECUTIVE NOTE:</span>
                  <p className="text-zinc-300 font-light leading-normal">{projSummary.executiveSummary}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="block text-[9px] font-bold text-primary uppercase mb-0.5">MILESTONES ACHIEVED:</span>
                  {projSummary.milestones?.map((ms: string, i: number) => (
                    <p key={i} className="text-[10px] text-zinc-300 font-light flex gap-1.5">
                      • {ms}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
