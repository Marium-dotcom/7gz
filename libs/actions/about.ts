'use server';

import { connectToDB } from '@/libs/mongoose';
import About, { IAbout, IAboutStat } from '@/libs/models/about';
import { revalidatePath } from 'next/cache';

// ── Fetch (admin form) ─────────────────────────────────────────────────

export async function getAbout(): Promise<Partial<IAbout> | null> {
  await connectToDB();

  try {
    const about = await About.findOne().sort({ updatedAt: -1 }).lean();
    if (!about) return null;
    return JSON.parse(JSON.stringify(about));
  } catch (err: unknown) {
    console.error('[getAbout]', err);
    return null;
  }
}

// ── Fetch (public page) ────────────────────────────────────────────────

export async function getPublishedAbout(): Promise<Partial<IAbout> | null> {
  await connectToDB();

  try {
    const about = await About.findOne({ isPublished: true }).lean();
    if (!about) return null;

    const result = JSON.parse(JSON.stringify(about));
    result.stats = (result.stats as IAboutStat[])
      .filter((s) => s.isVisible)
      .sort((a, b) => a.order - b.order);

    return result;
  } catch (err: unknown) {
    console.error('[getPublishedAbout]', err);
    return null;
  }
}

// ── Upsert section ─────────────────────────────────────────────────────

export async function upsertAbout(
  data: Partial<IAbout>
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    await About.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return { success: true, message: 'About section saved.' };
  } catch (err: unknown) {
    console.error('[upsertAbout]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Add a stat item ────────────────────────────────────────────────────

export async function addAboutStat(
  item: Omit<IAboutStat, 'order' | 'isVisible'> & { order?: number; isVisible?: boolean }
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const doc = await About.findOne();

    const newStat: IAboutStat = {
      label:     item.label,
      value:     item.value,
      order:     item.order ?? (doc?.stats.length ?? 0),
      isVisible: item.isVisible ?? true,
    };

    await About.findOneAndUpdate(
      {},
      { $push: { stats: newStat } },
      { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return { success: true, message: 'Stat added.' };
  } catch (err: unknown) {
    console.error('[addAboutStat]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Update a stat item by _id ──────────────────────────────────────────

export async function updateAboutStat(
  statId: string,
  data: Partial<IAboutStat>
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const updateFields = Object.fromEntries(
      Object.entries(data).map(([key, val]) => [`stats.$.${key}`, val])
    );

    await About.findOneAndUpdate(
      { 'stats._id': statId },
      { $set: updateFields }
    );

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return { success: true, message: 'Stat updated.' };
  } catch (err: unknown) {
    console.error('[updateAboutStat]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Delete a stat item by _id ──────────────────────────────────────────

export async function deleteAboutStat(
  statId: string
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    await About.findOneAndUpdate(
      {},
      { $pull: { stats: { _id: statId } } }
    );

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return { success: true, message: 'Stat deleted.' };
  } catch (err: unknown) {
    console.error('[deleteAboutStat]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Reorder stat items ─────────────────────────────────────────────────

export async function reorderAboutStats(
  orderedIds: string[]
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const doc = await About.findOne();
    if (!doc) return { success: false, message: 'No about document found.' };

    doc.stats = orderedIds
      .map((id, index) => {
        const item = doc.stats.find((s: IAboutStat & { _id: { toString(): string } }) => s._id.toString() === id);
        if (item) item.order = index;
        return item;
      })
      .filter(Boolean);

    await doc.save();

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/about');

    return { success: true, message: 'Order saved.' };
  } catch (err: unknown) {
    console.error('[reorderAboutStats]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}
