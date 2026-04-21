'use server';

import { auth } from '@/auth';
import { connectToDB } from '@/libs/mongoose';
import Doctor, { IDoctor, IEducation, IExperience } from '@/libs/models/doctor';
import { revalidatePath } from 'next/cache';

type Result = { success: boolean; message: string };

// ── Auth guard ─────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ error: Result } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { error: { success: false, message: 'Unauthorized' } };
  }
  return null;
}

// ── List (admin) ───────────────────────────────────────────────────────

export async function getDoctors(): Promise<Partial<IDoctor & { _id: string }>[]> {
  const guard = await requireAdmin();
  if (guard) return [];

  await connectToDB();
  try {
    const docs = await Doctor.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('[getDoctors]', err);
    return [];
  }
}

// ── Own profile (doctor session) ──────────────────────────────────────

export async function getMyDoctorProfile(): Promise<Partial<IDoctor & { _id: string }> | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'doctor') return null;

  await connectToDB();
  try {
    const { default: User } = await import('@/libs/models/user');
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return null;
    const doc = await Doctor.findOne({ user: user._id }).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error('[getMyDoctorProfile]', err);
    return null;
  }
}

// ── Upsert own profile (doctor session) ───────────────────────────────

export async function updateMyDoctorProfile(data: Partial<IDoctor>): Promise<Result & { id?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'doctor') {
    return { success: false, message: 'Unauthorized' };
  }

  await connectToDB();
  try {
    const { default: User } = await import('@/libs/models/user');
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return { success: false, message: 'User not found.' };

    const updated = await Doctor.findOneAndUpdate(
      { user: user._id },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!updated) return { success: false, message: 'Doctor profile not found.' };

    revalidatePath('/dashboard/profile');
    revalidatePath(`/book/${updated.licenseNumber}`);
    return { success: true, message: 'Profile saved.', id: updated._id.toString() };
  } catch (err) {
    console.error('[updateMyDoctorProfile]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Something went wrong.' };
  }
}

// ── Single (admin) ─────────────────────────────────────────────────────

export async function getDoctorById(
  id: string
): Promise<Partial<IDoctor & { _id: string }> | null> {
  const guard = await requireAdmin();
  if (guard) return null;

  await connectToDB();
  try {
    const doc = await Doctor.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error('[getDoctorById]', err);
    return null;
  }
}

// ── Single by slug/licenseNumber (public) ─────────────────────────────

export async function getPublishedDoctorBySlug(
  slug: string
): Promise<Partial<IDoctor & { _id: string }> | null> {
  await connectToDB();
  try {
    const doc = await Doctor.findOne({ licenseNumber: slug, isPublished: true, isActive: true }).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error('[getPublishedDoctorBySlug]', err);
    return null;
  }
}

// ── List published (public /book) ──────────────────────────────────────

export async function getPublishedDoctors(filters?: {
  specialty?: string;
  city?: string;
  online?: boolean;
}): Promise<Partial<IDoctor & { _id: string }>[]> {
  await connectToDB();
  try {
    const query: Record<string, unknown> = { isPublished: true, isActive: true };
    if (filters?.specialty) query.specialty = filters.specialty;
    if (filters?.city) query.city = filters.city;
    if (filters?.online) query.offersOnlineConsultation = true;

    const docs = await Doctor.find(query).sort({ rating: -1 }).lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('[getPublishedDoctors]', err);
    return [];
  }
}

// ── Verified doctors (homepage) ───────────────────────────────────────

export async function getVerifiedDoctors(limit = 6): Promise<Partial<IDoctor & { _id: string }>[]> {
  await connectToDB();
  try {
    const docs = await Doctor.find({ isPublished: true, isActive: true, isVerified: true })
      .sort({ rating: -1 })
      .limit(limit)
      .select('displayName avatar specialty city country consultationFee currency rating reviewCount yearsOfExperience offersOnlineConsultation isVerified licenseNumber bio')
      .lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('[getVerifiedDoctors]', err);
    return [];
  }
}

// ── Upsert profile ─────────────────────────────────────────────────────

export async function upsertDoctor(
  id: string | null,
  data: Partial<IDoctor>
): Promise<Result & { id?: string }> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    if (id) {
      const updated = await Doctor.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
      if (!updated) return { success: false, message: 'Doctor not found.' };
      revalidatePath('/admin/doctors');
      revalidatePath('/book');
      return { success: true, message: 'Doctor profile saved.', id: updated._id.toString() };
    } else {
      const created = await Doctor.create(data);
      revalidatePath('/admin/doctors');
      revalidatePath('/book');
      return { success: true, message: 'Doctor profile created.', id: created._id.toString() };
    }
  } catch (err) {
    console.error('[upsertDoctor]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Education items ────────────────────────────────────────────────────

export async function addEducation(doctorId: string, item: IEducation): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    await Doctor.findByIdAndUpdate(doctorId, { $push: { education: item } });
    revalidatePath('/admin/doctors');
    return { success: true, message: 'Education added.' };
  } catch (err) {
    console.error('[addEducation]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Error.' };
  }
}

export async function removeEducation(doctorId: string, index: number): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    const doc = await Doctor.findById(doctorId).lean();
    if (!doc) return { success: false, message: 'Doctor not found.' };
    const updated = (doc.education ?? []).filter((_: unknown, i: number) => i !== index);
    await Doctor.findByIdAndUpdate(doctorId, { $set: { education: updated } });
    revalidatePath('/admin/doctors');
    return { success: true, message: 'Education removed.' };
  } catch (err) {
    console.error('[removeEducation]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Error.' };
  }
}

// ── Experience items ───────────────────────────────────────────────────

export async function addExperience(doctorId: string, item: IExperience): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    await Doctor.findByIdAndUpdate(doctorId, { $push: { experience: item } });
    revalidatePath('/admin/doctors');
    return { success: true, message: 'Experience added.' };
  } catch (err) {
    console.error('[addExperience]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Error.' };
  }
}

export async function removeExperience(doctorId: string, index: number): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    const doc = await Doctor.findById(doctorId).lean();
    if (!doc) return { success: false, message: 'Doctor not found.' };
    const updated = (doc.experience ?? []).filter((_: unknown, i: number) => i !== index);
    await Doctor.findByIdAndUpdate(doctorId, { $set: { experience: updated } });
    revalidatePath('/admin/doctors');
    return { success: true, message: 'Experience removed.' };
  } catch (err) {
    console.error('[removeExperience]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Error.' };
  }
}

// ── Toggle publish / verify / active ──────────────────────────────────

export async function toggleDoctorFlag(
  doctorId: string,
  flag: 'isPublished' | 'isVerified' | 'isActive',
  value: boolean
): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();
  try {
    await Doctor.findByIdAndUpdate(doctorId, { [flag]: value });
    revalidatePath('/admin/doctors');
    revalidatePath('/book');
    return { success: true, message: 'Updated.' };
  } catch (err) {
    console.error('[toggleDoctorFlag]', err);
    return { success: false, message: err instanceof Error ? err.message : 'Error.' };
  }
}
