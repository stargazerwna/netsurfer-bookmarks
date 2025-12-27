function IconButton({ title, onClick, children, variant = 'default' }) {
  const cls =
    variant === 'danger'
      ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50';

  return (
    <button
      type="button"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${cls}`}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function BookmarkCard({ bookmark, shareUrl, onCopyShare, onDelete }) {
  let host = '';
  try {
    host = new URL(bookmark.url).hostname.replace(/^www\./, '');
  } catch (e) {
    host = '';
  }

  const badge = (host || 'B').slice(0, 1).toUpperCase();

  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-600 text-sm font-semibold text-white shadow-sm">
              {badge}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-700 dark:text-slate-50 dark:group-hover:text-slate-200">
                {bookmark.title}
              </div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {host || bookmark.url}
              </div>
            </div>
          </div>
        </a>

        <div className="flex shrink-0 items-center gap-1">
          {shareUrl ? (
            <a
              href={`/b/${bookmark.id}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50"
              title="Share"
              aria-label="Share"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 .17 1L8.6 8.08A3 3 0 1 0 8 14l5.17 3.1A3 3 0 1 0 14 16a3 3 0 0 0-.17 1l-5.17-3.1a3 3 0 0 0 0-3.8l5.17-3.08A3 3 0 0 0 16 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : null}

          {shareUrl ? (
            <IconButton title="Copy share link" onClick={() => onCopyShare?.(shareUrl)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 9h10v10H9V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          ) : null}

          {onDelete ? (
            <IconButton title="Delete" variant="danger" onClick={() => onDelete?.(bookmark.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M19 6l-1 14a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9L5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>
          ) : null}
        </div>
      </div>

      {bookmark.description ? (
        <p className="mt-3 text-sm text-slate-600">{bookmark.description}</p>
      ) : null}

      {bookmark.tags && bookmark.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}