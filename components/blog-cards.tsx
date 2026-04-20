import Link from 'next/link';
import { getBlogs } from '@/libs/actions/blog';
import type { IBlog } from '@/libs/models/blog';

export async function BlogCards() {
  const { posts } = await getBlogs({ limit: 6 });

  if (!posts.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-10 py-24 bg-[#E5F3FB]">
      <div className="mb-14 max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-[#103D48]" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
            From the Blog
          </span>
        </div>
        <h2 className="text-3xl font-extrabold leading-tight text-[#103D48] lg:text-4xl">
          Latest Articles
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: IBlog) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            {post.coverImage?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
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
              <h3 className="text-base font-bold leading-snug text-[#103D48] group-hover:text-teal-700 transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center gap-2 pt-2 text-xs font-semibold text-teal-600">
                Read more
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
