'use client';

import { useState, useTransition } from 'react';
import { updateMyDoctorProfile } from '@/libs/actions/doctor';
import type { IDoctor } from '@/libs/models/doctor';
import Link from 'next/link';

type Doc = Partial<IDoctor & { _id: string }>;

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
const GENDERS = ['male','female','other'] as const;

export default function DoctorProfileForm({ initialData }: { initialData: Doc | null }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState<Partial<IDoctor>>({
    displayName:              initialData?.displayName              ?? '',
    avatar:                   initialData?.avatar                   ?? '',
    bio:                      initialData?.bio                      ?? '',
    gender:                   initialData?.gender                   ?? 'male',
    languages:                initialData?.languages                ?? [],
    specialty:                initialData?.specialty                ?? '',
    subspecialties:           initialData?.subspecialties           ?? [],
    clinicName:               initialData?.clinicName               ?? '',
    clinicAddress:            initialData?.clinicAddress            ?? '',
    city:                     initialData?.city                     ?? '',
    country:                  initialData?.country                  ?? '',
    phone:                    initialData?.phone                    ?? '',
    consultationFee:          initialData?.consultationFee          ?? 0,
    currency:                 initialData?.currency                 ?? 'EGP',
    appointmentDuration:      initialData?.appointmentDuration      ?? 30,
    offersOnlineConsultation: initialData?.offersOnlineConsultation ?? false,
    onlineFee:                initialData?.onlineFee                ?? 0,
    availability:             initialData?.availability             ?? [],
  });

  function setField<K extends keyof IDoctor>(key: K, val: IDoctor[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function toggleDay(day: typeof DAYS[number]) {
    setForm((p) => {
      const avail = [...(p.availability ?? [])];
      const idx = avail.findIndex((a) => a.day === day);
      if (idx >= 0) {
        avail[idx] = { ...avail[idx], isAvailable: !avail[idx].isAvailable };
      } else {
        avail.push({ day, from: '09:00', to: '17:00', isAvailable: true });
      }
      return { ...p, availability: avail };
    });
  }

  function setDayTime(day: typeof DAYS[number], field: 'from' | 'to', val: string) {
    setForm((p) => {
      const avail = [...(p.availability ?? [])];
      const idx = avail.findIndex((a) => a.day === day);
      if (idx >= 0) avail[idx] = { ...avail[idx], [field]: val };
      return { ...p, availability: avail };
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      const res = await updateMyDoctorProfile(form);
      setIsError(!res.success);
      setMessage(res.message);
    });
  }

  const profileHref = initialData?.licenseNumber ? `/book/${initialData.licenseNumber}` : '/book';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Profile */}
      <Card label="Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Name *">
              <input required className="field-input" value={form.displayName} onChange={(e) => setField('displayName', e.target.value)} placeholder="Dr. Sarah Ahmed" />
            </Field>
            <Field label="Gender">
              <select className="field-input" value={form.gender} onChange={(e) => setField('gender', e.target.value as IDoctor['gender'])}>
                {GENDERS.map((g) => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Avatar URL">
            <input className="field-input" value={form.avatar} onChange={(e) => setField('avatar', e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Bio">
            <textarea className="field-input min-h-24 resize-y" value={form.bio} onChange={(e) => setField('bio', e.target.value)} placeholder="Short professional bio…" />
          </Field>
          <Field label="Languages (comma-separated)">
            <input className="field-input" value={(form.languages ?? []).join(', ')} onChange={(e) => setField('languages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Arabic, English" />
          </Field>
        </div>
      </Card>

      {/* Specialty */}
      <Card label="Specialty">
        <div className="space-y-4">
          <Field label="Specialty *">
            <input required className="field-input" value={form.specialty} onChange={(e) => setField('specialty', e.target.value)} placeholder="Cardiology" />
          </Field>
          <Field label="Subspecialties (comma-separated)">
            <input className="field-input" value={(form.subspecialties ?? []).join(', ')} onChange={(e) => setField('subspecialties', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Interventional, Pediatric" />
          </Field>
        </div>
      </Card>

      {/* Practice */}
      <Card label="Practice">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Clinic Name">
              <input className="field-input" value={form.clinicName} onChange={(e) => setField('clinicName', e.target.value)} placeholder="City Heart Clinic" />
            </Field>
            <Field label="Phone">
              <input className="field-input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+20 1xx xxx xxxx" />
            </Field>
          </div>
          <Field label="Clinic Address">
            <input className="field-input" value={form.clinicAddress} onChange={(e) => setField('clinicAddress', e.target.value)} placeholder="123 Tahrir St." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input className="field-input" value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Cairo" />
            </Field>
            <Field label="Country">
              <input className="field-input" value={form.country} onChange={(e) => setField('country', e.target.value)} placeholder="Egypt" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Consultation Fee">
              <input type="number" min={0} className="field-input" value={form.consultationFee} onChange={(e) => setField('consultationFee', Number(e.target.value))} />
            </Field>
            <Field label="Currency">
              <input className="field-input" value={form.currency} onChange={(e) => setField('currency', e.target.value)} placeholder="EGP" />
            </Field>
            <Field label="Slot Duration (min)">
              <input type="number" min={10} step={5} className="field-input" value={form.appointmentDuration} onChange={(e) => setField('appointmentDuration', Number(e.target.value))} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Online */}
      <Card label="Online Consultation">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!form.offersOnlineConsultation} onChange={(e) => setField('offersOnlineConsultation', e.target.checked)} className="h-4 w-4 accent-[#103D48]" />
            <span className="text-sm font-medium text-black">Offers online consultations</span>
          </label>
          {form.offersOnlineConsultation && (
            <Field label="Online Fee">
              <input type="number" min={0} className="field-input" value={form.onlineFee ?? 0} onChange={(e) => setField('onlineFee', Number(e.target.value))} />
            </Field>
          )}
        </div>
      </Card>

      {/* Availability */}
      <Card label="Availability">
        <div className="space-y-3">
          {DAYS.map((day) => {
            const slot = (form.availability ?? []).find((a) => a.day === day);
            const active = !!slot?.isAvailable;
            return (
              <div key={day} className="flex items-center gap-3">
                <label className="flex w-28 items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={active} onChange={() => toggleDay(day)} className="h-4 w-4 accent-[#103D48]" />
                  <span className="text-xs font-semibold capitalize text-black">{day}</span>
                </label>
                {active && slot && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={slot.from} onChange={(e) => setDayTime(day, 'from', e.target.value)} className="field-input w-28 py-1 text-xs" />
                    <span className="text-xs text-black/40">to</span>
                    <input type="time" value={slot.to} onChange={(e) => setDayTime(day, 'to', e.target.value)} className="field-input w-28 py-1 text-xs" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${isError ? 'border-black/20 bg-[#E5F3FB] text-black' : 'border-[#103D48]/30 bg-[#E5F3FB] text-[#103D48]'}`}>
          <span>{isError ? '✕' : '✓'}</span> {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-2xl bg-[#103D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
        <Link
          href={profileHref}
          className="rounded-2xl border border-[#E5F3FB] px-6 py-3.5 text-sm font-semibold text-black hover:bg-[#E5F3FB]"
        >
          View Profile
        </Link>
      </div>

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
