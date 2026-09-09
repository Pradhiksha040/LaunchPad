const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('launchpad_access_token');
  }

  public static setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('launchpad_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('launchpad_refresh_token', refreshToken);
    }
  }

  public static clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('launchpad_access_token');
    localStorage.removeItem('launchpad_refresh_token');
    localStorage.removeItem('launchpad_user');
  }

  public static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Clear stored invalid credentials
        // Don't auto redirect on check, but ensure token is cleaned up
      }

      const responseText = await response.text();
      let data: any;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        const errorMessage =
          data.message ||
          (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
          `HTTP Error ${response.status}: ${response.statusText}`;

        const error = new Error(errorMessage) as any;
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      // Network or offline error
      const networkError = new Error(
        err.message || 'Unable to connect to LaunchPad API. Please check backend server connection.',
      ) as any;
      networkError.statusCode = 0;
      throw networkError;
    }
  }

  public static get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
