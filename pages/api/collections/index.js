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

  if (req.method === 'GET') {
    // Get collections where user is owner or member
    const collections = await prisma.collection.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { 
            members: {
              some: { userId: user.id }
            }
          }
        ]
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
        bookmarks: {
          include: {
            bookmark: true
          }
        },
        _count: {
          select: {
            bookmarks: true,
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(collections);
    return;
  }

  if (req.method === 'POST') {
    const { name, description, isPublic } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Collection name is required' });
      return;
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        isPublic: Boolean(isPublic),
        ownerId: user.id
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

    res.status(201).json(collection);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
