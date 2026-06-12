import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../services/auth', () => ({
  getToken: vi.fn().mockReturnValue(null),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  getProfile: vi.fn().mockResolvedValue({ id: 'u1', name: 'Alice', email: 'a@b.com' }),
  login: vi.fn(),
  register: vi.fn(),
}));

import * as authService from '../services/auth';

const makeUser = () => ({
  id: 'u1',
  email: 'a@b.com',
  name: 'Alice',
  bio: null,
  profilePicture: null,
  familySize: 1,
  childrenAges: null,
  travelPreferences: null,
  availability: null,
  createdAt: '2024-01-01',
});

function TestConsumer() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <div>loading</div>;
  if (!user) return <button onClick={() => void login('a@b.com', 'pass')}>Login</button>;
  return (
    <div>
      <span data-testid="name">{user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getProfile).mockResolvedValue(makeUser());
  });

  it('starts with loading true then resolves to no user when no token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Login/ })).toBeDefined();
    });
  });

  it('loads user from token on mount', async () => {
    vi.mocked(authService.getToken).mockReturnValue('stored-token');
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('name')).toBeDefined();
      expect(screen.getByTestId('name').textContent).toBe('Alice');
    });
  });

  it('login sets user', async () => {
    vi.mocked(authService.login).mockResolvedValue({ user: makeUser(), token: 'tok' });
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByRole('button', { name: /Login/ }));
    await user.click(screen.getByRole('button', { name: /Login/ }));
    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Alice');
    });
  });

  it('logout clears user', async () => {
    vi.mocked(authService.getToken).mockReturnValue('tok');
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByRole('button', { name: /Logout/ }));
    await user.click(screen.getByRole('button', { name: /Logout/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Login/ })).toBeDefined();
    });
  });

  it('clears user when getProfile fails on mount', async () => {
    vi.mocked(authService.getToken).mockReturnValue('bad-token');
    vi.mocked(authService.getProfile).mockRejectedValue(new Error('401'));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Login/ })).toBeDefined();
    });
    expect(authService.clearAuth).toHaveBeenCalled();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      act(() => {
        render(<TestConsumer />);
      });
    }).toThrow();
    consoleError.mockRestore();
  });
});
