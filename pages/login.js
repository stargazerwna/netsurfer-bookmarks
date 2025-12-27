import { getProviders, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Login() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const callbackUrl = typeof router.query?.callbackUrl === 'string' ? router.query.callbackUrl : '/bookmarks';
    router.replace(callbackUrl);
  }, [router, status]);

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    loadProviders();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-600">
              Use your GitHub or Google account to access your bookmarks.
            </p>

            {session ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                You are already signed in.
              </div>
            ) : (
              <div className="mt-6 grid gap-2">
                {providers?.github ? (
                  <button
                    type="button"
                    onClick={() => signIn('github', { callbackUrl: router.query?.callbackUrl || '/bookmarks' })}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    Continue with GitHub
                  </button>
                ) : null}

                {providers?.google ? (
                  <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: router.query?.callbackUrl || '/bookmarks' })}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Continue with Google
                  </button>
                ) : null}

                <div className="mt-3 text-xs text-slate-500">
                  By continuing, you agree to store bookmarks in this service.
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { 
      providers: JSON.parse(JSON.stringify(providers || {})) 
    },
  };
}
