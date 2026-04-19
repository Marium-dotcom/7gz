import { getPublishedAbout } from '@/libs/actions/about';
import Image from 'next/image';
import Link from 'next/link';

export const About = async () => {
  const data = await getPublishedAbout();
  if (!data) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-10 py-24">

        {/* Section label */}
        {(data.sectionTitle || data.sectionSubtitle) && (
          <div className="mb-14">
            {data.sectionSubtitle && (
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#103D48]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
                  {data.sectionSubtitle}
                </span>
              </div>
            )}
            {data.sectionTitle && (
              <h2 className="text-3xl font-extrabold tracking-tight text-black lg:text-4xl">
                {data.sectionTitle}
              </h2>
            )}
          </div>
        )}

        {/* Main layout */}
        <div className={`flex flex-col gap-14 lg:flex-row lg:items-center ${data.image?.url ? 'lg:gap-20' : ''}`}>

          {/* Image */}
          {data.image?.url && (
            <div className="shrink-0 lg:w-[45%]">
              <div className="relative overflow-hidden rounded-3xl bg-[#E5F3FB]">
                <Image
                  src={data.image.url}
                  alt={data.image.alt || ''}
                  width={data.image.width || 720}
                  height={data.image.height || 540}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Text */}
          <div className="flex flex-1 flex-col gap-6">
            {data.heading && (
              <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-black lg:text-4xl">
                {data.heading}
              </h3>
            )}
            {data.subheading && (
              <p className="text-base font-semibold uppercase tracking-widest text-[#103D48]">
                {data.subheading}
              </p>
            )}
            {data.description && (
              <p className="text-base leading-relaxed text-black/60">
                {data.description}
              </p>
            )}
            {data.secondaryDescription && (
              <p className="text-base leading-relaxed text-black/50">
                {data.secondaryDescription}
              </p>
            )}

            {/* Stats */}
            {data.stats && data.stats.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {data.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 rounded-2xl bg-[#E5F3FB] px-5 py-4"
                  >
                    <span className="text-2xl font-extrabold text-[#103D48]">{stat.value}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-black/50">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {data.ctaText && data.ctaLink && (
              <div className="mt-2">
                <Link
                  href={data.ctaLink}
                  className="inline-block bg-[#103D48] px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black"
                >
                  {data.ctaText}
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
