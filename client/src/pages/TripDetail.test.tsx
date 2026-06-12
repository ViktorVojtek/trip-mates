import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TripDetail from './TripDetail';

const mockGetTripDetail = vi.fn();
const mockExpressInterest = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../services/api', () => ({
  getTripDetail: (...args: unknown[]) => mockGetTripDetail(...args),
  expressInterest: (...args: unknown[]) => mockExpressInterest(...args),
  getUser: (...args: unknown[]) => mockGetUser(...args),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      name: 'Alice',
      travelPreferences: 'hiking',
    },
  }),
}));

const makeTrip = (overrides = {}) => ({
  id: 'trip-1',
  title: 'Rome Adventure',
  description: 'A wonderful trip through Rome.',
  destination: 'Rome, Italy',
  startDate: '2025-09-01',
  endDate: '2025-09-14',
  groupType: 'family',
  activityPref: 'museums,food',
  budget: 1500,
  createdById: 'u2',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  ...overrides,
});

const makeCreator = () => ({
  id: 'u2',
  name: 'Bob',
  email: 'bob@example.com',
  bio: null,
  profilePicture: null,
  familySize: 2,
  childrenAges: null,
  travelPreferences: null,
  availability: null,
  createdAt: '2024-01-01',
});

const renderDetail = (tripId = 'trip-1') =>
  render(
    <MemoryRouter initialEntries={[`/trips/${tripId}`]}>
      <Routes>
        <Route path="/trips/:id" element={<TripDetail />} />
      </Routes>
    </MemoryRouter>,
  );

describe('TripDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTripDetail.mockResolvedValue(makeTrip());
    mockGetUser.mockResolvedValue(makeCreator());
    mockExpressInterest.mockResolvedValue({});
  });

  it('shows loading state initially', () => {
    mockGetTripDetail.mockImplementation(() => new Promise(() => {}));
    renderDetail();
    expect(screen.getByText(/Loading trip details/i)).toBeDefined();
  });

  it('renders trip title and destination', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Rome Adventure')).toBeDefined();
      expect(screen.getByText('Rome, Italy')).toBeDefined();
    });
  });

  it('renders creator name with link to public profile', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeDefined();
    });
    const link = screen.getByRole('link', { name: 'Bob' });
    expect(link.getAttribute('href')).toContain('/profile/u2');
  });

  it('renders activity tags', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('museums')).toBeDefined();
      expect(screen.getByText('food')).toBeDefined();
    });
  });

  it('shows Express Interest button for non-owners', async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Express Interest/i })).toBeDefined();
    });
  });

  it('marks interest as expressed after button click', async () => {
    const user = userEvent.setup();
    renderDetail();
    await waitFor(() => screen.getByRole('button', { name: /Express Interest/i }));
    await user.click(screen.getByRole('button', { name: /Express Interest/i }));
    await waitFor(() => {
      expect(screen.getByText(/Interest Expressed/i)).toBeDefined();
    });
  });

  it('shows owner message when current user is the creator', async () => {
    mockGetTripDetail.mockResolvedValue(makeTrip({ createdById: 'u1' }));
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/This is your trip posting/i)).toBeDefined();
    });
  });

  it('shows error state when trip not found', async () => {
    mockGetTripDetail.mockRejectedValue(new Error('404'));
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/Trip not found or unavailable/i)).toBeDefined();
    });
  });
});
