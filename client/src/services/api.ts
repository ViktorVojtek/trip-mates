import apiClient from '../api/client';
import type { Trip, TripInterest, Message, User, PaginatedResult, TripFilters, TripFormData } from '../types';

export const getTrips = async (filters: TripFilters = {}): Promise<PaginatedResult<Trip>> => {
  const response = await apiClient.get<PaginatedResult<Trip>>('/trips', { params: filters });
  return response.data;
};

export const getTripDetail = async (id: string): Promise<Trip> => {
  const response = await apiClient.get<Trip>(`/trips/${id}`);
  return response.data;
};

export const postTrip = async (data: TripFormData): Promise<Trip> => {
  const response = await apiClient.post<Trip>('/trips', data);
  return response.data;
};

export const expressInterest = async (tripId: string): Promise<TripInterest> => {
  const response = await apiClient.post<TripInterest>(`/trips/${tripId}/interest`);
  return response.data;
};

export const getTripInterests = async (tripId: string): Promise<TripInterest[]> => {
  const response = await apiClient.get<TripInterest[]>(`/trips/${tripId}/interests`);
  return response.data;
};

export const getMessages = async (params: { tripId?: string; userId?: string }): Promise<Message[]> => {
  const response = await apiClient.get<Message[]>('/messages', { params });
  return response.data;
};

export const sendMessage = async (data: {
  content: string;
  tripId?: string;
  receiverId: string;
}): Promise<Message> => {
  const response = await apiClient.post<Message>('/messages', data);
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const form = new FormData();
  form.append('avatar', file);
  const response = await apiClient.post<User>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
