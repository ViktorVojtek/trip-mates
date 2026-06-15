import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './auth';

vi.mock('../api/client');
import apiClient from '../api/client';

describe('services/auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem('token');
    }
  });

  it('setAuth stores token in localStorage', () => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      authService.setAuth('my-token');
      expect(localStorage.getItem('token')).toBe('my-token');
    }
  });

  it('clearAuth removes token from localStorage', () => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem('token', 'test');
      authService.clearAuth();
      expect(localStorage.getItem('token')).toBeNull();
    }
  });

  it('getToken returns stored token', () => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem('token', 'stored-token');
      const result = authService.getToken();
      expect(result).toBe('stored-token');
    }
  });

  it('getToken returns null when no token', () => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem('token');
    }
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const result = authService.getToken();
      expect(result).toBeNull();
    }
  });

  it('register calls correct endpoint with data', async () => {
    const mockData = { user: { id: '1' }, token: 't' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });
    await authService.register({ email: 'a@b.com', password: 'pass', name: 'A', familySize: 2 });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'a@b.com',
      password: 'pass',
      name: 'A',
      familySize: 2,
    });
  });

  it('login calls correct endpoint', async () => {
    const mockData = { user: { id: '1' }, token: 't' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });
    await authService.login({ email: 'a@b.com', password: 'pass' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
  });

  it('getProfile calls correct endpoint', async () => {
    const mockData = { id: '1' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });
    await authService.getProfile();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('googleLogin posts the credential to /auth/google', async () => {
    const mockData = { user: { id: '1' }, token: 't' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockData });
    await authService.googleLogin('cred-123');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/google', { credential: 'cred-123' });
  });

  it('updateProfile calls correct endpoint with data', async () => {
    const mockData = { id: '1' };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockData });
    await authService.updateProfile({ name: 'Updated', familySize: 2 });
    expect(apiClient.put).toHaveBeenCalledWith('/auth/profile', { name: 'Updated', familySize: 2 });
  });
});
