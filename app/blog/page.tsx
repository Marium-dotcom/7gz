import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getBlogs, getAllTags } from '@/libs/actions/blog';
import type { IBlog } from '@/libs/models/blog';

type Props = { searchParams: Promise<{ page?: string; tag?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = 9;

  const [{ posts, total, totalPages }, allTags] = await Promise.all([
    getBlogs({ page, limit, tags: tag ? [tag] : undefined }),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-10 py-20">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#103D48]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
              From the Blog
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-[#103D48] lg:text-5xl">
            Articles & Insights
          </h1>
          <p className="mt-4 text-base text-gray-500">
            {total} article{total !== 1 ? 's' : ''} published
          </p>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                !tag
                  ? 'border-[#103D48] bg-[#103D48] text-white'
                  : 'border-[#103D48]/30 text-[#103D48] hover:border-[#103D48]'
              }`}
            >
              All
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  tag === t
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-teal-200 text-teal-700 hover:border-teal-600'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {posts.length === 0 ? (
          <p className="py-20 text-center text-gray-400">No articles found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: IBlog) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                {post.coverImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage.url}
                    alt={post.coverImage.alt || post.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-teal-50 to-sky-100" />
                )}

                <div className="flex flex-1 flex-col gap-3 p-6">
                  {post.tags?.length > 0 && (
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
                      {post.tags[0]}
                    </span>
                  )}
                  <h2 className="text-base font-bold leading-snug text-[#103D48] transition-colors group-hover:text-teal-700 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm leading-relaxed text-gray-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    {post.publishedAt && (
                      <time className="text-xs text-gray-400" dateTime={new Date(post.publishedAt).toISOString()}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                    <span className="flex items-center gap-1 text-xs font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/blog?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(page - 1) })}`}
                className="rounded-full border border-[#103D48]/30 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#103D48] transition-colors hover:bg-[#103D48] hover:text-white"
              >
                ← Prev
              </Link>
            )}
            <span className="px-4 text-sm text-gray-400">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/blog?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(page + 1) })}`}
                className="rounded-full bg-[#103D48] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black"
              >
                Next →
              </Link>
            )}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
