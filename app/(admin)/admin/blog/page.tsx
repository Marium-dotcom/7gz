import Link from 'next/link';
import { getAdminBlogs } from '@/libs/actions/blog';
import BlogListClient from './BlogListClient';

export default async function AdminBlogPage() {
  const { posts } = await getAdminBlogs(1, 50);

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and publish your blog content.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-2xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-800"
        >
          + New Post
        </Link>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BlogListClient initialPosts={posts as any} />
    </div>
  );
}
