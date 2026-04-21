'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { pusherClient, channelName } from '@/libs/pusher-client';
import { sendMessage, markRead } from '@/libs/actions/chat';


interface Message {
  _id: string;
  senderId: string;
  senderRole: 'user' | 'doctor';
  text: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  conversationId: string;
  initialMessages: Message[];
  myRole: 'user' | 'doctor';
  otherName: string;
  otherAvatar?: string;
}

export default function ChatWindow({ conversationId, initialMessages, myRole, otherName, otherAvatar }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(channelName(conversationId));
    channel.bind('new-message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      markRead(conversationId);
    });
    return () => {
      pusherClient.unsubscribe(channelName(conversationId));
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim() || isPending) return;
    const optimistic: Message = {
      _id: `opt-${Date.now()}`,
      senderId: 'me',
      senderRole: myRole,
      text: text.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const sent = text.trim();
    setText('');
    startTransition(async () => {
      await sendMessage(conversationId, sent);
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5F3FB] bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E5F3FB] bg-[#E5F3FB] px-5 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#103D48] text-xs font-bold text-white">
          {otherAvatar
            ? <img src={otherAvatar} alt={otherName} className="h-8 w-8 rounded-full object-cover" />
            : otherName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-black">{otherName}</p>
          <p className="text-[11px] text-black/40">{myRole === 'user' ? 'Doctor' : 'Patient'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-black/30 mt-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderRole === myRole;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? 'rounded-br-sm bg-[#103D48] text-white'
                    : 'rounded-bl-sm bg-[#E5F3FB] text-black'
                }`}
              >
                {msg.text}
                <p className={`mt-1 text-right text-[10px] ${isMine ? 'text-white/50' : 'text-black/30'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-[#E5F3FB] px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="field-input flex-1 py-2 text-sm"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#103D48] text-white transition-colors hover:bg-black disabled:opacity-40"
        >
          <svg className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

    </div>
  );
}
