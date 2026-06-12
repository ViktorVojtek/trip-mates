import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, sendMessage, getUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Message, User } from '../types';
import ChatBubble from '../components/ChatBubble';
import { getInitials } from '../utils/helpers';

const POLL_INTERVAL = 5000;

interface ConversationSummary {
  partner: User;
  latestMessage: Message;
}

export default function Chat() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const allMessages = await getMessages({});
        const partnerMap = new Map<string, Message>();
        for (const msg of allMessages) {
          const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
          const existing = partnerMap.get(partnerId);
          if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
            partnerMap.set(partnerId, msg);
          }
        }
        const summaries = await Promise.all(
          [...partnerMap.entries()].map(async ([partnerId, latestMessage]) => {
            const partner = await getUser(partnerId);
            return { partner, latestMessage };
          }),
        );
        summaries.sort(
          (a, b) =>
            new Date(b.latestMessage.createdAt).getTime() -
            new Date(a.latestMessage.createdAt).getTime(),
        );
        setConversations(summaries);
      } catch {
        // sidebar stays empty on error
      } finally {
        setLoadingConversations(false);
      }
    };
    void fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    setMessagesLoading(true);

    const fetchMessages = async () => {
      try {
        const msgs = await getMessages({ userId });
        setMessages(msgs);
      } finally {
        setMessagesLoading(false);
      }
    };

    void fetchMessages();
    const interval = setInterval(() => void fetchMessages(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userId) return;
    try {
      setSending(true);
      const msg = await sendMessage({ content: content.trim(), receiverId: userId });
      setMessages((prev) => [...prev, msg]);
      setContent('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8 flex gap-4"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      {/* Left sidebar — conversation list */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-sm text-gray-400 text-center">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">No conversations yet.</div>
          ) : (
            conversations.map(({ partner, latestMessage }) => (
              <Link
                key={partner.id}
                to={`/chat/${partner.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                  userId === partner.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {partner.profilePicture ? (
                    <img
                      src={partner.profilePicture}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(partner.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{partner.name}</p>
                  <p className="text-xs text-gray-400 truncate">{latestMessage.content}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Right — chat area */}
      {userId ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-3 min-h-0">
            {messagesLoading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} isMine={msg.senderId === user?.id} />
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(e) => void handleSend(e)} className="mt-3 flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Select a conversation to start messaging.
        </div>
      )}
    </div>
  );
}
