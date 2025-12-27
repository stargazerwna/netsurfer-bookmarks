import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function PublicBookmarkPage() {
  const router = useRouter();
  const { id } = router.query;

  const [bookmark, setBookmark] = useState(null);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/public/bookmarks?id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setBookmark(data);
        setError('');
      })
      .catch((e) => {
        setBookmark(null);
        setError(e?.message || 'Failed to load bookmark');
      });
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOrigin(window.location.origin);
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Link href="/bookmarks" className="text-sm text-slate-600 hover:text-slate-900">
              Back to bookmarks
            </Link>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              {error}
            </div>
          ) : !bookmark ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Loading
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {bookmark.title}
                  </h1>
                  <div className="mt-1 break-all text-sm text-slate-600">
                    {bookmark.url}
                  </div>
                </div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Open
                </a>
              </div>

              {bookmark.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {bookmark.description}
                </p>
              ) : null}

              {bookmark.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
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

              {origin ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Share link
                  </div>
                  <div className="mt-1 break-all text-sm text-slate-700">{`${origin}/b/${bookmark.id}`}</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
