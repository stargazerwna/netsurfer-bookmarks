// Simple in-memory/bookmarks file storage for demonstration purposes.
// In a real application you would connect to a database.

import { getServerSession } from 'next-auth/next';
import { prisma } from '../../lib/prisma';
import { authOptions } from './auth/[...nextauth]';

function normalizeTags(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((t) => String(t).trim()).filter(Boolean);
  return String(input)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function serializeBookmark(bm) {
  return {
    id: bm.id,
    title: bm.title,
    url: bm.url,
    description: bm.description,
    tags: bm.tags ? bm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    isPublic: bm.isPublic,
    createdAt: bm.createdAt,
    updatedAt: bm.updatedAt,
  };
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(bookmarks.map(serializeBookmark));
  } else if (req.method === 'POST') {
    const { title, url, description = '', tags = [], isPublic = true } = req.body || {};
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const normalized = normalizeTags(tags);
    const created = await prisma.bookmark.create({
      data: {
        userId: user.id,
        title: String(title),
        url: String(url),
        description: String(description || ''),
        tags: normalized.join(','),
        isPublic: Boolean(isPublic),
      },
    });

    return res.status(201).json(serializeBookmark(created));
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    const numericId = Number(id);
    if (!numericId) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    const existing = await prisma.bookmark.findFirst({ where: { id: numericId, userId: user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await prisma.bookmark.delete({ where: { id: numericId } });
    return res.status(200).json({ ok: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}