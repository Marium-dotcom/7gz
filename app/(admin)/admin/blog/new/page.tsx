import Link from 'next/link';
import BlogForm from '../blogForm';

export default function NewBlogPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm text-gray-400 hover:text-gray-600">
          ← Blog Posts
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-semibold text-gray-900">New Post</h1>
      </div>

      <BlogForm mode="create" />
    </div>
  );
}
