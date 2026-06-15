import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from './ProfileForm';
import type { User } from '../types';

vi.mock('../services/auth', () => ({
  updateProfile: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/api', () => ({
  uploadAvatar: vi
    .fn()
    .mockResolvedValue({ id: 'u1', name: 'Alice', profilePicture: '/uploads/avatar-u1-1.png' }),
}));

vi.mock('./AvailabilityCalendar', () => ({
  default: ({ onChange }: { value: string[]; onChange: (d: string[]) => void }) => (
    <div data-testid="availability-calendar">
      <button onClick={() => onChange(['2025-08-01'])}>Pick date</button>
    </div>
  ),
}));

const makeUser = (overrides?: Partial<User>): User => ({
  id: 'u1',
  email: 'user@example.com',
  name: 'Alice',
  bio: 'Loves hiking',
  profilePicture: null,
  familySize: 3,
  childrenAges: '5, 8',
  travelPreferences: 'hiking,beaches',
  availability: '2025-07-01',
  createdAt: '2024-01-01',
  ...overrides,
});

describe('ProfileForm', () => {
  const onSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields with user values', () => {
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    expect(screen.getByDisplayValue('Alice')).toBeDefined();
    expect(screen.getByDisplayValue('Loves hiking')).toBeDefined();
    expect(screen.getByDisplayValue('3')).toBeDefined();
    expect(screen.getByDisplayValue('5, 8')).toBeDefined();
    expect(screen.getByDisplayValue('hiking,beaches')).toBeDefined();
  });

  it('renders profile picture URL input', () => {
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    expect(screen.getByText(/Profile Picture URL/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/https:\/\/example.com\/photo.jpg/i)).toBeDefined();
  });

  it('renders AvailabilityCalendar', () => {
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    expect(screen.getByTestId('availability-calendar')).toBeDefined();
  });

  it('shows validation error when name is cleared', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    const nameInput = screen.getByDisplayValue('Alice');
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeDefined();
    });
  });

  it('calls updateProfile and onSave on valid submit', async () => {
    const { updateProfile } = await import('../services/auth');
    const user = userEvent.setup();
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('renders Save Changes button', () => {
    render(<ProfileForm user={makeUser()} onSave={onSave} />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined();
  });

  it('uploads a selected image and fills the profile picture field', async () => {
    const { uploadAvatar } = await import('../services/api');
    const user = userEvent.setup();
    render(<ProfileForm user={makeUser()} onSave={onSave} />);

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload profile picture/i);
    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalledWith(file);
      expect(screen.getByDisplayValue('/uploads/avatar-u1-1.png')).toBeDefined();
    });
  });
});
