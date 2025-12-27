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
    const { bookmarkId } = req.body;
    if (!bookmarkId) {
      res.status(400).json({ error: 'Bookmark ID is required' });
      return;
    }

    // Check if bookmark exists and user has access to it
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      }
    });

    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    // Check if bookmark is already in collection
    const existingBookmark = await prisma.collectionBookmark.findUnique({
      where: {
        collectionId_bookmarkId: {
          collectionId: id,
          bookmarkId
        }
      }
    });

    if (existingBookmark) {
      res.status(400).json({ error: 'Bookmark is already in collection' });
      return;
    }

    const collectionBookmark = await prisma.collectionBookmark.create({
      data: {
        collectionId: id,
        bookmarkId
      },
      include: {
        bookmark: true
      }
    });

    res.status(201).json(collectionBookmark);
    return;
  }

  if (req.method === 'DELETE') {
    const { bookmarkId } = req.body;
    if (!bookmarkId) {
      res.status(400).json({ error: 'Bookmark ID is required' });
      return;
    }

    await prisma.collectionBookmark.delete({
      where: {
        collectionId_bookmarkId: {
          collectionId: id,
          bookmarkId
        }
      }
    });

    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
