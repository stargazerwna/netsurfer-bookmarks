export default async function handler(req, res) {
  const q = typeof req.query?.q === 'string' ? req.query.q : '';
  const url = q ? `/bookmarks?from=sitebar-search&q=${encodeURIComponent(q)}` : '/bookmarks';
  res.writeHead(302, { Location: url });
  res.end();
}
