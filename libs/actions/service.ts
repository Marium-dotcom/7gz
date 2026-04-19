'use server';

import { connectToDB } from '@/libs/mongoose';
import Services, { IServices, IService } from '@/libs/models/service';
import { revalidatePath } from 'next/cache';

// ── Fetch (admin form) ─────────────────────────────────────────────────

export async function getServices(): Promise<Partial<IServices> | null> {
  await connectToDB();

  try {
    const services = await Services.findOne().sort({ updatedAt: -1 }).lean();
    if (!services) return null;
    return JSON.parse(JSON.stringify(services));
  } catch (err: unknown) {
    console.error('[getServices]', err);
    return null;
  }
}

// ── Fetch (public homepage) ────────────────────────────────────────────

export async function getPublishedServices(): Promise<Partial<IServices> | null> {
  await connectToDB();

  const services = await Services
    .findOne({ isPublished: true })
    .lean();

  if (!services) return null;

  // only return visible service items, sorted by order
  const result = JSON.parse(JSON.stringify(services));
  result.services = (result.services as IService[])
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return result;
}

// ── Upsert section info ────────────────────────────────────────────────

export async function upsertServices(
  data: Partial<IServices>
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    await Services.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/services');

    return { success: true, message: 'Services section saved.' };
  } catch (err: unknown) {
    console.error('[upsertServices]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Add a single service item ──────────────────────────────────────────

export async function addServiceItem(
  item: Omit<IService, 'order' | 'isVisible'> & { order?: number; isVisible?: boolean }
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const doc = await Services.findOne();

    const newItem: IService = {
      title:     item.title,
      description: item.description,
      icon:      item.icon,
      link:      item.link,
      order:     item.order ?? (doc?.services.length ?? 0),
      isVisible: item.isVisible ?? true,
    };

    await Services.findOneAndUpdate(
      {},
      { $push: { services: newItem } },
      { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/services');

    return { success: true, message: 'Service item added.' };
  } catch (err: unknown) {
    console.error('[addServiceItem]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Update a single service item by _id ───────────────────────────────

export async function updateServiceItem(
  itemId: string,
  data: Partial<IService>
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const updateFields = Object.fromEntries(
      Object.entries(data).map(([key, val]) => [`services.$.${key}`, val])
    );

    await Services.findOneAndUpdate(
      { 'services._id': itemId },
      { $set: updateFields }
    );

    revalidatePath('/');
    revalidatePath('/admin/services');

    return { success: true, message: 'Service item updated.' };
  } catch (err: unknown) {
    console.error('[updateServiceItem]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Delete a single service item by _id ───────────────────────────────

export async function deleteServiceItem(
  itemId: string
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    await Services.findOneAndUpdate(
      {},
      { $pull: { services: { _id: itemId } } }
    );

    revalidatePath('/');
    revalidatePath('/admin/services');

    return { success: true, message: 'Service item deleted.' };
  } catch (err: unknown) {
    console.error('[deleteServiceItem]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}

// ── Reorder all service items ──────────────────────────────────────────

export async function reorderServiceItems(
  orderedIds: string[]
): Promise<{ success: boolean; message: string }> {
  await connectToDB();

  try {
    const doc = await Services.findOne();
    if (!doc) return { success: false, message: 'No services document found.' };

    doc.services = orderedIds
      .map((id, index) => {
        const item = doc.services.find((s: IService & { _id: { toString(): string } }) => s._id.toString() === id);
        if (item) item.order = index;
        return item;
      })
      .filter(Boolean);

    await doc.save();

    revalidatePath('/');
    revalidatePath('/admin/services');

    return { success: true, message: 'Order saved.' };
  } catch (err: unknown) {
    console.error('[reorderServiceItems]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { success: false, message };
  }
}