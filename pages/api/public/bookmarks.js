import { prisma } from '../../../lib/prisma';

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { id } = req.query;
  const numericId = Number(id);
  if (!numericId) {
    res.status(400).json({ error: 'id query parameter is required' });
    return;
  }

  const bookmark = await prisma.bookmark.findFirst({
    where: {
      id: numericId,
      isPublic: true,
    },
  });

  if (!bookmark) {
    res.status(404).json({ error: 'Bookmark not found' });
    return;
  }

  res.status(200).json(serializeBookmark(bookmark));
}
