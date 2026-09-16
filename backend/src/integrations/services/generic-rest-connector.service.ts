import { Injectable, Logger } from '@nestjs/common';
import { IntegrationAuthType } from '@prisma/client';

export interface ExecuteOptions {
  baseUrl: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  authType?: IntegrationAuthType | string;
  credentials?: {
    apiKey?: string;
    headerKey?: string;
    bearerToken?: string;
    jwtToken?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export interface ConnectorResponse {
  success: boolean;
  statusCode: number;
  durationMs: number;
  data?: any;
  errorMessage?: string;
  details?: string;
}

@Injectable()
export class GenericRestConnectorService {
  private readonly logger = new Logger(GenericRestConnectorService.name);

  async execute(options: ExecuteOptions): Promise<ConnectorResponse> {
    const startTime = Date.now();
    const method = (options.method || 'GET').toUpperCase();
    const timeoutMs = options.timeoutMs || 10000;

    // Build URL with query parameters
    let fullUrl = `${options.baseUrl.replace(/\/$/, '')}/${(options.endpoint || '').replace(/^\//, '')}`;
    if (options.queryParams && Object.keys(options.queryParams).length > 0) {
      const searchParams = new URLSearchParams(options.queryParams);
      fullUrl += `?${searchParams.toString()}`;
    }

    // Build Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    // Inject Authentication Header
    const authType = (options.authType || 'API_KEY').toString().toUpperCase();
    const creds = options.credentials || {};

    if (authType === 'API_KEY' || authType === 'API KEY') {
      const headerName = creds.headerKey || 'X-API-Key';
      if (creds.apiKey) {
        headers[headerName] = creds.apiKey;
      }
    } else if (authType === 'BEARER_TOKEN' || authType === 'BEARER TOKEN') {
      if (creds.bearerToken) {
        headers['Authorization'] = `Bearer ${creds.bearerToken}`;
      }
    } else if (authType === 'JWT') {
      if (creds.jwtToken || creds.bearerToken) {
        headers['Authorization'] = `Bearer ${creds.jwtToken || creds.bearerToken}`;
      }
    }

    // AbortController for Timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (bodyAllowed(method) && options.body !== undefined) {
        fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }

      const res = await fetch(fullUrl, fetchOptions);
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;

      const text = await res.text();
      let parsedData: any;
      try {
        parsedData = text ? JSON.parse(text) : {};
      } catch {
        parsedData = text;
      }

      const isSuccess = res.status >= 200 && res.status < 300;

      return {
        success: isSuccess,
        statusCode: res.status,
        durationMs,
        data: parsedData,
        errorMessage: isSuccess ? undefined : `HTTP Error ${res.status}: ${res.statusText}`,
        details: isSuccess
          ? `Request to ${fullUrl} succeeded with HTTP ${res.status}`
          : `Request to ${fullUrl} failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;

      let errorMessage = err.name === 'AbortError'
        ? `Request timed out after ${timeoutMs}ms`
        : (err.message || 'Network error occurred while connecting to external endpoint');

      this.logger.error(`Connector execution error to ${fullUrl}: ${errorMessage}`);

      return {
        success: false,
        statusCode: err.name === 'AbortError' ? 408 : 502,
        durationMs,
        errorMessage,
        details: `Connection failed: ${errorMessage}`,
      };
    }
  }
}

function bodyAllowed(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH';
}
