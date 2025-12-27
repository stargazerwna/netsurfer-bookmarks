import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Collection ID is required' });
    return;
  }

  // Check if user has access to this collection
  const collection = await prisma.collection.findFirst({
    where: {
      id,
      OR: [
        { ownerId: user.id },
        { 
          members: {
            some: { userId: user.id }
          }
        }
      ]
    }
  });

  if (!collection) {
    res.status(404).json({ error: 'Collection not found' });
    return;
  }

  if (req.method === 'GET') {
    const fullCollection = await prisma.collection.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        bookmarks: {
          include: {
            bookmark: true
          },
          orderBy: { addedAt: 'desc' }
        }
      }
    });

    res.status(200).json(fullCollection);
    return;
  }

  if (req.method === 'PUT') {
    if (collection.ownerId !== user.id) {
      res.status(403).json({ error: 'Only collection owner can edit' });
      return;
    }

    const { name, description, isPublic } = req.body;

    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || '' }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) })
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            bookmarks: true,
            members: true
          }
        }
      }
    });

    res.status(200).json(updatedCollection);
    return;
  }

  if (req.method === 'DELETE') {
    if (collection.ownerId !== user.id) {
      res.status(403).json({ error: 'Only collection owner can delete' });
      return;
    }

    await prisma.collection.delete({
      where: { id }
    });

    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
