'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteBlog, togglePublishBlog } from '@/libs/actions/blog';
import type { IBlog } from '@/libs/models/blog';

type Post = Partial<IBlog> & { _id: string; slug: string; title: string; isPublished: boolean; updatedAt?: string };

export default function BlogListClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [pending, startTransition] = useTransition();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  function handleToggle(slug: string, current: boolean) {
    setBusySlug(slug);
    startTransition(async () => {
      await togglePublishBlog(slug, !current);
      setPosts(prev => prev.map(p => p.slug === slug ? { ...p, isPublished: !current } : p));
      setBusySlug(null);
    });
  }

  function handleDelete(slug: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusySlug(slug);
    startTransition(async () => {
      await deleteBlog(slug);
      setPosts(prev => prev.filter(p => p.slug !== slug));
      setBusySlug(null);
    });
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <p className="text-sm font-medium text-gray-400">No posts yet</p>
        <p className="mt-1 text-xs text-gray-300">Create your first blog post above</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Title</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Author</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Updated</th>
            <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map(post => {
            const isBusy = pending && busySlug === post.slug;
            return (
              <tr key={post._id} className="transition-colors hover:bg-gray-50/60">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">/{post.slug}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${post.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500">{post.author || '—'}</td>
                <td className="px-4 py-4 text-gray-400 text-xs">
                  {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggle(post.slug, post.isPublished)}
                      disabled={isBusy}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        post.isPublished
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {post.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug, post.title)}
                      disabled={isBusy}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
