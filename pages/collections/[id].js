import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import BookmarkCard from '../../components/BookmarkCard';

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addBookmarkModalOpen, setAddBookmarkModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [availableBookmarks, setAvailableBookmarks] = useState([]);
  const [selectedBookmark, setSelectedBookmark] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchCollection();
      fetchAvailableBookmarks();
    }
  }, [status, id]);

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data);
      } else if (response.status === 404) {
        router.push('/collections');
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setAvailableBookmarks(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      // Find user by email
      const userResponse = await fetch('/api/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail })
      });

      if (!userResponse.ok) {
        alert('User not found');
        return;
      }

      const { user } = await userResponse.json();

      // Add member to collection
      const response = await fetch(`/api/collections/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        fetchCollection();
        setMemberModalOpen(false);
        setNewMemberEmail('');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const addBookmarkToCollection = async (e) => {
    e.preventDefault();
    if (!selectedBookmark) return;

    try {
      const response = await fetch(`/api/collections/${id}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId: parseInt(selectedBookmark) })
      });

      if (response.ok) {
        fetchCollection();
        setAddBookmarkModalOpen(false);
        setSelectedBookmark('');
      }
    } catch (error) {
      console.error('Failed to add bookmark to collection:', error);
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member from the collection?')) return;

    try {
      const response = await fetch(`/api/collections/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        fetchCollection();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const removeBookmarkFromCollection = async (bookmarkId) => {
    if (!confirm('Remove this bookmark from the collection?')) return;

    try {
      const response = await fetch(`/api/collections/${id}/bookmarks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId })
      });

      if (response.ok) {
        fetchCollection();
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
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
            <h1 className="text-2xl font-semibold mb-4">Collection</h1>
            <p className="text-gray-600 mb-6">Sign in to view this collection</p>
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

  if (!collection) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Collection not found</h1>
            <p className="text-gray-600 mb-6">The collection you're looking for doesn't exist or you don't have access to it.</p>
            <a
              href="/collections"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Back to collections
            </a>
          </div>
        </main>
      </>
    );
  }

  const isOwner = collection.owner.id === session.user.id;
  const bookmarksInCollection = collection.bookmarks.map(cb => cb.bookmark);

  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <a href="/collections" className="hover:text-gray-700">Collections</a>
              <span>→</span>
              <span>{collection.name}</span>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{collection.name}</h1>
                {collection.description && (
                  <p className="mt-1 text-sm text-gray-600">{collection.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span>{bookmarksInCollection.length} bookmarks</span>
                  <span>{collection.members.length + 1} members</span>
                  {collection.isPublic && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Public
                    </span>
                  )}
                </div>
              </div>
              
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddBookmarkModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Add bookmark
                  </button>
                  <button
                    onClick={() => setMemberModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Add member
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {collection.owner.name?.[0] || collection.owner.email?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {collection.owner.name || collection.owner.email}
                  </div>
                  <div className="text-xs text-gray-500">Owner</div>
                </div>
              </div>
              
              {collection.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {member.user.name?.[0] || member.user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-xs text-gray-500">Member</div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => removeMember(member.user.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bookmarks Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookmarks</h2>
            {bookmarksInCollection.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                <p className="text-gray-600 mb-6">Add bookmarks to this collection to get started</p>
                {isOwner && (
                  <button
                    onClick={() => setAddBookmarkModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Add bookmark
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {bookmarksInCollection.map((bookmark) => (
                  <div key={bookmark.id} className="relative">
                    <BookmarkCard bookmark={{...bookmark, tags: bookmark.tags ? bookmark.tags.split(',').filter(Boolean) : []}} />
                    {isOwner && (
                      <button
                        onClick={() => removeBookmarkFromCollection(bookmark.id)}
                        className="absolute top-4 right-4 text-xs text-red-600 hover:text-red-800 bg-white px-2 py-1 rounded shadow"
                      >
                        Remove from collection
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Bookmark Modal */}
      <Modal open={addBookmarkModalOpen} title="Add Bookmark to Collection" onClose={() => setAddBookmarkModalOpen(false)}>
        <form onSubmit={addBookmarkToCollection} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Bookmark
            </label>
            <select
              value={selectedBookmark}
              onChange={(e) => setSelectedBookmark(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-200"
              required
            >
              <option value="">Choose a bookmark...</option>
              {availableBookmarks
                .filter(bookmark => !bookmarksInCollection.find(b => b.id === bookmark.id))
                .map((bookmark) => (
                  <option key={bookmark.id} value={bookmark.id}>
                    {bookmark.title}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setAddBookmarkModalOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add to collection
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={memberModalOpen} title="Add Member" onClose={() => setMemberModalOpen(false)}>
        <form onSubmit={addMember} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-200"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setMemberModalOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add member
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
