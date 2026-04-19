import { Schema, Document, models, model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: {
    url: string;
    alt?: string;
  };
  tags: string[];
  author?: string;
  isPublished: boolean;
  publishedAt?: Date;
  readingTime?: number;   // minutes, auto-calculated
}

const BlogSchema = new Schema<IBlog>(
  {
    title:    { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt:  { type: String, trim: true },
    content:  { type: String, required: true },

    coverImage: {
      url: { type: String },
      alt: { type: String },
    },

    tags: {
      type:    [String],
      default: [],
      index:   true,       // ← indexed for fast tag-based queries
    },

    author:      { type: String },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    readingTime: { type: Number },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────────────────

// fast slug lookups
BlogSchema.index({ slug: 1 });

// tag search — the main query pattern
BlogSchema.index({ tags: 1, isPublished: 1 });

// latest posts feed
BlogSchema.index({ isPublished: 1, publishedAt: -1 });

// full-text search on title + content
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// ── Pre-save hooks ───────────────────────────────────────────────────────

// auto-calculate reading time (avg 200 words/min)
// ✅ After
BlogSchema.pre('save', async function () {
  if (this.isModified('content')) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});
const Blog = models.Blog || model<IBlog>('Blog', BlogSchema);
export default Blog;