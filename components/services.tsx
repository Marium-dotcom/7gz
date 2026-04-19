import { getPublishedServices } from '@/libs/actions/service';
import Link from 'next/link';

export const Services = async () => {
  const data = await getPublishedServices();
  if (!data) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-10 py-24 bg-[#E5F3FB]">

      {/* Header */}
      {(data.sectionTitle || data.sectionSubtitle) && (
        <div className="mb-14 max-w-2xl">
          {data.sectionSubtitle && (
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-white" />
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
          {data.sectionDescription && (
            <p className="mt-4 text-base leading-relaxed text-black/60">
              {data.sectionDescription}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      {data.services && data.services.length > 0 && (
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.services.map((service, i) => (
            <ServiceCard key={i} service={service} featured={i === Math.floor((data.services?.length ?? 0) / 2)} />
          ))}
        </div>
      )}

    </section>
  );
};

type Service = NonNullable<Awaited<ReturnType<typeof getPublishedServices>>>['services'][number];

function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  const card = featured ? (
    <div className="group  flex h-full flex-col items-center rounded-3xl bg-white px-8 py-10 text-center  shadow-[#103D48]/40 transition-transform hover:-translate-y-1">
      {service.icon && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-5xl">
          {service.icon.startsWith('http') || service.icon.startsWith('/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={service.icon} alt="" className=" object-contain" />
          ) : (
            <span>{service.icon}</span>
          )}
        </div>
      )}
      <h3 className="mb-3 text-xl font-extrabold text-[#103D48]">{service.title}</h3>
      {service.description && (
        <p className="mb-6 flex-1 text-sm leading-relaxed text-[#103D48]/60">{service.description}</p>
      )}
      {/* dot indicators */}
      <div className="mb-6 flex gap-1.5">
        <span className="h-1.5 w-4 rounded-full bg-white" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
      </div>
      {service.link && (
        <span className="w-full rounded-xl bg-[#103D48] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors ">
          Learn More
        </span>
      )}
    </div>
  ) : (
    <div className="group flex h-full flex-col items-center rounded-3xl bg-white px-8 py-10 text-center  transition-all hover:-translate-y-1  hover:shadow-[#103D48]/10">
      {service.icon && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#E5F3FB] text-5xl">
          {service.icon.startsWith('http') || service.icon.startsWith('/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={service.icon} alt="" className="h-32 w-32 object-contain" />
          ) : (
            <span>{service.icon}</span>
          )}
        </div>
      )}
      <h3 className="mb-3 text-xl font-extrabold text-[#103D48]">{service.title}</h3>
      {service.description && (
        <p className="flex-1 text-sm leading-relaxed text-black/50">{service.description}</p>
      )}
      {service.link && (
        <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2F5795] transition-all group-hover:gap-2.5">
          <span>Learn more</span>
          <span>→</span>
        </div>
      )}
    </div>
  );

  return service.link ? <Link href={service.link}>{card}</Link> : card;
}
