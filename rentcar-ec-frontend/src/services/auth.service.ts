import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, AuthResponse, LoginCredentials, RegisterData, Usuario } from '@/types/domain';

export interface UpdateProfileData {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  ciudadId?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', data),

  me: () =>
    apiClient.get<ApiSuccess<Usuario>>('/auth/me'),

  updateMe: (data: UpdateProfileData) =>
    apiClient.patch<ApiSuccess<Usuario>>('/auth/me', data),
};
