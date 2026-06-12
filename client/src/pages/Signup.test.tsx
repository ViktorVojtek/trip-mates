import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Signup page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignup = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

  it('renders all registration fields', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeDefined();
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDefined();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Alice');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@example.com');
    const passwords = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwords[0], 'password1');
    await user.type(passwords[1], 'password2');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeDefined();
    });
  });

  it('calls register and navigates on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Alice Smith');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@example.com');
    const passwords = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwords[0], 'password123');
    await user.type(passwords[1], 'password123');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'alice@example.com', name: 'Alice Smith' }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on registration failure', async () => {
    mockRegister.mockRejectedValue(new Error('conflict'));
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText('Jane Smith'), 'Alice Smith');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@example.com');
    const passwords = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwords[0], 'password123');
    await user.type(passwords[1], 'password123');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeDefined();
    });
  });
});
