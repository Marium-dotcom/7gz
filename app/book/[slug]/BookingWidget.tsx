'use client';

import { useEffect, useState, useTransition } from 'react';
import { getBookedSlots, createBooking } from '@/libs/actions/booking';

interface AvailSlot {
  day: string;
  from: string;
  to: string;
  isAvailable: boolean;
}

interface Props {
  doctorId:                string;
  availability:            AvailSlot[];
  appointmentDuration:     number;
  offersOnlineConsultation: boolean;
  fee:                     number;
  onlineFee?:              number;
  currency:                string;
  isLoggedIn:              boolean;
}

const JS_DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function toMin(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function addMin(time: string, mins: number) {
  const t = toMin(time) + mins;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function generateSlots(from: string, to: string, duration: number): string[] {
  const slots: string[] = [];
  let cur = from;
  while (toMin(cur) + duration <= toMin(to)) {
    slots.push(cur);
    cur = addMin(cur, duration);
  }
  return slots;
}

function localDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function next30Days(): string[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

export default function BookingWidget({
  doctorId,
  availability,
  appointmentDuration,
  offersOnlineConsultation,
  fee,
  onlineFee,
  currency,
  isLoggedIn,
}: Props) {
  const [type, setType]               = useState<'in-person' | 'online'>('in-person');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots]   = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isPending, startTransition]    = useTransition();
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const availMap = Object.fromEntries(
    availability
      .filter((a) => a.isAvailable)
      .map((a) => [a.day, { from: a.from, to: a.to }])
  );

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null);
    setLoadingSlots(true);
    getBookedSlots(doctorId, selectedDate).then((slots) => {
      setBookedSlots(slots);
      setLoadingSlots(false);
    });
  }, [selectedDate, doctorId]);

  function slotsForDate(dateStr: string): string[] {
    const day = JS_DAYS[localDate(dateStr).getDay()];
    const avail = availMap[day];
    if (!avail) return [];
    return generateSlots(avail.from, avail.to, appointmentDuration);
  }

  function isDayAvailable(dateStr: string) {
    return !!availMap[JS_DAYS[localDate(dateStr).getDay()]];
  }

  function handleConfirm() {
    if (!selectedDate || !selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const res = await createBooking({
        doctorId,
        dateStr:   selectedDate,
        startTime: selectedSlot,
        endTime:   addMin(selectedSlot, appointmentDuration),
        type,
      });
      if (res.success) setDone(true);
      else setError(res.message);
    });
  }

  /* ── Success state ───────────────────────────────────────── */
  if (done) {
    return (
      <div className="rounded-3xl bg-[#103D48] p-6 text-center text-white">
        <div className="mb-2 text-3xl">✓</div>
        <p className="text-lg font-extrabold">Appointment Booked!</p>
        <p className="mt-1 text-xs text-white/60">
          {localDate(selectedDate!).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {' '}at {selectedSlot}
        </p>
        <p className="mt-0.5 text-xs text-white/40 capitalize">{type}</p>
      </div>
    );
  }

  /* ── Not logged in ───────────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl bg-[#103D48] p-6 text-center text-white">
        <p className="mb-1 text-lg font-extrabold">Ready to book?</p>
        <p className="mb-4 text-xs text-white/60">{appointmentDuration}-minute appointments</p>
        <a
          href="/api/auth/signin"
          className="block w-full rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#103D48] transition-colors hover:bg-[#E5F3FB]"
        >
          Sign in to book
        </a>
      </div>
    );
  }

  const dates = next30Days();
  const slots = selectedDate ? slotsForDate(selectedDate) : [];

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

      {/* Header */}
      <div className="bg-[#103D48] px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white">Book Appointment</h2>
        <p className="mt-0.5 text-xs text-white/60">{appointmentDuration}-min sessions</p>
      </div>

      <div className="space-y-5 p-5">

        {/* Type toggle */}
        {offersOnlineConsultation && (
          <div className="flex overflow-hidden rounded-xl border border-[#E5F3FB]">
            {(['in-person', 'online'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  type === t
                    ? 'bg-[#103D48] text-white'
                    : 'text-black/50 hover:bg-[#E5F3FB]'
                }`}
              >
                {t === 'in-person' ? 'In-Person' : 'Online'}
                <span className="ml-1 font-normal opacity-60">
                  {t === 'in-person' ? fee : (onlineFee ?? fee)} {currency}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Date picker */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
            Select a Date
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((dateStr) => {
              const avail    = isDayAvailable(dateStr);
              const selected = selectedDate === dateStr;
              const d        = localDate(dateStr);
              return (
                <button
                  key={dateStr}
                  disabled={!avail}
                  onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                  className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2.5 text-center transition-colors ${
                    selected
                      ? 'bg-[#103D48] text-white'
                      : avail
                      ? 'bg-[#E5F3FB] text-[#103D48] hover:bg-[#103D48]/10'
                      : 'cursor-not-allowed bg-black/5 text-black/20'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-extrabold leading-tight">{d.getDate()}</span>
                  <span className="text-[10px]">
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
              Select a Time
            </p>
            {loadingSlots ? (
              <p className="py-4 text-center text-xs text-black/30">Loading…</p>
            ) : slots.length === 0 ? (
              <p className="py-4 text-center text-xs text-black/30">No slots for this day.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const booked   = bookedSlots.includes(slot);
                  const selected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={booked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-[#103D48] text-white'
                          : booked
                          ? 'cursor-not-allowed bg-black/5 text-black/20 line-through'
                          : 'bg-[#E5F3FB] text-[#103D48] hover:bg-[#103D48]/10'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Confirm */}
        {selectedSlot && (
          <div className="border-t border-[#E5F3FB] pt-4">
            <div className="mb-3 rounded-xl bg-[#E5F3FB] px-4 py-3 text-xs text-[#103D48]">
              <p className="font-bold">
                {localDate(selectedDate!).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
              <p className="mt-0.5 opacity-70 capitalize">
                {selectedSlot} – {addMin(selectedSlot, appointmentDuration)} · {type}
              </p>
            </div>
            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="w-full rounded-2xl bg-[#103D48] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Booking…' : 'Confirm Appointment'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
