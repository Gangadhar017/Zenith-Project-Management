# <div align="center">🌌 Zenith PM</div>
## <div align="center">Next-Generation AI-Powered Enterprise Project Management Platform</div>

<div align="center">

[![Next.js Version](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React Version](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript (Backend)](https://img.shields.io/badge/TypeScript-(Backend)-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-5.14.0-teal?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Docker Support](https://img.shields.io/badge/Docker-Compatible-blue?style=for-the-badge&logo=docker)](https://www.docker.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Armed-purple?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Resend SDK](https://img.shields.io/badge/Resend_SDK-Enabled-orange?style=for-the-badge)](https://resend.com)
[![Stripe API](https://img.shields.io/badge/Stripe_API-Monetized-green?style=for-the-badge&logo=stripe)](https://stripe.com)

</div>

---

### 📖 Introduction

**Zenith PM** is a high-fidelity, high-velocity agile project management SaaS platform purpose-built for high-performance engineering squads. Designed to replace sluggish legacy trackers, Zenith matches a clean, modern glassmorphic frontend built with **Next.js 15 and React 19 (JavaScript/JSX)** with a scalable, high-throughput **Node.js/Express/TypeScript** backend. The system features real-time synchronization via **Socket.io** alongside an integrated suite of **11 context-aware Gemini AI tools** functioning as digital team members.

---

## 🏗️ Architectural Core Matrix

```mermaid
graph TD
    A["Zenith Platform"] --> B["Enterprise App Client"]
    A --> C["High-Performance Server"]
    A --> D["Gemini AI Engine"]
    
    B --> B1["Next.js 15 App Router (React 19)"]
    B --> B2["Zustand Selector useShallow Optimization"]
    B --> B3["Framer Motion Kanban & Socket Cursors"]
    
    C --> C1["Express TypeScript & JWT Auth Gateway"]
    C --> C2["Prisma Schema & PostgreSQL Data Layer"]
    C --> C3["Presence Rooms State Engine"]
    
    D --> D1["Prompt-to-Tasks Wizard Service"]
    D --> D2["Capacity-Aware Sprint Optimizer"]
    D --> D3["Gemini Automated Bug Solver"]
    D --> D4["Grounded Workspace Chat Bot"]
```

---

## 🚀 Recent Core Advancements (The Architectural Upgrades)

We recently executed an extensive, end-to-end upgrade of Zenith to establish a top-tier, enterprise-ready standard:

*   **Phase 1: Database & Backend Optimization**:
    *   **N+1 Query Resolution**: Parallelized database counts using `Promise.all` in controllers, accelerating API load speeds.
    *   **Prisma Indices**: Configured highly selective `@index` parameters inside `schema.prisma` to accelerate query sorting.
    *   **Zod Payload Validations**: Embedded bulletproof server-side input schema validation on all request controllers using an optimized custom middleware layer.
*   **Phase 2: Sockets & Multiplayer Collaboration**:
    *   **Ghost Connection Eviction**: Tracked active Socket rooms within `presence.ts` registries. Connection drops trigger automatic room cleanups, broadcasting exit alerts to active team members.
    *   **Zombie Cursors Deletion**: Configured Zustand hooks on `user:left` events to instantly delete departees' mouse pointers from active boards.
*   **Phase 3: RAG-Grounded Chatbot & Capacity-Aware Planner**:
    *   **Keyword-Based RAG Context Grounding**: Upgraded `chatWithWorkspace` in `ai.service.ts` to rank workspace documents using keyword relevance (RAG filtering) to feed dense context previews to Gemini.
    *   **Capacity-Aware Sprint Planning**: Re-engineered the Sprint Optimizer to fetch live developer workloads (active assigned tasks) directly from PostgreSQL to balance card assignments.
*   **Phase 4: State Selector Tuning & Framer Motion Kanban Board**:
    *   **Zustand Selector Tuning**: Wrapped destructured store hooks with `useShallow` from `zustand/react/shallow` inside layouts and dashboard views to isolate rendering cascades.
    *   **Tactual Card Animations**: Swapped board cards with Framer Motion `<motion.div layout>` wrappers with spring transitions and tactile hover lift-up physics.
*   **Phase 5: Multi-Stage DevOps & CI/CD Pipelines**:
    *   **Double-Stage Docker Pipelines**: Split `backend/Dockerfile` and `frontend/Dockerfile` into intermediate `builder` and minimal production `runner` stages to shrink image footprints.
    *   **GitHub Actions CI Workflow**: Set up a robust validation pipeline (`ci.yml`) triggering on pushes to `master`.
*   **Phase 6: Transactional Emails (Resend SDK)**:
    *   **Resend Transactional Integrations**: Designed dark-themed Notion-style invitations and Linear-style task assignment HTML templates, triggered asynchronously in the background inside Controllers.
*   **Phase 7: Stripe Subscription Checkouts & Sandbox Portals**:
    *   **Monetization Gateway**: Integrated Stripe checkouts and webhook handlers. Configured mock success sandbox loops (`/api/billing/mock-success`) to simulate webhook confirmations instantly in development.
*   **Hardening Rate Limiter Security**:
    *   **Reverse-Proxy IP Extraction**: Hardened custom rate limiters with secure parsing of `x-forwarded-for` to extract the true client IP and prevent bypass spoofing behind Cloudflare or ALB.

---

## ✨ Primary Features Matrix

### 1. Unified Sessional Auth & RBAC
* Robust JWT token-based authentication with secure local/sessional memory hydration.
* Automated onboarding layer that auto-provisions a personalized default tenant hub upon registration.
* Granular Role-Based Access Control (RBAC) levels enforcing data mutations natively: `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`.

### 2. High-Velocity Board Engine
* Zero-latency task allocation updates matching modern agile states: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
* Optimized **Optimistic UI updates** within custom Zustand store slices instantly mirror coordinate modifications on screen before database persistence, resolving client lagging.
* Native tracking clocks (Pomodoro timers) let developers log deep focus intervals seamlessly to PostgreSQL analytics schemas.

### 3. Sockets Presence Core
* Real-time multiplayer presence engine that broadcasts and tracks mouse cursor coordinates of connected developers within active project boards.
* Asynchronous canvas synchronization streams status transitions and lane-order updates via centralized channel events instantly.
* Automated "Ghost Connection" eviction handles abrupt user network failures by cleaning registries inside server sockets.

### 4. 11 Context-Aware Gemini Models
* **Prompt-to-Tasks**: Compiles text descriptions into full sprint tickets equipped with pre-populated subtasks and technical priorities.
* **Sprint Planning Optimizer**: Iterates through pending cards, looks up estimated metrics, and suggests optimal development workloads based on live team member active workloads.
* **Meeting Summarizer**: Takes raw text transcripts from engineering syncs and turns them into technical checklist backlogs.
* **AI Bug Solver**: Examines issue context, reports deep structural root causes, and generates complete proposed source code repairs.
* **Grounded Chatbot Companion**: Provides an integrated assistant that has workspace-wide text grounding, leveraging keyword relevance scoring (RAG) to scan active wiki documentation.

---

## 📂 Repository Layout

```
d:/Project_Management/
├── .github/                   # CI/CD Workflows
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI compilation & build validator pipeline
├── frontend/                  # Next.js 15 App Router React JS Client
│   ├── src/
│   │   ├── app/               # Dashboard layouts, Calendars, Wikis, Sprints, Profile views (.jsx)
│   │   ├── components/        # Glassmorphic shells, overlays, inputs, buttons (.jsx)
│   │   ├── store/             # Zustand state slices (useAuthStore.js, useWorkspaceStore.js, useSocketStore.js)
│   │   └── lib/               # Global utility scripts and client API mappings (.js)
│   ├── jsconfig.json          # JavaScript absolute path directory mapping configurations
│   ├── tailwind.config.js     # Custom animations, boxed box-shadows, HSL theme maps
│   ├── Dockerfile             # Multi-stage production frontend container blueprint
│   └── package.json
└── backend/                   # Node.js Express TypeScript Engine Server
    ├── src/
    │   ├── controllers/       # HTTP request handlers and payload managers
    │   ├── middlewares/       # Core protection guards (JWT decryption, Proxy IP rate limits, schema Zod validators)
    │   ├── routes/            # Central application gateway routing blueprint
    │   ├── services/          # Google Gemini generative models logic, Resend emails, and Stripe billing
    │   ├── sockets/           # Collaborative coordinates & room syncing socket handlers
    │   └── server.ts          # Express application initialization entrypoint
    ├── prisma/
    │   ├── schema.prisma      # Unified Prisma schema architecture (Neon Postgres)
    │   └── seed.ts            # High-fidelity developer roles seeding database pipeline
    ├── Dockerfile             # Multi-stage production backend container blueprint
    └── package.json
```

---

## 🚀 Installation & Local Execution

### Option A: One-Click Multi-Container Orchestration (Docker Compose)

A complete ecosystem including PostgreSQL, the TypeScript backend server, and the Next.js production client can be spun up instantly using optimized multi-stage builder-runner pipelines:

```bash
# Compile multi-stage builder environments and run detached service processes
docker-compose up --build -d
```

* 🌐 **SaaS Frontend Web Application**: `http://localhost:3000` 
* ⚡ **Express Core API Gateway Engine**: `http://localhost:8000/api` 

---

### Option B: Split Manual Execution Layer

#### 1. Provision the Backend Engine Server

```bash
cd backend
npm install
```

Create a standard local development environment configuration file at `backend/.env`:

```env
PORT=8000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zenith?schema=public"
JWT_SECRET="super-secret-zenith-jwt-key-2026-wow"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"
RESEND_API_KEY="YOUR_RESEND_API_KEY_HERE"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="YOUR_STRIPE_WEBHOOK_SECRET_HERE"
CORS_ORIGIN="http://localhost:3000"
```

Sync database relational schemas and trigger the idempotent development seeding engine:

```bash
# Push Prisma schema blueprints to active database instance
npx prisma db push

# Load standard organization tenants, checklist items, and markdown docs
npm run seed
```

Boot the API development server environment:

```bash
npm run dev
```

#### 2. Provision the Next.js Frontend Client

```bash
cd ../frontend
npm install
```

Create the public client build configuration template at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:8000"
```

Execute the application client compiler:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🔐 Pre-Seeded Development Credentials

Zenith's seeding engine handles rapid testing out of the box by preloading profiles with pre-mapped projects:

*   **Lead Product Architect / Admin Guard**:
    *   📧 **Email address**: `lead@zenith.com` 
    *   🔑 **Password string**: `password123` 
*   **Software Engineer / Team Member Profile**:
    *   📧 **Email address**: `developer@zenith.com` 
    *   🔑 **Password string**: `password123` 

---

## 📝 Centralized API Router Blueprint

<details>
<summary>🔑 Authentication & Profiles</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Compiles profiles and provisions a unique default workspace |
| `POST` | `/api/auth/login` | Validates credentials and returns sessional JWT signature keys |
| `GET` | `/api/auth/me` | Fetches active identity scopes and sessional tenant mappings |
| `PUT` | `/api/auth/profile` | Synchronizes user names, passwords, and custom avatar indicators |

</details>

<details>
<summary>🏢 Workspace & Project Tenants</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/workspaces` | Provisions an isolated company workspace space |
| `GET` | `/api/workspaces` | Lists all workspaces linked to authenticated users |
| `GET` | `/api/workspaces/:workspaceId/stats` | Aggregates project velocities and global completion metrics |
| `POST` | `/api/workspaces/:workspaceId/invite` | Invites registered users to workspaces with background Resend HTML invites |
| `DELETE` | `/api/workspaces/:workspaceId/members/:userId` | Revokes developer access keys from selected workspace nodes |
| `POST` | `/api/projects` | Creates an independent board task array tracker |
| `GET` | `/api/projects` | Fetches projects linked to active organization context parameters |

</details>

<details>
<summary>📋 Task & Kanban Card Operations</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/tasks` | Creates backlog item nodes populated with sorting indices, triggers assignee emails |
| `PUT` | `/api/tasks/:taskId` | Commits status transitions, lane orders, and assignee updates |
| `DELETE` | `/api/tasks/:taskId` | Purges task entries and cascade deletes matching checklist arrays |
| `POST` | `/api/tasks/:taskId/subtasks` | Appends checklists to manage granular sprint objectives |
| `POST` | `/api/tasks/:taskId/comments` | Posts textual remarks directly to active task discussion streams |
| `POST` | `/api/tasks/:taskId/timer` | Saves logged task focus duration elements directly to database |

</details>

<details>
<summary>📄 Document Wikis</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/documents` | Provisions markdown documents and wiki pages in the workspace |
| `GET` | `/api/documents` | Lists all documents linked to workspace contexts |
| `GET` | `/api/documents/:documentId` | Fetches full markdown document details |
| `PUT` | `/api/documents/:documentId` | Updates markdown documentation titles and content |
| `DELETE` | `/api/documents/:documentId` | Purges documents from the workspace database |

</details>

<details>
<summary>🧠 Google Gemini AI Services</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/ai/generate-tasks` | Evaluates natural language input to assemble ticket backlogs |
| `POST` | `/api/ai/optimize-sprint` | Evaluates current workloads and backlog counts to organize sprints |
| `GET` | `/api/ai/project-summary/:projectId` | Compiles milestone results and evaluates potential blocks |
| `POST` | `/api/ai/summarize-meeting` | Scans text notes to build clear developer requirements checklists |
| `GET` | `/api/ai/workspace-risks/:workspaceId` | Monitors system timelines to flag overload risks |
| `POST` | `/api/ai/solve-bug` | Suggests root-causes and provides formatted code modifications |
| `POST` | `/api/ai/smart-assign` | Suggests optimal candidate assignees for custom ticket tags |
| `GET` | `/api/ai/daily-standup` | Assembles text summaries tracking daily development updates |
| `POST` | `/api/ai/chatbot` | Grounded digital coworker using RAG document rankings |

</details>

<details>
<summary>💳 Monetization & Subscriptions (Stripe)</summary>

| Method | Endpoint | Functional Scope |
| --- | --- | --- |
| `POST` | `/api/billing/checkout` | Initiates safe Stripe Checkout portal sessions for workspace upgrades |
| `GET` | `/api/billing/mock-success` | Sandbox portal to test billing successes and upgrade tiers in development |
| `POST` | `/api/billing/webhook` | Receiver endpoint that captures Stripe subscription completed events |

</details>

---

<div align="center">
  <sub>Built with ❤️ by Gangadhar. Powered by Google Gemini.</sub>
</div>
