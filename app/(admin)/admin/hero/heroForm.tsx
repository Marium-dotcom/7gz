'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { upsertHero } from '@/libs/actions/hero';
import type { IHero } from '@/libs/models/hero';

type Props = {
  initialData: Partial<IHero> | null;
};

const BG_TYPES = ['color', 'image'] as const;

export default function HeroForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState<Partial<IHero>>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    isPublished: initialData?.isPublished ?? false,
    image: initialData?.image || {},
    background: initialData?.background || { type: 'color' },
    ctaText: initialData?.ctaText || '',
    ctaLink: initialData?.ctaLink || '',
    secondaryCtaText: initialData?.secondaryCtaText || '',
    secondaryCtaLink: initialData?.secondaryCtaLink || '',
  });

  function set(path: string, value: string | number | boolean) {
    setForm((prev) => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };
      const [parent, child] = keys;
      return {
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      const res = await upsertHero(form);
      setIsError(!res.success);
      setMessage(res.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Content */}
      <Card label="Content" accent="teal">
        <div className="space-y-4">
          <Field label="Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="field-input"
              placeholder="Your main headline"
              required
            />
          </Field>
          <Field label="Subtitle">
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              className="field-input"
              placeholder="Supporting tagline"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="field-input min-h-22.5 resize-y"
              placeholder="Short paragraph below the headline"
            />
          </Field>
        </div>
      </Card>

      {/* Background */}
      <Card label="Background" accent="sky">
        <div className="space-y-4">
          <Field label="Type">
            <select
              value={form.background?.type || 'color'}
              onChange={(e) => set('background.type', e.target.value)}
              className="field-input"
            >
              {BG_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </Field>

          {form.background?.type === 'color' && (
            <Field label="Background Color">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-300">
                <input
                  type="color"
                  value={form.background?.color || '#ffffff'}
                  onChange={(e) => set('background.color', e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={form.background?.color || '#ffffff'}
                  onChange={(e) => set('background.color', e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-xs font-mono text-gray-700 outline-none placeholder:text-gray-300"
                  placeholder="#ffffff"
                />
              </div>
            </Field>
          )}

          {form.background?.type === 'image' && (
            <Field label="Background Image URL">
              <input
                type="text"
                value={form.background?.imageUrl || ''}
                onChange={(e) => set('background.imageUrl', e.target.value)}
                className="field-input"
                placeholder="https://..."
              />
            </Field>
          )}
        </div>
      </Card>

      {/* Hero Image */}
      <Card label="Hero Image" accent="amber">
        <div className="space-y-4">
          <Field label="Image URL">
            <input
              type="text"
              value={form.image?.url || ''}
              onChange={(e) => set('image.url', e.target.value)}
              className="field-input"
              placeholder="https://..."
            />
          </Field>
          <Field label="Alt Text">
            <input
              type="text"
              value={form.image?.alt || ''}
              onChange={(e) => set('image.alt', e.target.value)}
              className="field-input"
              placeholder="Describe the image"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Width (px)">
              <input
                type="number"
                value={form.image?.width || ''}
                onChange={(e) => set('image.width', parseInt(e.target.value))}
                className="field-input"
                placeholder="800"
              />
            </Field>
            <Field label="Height (px)">
              <input
                type="number"
                value={form.image?.height || ''}
                onChange={(e) => set('image.height', parseInt(e.target.value))}
                className="field-input"
                placeholder="600"
              />
            </Field>
          </div>
          {form.image?.url && (
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <Image
                src={form.image.url}
                alt={form.image.alt || 'Preview'}
                width={form.image.width || 800}
                height={form.image.height || 176}
                className="h-44 w-full object-cover"
              />
            </div>
          )}
        </div>
      </Card>

      {/* CTA Buttons */}
      <Card label="CTA Buttons" accent="rose">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Primary Button</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label">
                <input
                  type="text"
                  value={form.ctaText || ''}
                  onChange={(e) => set('ctaText', e.target.value)}
                  className="field-input"
                  placeholder="Get Started"
                />
              </Field>
              <Field label="Link">
                <input
                  type="text"
                  value={form.ctaLink || ''}
                  onChange={(e) => set('ctaLink', e.target.value)}
                  className="field-input"
                  placeholder="/contact"
                />
              </Field>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Secondary Button</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label">
                <input
                  type="text"
                  value={form.secondaryCtaText || ''}
                  onChange={(e) => set('secondaryCtaText', e.target.value)}
                  className="field-input"
                  placeholder="Learn More"
                />
              </Field>
              <Field label="Link">
                <input
                  type="text"
                  value={form.secondaryCtaLink || ''}
                  onChange={(e) => set('secondaryCtaLink', e.target.value)}
                  className="field-input"
                  placeholder="/about"
                />
              </Field>
            </div>
          </div>
        </div>
      </Card>

      {/* Publishing */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800">Publish Hero Section</p>
          <p className="text-xs text-gray-400">Make this hero visible on the live site</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={form.isPublished ?? false}
            onChange={(e) => set('isPublished', e.target.checked)}
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
        ) : 'Save Hero'}
      </button>

    </form>
  );
}

const ACCENT_CLASSES: Record<string, string> = {
  teal:  'border-teal-400 text-teal-700 bg-teal-50',
  sky:   'border-sky-400 text-sky-700 bg-sky-50',
  amber: 'border-amber-400 text-amber-700 bg-amber-50',
  rose:  'border-rose-400 text-rose-700 bg-rose-50',
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
