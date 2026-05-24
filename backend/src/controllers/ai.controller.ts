import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const generateTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required.' });

    const tasks = await AIService.generateTasksFromPrompt(prompt);
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const optimizeSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, backlogTasks, sprintName, teamSize } = req.body;
    if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required.' });

    const result = await AIService.optimizeSprint(workspaceId, backlogTasks || [], sprintName, teamSize || 3);
    
    // Save to AI History logs
    await prisma.aIHistory.create({
      data: {
        featureType: 'SPRINT_PLANNING',
        prompt: `Optimize sprint "${sprintName}" for workspace: ${workspaceId}`,
        response: JSON.stringify(result),
        workspaceId
      }
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getProjectSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await AIService.generateProjectSummary(projectId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const summarizeMeetingNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ message: 'Transcript content is required.' });

    const result = await AIService.summarizeMeetingNotes(transcript);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const detectWorkspaceRisks = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const result = await AIService.detectRisks(workspaceId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getProductivityInsights = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const result = await AIService.getProductivityInsights(req.user.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const solveBugTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Bug title is required.' });

    const result = await AIService.solveBug(title, description || '');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getDeadlinePrediction = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await AIService.predictDeadline(projectId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const smartAssign = async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, workspaceId } = req.body;
    if (!title || !workspaceId) {
      return res.status(400).json({ message: 'Task title and workspaceId are required.' });
    }

    const members = await prisma.membership.findMany({
      where: { workspaceId },
      include: { user: true }
    });

    const candidates = members.map(m => ({ id: m.user.id, name: m.user.name }));
    const result = await AIService.smartAssignTask(title, tags || [], candidates);

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const generateDailyStandup = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const result = await AIService.generateDailyStandup(req.user.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const chatbotAssistant = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, message } = req.body;
    if (!workspaceId || !message) {
      return res.status(400).json({ message: 'workspaceId and message are required.' });
    }

    const result = await AIService.chatWithWorkspace(workspaceId, message);
    
    // Save the message exchanges in DB
    await prisma.message.create({
      data: {
        content: message,
        userId: req.user?.id || '1',
        workspaceId
      }
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
