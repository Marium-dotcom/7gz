'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { upsertAbout } from '@/libs/actions/about';
import type { IAbout } from '@/libs/models/about';

type Props = { initialData: Partial<IAbout> | null };

function getExperience(data: Partial<IAbout> | null): string {
  return (data?.stats ?? []).find((s) => s.label === 'Experience')?.value ?? '';
}

export default function AboutForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage]       = useState('');
  const [isError, setIsError]       = useState(false);

  const [fields, setFields] = useState({
    sectionSubtitle: initialData?.sectionSubtitle ?? '',
    heading:         initialData?.heading         ?? '',
    description:     initialData?.description     ?? '',
    experience:      getExperience(initialData),
    imageUrl:        initialData?.image?.url       ?? '',
    imageAlt:        initialData?.image?.alt       ?? '',
    isPublished:     initialData?.isPublished      ?? false,
  });

  function set(key: keyof typeof fields, value: string | boolean) {
    setFields((p) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');

    // Build the stats array: keep non-Experience existing stats, upsert Experience
    const otherStats = (initialData?.stats ?? []).filter((s) => s.label !== 'Experience');
    const stats = fields.experience.trim()
      ? [...otherStats, { label: 'Experience', value: fields.experience.trim(), isVisible: true, order: 0 }]
      : otherStats;

    const payload: Partial<IAbout> = {
      sectionSubtitle: fields.sectionSubtitle,
      heading:         fields.heading,
      description:     fields.description,
      image: {
        url: fields.imageUrl,
        alt: fields.imageAlt,
      },
      stats,
      isPublished: fields.isPublished,
    };

    startTransition(async () => {
      const res = await upsertAbout(payload);
      setIsError(!res.success);
      setMessage(res.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Content */}
      <Card label="Content">
        <div className="space-y-4">
          <Field label="Tagline">
            <input
              type="text"
              value={fields.sectionSubtitle}
              onChange={(e) => set('sectionSubtitle', e.target.value)}
              className="field-input"
              placeholder="Our Story"
            />
          </Field>
          <Field label="Heading *">
            <input
              type="text"
              value={fields.heading}
              onChange={(e) => set('heading', e.target.value)}
              className="field-input"
              placeholder="Who We Are"
              required
            />
          </Field>
          <Field label="Description">
            <textarea
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
              className="field-input min-h-28 resize-y"
              placeholder="Tell your story…"
            />
          </Field>
        </div>
      </Card>

      {/* Experience */}
      <Card label="Experience">
        <Field label="Years of Experience">
          <input
            type="text"
            value={fields.experience}
            onChange={(e) => set('experience', e.target.value)}
            className="field-input"
            placeholder="10+ Years"
          />
        </Field>
        <p className="mt-2 text-xs text-black/30">Shown as a stat on the public about section.</p>
      </Card>

      {/* Image */}
      <Card label="Image">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Image URL">
              <input
                type="text"
                value={fields.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                className="field-input"
                placeholder="https://…"
              />
            </Field>
            <Field label="Alt Text">
              <input
                type="text"
                value={fields.imageAlt}
                onChange={(e) => set('imageAlt', e.target.value)}
                className="field-input"
                placeholder="Descriptive alt text"
              />
            </Field>
          </div>
          {fields.imageUrl && (
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#E5F3FB]">
                <Image src={fields.imageUrl} alt={fields.imageAlt || 'preview'} fill className="object-cover" />
              </div>
              <span className="text-xs text-black/40">Preview</span>
            </div>
          )}
        </div>
      </Card>

      {/* Publish toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5F3FB] bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-black">Publish About Section</p>
          <p className="text-xs text-black/40">Make this visible on the live site</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={fields.isPublished}
            onChange={(e) => set('isPublished', e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-[#E5F3FB] transition-colors peer-checked:bg-[#103D48]" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* Feedback */}
      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
          isError
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-[#103D48]/30 bg-[#E5F3FB] text-[#103D48]'
        }`}>
          <span>{isError ? '✕' : '✓'}</span>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[#103D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save About Section'}
      </button>

    </form>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">
      <div className="border-b border-[#E5F3FB] bg-[#E5F3FB] px-6 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#103D48]">{label}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-black/40">{label}</label>
      {children}
    </div>
  );
}
