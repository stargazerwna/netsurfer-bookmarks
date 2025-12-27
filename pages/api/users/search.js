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

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user: targetUser });
    return;
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: 'Method Not Allowed' });
}
