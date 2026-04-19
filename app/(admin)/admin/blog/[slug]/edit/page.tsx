import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminBlogBySlug } from '@/libs/actions/blog';
import BlogForm from '../../blogForm';

type Props = { params: Promise<{ slug: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params;
  const post = await getAdminBlogBySlug(slug);

  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm text-gray-400 hover:text-gray-600">
          ← Blog Posts
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-semibold text-gray-900 line-clamp-1">{post.title}</h1>
      </div>

      <BlogForm mode="edit" initialData={post} />
    </div>
  );
}
