'use client';

import { useState, useTransition } from 'react';
import { updateBookingStatus, BookingRow } from '@/libs/actions/booking';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-[#E5F3FB] text-[#103D48] border-[#103D48]/20',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-400 border-red-200',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function BookingsTable({
  initialBookings,
  showDoctor = false,
}: {
  initialBookings: BookingRow[];
  showDoctor?: boolean;
}) {
  const [bookings, setBookings]   = useState<BookingRow[]>(initialBookings);
  const [filter, setFilter]       = useState<string>('all');
  const [isPending, startTrans]   = useTransition();
  const [updating, setUpdating]   = useState<string | null>(null);

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  function handleStatus(bookingId: string, status: BookingRow['status']) {
    setUpdating(bookingId);
    startTrans(async () => {
      const res = await updateBookingStatus(bookingId, status);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => b._id === bookingId ? { ...b, status } : b)
        );
      }
      setUpdating(null);
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === s
                ? 'bg-[#103D48] text-white'
                : 'bg-white text-black/50 hover:bg-[#E5F3FB] hover:text-[#103D48]'
            }`}
          >
            {s}
            {s === 'all' && (
              <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                {bookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center text-sm text-black/30">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left: patient + date */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-black">{b.patient?.name ?? '—'}</p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[b.status]}`}
                  >
                    {b.status}
                  </span>
                  <span className="rounded-full bg-[#E5F3FB] px-2.5 py-0.5 text-[10px] font-semibold capitalize text-[#103D48]">
                    {b.type}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-black/40">{b.patient?.email}</p>
                {showDoctor && b.doctorName && (
                  <p className="mt-0.5 text-xs font-semibold text-[#103D48]">Dr. {b.doctorName}</p>
                )}
                <p className="mt-2 text-sm text-black/70">
                  {formatDate(b.dateStr)}
                  <span className="ml-2 font-semibold text-[#103D48]">
                    {b.startTime} – {b.endTime}
                  </span>
                </p>
                {b.notes && (
                  <p className="mt-1 text-xs text-black/40 italic">{b.notes}</p>
                )}
              </div>

              {/* Right: status selector */}
              {b.status !== 'cancelled' && b.status !== 'completed' && (
                <div className="flex shrink-0 gap-2">
                  {STATUS_OPTIONS.filter((s) => s !== b.status).map((s) => (
                    <button
                      key={s}
                      disabled={isPending && updating === b._id}
                      onClick={() => handleStatus(b._id, s)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors disabled:opacity-40 ${
                        s === 'cancelled'
                          ? 'border border-red-200 text-red-400 hover:bg-red-50'
                          : s === 'confirmed'
                          ? 'bg-[#103D48] text-white hover:opacity-90'
                          : 'bg-green-600 text-white hover:opacity-90'
                      }`}
                    >
                      {updating === b._id ? '…' : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
