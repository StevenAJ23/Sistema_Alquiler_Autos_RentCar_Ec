// src/lib/api-client.ts
// ============================================================
//   Cliente HTTP centralizado (Axios).
//
//   DISEÑO PARA 3 RETOS:
//   - Reto 1: BASE_URL apunta al monolito (Azure Web App)
//   - Reto 2: BASE_URL apunta al API Gateway (mismo contrato)
//   - Reto 3: Reutilizable en Ionic Vue / Quasar sin modificación
//
//   Los composables (useVehiculos, useReservas…) nunca conocen
//   la URL — solo llaman a los servicios, que usan este cliente.
// ============================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

// En Reto 2, esta variable apunta al API Gateway sin tocar nada más
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10_000,
    });

    // Interceptor de request — adjunta token JWT si existe
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('rentcar_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;

      // Correlation ID — trazabilidad end-to-end (teoría sección 1.5)
      config.headers['X-Correlation-Id'] =
        crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

      return config;
    });

    // Interceptor de response — manejo centralizado de errores
    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('rentcar_token');
          localStorage.removeItem('rentcar_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: object): Promise<T> {
    const res = await this.client.get<T>(url, { params });
    return res.data;
  }

  async post<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.post<T>(url, body);
    return res.data;
  }

  async put<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.put<T>(url, body);
    return res.data;
  }

  async patch<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.patch<T>(url, body);
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.client.delete<T>(url);
    return res.data;
  }

  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
}

// Singleton — un solo cliente en toda la app
export const apiClient = new ApiClient();
