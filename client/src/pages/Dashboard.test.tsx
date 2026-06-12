import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

const mockGetTrips = vi.fn();

vi.mock('../services/api', () => ({
  getTrips: (...args: unknown[]) => mockGetTrips(...args),
}));

const makeTrip = (id: string) => ({
  id,
  title: `Trip ${id}`,
  description: 'A great trip.',
  destination: `Destination ${id}`,
  startDate: '2025-07-01',
  endDate: '2025-07-10',
  groupType: 'family',
  activityPref: null,
  budget: 0,
  createdById: 'u1',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
});

const makeResult = (trips = [makeTrip('1')], totalPages = 1) => ({
  results: trips,
  meta: { page: 1, pageSize: 10, totalItems: trips.length, totalPages, hasNextPage: false, hasPreviousPage: false },
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTrips.mockResolvedValue(makeResult());
  });

  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

  it('shows loading state initially', () => {
    mockGetTrips.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText(/Loading trips/i)).toBeDefined();
  });

  it('renders trips after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Trip 1')).toBeDefined();
    });
  });

  it('shows empty state when no trips', async () => {
    mockGetTrips.mockResolvedValue(makeResult([], 0));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/No trips found/i)).toBeDefined();
    });
  });

  it('shows error state on fetch failure', async () => {
    mockGetTrips.mockRejectedValue(new Error('network'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load trips/i)).toBeDefined();
    });
  });

  it('shows Post a Trip link', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Post a Trip/i })).toBeDefined();
    });
  });

  it('shows pagination when totalPages > 1', async () => {
    mockGetTrips.mockResolvedValue(makeResult([makeTrip('1'), makeTrip('2')], 3));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/i)).toBeDefined();
    });
  });

  it('advances page when Next is clicked', async () => {
    mockGetTrips.mockResolvedValue(makeResult([makeTrip('1')], 2));
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(mockGetTrips).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });
});
