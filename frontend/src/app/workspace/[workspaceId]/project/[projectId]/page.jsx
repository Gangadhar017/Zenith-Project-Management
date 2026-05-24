"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";
import {
  Sparkles,
  Bot,
  Plus,
  X,
  CheckSquare,
  Clock,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Layers2,
} from "lucide-react";

const COLUMNS = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.projectId;
  const workspaceId = params.workspaceId;

  const { user } = useAuthStore();
  const {
    currentProject,
    tasks,
    selectProject,
    createTask,
    updateTaskOptimistic,
    saveTaskUpdate,
    deleteTask,
  } = useWorkspaceStore();

  const {
    socket,
    initializeSocket,
    disconnectSocket,
    emitTaskMove,
    emitTyping,
    isTyping,
  } = useSocketStore();

  const [activeTab, setActiveTab] = useState("kanban");
  const [selectedTask, setSelectedTask] = useState(null);

  // New task creations
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStatus, setCreateStatus] = useState("TODO");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskTags, setTaskTags] = useState("");

  // Pomodoro states
  const [timerDuration, setTimerDuration] = useState(1500); // 25 min default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Comments stream inside selected task
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Subtask checklists
  const [subtasksList, setSubtasksList] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Sprints optimizer
  const [sprintName, setSprintName] = useState("AI Sprint v1.0");
  const [sprintResult, setSprintResult] = useState(null);
  const [sprintLoading, setSprintLoading] = useState(false);

  // Gemini AI Bug Solver & Smart Assign
  const [aiSolverResult, setAiSolverResult] = useState(null);
  const [solvingBug, setSolvingBug] = useState(false);
  const [assigneeRec, setAssigneeRec] = useState(null);
  const [reccingAssignee, setReccingAssignee] = useState(false);

  // Socket sync integrations
  useEffect(() => {
    if (projectId && user) {
      selectProject(projectId);
      initializeSocket(projectId, user.id, user.name);
    }
    return () => {
      if (projectId && user) {
        disconnectSocket(projectId, user.id, user.name);
      }
    };
  }, [projectId, user, selectProject, initializeSocket, disconnectSocket]);

  // Sync details if task is updated globally
  useEffect(() => {
    if (selectedTask) {
      const live = tasks.find((t) => t.id === selectedTask.id);
      if (live) setSelectedTask(live);
    }
  }, [tasks, selectedTask]);

  // Pomodoro countdown clock
  useEffect(() => {
    if (timerRunning) {
      const id = setInterval(() => {
        setTimerDuration((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setTimerRunning(false);
            // Auto log 25 min to task timer entries
            handleLogTime(1500);
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerIntervalId(id);
    } else {
      if (timerIntervalId) clearInterval(timerIntervalId);
    }
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerRunning]);

  // Fetch comments & subtasks when task detail opens
  useEffect(() => {
    if (selectedTask) {
      const token = useAuthStore.getState().token;
      // Reset widgets
      setAiSolverResult(null);
      setAssigneeRec(null);
      setTimerDuration(1500);
      setTimerRunning(false);

      // Set items
      setCommentsList(selectedTask.comments || []);
      setSubtasksList(selectedTask.subtasks || []);
    }
  }, [selectedTask]);

  // Drag and drop Kanban Card handlers
  const handleDragStart = (e, taskId, status) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.setData("sourceStatus", status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, destStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    if (sourceStatus === destStatus) return;

    // Calculate dynamic sorting order
    const destTasks = tasks.filter((t) => t.status === destStatus);
    const maxOrder = destTasks.reduce(
      (max, t) => (t.order > max ? t.order : max),
      0,
    );
    const newOrder = maxOrder + 100;

    // Optimistic UI updates
    updateTaskOptimistic(taskId, { status: destStatus, order: newOrder });

    // Socket broadcasts to other users
    emitTaskMove(projectId, taskId, sourceStatus, destStatus, newOrder);

    // Save changes to Postgres DB
    await saveTaskUpdate(taskId, { status: destStatus, order: newOrder });
  };

  // Create Task handle
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const tagsArr = taskTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await createTask({
      title: taskTitle,
      description: taskDesc,
      status: createStatus,
      priority: taskPriority,
      tags: tagsArr,
      projectId,
    });

    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("MEDIUM");
    setTaskTags("");
    setShowCreateModal(false);
  };

  // Add subtask checkbox items
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;

    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        `http://localhost:8000/api/tasks/${selectedTask.id}/subtasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newSubtaskTitle }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSubtasksList((prev) => [...prev, data]);
        setNewSubtaskTitle("");
        // Trigger list sync
        selectProject(projectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        `http://localhost:8000/api/subtasks/${subtaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isCompleted: !currentStatus }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSubtasksList((prev) =>
          prev.map((s) => (s.id === subtaskId ? data : s)),
        );
        selectProject(projectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post comments inside active card
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(
        `http://localhost:8000/api/tasks/${selectedTask.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newCommentText }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setCommentsList((prev) => [...prev, data]);
        setNewCommentText("");
        emitTyping(projectId, selectedTask.id, user.name, false);
        selectProject(projectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pomodoro log duration helper
  const handleLogTime = async (seconds) => {
    if (!selectedTask) return;
    const token = useAuthStore.getState().token;
    try {
      await fetch(`http://localhost:8000/api/tasks/${selectedTask.id}/timer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duration: seconds,
          description: "Pomodoro Focus Session completed.",
        }),
      });
      alert("Time successfully saved and logged to Zenith database!");
      selectProject(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Sprints Optimizer Planner Wizard
  const handleTriggerSprintPlanning = async () => {
    setSprintLoading(true);
    const token = useAuthStore.getState().token;
    try {
      const backlogItems = tasks.filter(
        (t) => t.status === "BACKLOG" || t.status === "TODO",
      );
      const res = await fetch(`http://localhost:8000/api/ai/optimize-sprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId,
          sprintName,
          backlogTasks: backlogItems,
          teamSize: 3,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSprintResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSprintLoading(false);
    }
  };

  // AI Bug Solver implementation
  const handleTriggerBugSolver = async () => {
    if (!selectedTask) return;
    setSolvingBug(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`http://localhost:8000/api/ai/solve-bug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiSolverResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSolvingBug(false);
    }
  };

  // AI Smart Assign suggestion
  const handleTriggerSmartAssign = async () => {
    if (!selectedTask) return;
    setReccingAssignee(true);
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`http://localhost:8000/api/ai/smart-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedTask.title,
          tags: selectedTask.tags,
          workspaceId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssigneeRec(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReccingAssignee(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-w-0">
      {/* Board Header Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            {currentProject?.name || "Loading Project Board..."}
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            {currentProject?.description || "Build modular platforms."}
          </p>
        </div>

        {/* Tab view selectors */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "kanban" ? "bg-primary text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("sprint")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "sprint" ? "bg-primary text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
          >
            Sprint Optimizer
          </button>
        </div>
      </div>

      {/* ==========================================
           TAB 1: KANBAN BOARD
           ========================================== */}
      {activeTab === "kanban" && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[500px] overflow-x-auto items-start pb-10">
          {COLUMNS.map((col) => {
            const columnTasks = tasks
              .filter((t) => t.status === col)
              .sort((a, b) => a.order - b.order);
            return (
              <div
                key={col}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
                className="rounded-2xl glass-panel p-4 flex flex-col gap-4 border-white/5 max-h-[70vh] overflow-y-auto shrink-0 min-w-[220px]"
              >
                {/* Column header title */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span
                    className={`text-[10px] font-extrabold tracking-wider ${col === "IN_PROGRESS" ? "text-primary" : col === "DONE" ? "text-green-400" : "text-zinc-400"}`}
                  >
                    {col.replace("_", " ")}
                  </span>
                  <span className="h-5 w-5 bg-white/5 text-xs text-zinc-400 rounded-md flex items-center justify-center font-bold">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks loop inside status lane */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px]">
                  {columnTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id, col)}
                      onClick={() => setSelectedTask(t)}
                      className="glass-card p-4 rounded-xl flex flex-col gap-3 relative cursor-grab active:cursor-grabbing hover:border-primary/20 border border-transparent shadow-md"
                    >
                      <span className="block text-xs font-bold text-white leading-normal hover:text-primary transition">
                        {t.title}
                      </span>

                      {t.description && (
                        <span className="block text-[10px] text-zinc-500 font-light line-clamp-2">
                          {t.description}
                        </span>
                      )}

                      {/* Display tag badges */}
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[8px] font-bold bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded-md border border-white/5 uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${t.priority === "URGENT" ? "bg-red-500/20 text-red-400 border border-red-500/30" : t.priority === "HIGH" ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-zinc-500"}`}
                        >
                          {t.priority}
                        </span>

                        {t.assignee && (
                          <img
                            src={
                              t.assignee.image ||
                              `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${t.assignee.name}`
                            }
                            alt="assignee avatar"
                            className="h-4.5 w-4.5 rounded-full border border-white/10"
                            title={`Assigned to ${t.assignee.name}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create quick card */}
                <button
                  onClick={() => {
                    setCreateStatus(col);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-white border border-dashed border-white/5 hover:border-white/10 transition mt-2 hover:bg-white/[0.01]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add card
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
           TAB 2: AI SPRINTS PLANNER WIZARD
           ========================================== */}
      {activeTab === "sprint" && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 max-w-2xl mx-auto flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Layers2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AI Sprint Planning Optimizer
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Enter details to build a capacity optimized agile sprint via
                Gemini models.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">
                SPRINT NAME
              </label>
              <input
                type="text"
                className="glass-input p-2.5 text-sm"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
              />
            </div>

            <button
              onClick={handleTriggerSprintPlanning}
              disabled={sprintLoading}
              className="w-full bg-zenith-glow text-white font-medium text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition disabled:opacity-55"
            >
              {sprintLoading
                ? "Optimizing velocities..."
                : "Optimize Sprint backlog with AI"}{" "}
              <Sparkles className="h-4 w-4 text-white" />
            </button>
          </div>

          {sprintResult && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-primary block">
                OPTIMIZATION METRICS GENERATED
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-zinc-500 font-bold">
                    CAPACITY ASSIGNED
                  </span>
                  <span className="block text-lg font-black text-white mt-1">
                    {sprintResult.recommendedCapacity} points
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-zinc-500 font-bold">
                    RISK COEFFICIENT
                  </span>
                  <span
                    className={`block text-lg font-black mt-1 ${sprintResult.riskScore > 50 ? "text-red-400" : "text-green-400"}`}
                  >
                    {sprintResult.riskScore}% RISK
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-bold">
                  SPRINT RECOMMENDATIONS:
                </span>
                {sprintResult.recommendations?.map((rec, i) => (
                  <p
                    key={i}
                    className="text-xs text-zinc-300 font-light flex gap-2 items-start"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{" "}
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
           MODAL: CREATE TASK
           ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              onClick={() => setShowCreateModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="text-primary h-5 w-5" /> Create Task Card
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Add a brand new card inside your column lane.
            </p>

            <form
              onSubmit={handleCreateTaskSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  CARD TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Integrate auth token validation middleware"
                  className="glass-input p-2.5 text-sm"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  placeholder="Summarize the core execution steps."
                  className="glass-input p-2.5 text-sm h-20 resize-none"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">
                    PRIORITY
                  </label>
                  <select
                    className="bg-white/5 border border-white/10 rounded-lg text-xs font-semibold p-2.5 text-white"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="LOW" className="bg-zinc-900">
                      LOW
                    </option>
                    <option value="MEDIUM" className="bg-zinc-900">
                      MEDIUM
                    </option>
                    <option value="HIGH" className="bg-zinc-900">
                      HIGH
                    </option>
                    <option value="URGENT" className="bg-zinc-900">
                      URGENT
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend, API"
                    className="glass-input p-2.5 text-sm"
                    value={taskTags}
                    onChange={(e) => setTaskTags(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium text-xs py-3 rounded-xl shadow-lg transition"
              >
                Provision Kanban Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: TASK DETAILED VIEW OVERLAY (POMODORO, CHAT, CHECKLISTS, GEMINI SOLVERS)
           ========================================== */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end p-0">
          <div className="w-full max-w-2xl h-full glass-panel border-l border-white/10 p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto">
            {/* Header info */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {selectedTask.status.replace("_", " ")}
                  </span>
                  <h2 className="text-xl font-black text-white mt-2 leading-tight">
                    {selectedTask.title}
                  </h2>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    {selectedTask.description || "No detailed specifications."}
                  </p>
                </div>
                <button
                  className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                  onClick={() => setSelectedTask(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grid content panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                {/* COLUMN 1: POMODORO & CHECKLIST */}
                <div className="flex flex-col gap-6">
                  {/* Pomodoro Timer widget */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> POMODORO
                      FOCUS TIMER
                    </span>

                    <div className="flex items-center gap-4 py-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {Math.floor(timerDuration / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(timerDuration % 60).toString().padStart(2, "0")}
                      </span>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="h-8 px-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition text-xs font-semibold flex items-center gap-1"
                        >
                          {timerRunning ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}{" "}
                          {timerRunning ? "Pause" : "Start"}
                        </button>
                        <button
                          onClick={() => {
                            setTimerRunning(false);
                            setTimerDuration(1500);
                          }}
                          className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                          title="Reset Timer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Subtask widget */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5 text-secondary" />{" "}
                      CHECKLIST SUBTASKS
                    </span>

                    <div className="flex flex-col gap-2">
                      {subtasksList.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-lg text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={st.isCompleted}
                            className="cursor-pointer h-4 w-4 accent-primary rounded"
                            onChange={() =>
                              handleToggleSubtask(st.id, st.isCompleted)
                            }
                          />

                          <span
                            className={`text-zinc-300 font-light ${st.isCompleted ? "line-through opacity-55" : ""}`}
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={handleAddSubtask}
                      className="flex gap-2 mt-1"
                    >
                      <input
                        type="text"
                        placeholder="Add subtask element..."
                        className="flex-1 glass-input px-3 py-1.5 text-xs"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      />

                      <button
                        type="submit"
                        className="bg-secondary px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* COLUMN 2: GEMINI AI SERVICES MODULE */}
                <div className="flex flex-col gap-6">
                  {/* AI Smart Assign suggestions */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5 text-purple-400" /> AI SMART
                      ASSIGN SUGGESTION
                    </span>

                    <button
                      onClick={handleTriggerSmartAssign}
                      disabled={reccingAssignee}
                      className="bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition text-xs font-semibold py-2 rounded-lg"
                    >
                      {reccingAssignee
                        ? "Calculating task skills..."
                        : "Suggest Optimal Assignee"}
                    </button>

                    {assigneeRec && (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-1 text-[11px]">
                        <p className="text-zinc-300 font-light">
                          {assigneeRec.reasoning}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Bug Solver panel */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI BUG
                      SOLVER DRAFT
                    </span>

                    <button
                      onClick={handleTriggerBugSolver}
                      disabled={solvingBug}
                      className="bg-zenith-glow hover:opacity-90 transition text-white text-xs font-semibold py-2 rounded-lg"
                    >
                      {solvingBug
                        ? "Scanning bug trace..."
                        : "Solve Bug with AI"}
                    </button>

                    {aiSolverResult && (
                      <div className="flex flex-col gap-3 text-xs bg-white/5 p-3 rounded-lg border border-white/5 mt-2 max-h-[160px] overflow-y-auto">
                        <div>
                          <span className="text-[9px] font-bold text-primary uppercase block mb-1">
                            ANALYSIS:
                          </span>
                          <p className="text-zinc-300 font-light leading-normal">
                            {aiSolverResult.rootCauseAnalysis}
                          </p>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-secondary uppercase block mb-1">
                            CODE FIX DRAFT:
                          </span>
                          <pre className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-green-400 overflow-x-auto">
                            {aiSolverResult.codeSnippet}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* COMMENTS COLUMN BOTTOM */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-6">
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />{" "}
                  COMMENTS STREAM
                </span>

                <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto p-1">
                  {commentsList.map((comm) => (
                    <div key={comm.id} className="flex gap-3 text-xs">
                      <img
                        src={
                          comm.user?.image ||
                          `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${comm.user?.name}`
                        }
                        alt="avatar"
                        className="h-7 w-7 rounded-full bg-zinc-800 border border-white/5"
                      />

                      <div className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-[11px]">
                            {comm.user?.name}
                          </span>
                          <span className="text-[8px] text-zinc-500">
                            {new Date(comm.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-zinc-300 font-light leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show active typing indicator */}
                {isTyping[selectedTask.id] &&
                  isTyping[selectedTask.id].isTyping && (
                    <span className="text-[10px] text-primary italic font-light pl-10 animate-pulse">
                      {isTyping[selectedTask.id].userName} is typing comment...
                    </span>
                  )}

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a collaborative update..."
                    className="flex-1 glass-input px-3 py-2 text-xs"
                    value={newCommentText}
                    onChange={(e) => {
                      setNewCommentText(e.target.value);
                      // Trigger typing indicator sockets
                      emitTyping(
                        projectId,
                        selectedTask.id,
                        user.name,
                        e.target.value.length > 0,
                      );
                    }}
                    onBlur={() =>
                      emitTyping(projectId, selectedTask.id, user.name, false)
                    }
                  />

                  <button
                    type="submit"
                    className="bg-primary text-white text-xs font-semibold px-4 rounded-xl shadow"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>

            {/* Delete button bottom */}
            <div className="border-t border-white/5 pt-4 mt-8 flex justify-end">
              <button
                onClick={async () => {
                  if (confirm("Delete this card from Zenith board?")) {
                    await deleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }
                }}
                className="text-xs font-bold text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
