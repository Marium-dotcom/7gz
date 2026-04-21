'use client';

import { useState } from 'react';
import ChatWindow from './chat-window';

interface Conversation {
  id: string;
  lastMessageAt: string;
  unreadCount: number;
  lastMessage: string;
  other: { displayName?: string; name?: string; avatar?: string; specialty?: string } | null;
}

interface Props {
  conversations: Conversation[];
  myRole: 'user' | 'doctor';
  initialMessages: Record<string, unknown[]>;
}

export default function ConversationList({ conversations, myRole, initialMessages }: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null
  );

  const active = conversations.find((c) => c.id === activeId);
  const otherName = active?.other
    ? (active.other.displayName ?? active.other.name ?? 'Unknown')
    : 'Unknown';

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">

      {/* Sidebar */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">
        <div className="border-b border-[#E5F3FB] bg-[#E5F3FB] px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#103D48]">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5F3FB]">
          {conversations.length === 0 && (
            <p className="px-5 py-10 text-center text-xs text-black/30">No conversations yet.</p>
          )}
          {conversations.map((c) => {
            const name = c.other?.displayName ?? c.other?.name ?? 'Unknown';
            const initial = name[0]?.toUpperCase() ?? '?';
            const isActive = c.id === activeId;

            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#E5F3FB] ${isActive ? 'bg-[#E5F3FB]' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#103D48] text-xs font-bold text-white">
                    {c.other?.avatar
                      ? <img src={c.other.avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
                      : initial}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#103D48] text-[10px] font-bold text-white">
                      {c.unreadCount > 9 ? '9+' : c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold text-black ${c.unreadCount > 0 ? 'font-bold' : ''}`}>{name}</p>
                  <p className="truncate text-xs text-black/40">{c.lastMessage || 'No messages yet'}</p>
                </div>
                <p className="shrink-0 text-[10px] text-black/30">
                  {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1">
        {activeId ? (
          <ChatWindow
            conversationId={activeId}
            initialMessages={(initialMessages[activeId] ?? []) as never}
            myRole={myRole}
            otherName={otherName}
            otherAvatar={active?.other?.avatar}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-[#E5F3FB] bg-white text-sm text-black/30">
            Select a conversation to start chatting.
          </div>
        )}
      </div>

    </div>
  );
}
