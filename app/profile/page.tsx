import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/libs/mongoose';
import Booking from '@/libs/models/booking';
import User from '@/libs/models/user';
import Link from 'next/link';

async function getUserBookings(email: string) {
  await connectToDB();
  const user = await User.findOne({ email }).lean();
  if (!user) return [];

  const bookings = await Booking.find({ patient: user._id })
    .sort({ dateStr: -1, startTime: 1 })
    .populate({ path: 'doctor', select: 'displayName specialty avatar licenseNumber' })
    .lean();

  return JSON.parse(JSON.stringify(bookings));
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-[#E5F3FB] text-[#103D48]',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-400',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const bookings = await getUserBookings(session.user.email!);

  const upcoming = bookings.filter(
    (b: { status: string }) => b.status === 'pending' || b.status === 'confirmed'
  );
  const past = bookings.filter(
    (b: { status: string }) => b.status === 'completed' || b.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E5F3FB] text-2xl font-extrabold text-[#103D48]">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#103D48]">{session.user.name}</h1>
            <p className="text-sm text-black/40">{session.user.email}</p>
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="mb-4 text-lg font-extrabold text-[#103D48]">
            Upcoming Appointments
            {upcoming.length > 0 && (
              <span className="ml-2 rounded-full bg-[#103D48] px-2.5 py-0.5 text-xs font-bold text-white">
                {upcoming.length}
              </span>
            )}
          </h2>
          {upcoming.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-black/30">
              No upcoming appointments.{' '}
              <Link href="/book" className="font-semibold text-[#103D48] underline">
                Book one now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b: BookingWithDoctor) => (
                <BookingCard key={b._id} booking={b} />
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-extrabold text-[#103D48]">Past Appointments</h2>
            <div className="space-y-3">
              {past.map((b: BookingWithDoctor) => (
                <BookingCard key={b._id} booking={b} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

interface BookingWithDoctor {
  _id: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  doctor: { _id: string; displayName: string; specialty: string; licenseNumber: string } | null;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function BookingCard({ booking: b }: { booking: BookingWithDoctor }) {
  return (
    <Link
      href={b.doctor ? `/book/${b.doctor.licenseNumber}` : '#'}
      className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E5F3FB] text-lg font-extrabold text-[#103D48]">
        {b.doctor?.displayName?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-black">
          {b.doctor ? `Dr. ${b.doctor.displayName}` : 'Unknown Doctor'}
        </p>
        <p className="text-xs text-black/40">{b.doctor?.specialty}</p>
        <p className="mt-1 text-sm text-black/70">
          {formatDate(b.dateStr)}
          <span className="ml-2 font-semibold text-[#103D48]">{b.startTime} – {b.endTime}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[b.status]}`}>
          {b.status}
        </span>
        <span className="text-[10px] capitalize text-black/30">{b.type}</span>
      </div>
    </Link>
  );
}
