'use server';

import { auth } from '@/auth';
import { connectToDB } from '@/libs/mongoose';
import Conversation from '@/libs/models/conversation';
import { pusherServer, channelName } from '@/libs/pusher-server';
import User from '@/libs/models/user';
import Doctor from '@/libs/models/doctor';

type Result<T = undefined> = { success: boolean; message: string; data?: T };

// ── helpers ────────────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return null;
  return { ...user, role: session.user.role as string };
}

// ── Get or create conversation ─────────────────────────────────────────

export async function getOrCreateConversation(doctorId: string): Promise<Result<{ id: string }>> {
  const me = await getSessionUser();
  if (!me) return { success: false, message: 'Unauthorized' };
  if (me.role !== 'user') return { success: false, message: 'Only patients can initiate chats.' };

  await connectToDB();
  let convo = await Conversation.findOne({ userId: me._id, doctorId });
  if (!convo) {
    convo = await Conversation.create({ userId: me._id, doctorId, messages: [], lastMessageAt: new Date() });
  }
  return { success: true, message: 'ok', data: { id: convo._id.toString() } };
}

// ── Get conversations list (for sidebar) ──────────────────────────────

export async function getMyConversations() {
  const me = await getSessionUser();
  if (!me) return [];

  await connectToDB();

  let conversations;
  if (me.role === 'user') {
    conversations = await Conversation.find({ userId: me._id })
      .sort({ lastMessageAt: -1 })
      .lean();

    const doctorIds = conversations.map((c) => c.doctorId);
    const doctors = await Doctor.find({ _id: { $in: doctorIds } })
      .select('displayName avatar specialty')
      .lean();
    const doctorMap = Object.fromEntries(doctors.map((d) => [d._id.toString(), d]));

    return conversations.map((c) => ({
      id: c._id.toString(),
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.messages.filter((m: { read: boolean; senderRole: string }) => !m.read && m.senderRole === 'doctor').length,
      lastMessage: c.messages.at(-1)?.text ?? '',
      other: doctorMap[c.doctorId.toString()] ?? null,
    }));
  }

  if (me.role === 'doctor') {
    const doc = await Doctor.findOne({ user: me._id }).lean();
    if (!doc) return [];

    conversations = await Conversation.find({ doctorId: doc._id })
      .sort({ lastMessageAt: -1 })
      .lean();

    const userIds = conversations.map((c) => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    return conversations.map((c) => ({
      id: c._id.toString(),
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.messages.filter((m: { read: boolean; senderRole: string }) => !m.read && m.senderRole === 'user').length,
      lastMessage: c.messages.at(-1)?.text ?? '',
      other: userMap[c.userId.toString()] ?? null,
    }));
  }

  return [];
}

// ── Get messages for a conversation ───────────────────────────────────

export async function getMessages(conversationId: string) {
  const me = await getSessionUser();
  if (!me) return [];

  await connectToDB();
  const convo = await Conversation.findById(conversationId).lean();
  if (!convo) return [];

  const isParticipant =
    convo.userId.toString() === me._id.toString() ||
    (me.role === 'doctor' && await (async () => {
      const doc = await Doctor.findOne({ user: me._id }).lean();
      return doc?._id.toString() === convo.doctorId.toString();
    })());

  if (!isParticipant) return [];

  return JSON.parse(JSON.stringify(convo.messages));
}

// ── Send message ───────────────────────────────────────────────────────

export async function sendMessage(conversationId: string, text: string): Promise<Result> {
  const trimmed = text.trim();
  if (!trimmed) return { success: false, message: 'Empty message.' };

  const me = await getSessionUser();
  if (!me) return { success: false, message: 'Unauthorized' };

  await connectToDB();
  const convo = await Conversation.findById(conversationId);
  if (!convo) return { success: false, message: 'Conversation not found.' };

  let senderRole: 'user' | 'doctor';
  if (me.role === 'user' && convo.userId.toString() === me._id.toString()) {
    senderRole = 'user';
  } else if (me.role === 'doctor') {
    const doc = await Doctor.findOne({ user: me._id }).lean();
    if (!doc || doc._id.toString() !== convo.doctorId.toString()) {
      return { success: false, message: 'Unauthorized' };
    }
    senderRole = 'doctor';
  } else {
    return { success: false, message: 'Unauthorized' };
  }

  const msg = { senderId: me._id, senderRole, text: trimmed, read: false, createdAt: new Date() };
  convo.messages.push(msg as never);
  convo.lastMessageAt = new Date();
  await convo.save();

  const saved = convo.messages.at(-1);
  const payload = JSON.parse(JSON.stringify(saved));

  await pusherServer.trigger(channelName(conversationId), 'new-message', payload);

  return { success: true, message: 'sent' };
}

// ── Mark messages as read ─────────────────────────────────────────────

export async function markRead(conversationId: string): Promise<void> {
  const me = await getSessionUser();
  if (!me) return;

  await connectToDB();
  const convo = await Conversation.findById(conversationId);
  if (!convo) return;

  const opposite: 'user' | 'doctor' = me.role === 'user' ? 'doctor' : 'user';
  let changed = false;
  for (const msg of convo.messages) {
    if (msg.senderRole === opposite && !msg.read) {
      msg.read = true;
      changed = true;
    }
  }
  if (changed) await convo.save();
}

// ── Unread count (for navbar badge) ──────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const me = await getSessionUser();
  if (!me || me.role === 'admin') return 0;

  await connectToDB();

  if (me.role === 'user') {
    const convos = await Conversation.find({ userId: me._id }).lean();
    return convos.reduce((sum, c) => sum + c.messages.filter((m: { read: boolean; senderRole: string }) => !m.read && m.senderRole === 'doctor').length, 0);
  }

  if (me.role === 'doctor') {
    const doc = await Doctor.findOne({ user: me._id }).lean();
    if (!doc) return 0;
    const convos = await Conversation.find({ doctorId: doc._id }).lean();
    return convos.reduce((sum, c) => sum + c.messages.filter((m: { read: boolean; senderRole: string }) => !m.read && m.senderRole === 'user').length, 0);
  }

  return 0;
}
