'use server';

import { auth } from '@/auth';
import { connectToDB } from '@/libs/mongoose';
import Booking from '@/libs/models/booking';
import { revalidatePath } from 'next/cache';

export interface BookingRow {
  _id: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'online';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  patient: { _id: string; name: string; email: string };
  doctorName?: string; // populated for admin view
}

type Result = { success: boolean; message: string };

// Returns startTimes of active (non-cancelled) bookings for a doctor on a date
export async function getBookedSlots(doctorId: string, dateStr: string): Promise<string[]> {
  await connectToDB();
  try {
    const bookings = await Booking.find({
      doctor: doctorId,
      dateStr,
      status: { $ne: 'cancelled' },
    })
      .select('startTime')
      .lean();
    return bookings.map((b) => b.startTime);
  } catch (err) {
    console.error('[getBookedSlots]', err);
    return [];
  }
}

export async function createBooking(data: {
  doctorId:  string;
  dateStr:   string;
  startTime: string;
  endTime:   string;
  type:      'in-person' | 'online';
  notes?:    string;
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.email) return { success: false, message: 'Sign in to book an appointment.' };

  await connectToDB();

  try {
    const { default: User } = await import('@/libs/models/user');
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return { success: false, message: 'User not found.' };

    // Check for existing booking (friendly error before hitting unique index)
    const exists = await Booking.findOne({
      doctor:    data.doctorId,
      dateStr:   data.dateStr,
      startTime: data.startTime,
      status:    { $ne: 'cancelled' },
    });
    if (exists) return { success: false, message: 'This slot was just taken. Please choose another.' };

    await Booking.create({
      doctor:    data.doctorId,
      patient:   user._id,
      dateStr:   data.dateStr,
      startTime: data.startTime,
      endTime:   data.endTime,
      type:      data.type,
      notes:     data.notes,
    });

    revalidatePath(`/book`);
    return { success: true, message: 'Appointment booked!' };
  } catch (err: unknown) {
    // Unique index violation
    if (
      err instanceof Error &&
      'code' in (err as NodeJS.ErrnoException) &&
      (err as NodeJS.ErrnoException).code === '11000'
    ) {
      return { success: false, message: 'This slot was just taken. Please choose another.' };
    }
    console.error('[createBooking]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Something went wrong.' };
  }
}

// ── Doctor: own bookings ──────────────────────────────────────────────────

export async function getMyBookings(): Promise<BookingRow[]> {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== 'doctor') return [];

  await connectToDB();
  try {
    const { default: User }   = await import('@/libs/models/user');
    const { default: Doctor } = await import('@/libs/models/doctor');

    const user   = await User.findOne({ email: session.user.email }).lean();
    if (!user) return [];
    const doctor = await Doctor.findOne({ user: user._id }).lean();
    if (!doctor) return [];

    const bookings = await Booking.find({ doctor: doctor._id })
      .sort({ dateStr: -1, startTime: 1 })
      .populate('patient', 'name email')
      .lean();

    return JSON.parse(JSON.stringify(bookings));
  } catch (err) {
    console.error('[getMyBookings]', err);
    return [];
  }
}

// ── Admin: all bookings ───────────────────────────────────────────────────

export async function getAllBookings(): Promise<BookingRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') return [];

  await connectToDB();
  try {
    const { default: Doctor } = await import('@/libs/models/doctor');

    const bookings = await Booking.find()
      .sort({ dateStr: -1, startTime: 1 })
      .populate('patient', 'name email')
      .populate({ path: 'doctor', model: Doctor, select: 'displayName' })
      .lean();

    // Flatten doctorName for convenience
    const rows = bookings.map((b: Record<string, unknown>) => ({
      ...b,
      doctorName: (b.doctor as Record<string, unknown> | null)
        ? ((b.doctor as Record<string, unknown>).displayName as string)
        : 'Unknown',
    }));

    return JSON.parse(JSON.stringify(rows));
  } catch (err) {
    console.error('[getAllBookings]', err);
    return [];
  }
}

// ── Update booking status ─────────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized.' };

  await connectToDB();
  try {
    const { default: User }   = await import('@/libs/models/user');
    const { default: Doctor } = await import('@/libs/models/doctor');

    const user    = await User.findOne({ email: session.user.email }).lean();
    if (!user) return { success: false, message: 'User not found.' };

    const booking = await Booking.findById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    const isAdmin = session.user.role === 'admin';
    if (!isAdmin) {
      const doctor = await Doctor.findOne({ user: user._id }).lean();
      const isOwnerDoctor = doctor && booking.doctor.toString() === doctor._id.toString();
      if (!isOwnerDoctor) return { success: false, message: 'Unauthorized.' };
    }

    booking.status = status;
    await booking.save();

    revalidatePath('/doctor/profile');
    revalidatePath('/admin/bookings');
    return { success: true, message: 'Status updated.' };
  } catch (err) {
    console.error('[updateBookingStatus]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Something went wrong.' };
  }
}

export async function cancelBooking(bookingId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized.' };

  await connectToDB();

  try {
    const { default: User } = await import('@/libs/models/user');
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return { success: false, message: 'User not found.' };

    const booking = await Booking.findById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    const isOwner = booking.patient.toString() === user._id.toString();
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) return { success: false, message: 'Unauthorized.' };

    booking.status = 'cancelled';
    await booking.save();

    revalidatePath('/book');
    return { success: true, message: 'Booking cancelled.' };
  } catch (err) {
    console.error('[cancelBooking]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Something went wrong.' };
  }
}
