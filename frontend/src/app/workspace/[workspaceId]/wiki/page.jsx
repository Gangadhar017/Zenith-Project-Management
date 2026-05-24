"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sparkles,
  FileText,
  Plus,
  Save,
  Bot,
  ArrowRight,
  X,
} from "lucide-react";

export default function WorkspaceWikiPage() {
  const params = useParams();
  const workspaceId = params.workspaceId;

  const { documents, fetchDocuments, createDocument, updateDocument } =
    useWorkspaceStore();

  const [activeDoc, setActiveDoc] = useState(null);
  // Edit states
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");

  // New doc triggers
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIsWiki, setNewIsWiki] = useState(true);

  // AI Meeting summarizer states
  const [transcript, setTranscript] = useState("");
  const [summaryResult, setSummaryResult] = useState(null);
  const [sumLoading, setSumLoading] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchDocuments(workspaceId);
    }
  }, [workspaceId, fetchDocuments]);

  // Set inputs if doc selected
  const handleSelectDoc = (doc) => {
    setActiveDoc(doc);
    setDocTitle(doc.title);
    setDocContent(doc.content);
    setSummaryResult(null);
  };

  // Save edits handles
  const handleSaveDoc = async () => {
    if (!activeDoc) return;
    await updateDocument(activeDoc.id, docTitle, docContent);
    alert("Document Wiki successfully saved to Postgres!");
  };

  // Create new doc
  const handleCreateDocSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createDocument(
      newTitle,
      "# " + newTitle + "\n\nStart writing documentation here...",
      newIsWiki,
      workspaceId,
    );
    setNewTitle("");
    setShowNewDocModal(false);
  };

  // Trigger Gemini meeting notes summarizer
  const handleTriggerMeetingNotes = async () => {
    if (!transcript.trim()) return;
    setSumLoading(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        "http://localhost:8000/api/ai/summarize-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transcript }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSummaryResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSumLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto h-full items-start">
      {/* SIDEBAR: WIKI LISTING */}
      <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" /> WORKSPACE WIKIS
          </span>
          <button
            onClick={() => setShowNewDocModal(true)}
            className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelectDoc(doc)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition ${activeDoc?.id === doc.id ? "bg-primary/15 border-primary/20 text-white" : "bg-white/[0.01] border-white/5 text-zinc-400 hover:text-white"}`}
            >
              {doc.title}
            </button>
          ))}
          {documents.length === 0 && (
            <span className="text-[10px] text-zinc-500 italic p-3 text-center">
              No docs generated yet.
            </span>
          )}
        </div>
      </div>

      {/* CORE: DOCUMENT EDITOR & AI MEETING TRANSLATOR */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {activeDoc ? (
          <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

            {/* Doc Title header */}
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                className="bg-transparent text-xl font-bold text-white border-b border-transparent focus:border-white/10 focus:outline-none flex-1 py-1"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />

              <button
                onClick={handleSaveDoc}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Save className="h-3.5 w-3.5" /> Save Wiki
              </button>
            </div>

            {/* Doc text content */}
            <textarea
              className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 text-xs font-light text-zinc-300 h-96 focus:outline-none focus:border-white/10 resize-y leading-relaxed font-mono"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
            />
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl border-white/5 border-dashed text-center bg-white/[0.01] flex flex-col items-center justify-center min-h-[40vh]">
            <FileText className="h-10 w-10 text-zinc-600 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-zinc-400">
              Select a Knowledge Document
            </h3>
            <p className="text-xs text-zinc-500 font-light max-w-sm mt-1">
              Read collaborative documents or click the plus (+) button to draft
              active company resources.
            </p>
          </div>
        )}

        {/* AI Meeting Summarizer Console */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-secondary via-transparent to-transparent" />

          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1">
                AI Meeting Transcript Summarizer{" "}
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Convert video standup notes directly into standard sprint
                backlog cards.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <textarea
              placeholder="Paste raw conversation text/transcripts here (e.g. Gangadhar: We need to design PostgreSQL schemas, Sarah: Count me in for Next.js)..."
              className="glass-input p-3 text-xs h-24 resize-none leading-normal font-light"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <button
              onClick={handleTriggerMeetingNotes}
              disabled={sumLoading || !transcript.trim()}
              className="w-full bg-secondary hover:bg-secondary-hover text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
            >
              {sumLoading
                ? "Scanning vocal metrics..."
                : "Summarize and extract action items"}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {summaryResult && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-secondary block">
                EXTRACTED MEETING SUMMARY
              </span>
              <p className="text-xs text-zinc-300 font-light leading-normal">
                {summaryResult.summary}
              </p>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-bold">
                  ACTION ITEMS DETECTED:
                </span>
                {summaryResult.actionItems?.map((act, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white/[0.01] p-3 rounded-lg border border-white/5 text-xs"
                  >
                    <div className="flex gap-2">
                      <span className="font-bold text-primary">
                        [{act.priority}]
                      </span>
                      <span className="text-zinc-300 font-light">
                        {act.taskTitle}
                      </span>
                    </div>
                    <span className="text-zinc-500 font-semibold italic">
                      Suggest: {act.assigneeSuggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW DOCUMENT MODAL */}
      {showNewDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              onClick={() => setShowNewDocModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="text-primary h-5 w-5" /> New Wiki Document
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Create resources, roadmap lists, or team guides.
            </p>

            <form
              onSubmit={handleCreateDocSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Migrations Roadmap"
                  className="glass-input p-2.5 text-sm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium text-xs py-3 rounded-xl shadow-lg transition"
              >
                Draft Document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
