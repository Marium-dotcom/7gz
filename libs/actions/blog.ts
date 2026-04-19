'use server';

import { connectToDB } from '@/libs/mongoose';
import Blog, { IBlog } from '@/libs/models/blog';
import { revalidatePath } from 'next/cache';

// ── Types ────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; message: string };

type BlogFilters = {
  tags?: string[];        // $in — any of these tags
  allTags?: string[];     // $all — must have all these tags
  search?: string;        // full-text search
  page?: number;
  limit?: number;
};

// ── READ ─────────────────────────────────────────────────────────────────

export async function getBlogs(filters: BlogFilters = {}) {
  await connectToDB();

  const {
    tags,
    allTags,
    search,
    page  = 1,
    limit = 10,
  } = filters;

  const query: Record<string, unknown> = { isPublished: true };

  if (tags?.length)    query.tags = { $in: tags };
  if (allTags?.length) query.tags = { $all: allTags };
  if (search)          query.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')   // exclude heavy content field from list view
      .lean(),
    Blog.countDocuments(query),
  ]);

  return {
    posts: JSON.parse(JSON.stringify(posts)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
  };
}

export async function getBlogBySlug(
  slug: string
): Promise<Partial<IBlog> | null> {
  await connectToDB();

  const post = await Blog.findOne({ slug, isPublished: true }).lean();

  if (!post) return null;

  return JSON.parse(JSON.stringify(post));
}

export async function getAllTags(): Promise<string[]> {
  await connectToDB();

  const tags = await Blog.distinct('tags', { isPublished: true });

  return tags.sort();
}

// ── Admin READ ────────────────────────────────────────────────────────────

export async function getAdminBlogs(page = 1, limit = 20) {
  await connectToDB();

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Blog.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')
      .lean(),
    Blog.countDocuments(),
  ]);

  return {
    posts: JSON.parse(JSON.stringify(posts)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminBlogBySlug(
  slug: string
): Promise<Partial<IBlog> | null> {
  await connectToDB();

  const post = await Blog.findOne({ slug }).lean();

  if (!post) return null;

  return JSON.parse(JSON.stringify(post));
}

// ── CREATE ────────────────────────────────────────────────────────────────

export async function createBlog(
  data: Omit<IBlog, keyof Document>
): Promise<ActionResult & { slug?: string }> {
  await connectToDB();

  try {
    const post = await Blog.create(data);

    revalidatePath('/blog');
    revalidatePath('/admin/blog');

    return { success: true, message: 'Post created.', slug: post.slug };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('[createBlog]', err);
    return { success: false, message };
  }
}

// ── UPDATE ────────────────────────────────────────────────────────────────

export async function updateBlog(
  slug: string,
  data: Partial<IBlog>
): Promise<ActionResult> {
  await connectToDB();

  try {
    const post = await Blog.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!post) return { success: false, message: 'Post not found.' };

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');

    return { success: true, message: 'Post updated.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('[updateBlog]', err);
    return { success: false, message };
  }
}

// ── PUBLISH TOGGLE ────────────────────────────────────────────────────────

export async function togglePublishBlog(
  slug: string,
  isPublished: boolean
): Promise<ActionResult> {
  await connectToDB();

  try {
    const update: Partial<IBlog> = { isPublished };

    if (isPublished) {
      update.publishedAt = new Date();
    }

    await Blog.findOneAndUpdate({ slug }, { $set: update });

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');

    return {
      success: true,
      message: isPublished ? 'Post published.' : 'Post unpublished.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('[togglePublishBlog]', err);
    return { success: false, message };
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────

export async function deleteBlog(slug: string): Promise<ActionResult> {
  await connectToDB();

  try {
    const post = await Blog.findOneAndDelete({ slug });

    if (!post) return { success: false, message: 'Post not found.' };

    revalidatePath('/blog');
    revalidatePath('/admin/blog');

    return { success: true, message: 'Post deleted.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('[deleteBlog]', err);
    return { success: false, message };
  }
}