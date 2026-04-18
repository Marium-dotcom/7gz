'use client';

import { useState, useTransition } from 'react';
import { upsertHero } from '@/libs/actions/hero';
import type { IHero } from '@/libs/models/hero';

type Props = {
  initialData: Partial<IHero> | null;
};

const FONT_FAMILIES = [
  'Inter', 'Satoshi', 'General Sans', 'Playfair Display',
  'Georgia', 'Merriweather', 'DM Sans', 'Work Sans',
];

const FONT_SIZES = [
  '0.875rem', '1rem', '1.125rem', '1.25rem',
  '1.5rem', '1.875rem', '2.25rem', '3rem', '3.75rem',
];

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];
const BG_TYPES = ['color', 'image', 'gradient'] as const;

export default function HeroForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState<Partial<IHero>>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    isPublished: initialData?.isPublished ?? false,
    titleStyle: initialData?.titleStyle || {},
    subtitleStyle: initialData?.subtitleStyle || {},
    descriptionStyle: initialData?.descriptionStyle || {},
    image: initialData?.image || {},
    background: initialData?.background || { type: 'color', opacity: 1 },
    ctaText: initialData?.ctaText || '',
    ctaLink: initialData?.ctaLink || '',
    ctaColor: initialData?.ctaColor || '#01696f',
    ctaTextColor: initialData?.ctaTextColor || '#ffffff',
    secondaryCtaText: initialData?.secondaryCtaText || '',
    secondaryCtaLink: initialData?.secondaryCtaLink || '',
    secondaryCtaColor: initialData?.secondaryCtaColor || '#ffffff',
    secondaryCtaTextColor: initialData?.secondaryCtaTextColor || '#01696f',
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
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Content */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Content</h2>
        <div className="space-y-4">
          <Field label="Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="input"
              placeholder="Your main headline"
              required
            />
          </Field>
          <Field label="Subtitle">
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              className="input"
              placeholder="Supporting tagline"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Short paragraph below the headline"
            />
          </Field>
        </div>
      </section>

      {/* Title Typography */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Title Style</h2>
        <TypographyFields prefix="titleStyle" values={form.titleStyle || {}} onChange={set} />
      </section>

      {/* Subtitle Typography */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Subtitle Style</h2>
        <TypographyFields prefix="subtitleStyle" values={form.subtitleStyle || {}} onChange={set} />
      </section>

      {/* Description Typography */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Description Style</h2>
        <TypographyFields prefix="descriptionStyle" values={form.descriptionStyle || {}} onChange={set} />
      </section>

      {/* Background */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Background</h2>
        <div className="space-y-4">
          <Field label="Type">
            <select
              value={form.background?.type || 'color'}
              onChange={(e) => set('background.type', e.target.value)}
              className="input"
            >
              {BG_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </Field>

          {form.background?.type === 'color' && (
            <Field label="Background Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.background?.color || '#ffffff'}
                  onChange={(e) => set('background.color', e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-gray-200"
                />
                <input
                  type="text"
                  value={form.background?.color || ''}
                  onChange={(e) => set('background.color', e.target.value)}
                  className="input flex-1"
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
                className="input"
                placeholder="https://..."
              />
            </Field>
          )}

          {form.background?.type === 'gradient' && (
            <Field label="Gradient CSS">
              <input
                type="text"
                value={form.background?.gradient || ''}
                onChange={(e) => set('background.gradient', e.target.value)}
                className="input"
                placeholder="linear-gradient(135deg, #667eea, #764ba2)"
              />
            </Field>
          )}

          <Field label={`Opacity: ${form.background?.opacity ?? 1}`}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={form.background?.opacity ?? 1}
              onChange={(e) => set('background.opacity', parseFloat(e.target.value))}
              className="w-full"
            />
          </Field>
        </div>
      </section>

      {/* Hero Image */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Hero Image</h2>
        <div className="space-y-4">
          <Field label="Image URL">
            <input
              type="text"
              value={form.image?.url || ''}
              onChange={(e) => set('image.url', e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>
          <Field label="Alt Text">
            <input
              type="text"
              value={form.image?.alt || ''}
              onChange={(e) => set('image.alt', e.target.value)}
              className="input"
              placeholder="Describe the image"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Width (px)">
              <input
                type="number"
                value={form.image?.width || ''}
                onChange={(e) => set('image.width', parseInt(e.target.value))}
                className="input"
                placeholder="800"
              />
            </Field>
            <Field label="Height (px)">
              <input
                type="number"
                value={form.image?.height || ''}
                onChange={(e) => set('image.height', parseInt(e.target.value))}
                className="input"
                placeholder="600"
              />
            </Field>
          </div>
          {form.image?.url && (
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
              <img
                src={form.image.url}
                alt={form.image.alt || 'Preview'}
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">CTA Buttons</h2>
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium text-gray-500">Primary Button</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Button Text">
                <input
                  type="text"
                  value={form.ctaText || ''}
                  onChange={(e) => set('ctaText', e.target.value)}
                  className="input"
                  placeholder="Get Started"
                />
              </Field>
              <Field label="Button Link">
                <input
                  type="text"
                  value={form.ctaLink || ''}
                  onChange={(e) => set('ctaLink', e.target.value)}
                  className="input"
                  placeholder="/contact"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Button Color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.ctaColor || '#01696f'}
                    onChange={(e) => set('ctaColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={form.ctaColor || ''}
                    onChange={(e) => set('ctaColor', e.target.value)}
                    className="input flex-1"
                    placeholder="#01696f"
                  />
                </div>
              </Field>
              <Field label="Text Color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.ctaTextColor || '#ffffff'}
                    onChange={(e) => set('ctaTextColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={form.ctaTextColor || ''}
                    onChange={(e) => set('ctaTextColor', e.target.value)}
                    className="input flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </Field>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium text-gray-500">Secondary Button</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Button Text">
                <input
                  type="text"
                  value={form.secondaryCtaText || ''}
                  onChange={(e) => set('secondaryCtaText', e.target.value)}
                  className="input"
                  placeholder="Learn More"
                />
              </Field>
              <Field label="Button Link">
                <input
                  type="text"
                  value={form.secondaryCtaLink || ''}
                  onChange={(e) => set('secondaryCtaLink', e.target.value)}
                  className="input"
                  placeholder="/about"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Button Color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryCtaColor || '#ffffff'}
                    onChange={(e) => set('secondaryCtaColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={form.secondaryCtaColor || ''}
                    onChange={(e) => set('secondaryCtaColor', e.target.value)}
                    className="input flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </Field>
              <Field label="Text Color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryCtaTextColor || '#01696f'}
                    onChange={(e) => set('secondaryCtaTextColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={form.secondaryCtaTextColor || ''}
                    onChange={(e) => set('secondaryCtaTextColor', e.target.value)}
                    className="input flex-1"
                    placeholder="#01696f"
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>
      </section>

      {/* Publishing */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Publishing</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isPublished ?? false}
            onChange={(e) => set('isPublished', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-teal-600"
          />
          <span className="text-sm text-gray-700">Publish this hero section</span>
        </label>
      </section>

      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save Hero'}
      </button>

    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function TypographyFields({
  prefix,
  values,
  onChange,
}: {
  prefix: string;
  values: import('@/libs/models/hero').IHeroTypography;
  onChange: (path: string, value: string | number | boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Font Family">
        <select
          value={values.fontFamily || ''}
          onChange={(e) => onChange(`${prefix}.fontFamily`, e.target.value)}
          className="input"
        >
          <option value="">Default</option>
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label="Font Size">
        <select
          value={values.fontSize || ''}
          onChange={(e) => onChange(`${prefix}.fontSize`, e.target.value)}
          className="input"
        >
          <option value="">Default</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Font Weight">
        <select
          value={values.fontWeight || ''}
          onChange={(e) => onChange(`${prefix}.fontWeight`, e.target.value)}
          className="input"
        >
          <option value="">Default</option>
          {FONT_WEIGHTS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </Field>
      <Field label="Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={values.color || '#000000'}
            onChange={(e) => onChange(`${prefix}.color`, e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-gray-200"
          />
          <input
            type="text"
            value={values.color || ''}
            onChange={(e) => onChange(`${prefix}.color`, e.target.value)}
            className="input flex-1"
            placeholder="#000000"
          />
        </div>
      </Field>
      <Field label="Letter Spacing">
        <input
          type="text"
          value={values.letterSpacing || ''}
          onChange={(e) => onChange(`${prefix}.letterSpacing`, e.target.value)}
          className="input"
          placeholder="0.05em"
        />
      </Field>
      <Field label="Line Height">
        <input
          type="text"
          value={values.lineHeight || ''}
          onChange={(e) => onChange(`${prefix}.lineHeight`, e.target.value)}
          className="input"
          placeholder="1.5"
        />
      </Field>
    </div>
  );
}
