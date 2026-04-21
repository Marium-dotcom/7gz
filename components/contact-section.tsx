'use client';

import { useState, useTransition } from 'react';

export function ContactSection() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    });
  }

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-[#103D48]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#103D48]">
            Contact Us
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 lg:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-3 max-w-xl text-base text-gray-500">
            Have a question or need help? Fill out the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* Info cards */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {[
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                label: 'Email',
                value: 'support@medbook.com',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                label: 'Phone',
                value: '+20 100 000 0000',
              },
              {
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                label: 'Address',
                value: 'Cairo, Egypt',
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-[#E5F3FB] bg-[#E5F3FB] px-5 py-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#103D48] text-white">
                  {icon}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#103D48]/60">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm lg:col-span-3">
            <div className="border-b border-[#E5F3FB] bg-[#E5F3FB] px-6 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#103D48]">Send a Message</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full Name *">
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ahmed Hassan"
                    className="field-input"
                  />
                </FormField>
                <FormField label="Email Address *">
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ahmed@example.com"
                    className="field-input"
                  />
                </FormField>
              </div>

              <FormField label="Subject">
                <select name="subject" value={form.subject} onChange={handleChange} className="field-input">
                  <option value="">Select a topic…</option>
                  <option value="appointment">Appointment Help</option>
                  <option value="doctor">Doctor Inquiry</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </FormField>

              <FormField label="Message *">
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={5}
                  className="field-input resize-none"
                />
              </FormField>

              {status === 'success' && (
                <div className="flex items-center gap-2 rounded-xl border border-[#103D48]/20 bg-[#E5F3FB] px-4 py-3 text-sm font-medium text-[#103D48]">
                  <span>✓</span> Message sent! We'll be in touch soon.
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-[#103D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-black/40">{label}</label>
      {children}
    </div>
  );
}
