import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMyConversations, getMessages } from '@/libs/actions/chat';
import ConversationList from '@/components/conversation-list';

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect('/');
  if (session.user.role !== 'user') redirect('/');

  const conversations = await getMyConversations();

  const initialMessages: Record<string, unknown[]> = {};
  if (conversations[0]) {
    initialMessages[conversations[0].id] = await getMessages(conversations[0].id);
  }

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">My Messages</h1>
          <p className="mt-1 text-sm text-black/40">Chat with your doctors</p>
        </div>
        <ConversationList
          conversations={conversations as never}
          myRole="user"
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
