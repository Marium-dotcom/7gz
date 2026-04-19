'use client';

import { useState } from 'react';

const SPECIALISTS = [
  'Orthodontics', 'Cardiology', 'Dermatology', 'Neurology',
  'Pediatrics', 'Ophthalmology', 'General Practice',
];

export default function DoctorSearchBar() {
  const [date, setDate] = useState('');
  const [specialist, setSpecialist] = useState('Orthodontics');
  const [location, setLocation] = useState('New York, USA');

  return (
    <div className="w-full rounded-2xl  max-w-7xl border border-[#a8e8f7] bg-[#EAFBFF] p-2">
      <div className="flex flex-col items-stretch divide-y divide-[#a8e8f7]/10 overflow-hidden rounded-xl bg-white lg:flex-row lg:divide-x lg:divide-y-0">

        {/* Dates */}
        <label className="flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-[#EAFBFF]/60">
          <CalendarIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Dates</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none [color-scheme:light]"
            />
          </div>
        </label>

        {/* Specialist */}
        <label className="flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-[#EAFBFF]/60">
          <SpecialistIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Specialist</p>
            <select
              value={specialist}
              onChange={(e) => setSpecialist(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            >
              {SPECIALISTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </label>

        {/* Location */}
        <label className="flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-[#EAFBFF]/60">
          <LocationIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Location</p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
        </label>

        {/* Button */}
        <div className="flex items-center p-2">
          <button className="w-full rounded-xl bg-[#a8e8f7] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#1e3a6e] lg:w-auto lg:whitespace-nowrap">
            Search Doctor
          </button>
        </div>

      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#a8e8f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function SpecialistIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#a8e8f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#a8e8f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 0 1 14 0c0 5-7 12.5-7 12.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8.5" r="2.5" />
    </svg>
  );
}
