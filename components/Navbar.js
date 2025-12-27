import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            N
          </span>
          <span className="hidden sm:inline">NetSurfer Bookmarks</span>
          <span className="sm:hidden">NetSurfer</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/bookmarks" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            My bookmarks
          </Link>
          
          {status === 'authenticated' && (
            <Link href="/collections" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              Collections
            </Link>
          )}

          {status === 'authenticated' ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Log out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}