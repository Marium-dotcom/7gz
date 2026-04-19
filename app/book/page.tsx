import { getPublishedDoctors } from '@/libs/actions/doctor';
import Link from 'next/link';
import Image from 'next/image';

export default async function BookPage() {
  const doctors = await getPublishedDoctors();

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto w-full max-w-7xl px-10 py-20">

        {/* Header */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#103D48]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">Find a Doctor</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Book an Appointment</h1>
          <p className="mt-3 text-base text-black/50">Browse our verified specialists and book your visit.</p>
        </div>

        {doctors.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-20 text-center text-sm text-black/40">
            No doctors available at the moment.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <Link
              key={doc._id?.toString()}
              href={`/book/${doc.licenseNumber}`}
              className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Avatar */}
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
                  {doc.city && <p className="truncate text-xs text-black/40">{doc.city}{doc.country ? `, ${doc.country}` : ''}</p>}
                </div>
              </div>

              {/* Bio */}
              {doc.bio && (
                <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-black/50">{doc.bio}</p>
              )}

              {/* Meta */}
              <div className="mt-auto flex items-center justify-between border-t border-[#E5F3FB] pt-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#103D48]">★ {doc.rating?.toFixed(1) ?? '—'}</span>
                  <span className="text-xs text-black/30">({doc.reviewCount ?? 0})</span>
                </div>
                <div className="flex items-center gap-3">
                  {doc.offersOnlineConsultation && (
                    <span className="rounded-full bg-[#E5F3FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#103D48]">Online</span>
                  )}
                  {doc.isVerified && (
                    <span className="rounded-full bg-[#103D48] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Verified</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-black">{doc.consultationFee} <span className="text-xs font-normal text-black/40">{doc.currency}</span></span>
                <span className="text-xs font-semibold text-[#103D48] transition-all group-hover:underline">Book now →</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
