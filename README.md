# Zenith - Enterprise-Grade AI-Powered Project Management SaaS Platform

Zenith is a premium, high-velocity, dark-mode-first Silicon Valley style agile project management platform designed to perform better than Jira, Trello, and ClickUp. It pairs a beautiful glassmorphic Next.js 15 App Router frontend with a robust Node/Express/Socket.io backend, unified database schema maps via Prisma, and **11 distinct context-aware Gemini AI modules**.

---

## 🌟 Key Features

1. **Authentication & Multi-Tenancy**: Standard credentials register/login secure sessions utilizing HTTP-only JWTs, mapping custom profile images, workspaces allocations, and role-based memberships (OWNER, ADMIN, MEMBER, VIEWER).
2. **Dynamic Kanban Board**: Infinite scroll, drag-and-drop status lane changes (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) featuring **optimistic UI updates** for instant client-side card changes.
3. **Socket.io Synchronization**: Instant multi-user collaborative sync, display active typing indicators inside card comments, and coordinate live presence cursors.
4. **Agile Sprints Planner**: Schedule backlog points capacity workloads dynamically.
5. **Knowledge Wikis Doc Tool**: Share corporate resources and team guides inside Markdown text pages.
6. **11 Gemini AI Suite Modules**:
   - **Prompt-to-Tasks**: Type simple requirements (e.g. "Create NextJS auth routes") and auto-create structured tasks with sub-checklists.
   - **Sprint Planning**: Allocate capacity priorities dynamically.
   - **AI Project Summary**: Executives overview metrics reports.
   - **Meeting Summarizer**: Convert raw text video standup transcripts directly into backlog action cards.
   - **Risk Shield Detection**: Scans deadline overlaps and bottlenecks.
   - **Productivity Insights**: Personal efficiency scorecard advice.
   - **AI Bug Solver**: Draft proposed root-causes and actual code fixes for bug tasks.
   - **Deadline Predictor**: Sprint completion dates estimations.
   - **Smart Assign**: Auto-recommend assignees matching task skill tags.
   - **Daily Standup**: Aggregates what you did yesterday, today, and blockers.
   - **Workspace Chatbot Sidebar**: A persistent workspace brain answering queries about boards.

---

## 📂 Project Structure

```
d:/Project_Management/
├── frontend/                  # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/               # Pages & Views (Landing, Dashboard, Board, Wikis, Sprints)
│   │   ├── components/        # Glassmorphic UI containers
│   │   ├── store/             # Zustand state managers (Auth, Workspaces, Sockets)
│   │   └── lib/               # Utility functions
│   └── package.json
└── backend/                   # Express TypeScript Sockets Backend
    ├── src/
    │   ├── controllers/       # Route request handlers
    │   ├── middlewares/       # JWT Auth RBAC security
    │   ├── routes/            # Unified api router
    │   ├── services/          # Gemini AI API services
    │   ├── sockets/           # Presence cursors & typing sync
    │   └── server.ts          # Express launcher
    ├── prisma/
    │   ├── schema.prisma      # Prisma Postgres Schema
    │   └── seed.ts            # Seeding scripts
    └── package.json
```

---

## 🚀 Execution & Setup Guide

### Method A: Docker Multi-Container Compose (Recommended)
Launch Postgres, Express Backend, and Next.js Frontend with one command:
```bash
# From root directory (d:/Project_Management)
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Express API: `http://localhost:8000/api`

---

### Method B: Manual Local Development

#### 1. Setup Postgres Database
Ensure PostgreSQL is running locally, and create a database named `zenith`.

#### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `backend/.env` file:
```env
PORT=8000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zenith?schema=public"
JWT_SECRET="super-secret-zenith-jwt-key-2026-wow"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY" # Optional: beautiful fallbacks included!
CORS_ORIGIN="http://localhost:3000"
```

Sync Database Schemas and Seed Records:
```bash
# Push schema migrations
npx prisma db push

# Load sample workspaces, active sprints, backlog cards, and Wikis
npm run seed
```

Start Development API Server:
```bash
npm run dev
```

#### 3. Configure Frontend
```bash
cd ../frontend
npm install
```
Start Development Next.js Hub:
```bash
npm run dev
```
Open `http://localhost:3000` inside your browser!

---

## 🔐 Credentials for Instantly Seeding Onboarding
Use the seeded credentials to test the platform instantly:
- **Lead Developer Session**:
  - Email: `lead@zenith.com`
  - Password: `password123`
- **Associate Developer Session**:
  - Email: `developer@zenith.com`
  - Password: `password123`

---

## 📝 Express API Schema Reference

| HTTP Method | Route Endpoint | Purpose |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create user profile & default personal workspace |
| **POST** | `/api/auth/login` | Secure JWT sessional login |
| **POST** | `/api/workspaces` | Provision tenant workspace group |
| **GET** | `/api/workspaces/:workspaceId/stats` | Calculate project health & statistics |
| **POST** | `/api/projects` | Provision project scrum task board |
| **POST** | `/api/tasks` | Create Kanban card with order sorting |
| **PUT** | `/api/tasks/:taskId` | Save drag-and-drop status changes |
| **POST** | `/api/tasks/:taskId/comments` | Post comments inside chat streams |
| **POST** | `/api/tasks/:taskId/timer` | Log Pomodoro deep focus session duration |
| **POST** | `/api/ai/optimize-sprint` | Optimize sprint Backlog workloads with AI |
| **POST** | `/api/ai/solve-bug` | Suggest bug proposed root-causes and code fixes |
| **POST** | `/api/ai/chatbot` | PERSISTENT chat with workspace context |
