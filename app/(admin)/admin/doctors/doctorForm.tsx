'use client';

import { useState, useTransition } from 'react';
import { upsertDoctor, addEducation, removeEducation, addExperience, removeExperience } from '@/libs/actions/doctor';
import type { IDoctor, IEducation, IExperience } from '@/libs/models/doctor';

type Doc = Partial<IDoctor & { _id: string }>;

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
const GENDERS = ['male','female','other'] as const;

export default function DoctorForm({
  initialData,
  onSaved,
  onCancel,
}: {
  initialData: Doc | null;
  onSaved: (doc: Doc) => void;
  onCancel: () => void;
}) {
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
    licenseNumber:            initialData?.licenseNumber            ?? '',
    yearsOfExperience:        initialData?.yearsOfExperience        ?? 0,
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
    isVerified:               initialData?.isVerified               ?? false,
    isActive:                 initialData?.isActive                 ?? true,
    isPublished:              initialData?.isPublished              ?? false,
    availability:             initialData?.availability             ?? [],
    education:                initialData?.education                ?? [],
    experience:               initialData?.experience               ?? [],
  });

  // Education add state
  const [newEdu, setNewEdu] = useState<IEducation>({ degree: '', institution: '', year: new Date().getFullYear() });
  // Experience add state
  const [newExp, setNewExp] = useState<IExperience>({ title: '', workplace: '', from: new Date().getFullYear(), isCurrent: true });

  function notify(ok: boolean, msg: string) { setIsError(!ok); setMessage(msg); }

  function setField<K extends keyof IDoctor>(key: K, val: IDoctor[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      const payload = initialData?._id
        ? (({ education: _e, experience: _x, ...rest }) => rest)(form as Required<typeof form>)
        : form;
      const res = await upsertDoctor(initialData?._id ?? null, payload);
      notify(res.success, res.message);
      if (res.success) onSaved({ ...(form as Doc), _id: res.id as Doc['_id'] });
    });
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

  function handleAddEdu() {
    if (!newEdu.degree || !newEdu.institution) return;
    if (initialData?._id) {
      startTransition(async () => {
        const res = await addEducation(initialData._id!, newEdu);
        notify(res.success, res.message);
        if (res.success) {
          setForm((p) => ({ ...p, education: [...(p.education ?? []), newEdu] }));
          setNewEdu({ degree: '', institution: '', year: new Date().getFullYear() });
        }
      });
    } else {
      setForm((p) => ({ ...p, education: [...(p.education ?? []), newEdu] }));
      setNewEdu({ degree: '', institution: '', year: new Date().getFullYear() });
    }
  }

  function handleRemoveEdu(idx: number) {
    if (initialData?._id) {
      startTransition(async () => {
        const res = await removeEducation(initialData._id!, idx);
        notify(res.success, res.message);
        if (res.success) setForm((p) => ({ ...p, education: (p.education ?? []).filter((_, i) => i !== idx) }));
      });
    } else {
      setForm((p) => ({ ...p, education: (p.education ?? []).filter((_, i) => i !== idx) }));
    }
  }

  function handleAddExp() {
    if (!newExp.title || !newExp.workplace) return;
    if (initialData?._id) {
      startTransition(async () => {
        const res = await addExperience(initialData._id!, newExp);
        notify(res.success, res.message);
        if (res.success) {
          setForm((p) => ({ ...p, experience: [...(p.experience ?? []), newExp] }));
          setNewExp({ title: '', workplace: '', from: new Date().getFullYear(), isCurrent: true });
        }
      });
    } else {
      setForm((p) => ({ ...p, experience: [...(p.experience ?? []), newExp] }));
      setNewExp({ title: '', workplace: '', from: new Date().getFullYear(), isCurrent: true });
    }
  }

  function handleRemoveExp(idx: number) {
    if (initialData?._id) {
      startTransition(async () => {
        const res = await removeExperience(initialData._id!, idx);
        notify(res.success, res.message);
        if (res.success) setForm((p) => ({ ...p, experience: (p.experience ?? []).filter((_, i) => i !== idx) }));
      });
    } else {
      setForm((p) => ({ ...p, experience: (p.experience ?? []).filter((_, i) => i !== idx) }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Back */}
      <button type="button" onClick={onCancel} className="text-xs font-semibold text-[#103D48] hover:underline">
        ← Back to list
      </button>

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
            <textarea className="field-input min-h-20 resize-y" value={form.bio} onChange={(e) => setField('bio', e.target.value)} placeholder="Short professional bio…" />
          </Field>
          <Field label="Languages (comma-separated)">
            <input className="field-input" value={(form.languages ?? []).join(', ')} onChange={(e) => setField('languages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Arabic, English" />
          </Field>
        </div>
      </Card>

      {/* Medical */}
      <Card label="Medical Info">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Specialty *">
              <input required className="field-input" value={form.specialty} onChange={(e) => setField('specialty', e.target.value)} placeholder="Cardiology" />
            </Field>
            <Field label="License Number *">
              <input required className="field-input" value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} placeholder="EG-12345" />
            </Field>
          </div>
          <Field label="Subspecialties (comma-separated)">
            <input className="field-input" value={(form.subspecialties ?? []).join(', ')} onChange={(e) => setField('subspecialties', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Interventional, Pediatric" />
          </Field>
          <Field label="Years of Experience">
            <input type="number" min={0} className="field-input" value={form.yearsOfExperience} onChange={(e) => setField('yearsOfExperience', Number(e.target.value))} />
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

      {/* Education */}
      <Card label="Education">
        <div className="space-y-3">
          {(form.education ?? []).map((edu, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-[#E5F3FB] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-black">{edu.degree}</p>
                <p className="text-xs text-black/50">{edu.institution} · {edu.year}</p>
              </div>
              <button type="button" onClick={() => handleRemoveEdu(i)} className="text-xs font-medium text-black/40 hover:text-black">Remove</button>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Degree">
              <input className="field-input" value={newEdu.degree} onChange={(e) => setNewEdu((p) => ({ ...p, degree: e.target.value }))} placeholder="MBBS" />
            </Field>
            <Field label="Institution">
              <input className="field-input" value={newEdu.institution} onChange={(e) => setNewEdu((p) => ({ ...p, institution: e.target.value }))} placeholder="Cairo University" />
            </Field>
            <Field label="Year">
              <input type="number" className="field-input" value={newEdu.year} onChange={(e) => setNewEdu((p) => ({ ...p, year: Number(e.target.value) }))} />
            </Field>
          </div>
          <button type="button" onClick={handleAddEdu} disabled={isPending} className="rounded-xl border border-dashed border-[#103D48]/30 px-4 py-2 text-xs font-semibold text-[#103D48] hover:bg-[#E5F3FB] disabled:opacity-50">
            + Add Education
          </button>
        </div>
      </Card>

      {/* Experience */}
      <Card label="Experience">
        <div className="space-y-3">
          {(form.experience ?? []).map((exp, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-[#E5F3FB] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-black">{exp.title}</p>
                <p className="text-xs text-black/50">{exp.workplace} · {exp.from}–{exp.isCurrent ? 'Present' : exp.to}</p>
              </div>
              <button type="button" onClick={() => handleRemoveExp(i)} className="text-xs font-medium text-black/40 hover:text-black">Remove</button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className="field-input" value={newExp.title} onChange={(e) => setNewExp((p) => ({ ...p, title: e.target.value }))} placeholder="Consultant Cardiologist" />
            </Field>
            <Field label="Workplace">
              <input className="field-input" value={newExp.workplace} onChange={(e) => setNewExp((p) => ({ ...p, workplace: e.target.value }))} placeholder="Ain Shams Hospital" />
            </Field>
            <Field label="From (year)">
              <input type="number" className="field-input" value={newExp.from} onChange={(e) => setNewExp((p) => ({ ...p, from: Number(e.target.value) }))} />
            </Field>
            <Field label="To (year)">
              <input type="number" className="field-input" disabled={newExp.isCurrent} value={newExp.to ?? ''} onChange={(e) => setNewExp((p) => ({ ...p, to: Number(e.target.value) }))} placeholder="Leave blank if current" />
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newExp.isCurrent} onChange={(e) => setNewExp((p) => ({ ...p, isCurrent: e.target.checked, to: e.target.checked ? undefined : p.to }))} className="h-4 w-4 accent-[#103D48]" />
            <span className="text-xs font-medium text-black/60">Currently working here</span>
          </label>
          <button type="button" onClick={handleAddExp} disabled={isPending} className="rounded-xl border border-dashed border-[#103D48]/30 px-4 py-2 text-xs font-semibold text-[#103D48] hover:bg-[#E5F3FB] disabled:opacity-50">
            + Add Experience
          </button>
        </div>
      </Card>

      {/* Status flags */}
      <Card label="Status">
        <div className="flex flex-wrap gap-6">
          {(['isVerified', 'isActive', 'isPublished'] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form[flag]} onChange={(e) => setField(flag, e.target.checked)} className="h-4 w-4 accent-[#103D48]" />
              <span className="text-sm font-medium text-black capitalize">{flag.replace('is', '')}</span>
            </label>
          ))}
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
          {isPending ? 'Saving…' : 'Save Doctor Profile'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl border border-[#E5F3FB] px-6 py-3.5 text-sm font-semibold text-black hover:bg-[#E5F3FB]">
          Cancel
        </button>
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
