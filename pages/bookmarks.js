import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import BookmarkCard from '../components/BookmarkCard';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';

export default function Bookmarks() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [toast, setToast] = useState('');
  const [origin, setOrigin] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/bookmarks');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) setBookmarks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load bookmarks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query?.q !== 'string') return;
    setQuery(router.query.q);
  }, [router.isReady, router.query?.q]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOrigin(window.location.origin);
  }, []);

  const parsedTags = (raw) =>
    raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  const addBookmark = async (e) => {
    e.preventDefault();
    const newBookmark = {
      title,
      url,
      description,
      tags: parsedTags(tags),
    };
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBookmark),
    });
    const created = await res.json();
    if (!res.ok) {
      setToast(created?.error || 'Failed to add bookmark');
      return;
    }
    setBookmarks((prev) => [created, ...prev]);
    setTitle('');
    setUrl('');
    setDescription('');
    setTags('');
    setModalOpen(false);
    setToast('Saved');
  };

  const deleteBookmark = async (id) => {
    const ok = window.confirm('Delete this bookmark?');
    if (!ok) return;

    const res = await fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setToast(body?.error || 'Failed to delete');
      return;
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setToast('Deleted');
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setToast('Copied');
        return;
      }
    } catch (e) {
      // Fall through
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setToast('Copied');
    } catch (e) {
      setToast('Copy failed');
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = bookmarks
    .filter((b) => {
      if (activeTag && !(b.tags || []).includes(activeTag)) return false;
      if (!normalizedQuery) return true;

      const hay = [b.title, b.url, b.description, ...(b.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(normalizedQuery);
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const tagStats = (() => {
    const counts = new Map();
    for (const b of bookmarks) {
      for (const t of b.tags || []) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
  })();

  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Bookmarks</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your personal link library.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
              >
                New bookmark
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <Sidebar
              tags={tagStats}
              activeTag={activeTag}
              totalCount={bookmarks.length}
              onSelectTag={(t) => setActiveTag(t)}
            />

            <section className="min-w-0 flex-1">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search titles, URLs, descriptions, tags"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
                  />
                </div>
                <div className="flex items-center gap-2 md:hidden">
                  <select
                    value={activeTag || ''}
                    onChange={(e) => setActiveTag(e.target.value || null)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
                  >
                    <option value="">All tags</option>
                    {tagStats.map((t) => (
                      <option key={t.tag} value={t.tag}>
                        {t.tag} ({t.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {toast ? (
                <div className="ns-card mb-5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {toast}
                </div>
              ) : null}

              {error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="ns-card p-6 text-sm text-slate-600">
                  Loading bookmarks
                </div>
              ) : filtered.length === 0 ? (
                <div className="ns-card p-6 text-sm text-slate-600">
                  No bookmarks match your filters.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((bm) => {
                    const shareUrl = origin ? `${origin}/b/${bm.id}` : '';
                    return (
                      <BookmarkCard
                        key={bm.id}
                        bookmark={bm}
                        shareUrl={shareUrl}
                        onCopyShare={(text) => copyToClipboard(text)}
                        onDelete={(id) => deleteBookmark(id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Modal open={modalOpen} title="New bookmark" onClose={() => setModalOpen(false)}>
        <form onSubmit={addBookmark} className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export async function getServerSideProps(context) {
  const [{ getServerSession }, { authOptions }] = await Promise.all([
    import('next-auth/next'),
    import('./api/auth/[...nextauth]'),
  ]);

  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: `/login?callbackUrl=${encodeURIComponent('/bookmarks')}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
}