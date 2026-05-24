import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, isWiki, workspaceId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!title || !workspaceId) {
      return res.status(400).json({ message: 'Title and workspaceId are required.' });
    }

    const doc = await prisma.document.create({
      data: {
        title,
        content: content || '',
        isWiki: isWiki || false,
        workspaceId,
        userId: req.user.id
      }
    });

    return res.status(201).json(doc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const listDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId query parameter is required.' });
    }

    const docs = await prisma.document.findMany({
      where: { workspaceId: workspaceId as string },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { user: { select: { id: true, name: true } } }
    });

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    return res.json(doc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const { title, content, isWiki } = req.body;

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { title, content, isWiki }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    await prisma.document.delete({ where: { id: documentId } });
    return res.json({ message: 'Document successfully deleted.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
