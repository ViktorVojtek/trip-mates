import type { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isMine: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBubble({ message, isMine }: ChatBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>
        <span
          className={`text-xs mt-1 block text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
