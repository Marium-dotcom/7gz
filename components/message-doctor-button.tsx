'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/libs/actions/chat';

export default function MessageDoctorButton({ doctorId }: { doctorId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const res = await getOrCreateConversation(doctorId);
      if (res.success) router.push('/messages');
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#103D48] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black disabled:opacity-50"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {isPending ? 'Opening…' : 'Message Doctor'}
    </button>
  );
}
