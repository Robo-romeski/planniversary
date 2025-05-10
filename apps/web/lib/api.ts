import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { WizardData } from '../app/date-wizard/page';

// Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

// Create API client class
class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with requests
    });

    this.setupInterceptors();
  }

  // Singleton pattern
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage if it exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Error handler
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 401) {
        // Handle unauthorized access
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Redirect to login page if needed
          // window.location.href = '/login';
        }
      }

      return {
        message: data.message || 'An error occurred',
        code: data.code,
        status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something happened in setting up the request
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_SETUP_ERROR',
      };
    }
  }

  // HTTP methods
  public async get<T = any>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  public async put<T = any>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data);
  }

  public async patch<T = any>(url: string, data?: any): Promise<T> {
    return this.client.patch(url, data);
  }

  public async delete<T = any>(url: string): Promise<T> {
    return this.client.delete(url);
  }
}

// Export singleton instance
export const api = ApiClient.getInstance();

export async function fetchRecommendations(wizardData: WizardData) {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wizardData),
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function createParty(partyData: any) {
  const res = await fetch('/api/party', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partyData),
  });
  if (!res.ok) throw new Error('Failed to create party');
  return res.json();
}

export async function addGuestsToParty(partyId: string, guests: { name: string, email: string }[]) {
  const res = await fetch(`/api/party/${partyId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guests }),
  });
  if (!res.ok) throw new Error('Failed to add guests');
  return res.json();
}

export async function fetchPartySuggestions(partyId: string) {
  console.log('[fetchPartySuggestions] Fetching:', `/api/party/${partyId}/suggestions`);
  const res = await fetch(`/api/party/${partyId}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch party suggestions');
  const data = await res.json();
  console.log('[fetchPartySuggestions] Response:', data);
  return data;
}

export async function submitRSVP(partyId: string, rsvp: { name: string, email: string, response: string }) {
  const res = await fetch(`/api/party/${partyId}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvp),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

export async function updateParty(partyId: string, partyData: any) {
  const res = await fetch(`/api/party/${partyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partyData),
  });
  if (!res.ok) throw new Error('Failed to update party');
  return res.json();
}

export async function deleteParty(partyId: string) {
  const res = await fetch(`/api/party/${partyId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete party');
  return res.json();
} 