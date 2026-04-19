'use server';

import { auth } from '@/auth';
import { connectToDB } from '@/libs/mongoose';
import User, { IUser, UserRole, USER_ROLES } from '@/libs/models/user';
import { revalidatePath } from 'next/cache';

type Result = { success: boolean; message: string };

async function requireAdmin(): Promise<{ error: Result } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { error: { success: false, message: 'Unauthorized' } };
  }
  return null;
}

// ── List all users ─────────────────────────────────────────────────────

export async function getUsers(): Promise<Partial<IUser & { _id: string }>[]> {
  const guard = await requireAdmin();
  if (guard) return [];

  await connectToDB();

  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(users));
  } catch (err) {
    console.error('[getUsers]', err);
    return [];
  }
}

// ── Set role ───────────────────────────────────────────────────────────

export async function setUserRole(userId: string, role: UserRole): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  if (!USER_ROLES.includes(role)) {
    return { success: false, message: `Invalid role: ${role}` };
  }

  await connectToDB();

  try {
    const updated = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!updated) return { success: false, message: 'User not found.' };

    revalidatePath('/admin/users');
    return { success: true, message: `Role updated to "${role}".` };
  } catch (err) {
    console.error('[setUserRole]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Block / unblock ────────────────────────────────────────────────────

export async function setUserBlocked(userId: string, blocked: boolean): Promise<Result> {
  const guard = await requireAdmin();
  if (guard) return guard.error;

  await connectToDB();

  try {
    const updated = await User.findByIdAndUpdate(userId, { isBlocked: blocked }, { new: true });
    if (!updated) return { success: false, message: 'User not found.' };

    revalidatePath('/admin/users');
    return { success: true, message: blocked ? 'User blocked.' : 'User unblocked.' };
  } catch (err) {
    console.error('[setUserBlocked]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}
