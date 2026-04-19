import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/libs/actions/blog';

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) notFound();

  return (
    <div className="bg-[#E5F3FB] min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-20">

        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {post.tags?.map(tag => (
            <span key={tag} className="rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-teal-600">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold leading-tight text-[#103D48] lg:text-5xl">
          {post.title}
        </h1>

        {/* Byline */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {post.author && <span>{post.author}</span>}
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          )}
          {post.readingTime && <span>{post.readingTime} min read</span>}
        </div>

        {/* Cover image */}
        {post.coverImage?.url && (
          <div className="mt-10 overflow-hidden rounded-3xl shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content mt-10"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

      </article>
    </div>
  );
}
