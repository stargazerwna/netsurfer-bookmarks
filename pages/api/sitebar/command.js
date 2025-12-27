import { getServerSession } from 'next-auth/next';

import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseTags(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  // Add CORS headers for browser addon compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const command = typeof req.query?.command === 'string' ? req.query.command.trim() : '';
  
  // Debug logging (you can remove this in production)
  console.log('SiteBar command received:', JSON.stringify(req.query));
  console.log('Parsed command:', JSON.stringify(command));

  // If no command is specified, show available commands
  if (!command) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"/><title>NetSurfer SiteBar</title></head><body style="font-family:system-ui;padding:16px;">
      <h2>NetSurfer SiteBar Commands</h2>
      <p>Available commands:</p>
      <ul>
        <li><a href="/command.php?command=Log In">Log In</a> - Sign in to your account</li>
        <li><a href="/command.php?command=Add Link">Add Link</a> - Add a new bookmark</li>
      </ul>
      <p><a href="/login">Log in via web interface</a></p>
      <p><a href="/bookmarks">Go to bookmarks</a></p>
    </body></html>`);
    return;
  }

  // Handle "Log In" command (case-insensitive)
  if (command.toLowerCase() === 'log in') {
    const callbackUrl = `/command.php?command=${encodeURIComponent('Add Link')}`;
    res.writeHead(302, { Location: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` });
    return res.end();
  }

  if (command.toLowerCase() !== 'add link') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"/><title>NetSurfer</title></head><body style="font-family:system-ui;padding:16px;">
      <h2>Unsupported command</h2>
      <p>Command: ${escapeHtml(command)}</p>
      <p><a href="/login">Log in</a></p>
    </body></html>`);
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    const callbackUrl = `/command.php?command=${encodeURIComponent('Add Link')}&url=${encodeURIComponent(String(req.query?.url || ''))}`;
    res.writeHead(302, { Location: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` });
    return res.end();
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const url = body.url || body.URL || '';
    const title = body.title || body.name || body.Name || '';
    const description = body.description || body.desc || body.Description || '';
    const tags = parseTags(body.tags || body.Tags || '');
    const isPrivate = body.private === '1' || body.private === 'on' || body.is_private === '1';

    if (!url || !title) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(400).send(`<!doctype html><html><head><meta charset="utf-8"/><title>Add Link</title></head><body style="font-family:system-ui;padding:16px;">
        <h2>Missing required fields</h2>
        <p>URL and Link Name are required.</p>
        <p><a href="/command.php?command=${encodeURIComponent('Add Link')}">Back</a></p>
      </body></html>`);
      return;
    }

    await prisma.bookmark.create({
      data: {
        userId: user.id,
        title: String(title),
        url: String(url),
        description: String(description || ''),
        tags: tags.join(','),
        isPublic: !isPrivate,
      },
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"/><title>Saved</title></head><body style="font-family:system-ui;padding:16px;">
      <h2>Saved</h2>
      <p>The link has been saved.</p>
      <p><a href="/bookmarks">Open bookmarks</a></p>
    </body></html>`);
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const prefillUrl = typeof req.query?.url === 'string' ? req.query.url : '';
  const prefillTitle = typeof req.query?.name === 'string' ? req.query.name : '';
  const prefillDesc = typeof req.query?.desc === 'string' ? req.query.desc : '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Add Link</title>
</head>
<body style="font-family:system-ui;padding:16px;max-width:720px;margin:0 auto;">
  <h2>Add Link</h2>
  <form method="POST" action="/command.php?command=${encodeURIComponent('Add Link')}" style="display:grid;gap:12px;">
    <label>URL<br/>
      <input name="url" required value="${escapeHtml(prefillUrl)}" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;" />
    </label>
    <label>Link Name<br/>
      <input name="title" required value="${escapeHtml(prefillTitle)}" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;" />
    </label>
    <label>Description<br/>
      <input name="description" value="${escapeHtml(prefillDesc)}" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;" />
    </label>
    <label>Tags (comma separated)<br/>
      <input name="tags" value="" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;" />
    </label>
    <label style="display:flex;align-items:center;gap:8px;">
      <input type="checkbox" name="private" />
      Private
    </label>
    <button type="submit" style="padding:10px 14px;border-radius:10px;border:0;background:#0f172a;color:#fff;font-weight:600;">Submit</button>
  </form>
</body>
</html>`);
}
