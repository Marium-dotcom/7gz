import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMyDoctorProfile } from '@/libs/actions/doctor';
import { getMyBookings } from '@/libs/actions/booking';
import BookingsTable from './BookingsTable';
import Link from 'next/link';

export default async function DoctorProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'doctor') redirect('/');

  const [profile, bookings] = await Promise.all([
    getMyDoctorProfile(),
    getMyBookings(),
  ]);

  const upcoming = bookings.filter(
    (b) => b.status !== 'cancelled' && b.status !== 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#103D48]">My Profile</h1>
            <p className="mt-1 text-sm text-black/40">
              {profile?.displayName ? `Dr. ${profile.displayName}` : session.user.name}
            </p>
          </div>
          <Link
            href="/doctor/profile/edit"
            className="rounded-xl border border-[#103D48]/20 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#103D48] transition-colors hover:bg-[#103D48] hover:text-white"
          >
            Edit Profile
          </Link>
        </div>

        {/* Profile snapshot */}
        {profile && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Specialty"   value={profile.specialty ?? '—'} />
            <Stat label="Experience"  value={`${profile.yearsOfExperience ?? 0} yrs`} />
            <Stat label="Rating"      value={`★ ${profile.rating?.toFixed(1) ?? '—'}`} />
            <Stat label="Upcoming"    value={String(upcoming)} highlight />
          </div>
        )}

        {/* Bookings */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-[#103D48]">Appointments</h2>
            <p className="text-xs text-black/40">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <BookingsTable initialBookings={bookings} />
        </div>

      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-[#103D48] text-white' : 'bg-white'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-white/60' : 'text-black/40'}`}>
        {label}
      </p>
      <p className={`mt-1 text-xl font-extrabold ${highlight ? 'text-white' : 'text-[#103D48]'}`}>
        {value}
      </p>
    </div>
  );
}
