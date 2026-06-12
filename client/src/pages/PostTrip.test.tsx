import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PostTrip from './PostTrip';

const mockPostTrip = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../services/api', () => ({
  postTrip: (...args: unknown[]) => mockPostTrip(...args),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PostTrip page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPostTrip = () =>
    render(
      <MemoryRouter>
        <PostTrip />
      </MemoryRouter>,
    );

  it('renders the page heading', () => {
    renderPostTrip();
    expect(screen.getByText(/Post a Trip/i)).toBeDefined();
  });

  it('renders TripForm fields', () => {
    renderPostTrip();
    expect(screen.getByPlaceholderText(/Summer Europe Family Adventure/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Paris, France/i)).toBeDefined();
  });

  it('calls postTrip and navigates on valid submit', async () => {
    mockPostTrip.mockResolvedValue({ id: 'trip-99' });
    const user = userEvent.setup();
    renderPostTrip();

    await user.type(screen.getByPlaceholderText(/Summer Europe Family Adventure/i), 'Japan Trip');
    await user.type(screen.getByPlaceholderText(/Paris, France/i), 'Tokyo');
    await user.type(
      screen.getByPlaceholderText(/Tell us about your trip/i),
      'An incredible adventure through Japan with lots of food and history.',
    );
    const dateInputs = document.querySelectorAll('input[type="date"]');
    await user.type(dateInputs[0] as HTMLElement, '2025-10-01');
    await user.type(dateInputs[1] as HTMLElement, '2025-10-15');
    await user.selectOptions(screen.getByRole('combobox'), 'family');
    await user.click(screen.getByRole('button', { name: /Post Trip/i }));

    await waitFor(() => {
      expect(mockPostTrip).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Japan Trip', destination: 'Tokyo' }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/trips/trip-99');
    });
  });
});
