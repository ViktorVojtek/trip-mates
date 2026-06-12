import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatBubble from './ChatBubble';
import type { Message } from '../types';

const makeMessage = (overrides?: Partial<Message>): Message => ({
  id: '1',
  content: 'Hello there!',
  senderId: 'u1',
  receiverId: 'u2',
  tripId: null,
  createdAt: '2025-06-01T12:00:00.000Z',
  ...overrides,
});

it('renders message content', () => {
  render(<ChatBubble message={makeMessage()} isMine={false} />);
  expect(screen.getByText('Hello there!')).toBeDefined();
});

it('renders with right alignment when isMine is true', () => {
  const { container } = render(<ChatBubble message={makeMessage()} isMine={true} />);
  const outer = container.firstChild as HTMLElement;
  expect(outer.className).toContain('justify-end');
});

it('renders with left alignment when isMine is false', () => {
  const { container } = render(<ChatBubble message={makeMessage()} isMine={false} />);
  const outer = container.firstChild as HTMLElement;
  expect(outer.className).toContain('justify-start');
});

it('renders time in the correct format', () => {
  render(<ChatBubble message={makeMessage({ createdAt: '2025-06-01T12:00:00.000Z' })} isMine={false} />);
  const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
  expect(timeElements.length).toBeGreaterThan(0);
});
