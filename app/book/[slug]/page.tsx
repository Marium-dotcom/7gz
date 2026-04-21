import { getPublishedDoctorBySlug } from '@/libs/actions/doctor';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BookingWidget from './BookingWidget';
import MessageDoctorButton from '@/components/message-doctor-button';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

export default async function DoctorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [doc, session] = await Promise.all([getPublishedDoctorBySlug(slug), auth()]);
  if (!doc) notFound();

  const isOwner = session?.user?.role === 'doctor' && doc.licenseNumber === slug;
  const isPatient = session?.user?.role === 'user';
  const availableDays = (doc.availability ?? []).filter((a) => a.isAvailable);

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto w-full max-w-5xl px-10 py-20 space-y-8">

        {/* Hero card */}
        <div className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-sm sm:flex-row sm:items-start">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#E5F3FB]">
            {doc.avatar ? (
              <Image src={doc.avatar} alt={doc.displayName ?? ''} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#103D48]">
                {doc.displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-black">{doc.displayName}</h1>
              {doc.isVerified && (
                <span className="rounded-full bg-[#103D48] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Verified</span>
              )}
            </div>
            <p className="font-semibold text-[#103D48]">{doc.specialty}</p>
            {doc.subspecialties && doc.subspecialties.length > 0 && (
              <p className="text-xs text-black/50">{doc.subspecialties.join(' · ')}</p>
            )}
            {doc.city && (
              <p className="mt-1 text-sm text-black/40">{doc.city}{doc.country ? `, ${doc.country}` : ''}</p>
            )}
            {doc.bio && <p className="mt-3 text-sm leading-relaxed text-black/60">{doc.bio}</p>}

            {isOwner && (
              <Link
                href="/dashboard/profile"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#103D48]/30 px-4 py-2 text-xs font-bold text-[#103D48] transition-colors hover:bg-[#E5F3FB]"
              >
                ✎ Edit Profile
              </Link>
            )}
            {isPatient && (
              <MessageDoctorButton doctorId={doc._id!.toString()} />
            )}

            {/* Stats strip */}
            <div className="mt-4 flex flex-wrap gap-4">
              <Stat label="Experience" value={`${doc.yearsOfExperience ?? 0} yrs`} />
              <Stat label="Rating" value={`★ ${doc.rating?.toFixed(1) ?? '—'} (${doc.reviewCount ?? 0})`} />
              <Stat label="Fee" value={`${doc.consultationFee} ${doc.currency}`} />
              {doc.offersOnlineConsultation && (
                <Stat label="Online Fee" value={`${doc.onlineFee ?? 0} ${doc.currency}`} />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Education */}
            {doc.education && doc.education.length > 0 && (
              <Section title="Education">
                {doc.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-[#E5F3FB] px-5 py-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#103D48]" />
                    <div>
                      <p className="font-semibold text-black">{edu.degree}</p>
                      <p className="text-xs text-black/50">{edu.institution} · {edu.year}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Experience */}
            {doc.experience && doc.experience.length > 0 && (
              <Section title="Experience">
                {doc.experience.map((exp, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-[#E5F3FB] px-5 py-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#103D48]" />
                    <div>
                      <p className="font-semibold text-black">{exp.title}</p>
                      <p className="text-xs text-black/50">{exp.workplace} · {exp.from}–{exp.isCurrent ? 'Present' : exp.to}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Availability */}
            {availableDays.length > 0 && (
              <Section title="Availability">
                {DAYS.filter((d) => availableDays.find((a) => a.day === d)).map((day) => {
                  const slot = availableDays.find((a) => a.day === day)!;
                  return (
                    <div key={day} className="flex items-center justify-between rounded-xl bg-[#E5F3FB] px-4 py-2.5">
                      <span className="text-xs font-semibold capitalize text-black">{day}</span>
                      <span className="text-xs text-black/50">{slot.from} – {slot.to}</span>
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Languages */}
            {doc.languages && doc.languages.length > 0 && (
              <Section title="Languages">
                <div className="flex flex-wrap gap-2">
                  {doc.languages.map((lang, i) => (
                    <span key={i} className="rounded-full bg-[#E5F3FB] px-3 py-1 text-xs font-semibold text-[#103D48]">{lang}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Contact */}
            <Section title="Contact">
              {doc.clinicName && <p className="text-sm font-semibold text-black">{doc.clinicName}</p>}
              {doc.clinicAddress && <p className="text-xs text-black/50">{doc.clinicAddress}</p>}
              {doc.phone && (
                <a href={`tel:${doc.phone}`} className="mt-2 inline-block text-sm font-bold text-[#103D48] hover:underline">
                  {doc.phone}
                </a>
              )}
            </Section>

            {/* Booking widget */}
            <BookingWidget
              doctorId={doc._id!.toString()}
              availability={doc.availability ?? []}
              appointmentDuration={doc.appointmentDuration ?? 30}
              offersOnlineConsultation={doc.offersOnlineConsultation ?? false}
              fee={doc.consultationFee ?? 0}
              onlineFee={doc.onlineFee}
              currency={doc.currency ?? 'EGP'}
              isLoggedIn={!!session?.user}
            />

          </div>
        </div>

      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-[#E5F3FB] px-4 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-black/40">{label}</span>
      <span className="text-sm font-bold text-[#103D48]">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">
      <div className="border-b border-[#E5F3FB] bg-[#E5F3FB] px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#103D48]">{title}</h2>
      </div>
      <div className="space-y-2 p-5">{children}</div>
    </div>
  );
}
