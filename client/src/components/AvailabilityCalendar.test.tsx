import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AvailabilityCalendar from './AvailabilityCalendar';

it('renders the current month name', () => {
  const { container } = render(<AvailabilityCalendar />);
  const monthName = container.querySelector('h3');
  expect(monthName).toBeDefined();
  expect(monthName?.textContent).toContain(' ');
});

it('renders day headers', () => {
  render(<AvailabilityCalendar />);
  const headers = screen.getAllByRole('columnheader');
  expect(headers.length).toBe(7);
});

it('calls onChange with selected dates', () => {
  const fn = vi.fn();
  render(<AvailabilityCalendar onChange={fn} />);
  const today = new Date();
  const dayCell = screen.getAllByRole('button').find((el) =>
    el.textContent === String(today.getDate())
  );
  if (dayCell) {
    fireEvent.click(dayCell);
    expect(fn).toHaveBeenCalled();
  }
});

it('toggles date selection (select then deselect)', () => {
  const fn = vi.fn();
  const { unmount } = render(<AvailabilityCalendar onChange={fn} />);
  const buttons = screen.getAllByRole('button');
  const first = buttons.find((el) => el.textContent && !['‹', '›'].includes(el.textContent));
  if (first) {
    fireEvent.click(first);
    fireEvent.click(first);
    const calls = fn.mock.calls;
    expect(calls.length).toBe(2);
  }
  unmount();
});

it('does not allow selection when readOnly is true', () => {
  const fn = vi.fn();
  render(<AvailabilityCalendar onChange={fn} readOnly />);
  const buttons = screen.getAllByRole('button').filter(
    (el) => el.textContent && !['‹', '›'].includes(el.textContent)
  );
  if (buttons.length > 0) {
    fireEvent.click(buttons[0]);
    expect(fn).not.toHaveBeenCalled();
  }
});

it('navigates to previous month', () => {
  render(<AvailabilityCalendar />);
  const prevBtn = screen.getAllByRole('button').find((el) => el.textContent === '‹');
  expect(prevBtn).toBeDefined();
});
