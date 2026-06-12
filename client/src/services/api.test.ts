import { describe, it, expect, vi } from 'vitest';
import * as apiService from './api';

vi.mock('../api/client');
import apiClient from '../api/client';

describe('services/api', () => {
  const mockGet = vi.fn(() => Promise.resolve({ data: { results: [], meta: {} } }));
  const mockPost = vi.fn(() => Promise.resolve({ data: {} }));

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(apiClient).get = mockGet as never;
    vi.mocked(apiClient).post = mockPost as never;
  });

  it('getTrips calls correct endpoint with params', async () => {
    await apiService.getTrips({ destination: 'Paris' });
    expect(mockGet).toHaveBeenCalledWith('/trips', { params: { destination: 'Paris' } });
  });

  it('getTrips returns response data', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({ data: { results: [{ id: '1' }], meta: {} } }),
    );
    const result = await apiService.getTrips();
    expect(result.results).toEqual([{ id: '1' }]);
  });

  it('getTripDetail calls correct endpoint', async () => {
    await apiService.getTripDetail('trip-123');
    expect(mockGet).toHaveBeenCalledWith('/trips/trip-123');
  });

  it('postTrip calls correct endpoint with data', async () => {
    await apiService.postTrip({
      title: 'Trip',
      description: 'Desc',
      destination: 'Paris',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      groupType: 'family',
      budget: 500,
    });
    expect(mockPost).toHaveBeenCalledWith('/trips', expect.any(Object));
  });

  it('expressInterest calls correct endpoint', async () => {
    await apiService.expressInterest('trip-123');
    expect(mockPost).toHaveBeenCalledWith('/trips/trip-123/interest');
  });

  it('getTripInterests calls correct endpoint', async () => {
    await apiService.getTripInterests('trip-123');
    expect(mockGet).toHaveBeenCalledWith('/trips/trip-123/interests');
  });

  it('getMessages calls correct endpoint with params', async () => {
    await apiService.getMessages({ userId: 'user-1' });
    expect(mockGet).toHaveBeenCalledWith('/messages', { params: { userId: 'user-1' } });
  });

  it('sendMessage calls correct endpoint with data', async () => {
    await apiService.sendMessage({ content: 'Hello', receiverId: 'user-1' });
    expect(mockPost).toHaveBeenCalledWith('/messages', { content: 'Hello', receiverId: 'user-1' });
  });

  it('getUser calls correct endpoint', async () => {
    await apiService.getUser('user-123');
    expect(mockGet).toHaveBeenCalledWith('/users/user-123');
  });
});
