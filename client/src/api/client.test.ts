import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from './client';

describe('api/client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    try {
      const store: Record<string, string> = {};
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
      });
    } catch (e) {
      // localStorage might be unavailable
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an axios instance with the correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('sets Content-Type header by default', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('adds Authorization header when token exists in localStorage', () => {
    localStorage.setItem('token', 'test-token');
    const config = { headers: {} } as any;
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    interceptor(config);
    expect(config.headers.Authorization).toBe('Bearer test-token');
    localStorage.removeItem('token');
  });

  it('does not add Authorization header when no token', () => {
    localStorage.removeItem('token');
    const config = { headers: {} } as any;
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    interceptor(config);
    expect(config.headers.Authorization).toBeUndefined();
  });
});
