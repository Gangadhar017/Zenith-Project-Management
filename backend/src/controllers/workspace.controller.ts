import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        memberships: {
          create: {
            userId: req.user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        memberships: true
      }
    });

    return res.status(201).json(workspace);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const listWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const memberships = await prisma.membership.findMany({
      where: { userId: req.user.id },
      include: {
        workspace: {
          include: {
            memberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const workspaces = memberships.map(m => ({
      ...m.workspace,
      userRole: m.role
    }));

    return res.json(workspaces);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Check if the current user has permission (Owner/Admin)
    const currentMember = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: req.user.id, workspaceId } }
    });

    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Only Owners or Admins can invite members.' });
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User with this email not found in Zenith.' });
    }

    // Verify if already member
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: invitedUser.id, workspaceId } }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member of this workspace.' });
    }

    const membership = await prisma.membership.create({
      data: {
        userId: invitedUser.id,
        workspaceId,
        role: role || 'MEMBER'
      },
      include: {
        user: true
      }
    });

    return res.status(201).json(membership);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, userId } = req.params;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const currentMember = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: req.user.id, workspaceId } }
    });

    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Only Owners or Admins can remove members.' });
    }

    // Protect OWNER from removal unless they delete the workspace
    const targetMember = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    if (!targetMember) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    if (targetMember.role === 'OWNER') {
      return res.status(400).json({ message: 'Cannot remove the owner of the workspace.' });
    }

    await prisma.membership.delete({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    return res.json({ message: 'Member successfully removed.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getWorkspaceStats = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;

    const [projectsCount, tasksCount, completedTasksCount, teamCount] = await Promise.all([
      prisma.project.count({ where: { workspaceId } }),
      prisma.task.count({ where: { project: { workspaceId } } }),
      prisma.task.count({
        where: {
          project: { workspaceId },
          status: 'DONE'
        }
      }),
      prisma.membership.count({ where: { workspaceId } })
    ]);

    return res.json({
      projects: projectsCount,
      tasks: tasksCount,
      completedTasks: completedTasksCount,
      teamMembers: teamCount,
      healthScore: tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 100
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
