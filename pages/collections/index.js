import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';

export default function Collections() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCollections();
    }
  }, [status]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      });

      if (response.ok) {
        const created = await response.json();
        setCollections([created, ...collections]);
        setModalOpen(false);
        setNewCollection({ name: '', description: '', isPublic: false });
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid gap-4">
              {[...Array(3)].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Collections</h1>
            <p className="text-gray-600 mb-6">Sign in to manage your bookmark collections</p>
            <button
              onClick={() => signIn()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Sign in
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Collections</h1>
              <p className="mt-1 text-sm text-gray-600">Organize and share bookmarks with groups</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              New collection
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
              <p className="text-gray-600 mb-6">Create your first collection to organize bookmarks</p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Create collection
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div key={collection.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>{collection._count.bookmarks} bookmarks</span>
                    <span>{collection._count.members} members</span>
                    {collection.isPublic && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Public
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {collection.owner.name?.[0] || collection.owner.email?.[0] || 'U'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700">
                        {collection.owner.name || collection.owner.email}
                      </span>
                    </div>
                    <a
                      href={`/collections/${collection.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal open={modalOpen} title="New Collection" onClose={() => setModalOpen(false)}>
        <form onSubmit={createCollection} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newCollection.name}
              onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newCollection.description}
              onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-200"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={newCollection.isPublic}
              onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make collection public
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
