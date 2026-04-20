import { getPublishedAbout } from '@/libs/actions/about';
import Image from 'next/image';

export const About = async () => {
  const data = await getPublishedAbout();
  if (!data) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-10 py-24">

        {/* Tagline */}
        {data.sectionSubtitle && (
          <div className=" max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#103D48]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
                {data.sectionSubtitle}
              </span>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center">

          {/* Image */}
          {data.image?.url && (
            <div className="shrink-0 lg:w-[45%]">
              <div className="overflow-hidden rounded-3xl bg-[#E5F3FB]">
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

          {/* Text block */}
          <div className="flex flex-1 flex-col gap-5">

            {data.heading && (
              <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-black lg:text-3xl">
                {data.heading}
              </h3>
            )}

            {data.description && (
              <p className="text-base leading-relaxed text-black/60">
                {data.description}
              </p>
            )}

            {/* Stats (Experience) */}
            {data.stats && data.stats.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {data.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-3xl bg-[#E5F3FB] px-5 py-4">
                    <span className="text-2xl font-extrabold text-[#103D48]">{stat.value}</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-black/40">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};
