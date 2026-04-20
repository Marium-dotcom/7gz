import { getVerifiedDoctors } from '@/libs/actions/doctor';
import Image from 'next/image';
import Link from 'next/link';

export const VerifiedDoctors = async () => {
  const doctors = await getVerifiedDoctors(6);
  if (doctors.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-10 py-24">

      {/* Header */}
      <div className="mb-14 flex items-end justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#103D48]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
              Our Specialists
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-black lg:text-4xl">
            Meet Our Verified Doctors
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/60">
            Board-certified specialists ready to help you feel your best.
          </p>
        </div>
        <Link
          href="/book"
          className="hidden shrink-0 rounded-xl border border-[#103D48]/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#103D48] transition-colors hover:bg-[#103D48] hover:text-white sm:block"
        >
          View all →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc) => (
          <Link
            key={doc._id?.toString()}
            href={`/book/${doc.licenseNumber}`}
            className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            {/* Avatar + name */}
            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#E5F3FB]">
                {doc.avatar ? (
                  <Image src={doc.avatar} alt={doc.displayName ?? ''} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#103D48]">
                    {doc.displayName?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-black">{doc.displayName}</p>
                <p className="truncate text-xs font-semibold text-[#103D48]">{doc.specialty}</p>
                {doc.city && (
                  <p className="truncate text-xs text-black/40">
                    {doc.city}{doc.country ? `, ${doc.country}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {doc.bio && (
              <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-black/50">{doc.bio}</p>
            )}

            {/* Meta row */}
            <div className="mt-auto flex items-center justify-between border-t border-[#E5F3FB] pt-4">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#103D48]">★ {doc.rating?.toFixed(1) ?? '—'}</span>
                <span className="text-xs text-black/30">({doc.reviewCount ?? 0})</span>
              </div>
              <div className="flex items-center gap-2">
                {doc.offersOnlineConsultation && (
                  <span className="rounded-full bg-[#E5F3FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#103D48]">
                    Online
                  </span>
                )}
                <span className="rounded-full bg-[#103D48] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Verified
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-black">
                {doc.consultationFee}{' '}
                <span className="text-xs font-normal text-black/40">{doc.currency}</span>
              </span>
              <span className="text-xs font-semibold text-[#103D48] transition-all group-hover:underline">
                Book now →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile view-all */}
      <div className="mt-10 text-center sm:hidden">
        <Link
          href="/book"
          className="inline-block rounded-xl border border-[#103D48]/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#103D48] transition-colors hover:bg-[#103D48] hover:text-white"
        >
          View all doctors →
        </Link>
      </div>

    </section>
  );
};
