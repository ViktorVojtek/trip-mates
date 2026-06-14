import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Chat from './Chat';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const mockGetMessages = vi.fn();
const mockSendMessage = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../services/api', () => ({
  getMessages: (...args: unknown[]) => mockGetMessages(...args),
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  getUser: (...args: unknown[]) => mockGetUser(...args),
}));

vi.mock('../components/ChatBubble', () => ({
  default: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-bubble">{message.content}</div>
  ),
}));

const currentUser = { id: 'u1', name: 'Alice', profilePicture: null };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

const makeMessage = (id: string, senderId = 'u1', receiverId = 'u2', content = `msg ${id}`) => ({
  id,
  senderId,
  receiverId,
  content,
  createdAt: `2025-01-0${id}T00:00:00.000Z`,
});

const makePartner = (id = 'u2') => ({
  id,
  name: 'Bob',
  email: 'bob@example.com',
  bio: null,
  profilePicture: null,
  familySize: 0,
  childrenAges: null,
  travelPreferences: null,
  availability: null,
  createdAt: '2024-01-01',
});

const renderChat = (userId?: string) =>
  render(
    <MemoryRouter initialEntries={[userId ? `/chat/${userId}` : '/chat']}>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:userId" element={<Chat />} />
      </Routes>
    </MemoryRouter>,
  );

describe('Chat page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMessages.mockResolvedValue([]);
    mockGetUser.mockResolvedValue(makePartner());
    mockSendMessage.mockResolvedValue(makeMessage('new', 'u1', 'u2', 'hello'));
  });

  it('shows Messages heading', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeDefined();
    });
  });

  it('shows empty conversations state when no messages', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/No conversations yet/i)).toBeDefined();
    });
  });

  it('shows placeholder when no userId selected', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/Select a conversation to start messaging/i)).toBeDefined();
    });
  });

  it('shows conversations from getMessages', async () => {
    mockGetMessages.mockResolvedValue([makeMessage('1', 'u1', 'u2')]);
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeDefined();
    });
  });

  it('shows message area when userId is in URL', async () => {
    mockGetMessages.mockResolvedValue([]);
    renderChat('u2');
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message/i)).toBeDefined();
    });
  });

  it('shows no messages text in conversation area', async () => {
    mockGetMessages.mockResolvedValue([]);
    renderChat('u2');
    await waitFor(() => {
      expect(screen.getByText(/No messages yet/i)).toBeDefined();
    });
  });

  it('renders chat bubbles when messages exist', async () => {
    mockGetMessages
      .mockResolvedValueOnce([])
      .mockResolvedValue([makeMessage('1', 'u1', 'u2', 'hello there')]);
    renderChat('u2');
    await waitFor(() => {
      expect(screen.getByTestId('chat-bubble')).toBeDefined();
    });
  });

  it('sends message on form submit', async () => {
    mockGetMessages.mockResolvedValue([]);
    const user = userEvent.setup();
    renderChat('u2');
    await waitFor(() => screen.getByPlaceholderText(/Type a message/i));
    await user.type(screen.getByPlaceholderText(/Type a message/i), 'hello');
    await user.click(screen.getByRole('button', { name: /Send/i }));
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({ content: 'hello', receiverId: 'u2' });
    });
  });

  it('disables Send button when input is empty', async () => {
    mockGetMessages.mockResolvedValue([]);
    renderChat('u2');
    await waitFor(() => screen.getByRole('button', { name: /Send/i }));
    const btn = screen.getByRole('button', { name: /Send/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
