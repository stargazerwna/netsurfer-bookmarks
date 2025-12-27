import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from 'lib/prisma';

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

  if (req.method === 'POST') {
    if (collection.ownerId !== user.id) {
      res.status(403).json({ error: 'Only collection owner can add members' });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.collectionMember.findUnique({
      where: {
        collectionId_userId: {
          collectionId: id,
          userId
        }
      }
    });

    if (existingMember) {
      res.status(400).json({ error: 'User is already a member' });
      return;
    }

    const member = await prisma.collectionMember.create({
      data: {
        collectionId: id,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(member);
    return;
  }

  if (req.method === 'DELETE') {
    if (collection.ownerId !== user.id) {
      res.status(403).json({ error: 'Only collection owner can remove members' });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await prisma.collectionMember.delete({
      where: {
        collectionId_userId: {
          collectionId: id,
          userId
        }
      }
    });

    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
