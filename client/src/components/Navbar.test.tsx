import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when logged out', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    });

    it('renders TripMates logo link', () => {
      renderNavbar();
      expect(screen.getByRole('link', { name: /TripMates/i })).toBeDefined();
    });

    it('shows Sign In link', () => {
      renderNavbar();
      expect(screen.getByRole('link', { name: /Sign In/i })).toBeDefined();
    });

    it('shows Get Started link', () => {
      renderNavbar();
      expect(screen.getByRole('link', { name: /Get Started/i })).toBeDefined();
    });

    it('does not show Dashboard or Logout', () => {
      renderNavbar();
      expect(screen.queryByRole('link', { name: /Dashboard/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /Logout/i })).toBeNull();
    });
  });

  describe('when logged in', () => {
    const user = { id: 'u1', name: 'Alice Doe', profilePicture: null };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user, logout: mockLogout });
    });

    it('shows Dashboard link', () => {
      renderNavbar();
      expect(screen.getAllByRole('link', { name: /Dashboard/i })[0]).toBeDefined();
    });

    it('shows Post Trip link', () => {
      renderNavbar();
      expect(screen.getAllByRole('link', { name: /Post Trip/i })[0]).toBeDefined();
    });

    it('shows Messages link', () => {
      renderNavbar();
      expect(screen.getAllByRole('link', { name: /Messages/i })[0]).toBeDefined();
    });

    it('shows user first name', () => {
      renderNavbar();
      expect(screen.getByText('Alice')).toBeDefined();
    });

    it('calls logout and navigates to / on Logout click', async () => {
      const ue = userEvent.setup();
      renderNavbar();
      await ue.click(screen.getAllByRole('button', { name: /Logout/i })[0]);
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('mobile menu', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    });

    it('toggles mobile menu on hamburger click', async () => {
      const ue = userEvent.setup();
      renderNavbar();
      const hamburger = screen.getByRole('button');
      expect(screen.queryByText(/Sign In/i, { selector: 'a.block' })).toBeNull();
      await ue.click(hamburger);
      expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    });
  });
});
