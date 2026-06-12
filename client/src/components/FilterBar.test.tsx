import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from './FilterBar';
import type { TripFilters } from '../types';

describe('FilterBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders destination input', () => {
    render(<FilterBar onFilter={() => {}} />);
    expect(screen.getByPlaceholderText(/Paris/)).toBeDefined();
  });

  it('renders group type select', () => {
    render(<FilterBar onFilter={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('renders date input for start date', () => {
    render(<FilterBar onFilter={() => {}} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('calls onFilter with filter values after debounce', () => {
    const fn = vi.fn();
    render(<FilterBar onFilter={fn} />);
    const input = screen.getByPlaceholderText(/Paris/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Paris' } });
    vi.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledWith({ destination: 'Paris' });
  });

  it('calls onFilter with empty object when clear is clicked', () => {
    const fn = vi.fn();
    render(<FilterBar onFilter={fn} />);

    const input = screen.getByPlaceholderText(/Paris/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Paris' } });
    vi.advanceTimersByTime(400);

    const buttons = screen.getAllByRole('button');
    const clearBtn = buttons[buttons.length - 1];
    fireEvent.click(clearBtn);
    expect(fn).toHaveBeenLastCalledWith({});
  });

  it('shows clear button when filters are active', () => {
    const fn = vi.fn();
    render(<FilterBar onFilter={fn} />);
    const input = screen.getByPlaceholderText(/Paris/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Paris' } });
    vi.advanceTimersByTime(400);
    expect(screen.getByText('Clear')).toBeDefined();
  });

  it('does not show clear button when no filters', () => {
    render(<FilterBar onFilter={() => {}} />);
    expect(screen.queryByText('Clear')).toBeNull();
  });
});
