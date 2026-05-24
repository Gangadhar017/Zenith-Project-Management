import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const API_BASE = 'http://localhost:8000/api';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  userRole?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  tags: string[];
  isStarred: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  order: number;
  tags: string[];
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  assignee?: { id: string; name: string; image?: string };
  subtasks: Array<{ id: string; title: string; isCompleted: boolean }>;
}

interface Document {
  id: string;
  title: string;
  content: string;
  isWiki: boolean;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  documents: Document[];
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description: string) => Promise<void>;
  
  fetchProjects: (workspaceId: string) => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (data: Partial<Project> & { workspaceId: string }) => Promise<void>;
  toggleStarProject: (projectId: string) => Promise<void>;

  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: Partial<Task> & { projectId: string }) => Promise<void>;
  updateTaskOptimistic: (taskId: string, updates: Partial<Task>) => void;
  saveTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  fetchDocuments: (workspaceId: string) => Promise<void>;
  createDocument: (title: string, content: string, isWiki: boolean, workspaceId: string) => Promise<void>;
  updateDocument: (docId: string, title: string, content: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  return {
    workspaces: [],
    currentWorkspace: null,
    projects: [],
    currentProject: null,
    tasks: [],
    documents: [],
    isLoading: false,

    fetchWorkspaces: async () => {
      set({ isLoading: true });
      try {
        const res = await fetch(`${API_BASE}/workspaces`, { headers: getHeaders() });
        const data = await res.json();
        if (res.ok) {
          set({ workspaces: data });
          if (data.length > 0 && !get().currentWorkspace) {
            const ws = data[0];
            set({ currentWorkspace: ws });
            get().fetchProjects(ws.id);
            get().fetchDocuments(ws.id);
          }
        }
      } catch (err) {
        console.error('Fetch workspaces failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    selectWorkspace: (workspace) => {
      set({ currentWorkspace: workspace, projects: [], currentProject: null, tasks: [] });
      get().fetchProjects(workspace.id);
      get().fetchDocuments(workspace.id);
    },

    createWorkspace: async (name, description) => {
      try {
        const res = await fetch(`${API_BASE}/workspaces`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name, description })
        });
        if (res.ok) {
          await get().fetchWorkspaces();
        }
      } catch (err) {
        console.error('Create workspace failed:', err);
      }
    },

    fetchProjects: async (workspaceId) => {
      try {
        const res = await fetch(`${API_BASE}/projects?workspaceId=${workspaceId}`, { headers: getHeaders() });
        const data = await res.json();
        if (res.ok) {
          set({ projects: data });
        }
      } catch (err) {
        console.error('Fetch projects failed:', err);
      }
    },

    selectProject: async (projectId) => {
      set({ isLoading: true });
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, { headers: getHeaders() });
        const data = await res.json();
        if (res.ok) {
          set({ currentProject: data, tasks: data.tasks || [] });
        }
      } catch (err) {
        console.error('Fetch project details failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    createProject: async (projData) => {
      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(projData)
        });
        if (res.ok && get().currentWorkspace) {
          await get().fetchProjects(get().currentWorkspace!.id);
        }
      } catch (err) {
        console.error('Create project failed:', err);
      }
    },

    toggleStarProject: async (projectId) => {
      const proj = get().projects.find(p => p.id === projectId);
      if (!proj) return;
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ isStarred: !proj.isStarred })
        });
        if (res.ok && get().currentWorkspace) {
          await get().fetchProjects(get().currentWorkspace!.id);
        }
      } catch (err) {
        console.error('Toggle project star failed:', err);
      }
    },

    fetchTasks: async (projectId) => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, { headers: getHeaders() });
        const data = await res.json();
        if (res.ok) {
          set({ tasks: data.tasks || [] });
        }
      } catch (err) {
        console.error('Fetch tasks failed:', err);
      }
    },

    createTask: async (taskData) => {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(taskData)
        });
        if (res.ok && get().currentProject) {
          await get().fetchTasks(get().currentProject!.id);
        }
      } catch (err) {
        console.error('Create task failed:', err);
      }
    },

    updateTaskOptimistic: (taskId, updates) => {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      }));
    },

    saveTaskUpdate: async (taskId, updates) => {
      try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updates)
        });
        if (!res.ok) {
          // Revert if error
          if (get().currentProject) {
            await get().fetchTasks(get().currentProject!.id);
          }
        }
      } catch (err) {
        console.error('Save task update failed:', err);
        if (get().currentProject) {
          await get().fetchTasks(get().currentProject!.id);
        }
      }
    },

    deleteTask: async (taskId) => {
      try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok && get().currentProject) {
          await get().fetchTasks(get().currentProject!.id);
        }
      } catch (err) {
        console.error('Delete task failed:', err);
      }
    },

    fetchDocuments: async (workspaceId) => {
      try {
        const res = await fetch(`${API_BASE}/documents?workspaceId=${workspaceId}`, { headers: getHeaders() });
        const data = await res.json();
        if (res.ok) {
          set({ documents: data });
        }
      } catch (err) {
        console.error('Fetch documents failed:', err);
      }
    },

    createDocument: async (title, content, isWiki, workspaceId) => {
      try {
        const res = await fetch(`${API_BASE}/documents`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ title, content, isWiki, workspaceId })
        });
        if (res.ok) {
          await get().fetchDocuments(workspaceId);
        }
      } catch (err) {
        console.error('Create document failed:', err);
      }
    },

    updateDocument: async (docId, title, content) => {
      try {
        const res = await fetch(`${API_BASE}/documents/${docId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ title, content })
        });
        if (res.ok && get().currentWorkspace) {
          await get().fetchDocuments(get().currentWorkspace!.id);
        }
      } catch (err) {
        console.error('Update document failed:', err);
      }
    }
  };
});
