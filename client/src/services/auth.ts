import apiClient from '../api/client';
import type { AuthResponse, User, LoginFormData, UpdateProfileFormData } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  familySize: number;
  childrenAges?: string;
}

export const setAuth = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: UpdateProfileFormData): Promise<User> => {
  const response = await apiClient.put<User>('/auth/profile', data);
  return response.data;
};
