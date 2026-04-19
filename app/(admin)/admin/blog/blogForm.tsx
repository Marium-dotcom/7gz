'use client';

import { useState, useTransition } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapLink from '@tiptap/extension-link';
import type { Editor } from '@tiptap/core';
import { createBlog, updateBlog } from '@/libs/actions/blog';
import type { IBlog } from '@/libs/models/blog';
import { useRouter } from 'next/navigation';

type Props = {
  initialData?: Partial<IBlog> | null;
  mode: 'create' | 'edit';
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);

  const [form, setForm] = useState({
    title:      initialData?.title ?? '',
    slug:       initialData?.slug ?? '',
    excerpt:    initialData?.excerpt ?? '',
    author:     initialData?.author ?? '',
    coverUrl:   initialData?.coverImage?.url ?? '',
    coverAlt:   initialData?.coverImage?.alt ?? '',
    tags:       (initialData?.tags ?? []).join(', '),
    isPublished: initialData?.isPublished ?? false,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your post content here…' }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: initialData?.content ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'tiptap min-h-[360px] px-6 py-4 text-sm text-gray-800' },
    },
  });

  function set(key: keyof typeof form, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    setForm(prev => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugify(title),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const content = editor?.getHTML() ?? '';
    const tags    = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const coverImage = form.coverUrl
      ? { url: form.coverUrl, alt: form.coverAlt }
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { title: form.title, slug: form.slug, excerpt: form.excerpt, author: form.author, content, tags, coverImage, isPublished: form.isPublished };

    startTransition(async () => {
      const res = mode === 'create'
        ? await createBlog(data)
        : await updateBlog(initialData!.slug!, data);

      setIsError(!res.success);
      setMessage(res.message);

      if (res.success && mode === 'create' && 'slug' in res && res.slug) {
        router.push(`/admin/blog/${res.slug}/edit`);
      }
    });
  }

  const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Post Details */}
      <Card label="Post Details" accent="teal">
        <div className="space-y-4">
          <Field label="Title *">
            <input
              type="text"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="field-input"
              placeholder="Post title"
              required
            />
          </Field>

          <Field label="Slug *">
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={e => { setSlugManual(true); set('slug', slugify(e.target.value)); }}
                className="field-input flex-1"
                placeholder="post-url-slug"
                required
              />
              {slugManual && (
                <button
                  type="button"
                  onClick={() => { setSlugManual(false); set('slug', slugify(form.title)); }}
                  className="shrink-0 rounded-xl border border-gray-200 px-3 text-xs text-gray-500 hover:bg-gray-50"
                >
                  Auto
                </button>
              )}
            </div>
          </Field>

          <Field label="Author">
            <input
              type="text"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              className="field-input"
              placeholder="Dr. Jane Smith"
            />
          </Field>

          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              className="field-input min-h-[80px] resize-y"
              placeholder="Short summary shown in post listings…"
            />
          </Field>
        </div>
      </Card>

      {/* Cover Image */}
      <Card label="Cover Image" accent="amber">
        <div className="space-y-4">
          <Field label="Image URL">
            <input
              type="text"
              value={form.coverUrl}
              onChange={e => set('coverUrl', e.target.value)}
              className="field-input"
              placeholder="https://…"
            />
          </Field>
          <Field label="Alt Text">
            <input
              type="text"
              value={form.coverAlt}
              onChange={e => set('coverAlt', e.target.value)}
              className="field-input"
              placeholder="Describe the image"
            />
          </Field>
          {form.coverUrl && (
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverUrl} alt={form.coverAlt || 'Cover preview'} className="h-44 w-full object-cover" />
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      <Card label="Content *" accent="sky">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <Toolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </Card>

      {/* Tags */}
      <Card label="Tags" accent="violet">
        <Field label="Comma-separated">
          <input
            type="text"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            className="field-input"
            placeholder="health, wellness, tips"
          />
          {tagList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagList.map(tag => (
                <span key={tag} className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Field>
      </Card>

      {/* Publish toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800">Publish Post</p>
          <p className="text-xs text-gray-400">Make this post visible on the live site</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={e => set('isPublished', e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-teal-600 peer-focus:ring-2 peer-focus:ring-teal-400 peer-focus:ring-offset-1" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <span>{isError ? '✕' : '✓'}</span>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving…
          </span>
        ) : mode === 'create' ? 'Create Post' : 'Save Changes'}
      </button>

    </form>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const e = editor; // stable non-nullable alias for closures

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium transition-colors ${active ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`;
  const sep = <div className="mx-0.5 w-px self-stretch bg-gray-200" />;

  function setLink() {
    const prev = e.getAttributes('link').href as string | undefined;
    const url  = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { e.chain().focus().unsetLink().run(); return; }
    e.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-3 py-2">
      <button type="button" onClick={() => e.chain().focus().toggleBold().run()}      className={btn(e.isActive('bold'))}>      <b>B</b></button>
      <button type="button" onClick={() => e.chain().focus().toggleItalic().run()}    className={btn(e.isActive('italic'))}>    <i>I</i></button>
      <button type="button" onClick={() => e.chain().focus().toggleStrike().run()}    className={btn(e.isActive('strike'))}>    <s>S</s></button>
      {sep}
      <button type="button" onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(e.isActive('heading', { level: 2 }))}>H2</button>
      <button type="button" onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(e.isActive('heading', { level: 3 }))}>H3</button>
      {sep}
      <button type="button" onClick={() => e.chain().focus().toggleBulletList().run()}  className={btn(e.isActive('bulletList'))}>• List</button>
      <button type="button" onClick={() => e.chain().focus().toggleOrderedList().run()} className={btn(e.isActive('orderedList'))}>1. List</button>
      {sep}
      <button type="button" onClick={() => e.chain().focus().toggleBlockquote().run()} className={btn(e.isActive('blockquote'))}>Quote</button>
      <button type="button" onClick={() => e.chain().focus().toggleCode().run()}       className={btn(e.isActive('code'))}>Code</button>
      <button type="button" onClick={() => e.chain().focus().toggleCodeBlock().run()}  className={btn(e.isActive('codeBlock'))}>{'</>'}</button>
      {sep}
      <button type="button" onClick={() => e.chain().focus().setHorizontalRule().run()} className={btn(false)}>─</button>
      <button type="button" onClick={setLink}                                          className={btn(e.isActive('link'))}>Link</button>
      {sep}
      <button type="button" onClick={() => e.chain().focus().undo().run()} disabled={!e.can().undo()} className={`${btn(false)} disabled:opacity-30`}>↩</button>
      <button type="button" onClick={() => e.chain().focus().redo().run()} disabled={!e.can().redo()} className={`${btn(false)} disabled:opacity-30`}>↪</button>
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const ACCENT_CLASSES: Record<string, string> = {
  teal:   'border-teal-400   text-teal-700   bg-teal-50',
  sky:    'border-sky-400    text-sky-700    bg-sky-50',
  amber:  'border-amber-400  text-amber-700  bg-amber-50',
  rose:   'border-rose-400   text-rose-700   bg-rose-50',
  violet: 'border-violet-400 text-violet-700 bg-violet-50',
};

function Card({ label, accent = 'teal', children }: { label: string; accent?: string; children: React.ReactNode }) {
  const cls = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.teal;
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className={`border-b px-6 py-3 ${cls}`}>
        <h2 className="text-xs font-semibold uppercase tracking-widest">{label}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}
