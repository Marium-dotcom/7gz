import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getPublishedServices } from '@/libs/actions/service';
import type { IService } from '@/libs/models/service';

export default async function ServicesPage() {
  const data = await getPublishedServices();

  return (
    <div className="min-h-screen bg-[#E5F3FB]">

      <div className="mx-auto max-w-7xl px-10 py-20">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          {data?.sectionSubtitle && (
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#103D48]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
                {data.sectionSubtitle}
              </span>
            </div>
          )}
          <h1 className="text-4xl font-extrabold leading-tight text-[#103D48] lg:text-5xl">
            {data?.sectionTitle ?? 'Our Services'}
          </h1>
          {data?.sectionDescription && (
            <p className="mt-4 text-base leading-relaxed text-black/60">
              {data.sectionDescription}
            </p>
          )}
        </div>

        {/* Grid */}
        {!data || data.services?.length === 0 ? (
          <p className="py-20 text-center text-gray-400">No services available.</p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.services!.map((service, i) => (
              <ServiceCard
                key={i}
                service={service}
                featured={i === Math.floor((data.services?.length ?? 0) / 2)}
              />
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

function ServiceCard({ service, featured }: { service: IService; featured?: boolean }) {
  const inner = featured ? (
    <div className="group flex h-full flex-col items-center rounded-3xl bg-white px-8 py-10 text-center shadow-md transition-transform hover:-translate-y-1">
      {service.icon && (
        <div className="mb-6 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl bg-[#E5F3FB] text-5xl">
          {service.icon.startsWith('http') || service.icon.startsWith('/') ? (
            <Image
              src={service.icon}
              alt=""
              width={300}
              height={300}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <span className="inline-block transition-transform duration-300 group-hover:scale-110">
              {service.icon}
            </span>
          )}
        </div>
      )}
      <h2 className="mb-3 text-xl font-extrabold text-[#103D48]">{service.title}</h2>
      {service.description && (
        <p className="mb-6 flex-1 text-sm leading-relaxed text-[#103D48]/60">
          {service.description}
        </p>
      )}
      {service.link && (
        <span className="mt-auto w-full rounded-xl bg-[#103D48] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors group-hover:bg-black">
          Learn More
        </span>
      )}
    </div>
  ) : (
    <div className="group flex h-full flex-col items-center rounded-3xl bg-white px-8 py-10 text-center transition-all hover:-translate-y-1 hover:shadow-md">
      {service.icon && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#E5F3FB] text-5xl">
          {service.icon.startsWith('http') || service.icon.startsWith('/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.icon}
              alt=""
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <span className="inline-block transition-transform duration-300 group-hover:scale-110">
              {service.icon}
            </span>
          )}
        </div>
      )}
      <h2 className="mb-3 text-xl font-extrabold text-[#103D48]">{service.title}</h2>
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

  return service.link ? <Link href={service.link}>{inner}</Link> : inner;
}
