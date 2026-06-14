import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

const mockGetTrips = vi.fn();

vi.mock('../services/api', () => ({
  getTrips: (...args: unknown[]) => mockGetTrips(...args),
}));

vi.mock('../components/TripCard', () => ({
  default: ({ trip }: { trip: { title: string } }) => <div data-testid="trip-card">{trip.title}</div>,
}));

const makeTrip = (id: string) => ({
  id,
  title: `Trip ${id}`,
  description: 'A great trip.',
  destination: `City ${id}`,
  startDate: '2025-07-01',
  endDate: '2025-07-10',
  groupType: 'family',
  activityPref: null,
  budget: 0,
  createdById: 'u1',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
});

const makeResult = (trips = [makeTrip('1')]) => ({
  results: trips,
  meta: { page: 1, pageSize: 3, totalItems: trips.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
});

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderLanding = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>,
  );

describe('Landing page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
    mockGetTrips.mockResolvedValue(makeResult());
  });

  it('renders hero headline', async () => {
    renderLanding();
    expect(screen.getByText(/Travel Together, Better/i)).toBeDefined();
  });

  it('shows Get Started and Sign In links when not logged in', async () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /Get Started Free/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeDefined();
  });

  it('shows Go to Dashboard link when logged in', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1', name: 'Alice' } });
    renderLanding();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toBeDefined();
  });

  it('shows How It Works section', () => {
    renderLanding();
    expect(screen.getByText(/How It Works/i)).toBeDefined();
  });

  it('shows loading state while fetching trips', () => {
    mockGetTrips.mockImplementation(() => new Promise(() => {}));
    renderLanding();
    expect(screen.getByText(/Loading trips/i)).toBeDefined();
  });

  it('renders featured trips after load', async () => {
    mockGetTrips.mockResolvedValue(makeResult([makeTrip('1'), makeTrip('2')]));
    renderLanding();
    await waitFor(() => {
      expect(screen.getAllByTestId('trip-card')).toHaveLength(2);
    });
  });

  it('shows empty message when no trips', async () => {
    mockGetTrips.mockResolvedValue(makeResult([]));
    renderLanding();
    await waitFor(() => {
      expect(screen.getByText(/No trips posted yet/i)).toBeDefined();
    });
  });

  it('shows CTA section when not logged in', async () => {
    renderLanding();
    await waitFor(() => {
      expect(screen.getByText(/Ready to find your travel mates/i)).toBeDefined();
    });
  });

  it('hides CTA section when logged in', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1', name: 'Alice' } });
    renderLanding();
    await waitFor(() => {
      expect(screen.queryByText(/Ready to find your travel mates/i)).toBeNull();
    });
  });
});
