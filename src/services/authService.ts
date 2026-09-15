import { ApiClient } from '../lib/api/client';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export const authService = {
  async register(payload: {
    name: string;
    email: string;
    password: string;
    organizationName?: string;
  }): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('auth/register', payload);
    if (response.accessToken) {
      ApiClient.setTokens(response.accessToken, response.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('launchpad_user', JSON.stringify(response.user));
      }
    }
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>('auth/login', {
        email,
        password,
      });

      if (response.accessToken) {
        ApiClient.setTokens(response.accessToken, response.refreshToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('launchpad_user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      if (error.statusCode !== undefined) {
        throw error;
      }
      throw error;
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const me = await ApiClient.get<User>('auth/me');
      if (me && me.id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('launchpad_user', JSON.stringify(me));
        }
        return me;
      }
    } catch (e) {
      // ignore
    }
    return this.getCurrentUserFromStorage();
  },

  logout() {
    ApiClient.clearTokens();
  },

  getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('launchpad_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};

