import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { EmailService } from '../services/email.service';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, tags, projectId, sprintId, assigneeId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required.' });
    }

    // Get max order in task group to put it at the end
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: status || 'TODO' },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastTask ? lastTask.order + 100 : 100;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        order: nextOrder,
        tags: tags || [],
        projectId,
        sprintId: sprintId || null,
        assigneeId: assigneeId || null,
        reporterId: req.user.id
      },
      include: {
        subtasks: true,
        assignee: true
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATE',
        description: `Created task "${title}"`,
        projectId,
        taskId: task.id,
        userId: req.user.id
      }
    });

    // Send task assignment email notification asynchronously
    if (assigneeId) {
      prisma.user.findUnique({
        where: { id: assigneeId },
        select: { email: true, name: true }
      }).then(assignee => {
        if (assignee && assignee.email) {
          prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true }
          }).then(proj => {
            const projectName = proj?.name || 'Zenith Project';
            return EmailService.sendTaskAssignment(
              assignee.email,
              assignee.name,
              title,
              projectName,
              priority || 'MEDIUM'
            );
          }).catch(err => console.error('Failed to fetch project for async assign email:', err));
        }
      }).catch(err => console.error('Failed to fetch assignee for async assign email:', err));
    }

    return res.status(201).json(task);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, order, tags, sprintId, assigneeId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order,
        tags,
        sprintId,
        assigneeId
      },
      include: {
        subtasks: true,
        assignee: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        timeEntries: true
      }
    });

    // Create activity logs for movement/status updates
    if (status && status !== task.status) {
      await prisma.activity.create({
        data: {
          type: 'TASK_MOVE',
          description: `Moved task to "${status}"`,
          projectId: task.projectId,
          taskId: task.id,
          userId: req.user.id
        }
      });
    }

    // Send task assignment email notification asynchronously if assignee changed
    if (assigneeId && assigneeId !== task.assigneeId) {
      prisma.user.findUnique({
        where: { id: assigneeId },
        select: { email: true, name: true }
      }).then(assignee => {
        if (assignee && assignee.email) {
          prisma.project.findUnique({
            where: { id: task.projectId },
            select: { name: true }
          }).then(proj => {
            const projectName = proj?.name || 'Zenith Project';
            return EmailService.sendTaskAssignment(
              assignee.email,
              assignee.name,
              title || task.title,
              projectName,
              priority || task.priority
            );
          }).catch(err => console.error('Failed to fetch project for async update assign email:', err));
        }
      }).catch(err => console.error('Failed to fetch assignee for async update assign email:', err));
    }

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    await prisma.task.delete({ where: { id: taskId } });

    await prisma.activity.create({
      data: {
        type: 'TASK_DELETE',
        description: `Deleted task "${task.title}"`,
        projectId: task.projectId,
        userId: req.user.id
      }
    });

    return res.json({ message: 'Task successfully deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Subtasks
export const addSubtask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId
      }
    });

    return res.status(201).json(subtask);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const toggleSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    const { isCompleted } = req.body;

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    await prisma.subtask.delete({ where: { id: subtaskId } });
    return res.json({ message: 'Subtask successfully deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Comments
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return res.status(201).json(comment);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Time Tracking
export const addTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { duration, description } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!duration) return res.status(400).json({ message: 'Duration (seconds) is required.' });

    const entry = await prisma.timeEntry.create({
      data: {
        duration: parseInt(duration),
        description,
        taskId,
        userId: req.user.id
      }
    });

    return res.status(201).json(entry);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Sprints
export const createSprint = async (req: AuthRequest, res: Response) => {
  try {
    const { name, startDate, endDate, projectId } = req.body;

    if (!name || !startDate || !endDate || !projectId) {
      return res.status(400).json({ message: 'Missing required sprint fields.' });
    }

    const sprint = await prisma.sprint.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
        status: 'UPCOMING'
      }
    });

    return res.status(201).json(sprint);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
