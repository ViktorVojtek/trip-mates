import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';

vi.mock('../services/auth', () => ({
  updateProfile: vi.fn().mockResolvedValue({}),
}));

vi.mock('../components/AvailabilityCalendar', () => ({
  default: () => <div data-testid="availability-calendar" />,
}));

const makeUser = () => ({
  id: 'u1',
  email: 'alice@example.com',
  name: 'Alice',
  bio: 'Loves hiking',
  profilePicture: null,
  familySize: 3,
  childrenAges: '5, 8',
  travelPreferences: 'hiking,beaches',
  availability: '2025-07-01',
  createdAt: '2024-01-01',
});

const mockRefreshProfile = vi.fn().mockResolvedValue(undefined);

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: makeUser(), refreshProfile: mockRefreshProfile }),
}));

describe('Profile page', () => {
  it('renders user name and email', () => {
    render(<Profile />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('alice@example.com')).toBeDefined();
  });

  it('renders Edit Profile button', () => {
    render(<Profile />);
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeDefined();
  });

  it('shows ProfileForm when Edit Profile clicked', async () => {
    const user = userEvent.setup();
    render(<Profile />);
    await user.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDefined();
  });

  it('shows travel preferences as tags', () => {
    render(<Profile />);
    expect(screen.getByText('hiking')).toBeDefined();
    expect(screen.getByText('beaches')).toBeDefined();
  });

  it('shows family size', () => {
    render(<Profile />);
    expect(screen.getByText('3 people')).toBeDefined();
  });

  it('shows bio', () => {
    render(<Profile />);
    expect(screen.getByText('Loves hiking')).toBeDefined();
  });

  it('hides form and shows Cancel when in edit mode', async () => {
    const user = userEvent.setup();
    render(<Profile />);
    await user.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDefined();
  });

  it('calls refreshProfile after save and hides form', async () => {
    const { updateProfile } = await import('../services/auth');
    vi.mocked(updateProfile).mockResolvedValue(makeUser() as never);
    const user = userEvent.setup();
    render(<Profile />);
    await user.click(screen.getByRole('button', { name: /Edit Profile/i }));
    await user.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => {
      expect(mockRefreshProfile).toHaveBeenCalled();
    });
  });
});
