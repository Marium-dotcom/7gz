'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  upsertAbout,
  addAboutStat,
  updateAboutStat,
  deleteAboutStat,
} from '@/libs/actions/about';
import type { IAbout, IAboutStat } from '@/libs/models/about';

type Props = { initialData: Partial<IAbout> | null };
type StatWithId = IAboutStat & { _id?: string };

export default function AboutForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [section, setSection] = useState({
    sectionTitle:         initialData?.sectionTitle         || '',
    sectionSubtitle:      initialData?.sectionSubtitle      || '',
    heading:              initialData?.heading              || '',
    subheading:           initialData?.subheading           || '',
    description:          initialData?.description          || '',
    secondaryDescription: initialData?.secondaryDescription || '',
    ctaText:              initialData?.ctaText              || '',
    ctaLink:              initialData?.ctaLink              || '',
    image: {
      url:    initialData?.image?.url    || '',
      alt:    initialData?.image?.alt    || '',
      width:  initialData?.image?.width  || undefined,
      height: initialData?.image?.height || undefined,
    },
    isPublished: initialData?.isPublished ?? false,
  });

  const [stats, setStats] = useState<StatWithId[]>(
    (initialData?.stats as StatWithId[]) || []
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStat, setNewStat] = useState<Partial<IAboutStat>>({ label: '', value: '', isVisible: true });
  const [showAdd, setShowAdd] = useState(false);

  function notify(success: boolean, msg: string) {
    setIsError(!success);
    setMessage(msg);
  }

  function handleSectionSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      const res = await upsertAbout(section);
      notify(res.success, res.message);
    });
  }

  function handleAddStat() {
    if (!newStat.label?.trim() || !newStat.value?.trim()) return;
    startTransition(async () => {
      const res = await addAboutStat({ label: newStat.label!, value: newStat.value!, isVisible: newStat.isVisible ?? true });
      notify(res.success, res.message);
      if (res.success) {
        setNewStat({ label: '', value: '', isVisible: true });
        setShowAdd(false);
      }
    });
  }

  function handleUpdateStat(stat: StatWithId) {
    if (!stat._id) return;
    startTransition(async () => {
      const res = await updateAboutStat(stat._id!, { label: stat.label, value: stat.value, isVisible: stat.isVisible });
      notify(res.success, res.message);
      if (res.success) setEditingId(null);
    });
  }

  function handleDeleteStat(id: string) {
    startTransition(async () => {
      const res = await deleteAboutStat(id);
      notify(res.success, res.message);
      if (res.success) setStats((prev) => prev.filter((s) => s._id !== id));
    });
  }

  function handleToggleStatVisible(stat: StatWithId) {
    if (!stat._id) return;
    startTransition(async () => {
      const res = await updateAboutStat(stat._id!, { isVisible: !stat.isVisible });
      notify(res.success, res.message);
      if (res.success)
        setStats((prev) => prev.map((s) => (s._id === stat._id ? { ...s, isVisible: !s.isVisible } : s)));
    });
  }

  return (
    <div className="space-y-5">

      <form onSubmit={handleSectionSubmit} className="space-y-5">

        <Card label="Section Header">
          <div className="space-y-4">
            <Field label="Section Title *">
              <input
                type="text"
                value={section.sectionTitle}
                onChange={(e) => setSection((p) => ({ ...p, sectionTitle: e.target.value }))}
                className="field-input"
                placeholder="About Us"
                required
              />
            </Field>
            <Field label="Section Subtitle">
              <input
                type="text"
                value={section.sectionSubtitle}
                onChange={(e) => setSection((p) => ({ ...p, sectionSubtitle: e.target.value }))}
                className="field-input"
                placeholder="A short tagline"
              />
            </Field>
          </div>
        </Card>

        <Card label="Main Content">
          <div className="space-y-4">
            <Field label="Heading *">
              <input
                type="text"
                value={section.heading}
                onChange={(e) => setSection((p) => ({ ...p, heading: e.target.value }))}
                className="field-input"
                placeholder="Who We Are"
                required
              />
            </Field>
            <Field label="Subheading">
              <input
                type="text"
                value={section.subheading}
                onChange={(e) => setSection((p) => ({ ...p, subheading: e.target.value }))}
                className="field-input"
                placeholder="Supporting line"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={section.description}
                onChange={(e) => setSection((p) => ({ ...p, description: e.target.value }))}
                className="field-input min-h-24 resize-y"
                placeholder="Main body text…"
              />
            </Field>
            <Field label="Secondary Description">
              <textarea
                value={section.secondaryDescription}
                onChange={(e) => setSection((p) => ({ ...p, secondaryDescription: e.target.value }))}
                className="field-input min-h-20 resize-y"
                placeholder="Additional paragraph…"
              />
            </Field>
          </div>
        </Card>

        <Card label="Call to Action">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button Text">
              <input
                type="text"
                value={section.ctaText}
                onChange={(e) => setSection((p) => ({ ...p, ctaText: e.target.value }))}
                className="field-input"
                placeholder="Learn More"
              />
            </Field>
            <Field label="Button Link">
              <input
                type="text"
                value={section.ctaLink}
                onChange={(e) => setSection((p) => ({ ...p, ctaLink: e.target.value }))}
                className="field-input"
                placeholder="/about"
              />
            </Field>
          </div>
        </Card>

        <Card label="Image">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Image URL">
                <input
                  type="text"
                  value={section.image.url}
                  onChange={(e) => setSection((p) => ({ ...p, image: { ...p.image, url: e.target.value } }))}
                  className="field-input"
                  placeholder="https://…"
                />
              </Field>
              <Field label="Alt Text">
                <input
                  type="text"
                  value={section.image.alt}
                  onChange={(e) => setSection((p) => ({ ...p, image: { ...p.image, alt: e.target.value } }))}
                  className="field-input"
                  placeholder="Descriptive alt text"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Width (px)">
                <input
                  type="number"
                  value={section.image.width ?? ''}
                  onChange={(e) => setSection((p) => ({ ...p, image: { ...p.image, width: e.target.value ? Number(e.target.value) : undefined } }))}
                  className="field-input"
                  placeholder="800"
                />
              </Field>
              <Field label="Height (px)">
                <input
                  type="number"
                  value={section.image.height ?? ''}
                  onChange={(e) => setSection((p) => ({ ...p, image: { ...p.image, height: e.target.value ? Number(e.target.value) : undefined } }))}
                  className="field-input"
                  placeholder="600"
                />
              </Field>
            </div>
            {section.image.url && (
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#E5F3FB] bg-[#E5F3FB]">
                  <Image src={section.image.url} alt={section.image.alt || 'preview'} fill className="object-cover" />
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
            <p className="text-xs text-black/40">Make this section visible on the live site</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={section.isPublished}
              onChange={(e) => setSection((p) => ({ ...p, isPublished: e.target.checked }))}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-[#E5F3FB] transition-colors peer-checked:bg-[#103D48]" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        {message && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${isError ? 'border-black/20 bg-[#E5F3FB] text-black' : 'border-[#103D48]/30 bg-[#E5F3FB] text-[#103D48]'}`}>
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

      {/* Stats */}
      <Card label="Stats">
        <div className="space-y-3">
          {stats.length === 0 && (
            <p className="py-4 text-center text-sm text-black/40">No stats yet. Add one below.</p>
          )}

          {stats.map((stat) =>
            editingId === stat._id ? (
              <div key={stat._id} className="space-y-3 rounded-xl border border-[#103D48]/20 bg-[#E5F3FB] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Label *">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => setStats((prev) => prev.map((s) => s._id === stat._id ? { ...s, label: e.target.value } : s))}
                      className="field-input"
                      placeholder="Years of Experience"
                    />
                  </Field>
                  <Field label="Value *">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => setStats((prev) => prev.map((s) => s._id === stat._id ? { ...s, value: e.target.value } : s))}
                      className="field-input"
                      placeholder="10+"
                    />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStat(stat)}
                    disabled={isPending}
                    className="rounded-xl bg-[#103D48] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border border-[#E5F3FB] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E5F3FB]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={stat._id} className="flex items-center gap-3 rounded-xl border border-[#E5F3FB] bg-[#E5F3FB]/60 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-black">{stat.value}</p>
                  <p className="truncate text-xs text-black/40">{stat.label}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center" title={stat.isVisible ? 'Visible' : 'Hidden'}>
                  <input
                    type="checkbox"
                    checked={stat.isVisible}
                    onChange={() => handleToggleStatVisible(stat)}
                    className="peer sr-only"
                    disabled={isPending}
                  />
                  <div className="h-5 w-9 rounded-full bg-white transition-colors peer-checked:bg-[#103D48]" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#E5F3FB] shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-white" />
                </label>
                <button
                  onClick={() => setEditingId(stat._id!)}
                  className="rounded-lg border border-[#103D48]/20 px-3 py-1.5 text-xs font-medium text-black hover:bg-[#E5F3FB]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStat(stat._id!)}
                  disabled={isPending}
                  className="rounded-lg border border-black/20 px-3 py-1.5 text-xs font-medium text-black hover:bg-[#E5F3FB] disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )
          )}

          {showAdd ? (
            <div className="space-y-3 rounded-xl border border-dashed border-[#103D48]/30 bg-[#E5F3FB]/40 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Label *">
                  <input
                    type="text"
                    value={newStat.label}
                    onChange={(e) => setNewStat((p) => ({ ...p, label: e.target.value }))}
                    className="field-input"
                    placeholder="Years of Experience"
                  />
                </Field>
                <Field label="Value *">
                  <input
                    type="text"
                    value={newStat.value}
                    onChange={(e) => setNewStat((p) => ({ ...p, value: e.target.value }))}
                    className="field-input"
                    placeholder="10+"
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStat}
                  disabled={isPending || !newStat.label?.trim() || !newStat.value?.trim()}
                  className="rounded-xl bg-[#103D48] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  Add Stat
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-[#E5F3FB] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E5F3FB]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full rounded-xl border border-dashed border-[#103D48]/30 py-3 text-sm font-medium text-[#103D48] transition-colors hover:bg-[#E5F3FB]"
            >
              + Add Stat
            </button>
          )}
        </div>
      </Card>

    </div>
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
