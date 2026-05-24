import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, coverImage, status, priority, deadline, tags } = req.body;
    const { workspaceId } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: 'Name and workspaceId are required.' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
        status: status || 'PLANNING',
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        tags: tags || [],
        workspaceId
      }
    });

    return res.status(201).json(project);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const listProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId query parameter is required.' });
    }

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId as string,
        isArchived: false
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(projects);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: true,
        tasks: {
          include: {
            subtasks: true,
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true
              }
            },
            reporter: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.json(project);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, coverImage, status, priority, deadline, tags, isStarred, isArchived } = req.body;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        coverImage,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
        tags,
        isStarred,
        isArchived
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    await prisma.project.delete({
      where: { id: projectId }
    });

    return res.json({ message: 'Project successfully deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
