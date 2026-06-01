import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limit.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { createWorkspaceSchema, inviteMemberSchema } from '../schemas/workspace.schema';
import * as authCtrl from '../controllers/auth.controller';
import * as wsCtrl from '../controllers/workspace.controller';
import * as projCtrl from '../controllers/project.controller';
import * as taskCtrl from '../controllers/task.controller';
import * as aiCtrl from '../controllers/ai.controller';
import * as docCtrl from '../controllers/document.controller';
import * as billingCtrl from '../controllers/billing.controller';

const router = Router();

// Configure Rate Limit firewalls
const authLimiter = rateLimiter(10, 60 * 1000, 'authentication');
const aiLimiter = rateLimiter(20, 60 * 1000, 'artificial-intelligence');

// ==========================================
// AUTH & USERS
// ==========================================
router.post('/auth/register', authLimiter, validateRequest(registerSchema), authCtrl.register);
router.post('/auth/verify-otp', authLimiter, authCtrl.verifyOTP);
router.post('/auth/login', authLimiter, validateRequest(loginSchema), authCtrl.login);
router.post('/auth/forgot-password', authLimiter, authCtrl.forgotPassword);
router.post('/auth/reset-password', authLimiter, authCtrl.resetPassword);
router.get('/auth/me', authenticateToken, authCtrl.getProfile);
router.put('/auth/profile', authenticateToken, authCtrl.updateProfile);

// ==========================================
// WORKSPACES
// ==========================================
router.post('/workspaces', authenticateToken, validateRequest(createWorkspaceSchema), wsCtrl.createWorkspace);
router.get('/workspaces', authenticateToken, wsCtrl.listWorkspaces);
router.get('/workspaces/:workspaceId/stats', authenticateToken, wsCtrl.getWorkspaceStats);
router.post('/workspaces/:workspaceId/invite', authenticateToken, validateRequest(inviteMemberSchema), wsCtrl.inviteMember);
router.delete('/workspaces/:workspaceId/members/:userId', authenticateToken, wsCtrl.removeMember);

// ==========================================
// PROJECTS
// ==========================================
router.post('/projects', authenticateToken, projCtrl.createProject);
router.get('/projects', authenticateToken, projCtrl.listProjects);
router.get('/projects/:projectId', authenticateToken, projCtrl.getProjectDetails);
router.put('/projects/:projectId', authenticateToken, projCtrl.updateProject);
router.delete('/projects/:projectId', authenticateToken, projCtrl.deleteProject);

// ==========================================
// TASKS & SPRINTS
// ==========================================
router.post('/tasks', authenticateToken, taskCtrl.createTask);
router.put('/tasks/:taskId', authenticateToken, taskCtrl.updateTask);
router.delete('/tasks/:taskId', authenticateToken, taskCtrl.deleteTask);

router.post('/tasks/:taskId/subtasks', authenticateToken, taskCtrl.addSubtask);
router.put('/subtasks/:subtaskId', authenticateToken, taskCtrl.toggleSubtask);
router.delete('/subtasks/:subtaskId', authenticateToken, taskCtrl.deleteSubtask);

router.post('/tasks/:taskId/comments', authenticateToken, taskCtrl.addComment);
router.post('/tasks/:taskId/timer', authenticateToken, taskCtrl.addTimeEntry);

router.post('/sprints', authenticateToken, taskCtrl.createSprint);

// ==========================================
// DOCUMENT WIKIS
// ==========================================
router.post('/documents', authenticateToken, docCtrl.createDocument);
router.get('/documents', authenticateToken, docCtrl.listDocuments);
router.get('/documents/:documentId', authenticateToken, docCtrl.getDocument);
router.put('/documents/:documentId', authenticateToken, docCtrl.updateDocument);
router.delete('/documents/:documentId', authenticateToken, docCtrl.deleteDocument);

// ==========================================
// AI ENGINE MODULES
// ==========================================
router.post('/ai/generate-tasks', authenticateToken, aiLimiter, aiCtrl.generateTasks);
router.post('/ai/optimize-sprint', authenticateToken, aiLimiter, aiCtrl.optimizeSprint);
router.get('/ai/project-summary/:projectId', authenticateToken, aiLimiter, aiCtrl.getProjectSummary);
router.post('/ai/summarize-meeting', authenticateToken, aiLimiter, aiCtrl.summarizeMeetingNotes);
router.get('/ai/workspace-risks/:workspaceId', authenticateToken, aiLimiter, aiCtrl.detectWorkspaceRisks);
router.get('/ai/productivity-insights', authenticateToken, aiLimiter, aiCtrl.getProductivityInsights);
router.post('/ai/solve-bug', authenticateToken, aiLimiter, aiCtrl.solveBugTask);
router.get('/ai/predict-deadline/:projectId', authenticateToken, aiLimiter, aiCtrl.getDeadlinePrediction);
router.post('/ai/smart-assign', authenticateToken, aiLimiter, aiCtrl.smartAssign);
router.get('/ai/daily-standup', authenticateToken, aiLimiter, aiCtrl.generateDailyStandup);
router.post('/ai/chatbot', authenticateToken, aiLimiter, aiCtrl.chatbotAssistant);

// ==========================================
// MONETIZATION & SUBSCRIPTIONS (STRIPE)
// ==========================================
router.post('/billing/checkout', authenticateToken, billingCtrl.checkout);
router.get('/billing/mock-success', billingCtrl.mockSuccess);
router.post('/billing/webhook', billingCtrl.webhook);

export default router;
