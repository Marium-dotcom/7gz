import { getAllBookings } from '@/libs/actions/booking';
import BookingsTable from '@/app/doctor/profile/BookingsTable';

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();

  const counts = bookings.reduce(
    (acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">All patient appointments across every doctor.</p>
      </div>

      {/* Summary pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        {(Object.entries(counts) as [string, number][]).map(([status, n]) => (
          <div key={status} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold capitalize text-gray-700 shadow-sm">
            {status}: <span className="font-bold text-gray-900">{n}</span>
          </div>
        ))}
        <div className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500">
          Total: <span className="font-bold text-gray-700">{bookings.length}</span>
        </div>
      </div>

      <BookingsTable initialBookings={bookings} showDoctor />
    </div>
  );
}
