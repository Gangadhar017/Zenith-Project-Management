# <div align="center">🌌 Zenith PM</div>
## <div align="center">Next-Generation AI-Powered Enterprise Project Management Platform</div>

<div align="center">

[![Next.js Version](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React JS](https://img.shields.io/badge/React_JS-JavaScript/JSX-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript (Backend)](https://img.shields.io/badge/TypeScript-(Backend)-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-6.x-teal?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Docker Support](https://img.shields.io/badge/Docker-Compatible-blue?style=for-the-badge&logo=docker)](https://www.docker.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Armed-purple?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

</div>

---

### 📖 Introduction

**Zenith** is a high-fidelity, high-velocity agile project management SaaS platform built for high-performance engineering teams. Engineered to outperform legacy task trackers, Zenith pairs a sleek, modern glassmorphic **Next.js 15 React JS (JavaScript/JSX)** frontend with a high-performance **Node.js/Express/TypeScript** backend, real-time collaboration engines powered by **Socket.io**, and **11 context-aware Gemini AI models** that act as cooperative digital teammates.

---

## 🚀 Recent Core Advancements

We recently rolled out key system-wide visual, architectural, and functional enhancements to Zenith:

*   **TypeScript to React JS (JavaScript/JSX) Migration**: Transformed the entire frontend React codebase from TypeScript (`.ts`/`.tsx`) to plain, high-performance **React JS (`.js`/`.jsx`)**. All types, interfaces, and static annotations were safely stripped while preserving 100% of formatting, absolute path imports (mapped via standard `jsconfig.json`), and features.
*   **Reactive Class-Based Dark Mode theme**: Built a robust dark-theme first layout. The workspace store (`useAuthStore`) seamlessly caches user preference within local storage and defaults to a gorgeous dark zinc/indigo theme (`#09090b` carbon) for first-time visitors, completely eliminating visual contrast and white-on-white text bugs.
*   **Fully Functional Autocomplete Workspace Search**: Upgraded the static command-palette mockup with a fully operational real-time search engine inside the top header. Pressing `⌘K` or `Ctrl+K` instantly focuses the bar, searching all Projects and Tasks in the active workspace and linking directly to target boards.
*   **Breadcrumbs Navigation backlinks Reset**: Integrated direct State Purge controllers into the top-header breadcrumb list. Navigating back to the `Workspace` or the Workspace name breadcrumbs clears the project selector state dynamically, preventing stale project sub-headers on workspace-level pages like the Calendar, Wikis, or Team tables.

---

## ✨ Primary Features Matrix

```mermaid
graph TD
    A["Zenith Platform"] --> B["Enterprise App Client"]
    A --> C["High-Performance Server"]
    A --> D["Gemini AI Engine"]
    
    B --> B1["Next.js 15 App Router (React JS)"]
    B --> B2["Zustand Stores & Themes"]
    B --> B3["Socket.io Cursors & Typing"]
    
    C --> C1["Express & JWT Auth Router"]
    C --> C2["Prisma Schema with Neon Postgres"]
    C --> C3["Presence Rooms Synchronization"]
    
    D --> D1["Prompt-to-Tasks Wizard"]
    D --> D2["AI Sprints Optimizer"]
    D --> D3["Gemini Code Bug Solver"]
    D --> D4["Workspace Chat Sidebar"]
```

### 1. Unified Sessional Auth & RBAC
- Secure JWT credential registers and cookie/header-based authorization.
- Automatic personal workspace provisioning.
- Precise Role-Based Access Controls: `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`.

### 2. High-Performance Kanban Board
- Zero-latency card drag-and-drops across columns (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- **Optimistic UI Updates** in Zustand stores reflect on-screen state modifications instantly.
- Integrated task timers (Pomodoro clocks) logging deep focus focus metrics directly into the database.

### 3. Real-Time Collaboration Core
- Presence engines track and render mouse cursors coordinates of all active workspace developers.
- typing animations display indicators inside task comment boxes when teams are writing.
- Instant, multi-client board layout updates via global Socket.io event triggers.

### 4. 11 Gemini AI Suite Modules
*   **Prompt-to-Tasks**: Converts descriptive natural language requests into structured checklists and tickets.
*   **Sprint Planning Optimizer**: Analyzes backlog queues, estimates team capacities, and proposes optimized sprint allocations.
*   **Meeting Summarizer**: Processes raw video or standup transcripts into actionable backlog tickets.
*   **Risk Shield Detection**: Flags potential schedule bottlenecks, task overlaps, and capacity overloads.
*   **AI Bug Solver**: Scans bug ticket logs, drafts possible root causes, and outputs proposed code solutions.
*   **Workspace Chatbot Sidebar**: A persistent virtual teammate sidebar that answers queries regarding active tickets, workspace documents, and project details.

---

## 📂 Repository Layout

```
d:/Project_Management/
├── frontend/                  # Next.js 15 App Router React JS (JS/JSX) Frontend client
│   ├── src/
│   │   ├── app/               # Workspace Pages, Calendars, Wikis, Sprints, Profile Settings (.jsx)
│   │   ├── components/        # Glassmorphic layouts, buttons, modals (.jsx)
│   │   ├── store/             # Zustand state managers (useAuthStore.js, useWorkspaceStore.js, useSocketStore.js)
│   │   └── lib/               # Global utility scripts (.js)
│   ├── jsconfig.json          # Next.js JavaScript directory path alias configurations
│   ├── tailwind.config.js     # Custom animations, HSL themes, and gradients
│   └── package.json
└── backend/                   # Express TypeScript Sockets API Server
    ├── src/
    │   ├── controllers/       # HTTP request parsers
    │   ├── middlewares/       # Security filters (JWT validation, roles authentication)
    │   ├── routes/            # Unified API endpoint schema mapper
    │   ├── services/          # Google Gemini AI services wrapper
    │   ├── sockets/           # Collaborative pointer & cursor synchronization
    │   └── server.ts          # Server entrypoint file
    ├── prisma/
    │   ├── schema.prisma      # Unified Prisma schemas (PostgreSQL / Neon compatible)
    │   └── seed.ts            # RBAC Roles & developers database seed script
    └── package.json
```

---

## 🚀 Setting Up the Suite

### Method A: One-Click Docker Multicontainer Compose (Recommended)
You can orchestrate the entire database, TypeScript backend, and React JS client environment instantly using Docker:
```bash
# Launch database, backend API, and frontend client concurrently
docker-compose up --build -d
```
*   **Next.js Frontend Client**: `http://localhost:3000`
*   **Express API Server**: `http://localhost:8000/api`

---

### Method B: Manual Local Development Setup

#### 1. Setup PostgreSQL Database
Ensure you have a running PostgreSQL instance and provision a clean database (e.g. `zenith`).

#### 2. Configure & Start Express API Server
```bash
cd backend
npm install
```

Create a `backend/.env` file:
```env
PORT=8000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zenith?schema=public"
JWT_SECRET="super-secret-zenith-jwt-key-2026-wow"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY" # Optional: high-fidelity mock fallbacks included!
CORS_ORIGIN="http://localhost:3000"
```

Sync PostgreSQL tables and seed starting workspace profiles:
```bash
# Run schema migration pushes
npx prisma db push

# Load sample workspaces, team members, backlog cards, and Wikis
npm run seed
```

Start the TypeScript development server:
```bash
npm run dev
```

#### 3. Configure & Start Next.js React JS Client
```bash
cd ../frontend
npm install
```

Start the Next.js App Router client in plain JavaScript dev mode:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🔐 Seeded Credentials for Quick Access
Zenith's seed engine preloads workspace profiles to facilitate testing out of the box:

*   **Lead Architect / Admin Session**:
    *   **Email**: `lead@zenith.com`
    *   **Password**: `password123`
*   **Developer / Member Session**:
    *   **Email**: `developer@zenith.com`
    *   **Password**: `password123`

---

## 📝 Primary API Router Index

<details>
<summary>🔑 Authentication Routes</summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register profile & auto-provision default workspace |
| `POST` | `/api/auth/login` | Log in and issue HTTP sessional JWT |
| `PUT` | `/api/auth/profile` | Update profile information (Clerk-style details modal sync) |

</details>

<details>
<summary>🏢 Workspace & Project Routes</summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/workspaces` | Create dynamic organization tenant |
| `GET` | `/api/workspaces/:workspaceId/stats` | Fetch real-time metrics & health indexes |
| `POST` | `/api/projects` | Provision project scrum task board |
| `PUT` | `/api/projects/:projectId` | Toggle project starring state |

</details>

<details>
<summary>📋 Task & Kanban Card Routes</summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create backlog cards with order sorting |
| `PUT` | `/api/tasks/:taskId` | Save drag-and-drop column changes and coordinates |
| `POST` | `/api/tasks/:taskId/comments` | Post comments inside chat streams |
| `POST` | `/api/tasks/:taskId/timer` | Log Pomodoro deep focus session duration |

</details>

<details>
<summary>🧠 Google Gemini AI Services</summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/optimize-sprint` | Run Sprint capacity Optimizer planner |
| `POST` | `/api/ai/solve-bug` | Suggest bug proposed root-causes and actual code fixes |
| `POST` | `/api/ai/smart-assign` | Suggest optimal developer assignee for task tags |
| `POST` | `/api/ai/chatbot` | Conversational interface with context-aware workspace memory |

</details>

---

<div align="center">
  <sub>Built with ❤️ by Silicon Valley Agile Engineers. Powered by Google Gemini.</sub>
</div>
