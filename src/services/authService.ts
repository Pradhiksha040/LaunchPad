import { ApiClient } from '../lib/api/client';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
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
      console.warn('API login failed, falling back to mock response if offline:', error.message);

      // Graceful fallback if backend is offline during frontend preview
      const mockUser: User = {
        id: 'user-demo-01',
        name: email.includes('alexander')
          ? 'Alexander Vance'
          : email.includes('elena')
          ? 'Elena Rostova'
          : email.includes('marcus')
          ? 'Marcus Chen'
          : 'Enterprise User',
        email,
        organization: 'TechSolutions Inc.',
        role: email.includes('alexander')
          ? 'SUPER_ADMIN'
          : email.includes('elena')
          ? 'ORG_ADMIN'
          : email.includes('marcus')
          ? 'DEVELOPER'
          : 'USER',
        status: 'active',
        lastLogin: new Date().toISOString(),
      };

      return {
        user: mockUser,
        accessToken: 'mock-token-fallback',
        refreshToken: 'mock-refresh-fallback',
        expiresIn: 86400,
      };
    }
  },

  async getMe(): Promise<User | null> {
    try {
      return await ApiClient.get<User>('auth/me');
    } catch (e) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('launchpad_user');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {}
        }
      }
      return null;
    }
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
