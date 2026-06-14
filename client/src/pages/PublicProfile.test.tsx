import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicProfile from './PublicProfile';

const mockGetUser = vi.fn();
const mockGetTrips = vi.fn();

vi.mock('../services/api', () => ({
  getUser: (...args: unknown[]) => mockGetUser(...args),
  getTrips: (...args: unknown[]) => mockGetTrips(...args),
}));

vi.mock('../components/TripCard', () => ({
  default: ({ trip }: { trip: { title: string } }) => (
    <div data-testid="trip-card">{trip.title}</div>
  ),
}));

const makeUser = (overrides = {}) => ({
  id: 'u2',
  name: 'Bob Smith',
  email: 'bob@example.com',
  bio: 'Loves travel',
  profilePicture: null,
  familySize: 3,
  childrenAges: '5, 8',
  travelPreferences: 'beaches,mountains',
  availability: '2025-07-01,2025-08-01',
  createdAt: '2023-05-15T00:00:00.000Z',
  ...overrides,
});

const makeTrip = (id: string) => ({
  id,
  title: `Bob Trip ${id}`,
  description: 'Nice trip',
  destination: 'Paris',
  startDate: '2025-07-01',
  endDate: '2025-07-10',
  groupType: 'family',
  activityPref: null,
  budget: 1000,
  createdById: 'u2',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
});

const makeResult = (trips = [makeTrip('1')]) => ({
  results: trips,
  meta: { page: 1, pageSize: 50, totalItems: trips.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
});

const renderPublicProfile = (userId = 'u2') =>
  render(
    <MemoryRouter initialEntries={[`/profile/${userId}`]}>
      <Routes>
        <Route path="/profile/:userId" element={<PublicProfile />} />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicProfile page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue(makeUser());
    mockGetTrips.mockResolvedValue(makeResult());
  });

  it('shows loading state initially', () => {
    mockGetUser.mockImplementation(() => new Promise(() => {}));
    renderPublicProfile();
    expect(screen.getByText(/Loading profile/i)).toBeDefined();
  });

  it('renders user name after load', async () => {
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeDefined();
    });
  });

  it('shows member since year', async () => {
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByText(/Member since 2023/i)).toBeDefined();
    });
  });

  it('shows bio', async () => {
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByText('Loves travel')).toBeDefined();
    });
  });

  it('shows travel preferences as tags', async () => {
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByText('beaches')).toBeDefined();
      expect(screen.getByText('mountains')).toBeDefined();
    });
  });

  it('renders posted trips', async () => {
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByTestId('trip-card')).toBeDefined();
    });
  });

  it('hides trips section when no trips', async () => {
    mockGetTrips.mockResolvedValue(makeResult([]));
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.queryByTestId('trip-card')).toBeNull();
    });
  });

  it('shows error when user not found', async () => {
    mockGetUser.mockRejectedValue(new Error('404'));
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeDefined();
    });
  });

  it('shows back to dashboard link on error', async () => {
    mockGetUser.mockRejectedValue(new Error('404'));
    renderPublicProfile();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toBeDefined();
    });
  });
});
