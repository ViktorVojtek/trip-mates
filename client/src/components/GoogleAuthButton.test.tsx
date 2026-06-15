import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleAuthButton from './GoogleAuthButton';

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }: { onSuccess: (c: { credential?: string }) => void }) => (
    <button onClick={() => onSuccess({ credential: 'fake-cred' })}>Sign in with Google</button>
  ),
}));

const mockLoginWithGoogle = vi.fn().mockResolvedValue(undefined);
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ loginWithGoogle: mockLoginWithGoogle }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('GoogleAuthButton', () => {
  it('renders nothing when no client id is configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    const { container } = render(<GoogleAuthButton />);
    expect(container.firstChild).toBeNull();
  });

  it('logs in with the returned credential on success', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    const user = userEvent.setup();
    render(<GoogleAuthButton />);
    await user.click(screen.getByText(/Sign in with Google/i));
    expect(mockLoginWithGoogle).toHaveBeenCalledWith('fake-cred');
  });
});
