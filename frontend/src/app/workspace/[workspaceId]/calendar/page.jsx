"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useShallow } from "zustand/react/shallow";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function WorkspaceCalendarPage() {
  const params = useParams();
  const workspaceId = params.workspaceId;

  const { tasks, projects } = useWorkspaceStore(
    useShallow((state) => ({
      tasks: state.tasks,
      projects: state.projects,
    }))
  );

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Helper to render calendar days
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const calendarDays = [];
  // Fill empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Fill days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Calendar header details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Workspace Calendar
            Planner
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Plan and coordinate due dates, scrum sprints, and milestone releases
            visually.
          </p>
        </div>

        {/* Date controllers */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <span className="text-xs font-bold text-white px-2">
            {months[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Grid calendar */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col bg-white/[0.01]">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02] text-center py-3 text-[10px] font-extrabold text-zinc-500 tracking-wider">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-px bg-white/5">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={idx}
                  className="bg-zinc-950/80 aspect-square p-2 border-b border-r border-white/5"
                />
              );
            }

            // Find tasks matching current day, month, and year
            const currentDayTasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              const date = new Date(t.dueDate);
              return (
                date.getDate() === day &&
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
              );
            });

            return (
              <div
                key={idx}
                className="bg-zinc-950 aspect-square p-3 border-b border-r border-white/5 flex flex-col gap-2 relative overflow-y-auto group hover:bg-white/[0.01] transition duration-200"
              >
                <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition">
                  {day}
                </span>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
                  {currentDayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-primary/20 border border-primary/30 p-2 rounded-lg text-[9px] text-white font-bold leading-normal truncate"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
