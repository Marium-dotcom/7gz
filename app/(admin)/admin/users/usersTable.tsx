'use client';

import { useState, useTransition } from 'react';
import { setUserRole, setUserBlocked } from '@/libs/actions/user';
import { USER_ROLES, type UserRole } from '@/libs/constants/user';
import type { IUser } from '@/libs/models/user';

type UserRow = Partial<IUser & { _id: string }>;

export default function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  function notify(id: string, ok: boolean, msg: string) {
    setFeedback({ id, msg, ok });
    setTimeout(() => setFeedback(null), 3000);
  }

  function handleRoleChange(user: UserRow, role: UserRole) {
    if (!user._id) return;
    startTransition(async () => {
      const res = await setUserRole(user._id!, role);
      if (res.success) setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role } : u));
      notify(user._id!, res.success, res.message);
    });
  }

  function handleToggleBlock(user: UserRow) {
    if (!user._id) return;
    const next = !user.isBlocked;
    startTransition(async () => {
      const res = await setUserBlocked(user._id!, next);
      if (res.success) setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isBlocked: next } : u));
      notify(user._id!, res.success, res.message);
    });
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5F3FB] bg-white px-6 py-16 text-center text-sm text-black/40">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#E5F3FB] bg-[#E5F3FB] px-6 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#103D48]">
          All Users
        </h2>
      </div>

      <div className="divide-y divide-[#E5F3FB]">
        {users.map((user) => (
          <div key={user._id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-6">

            {/* Avatar + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F3FB] text-sm font-bold text-[#103D48]">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">{user.name ?? '—'}</p>
                <p className="truncate text-xs text-black/40">{user.email ?? '—'}</p>
              </div>
            </div>

            {/* Role selector */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
                Role
              </label>
              <select
                value={user.role ?? 'user'}
                onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                disabled={isPending}
                className="rounded-lg border border-[#E5F3FB] bg-[#E5F3FB] px-3 py-1.5 text-xs font-semibold text-[#103D48] focus:outline-none focus:ring-2 focus:ring-[#103D48]/30 disabled:opacity-50"
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Block toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="relative inline-flex cursor-pointer items-center" title={user.isBlocked ? 'Unblock user' : 'Block user'}>
                <input
                  type="checkbox"
                  checked={!!user.isBlocked}
                  onChange={() => handleToggleBlock(user)}
                  className="peer sr-only"
                  disabled={isPending}
                />
                <div className="h-5 w-9 rounded-full bg-[#E5F3FB] transition-colors peer-checked:bg-black" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </label>
              <span className="text-xs font-medium text-black/50">
                {user.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>

            {/* Inline feedback */}
            {feedback !== null && feedback.id === user._id && (
              <span className={`text-xs font-medium ${feedback.ok ? 'text-[#103D48]' : 'text-black'}`}>
                {feedback.ok ? '✓' : '✕'} {feedback.msg}
              </span>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
