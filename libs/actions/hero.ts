'use server';

import { auth } from "@/auth";
import { connectToDB } from "../mongoose";
import Hero from "../models/hero";
export async function upsertHero(data: Partial<import('@/libs/models/hero').IHero>) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }

  if (!data.title?.trim()) {
    return { success: false, message: 'Title is required' };
  }

  await connectToDB();

  const payload = {
    ...data,
    updatedBy: session.user.email,
  };

  const existing = await Hero.findOne();

  if (existing) {
    await Hero.findByIdAndUpdate(existing._id, payload, { new: true });
  } else {
    await Hero.create(payload);
  }

  return { success: true, message: 'Hero updated successfully' };
}

export async function getHero() {
  await connectToDB();

  const hero = await Hero.findOne({ isPublished: true }).lean();

  if (!hero) return null;

  return {
    ...hero,
    _id: hero._id.toString(),
  };
}