'use client';

import { useState } from 'react';
import { toggleDoctorFlag } from '@/libs/actions/doctor';
import type { IDoctor } from '@/libs/models/doctor';
import DoctorForm from './doctorForm';

type Doc = Partial<IDoctor & { _id: string }>;

export default function DoctorList({ initialDoctors }: { initialDoctors: Doc[] }) {
  const [doctors, setDoctors] = useState<Doc[]>(initialDoctors);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [creating, setCreating] = useState(false);

  function onSaved(doc: Doc) {
    setDoctors((prev) => {
      const idx = prev.findIndex((d) => d._id === doc._id);
      return idx >= 0 ? prev.map((d, i) => (i === idx ? doc : d)) : [doc, ...prev];
    });
    setSelected(null);
    setCreating(false);
  }

  async function toggle(id: string, flag: 'isPublished' | 'isVerified' | 'isActive', val: boolean) {
    await toggleDoctorFlag(id, flag, val);
    setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, [flag]: val } : d)));
  }

  if (selected || creating) {
    return (
      <DoctorForm
        initialData={selected}
        onSaved={onSaved}
        onCancel={() => { setSelected(null); setCreating(false); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating(true)}
        className="rounded-2xl bg-[#103D48] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
      >
        + New Doctor
      </button>

      {doctors.length === 0 && (
        <div className="rounded-2xl border border-[#E5F3FB] bg-white px-6 py-16 text-center text-sm text-black/40">
          No doctors yet.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">
        {doctors.map((doc, i) => (
          <div
            key={doc._id ?? i}
            className="flex flex-col gap-3 border-b border-[#E5F3FB] px-6 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-6"
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F3FB] text-sm font-bold text-[#103D48]">
                {doc.displayName?.[0]?.toUpperCase() ?? 'D'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">{doc.displayName}</p>
                <p className="truncate text-xs text-black/40">{doc.specialty} {doc.city ? `· ${doc.city}` : ''}</p>
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-4 shrink-0 text-xs">
              {(['isVerified', 'isActive', 'isPublished'] as const).map((flag) => (
                <label key={flag} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!doc[flag]}
                    onChange={(e) => doc._id && toggle(doc._id, flag, e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${doc[flag] ? 'bg-[#103D48] text-white' : 'bg-[#E5F3FB] text-black/50'}`}>
                    {flag.replace('is', '')}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setSelected(doc)}
              className="shrink-0 rounded-lg border border-[#E5F3FB] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#E5F3FB]"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
