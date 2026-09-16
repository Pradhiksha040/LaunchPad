import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DeveloperService } from '../developer.service';

export const SCOPES_KEY = 'scopes';
export const Scopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private developerService: DeveloperService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check for API key in x-api-key header or Authorization: Bearer lp_...
    let apiKeySecret = request.headers['x-api-key'];
    if (!apiKeySecret) {
      const authHeader = request.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer lp_')) {
        apiKeySecret = authHeader.replace('Bearer ', '').trim();
      }
    }

    if (!apiKeySecret) {
      throw new UnauthorizedException('Missing x-api-key header or Bearer API Key');
    }

    const startTime = Date.now();

    // Validate key against hashed storage
    const apiKey = await this.developerService.validateApiKey(apiKeySecret);

    // Rate limiting check
    const allowed = await this.developerService.checkRateLimit(apiKey.id, apiKey.rateLimit);
    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `API Key rate limit of ${apiKey.rateLimit} req/min exceeded`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check required permission scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredScopes && requiredScopes.length > 0) {
      const keyScopes = (apiKey.scopes as string[]) || [];
      const hasScope = requiredScopes.every((scope) => keyScopes.includes(scope));

      if (!hasScope) {
        throw new UnauthorizedException(
          `API Key lacks required scope(s): ${requiredScopes.join(', ')}`,
        );
      }
    }

    // Attach verified API Key metadata to request
    request.apiKey = apiKey;
    request.user = {
      organizationId: apiKey.organizationId,
      applicationId: apiKey.applicationId,
      apiKeyId: apiKey.id,
    };

    // Asynchronously log API usage telemetry on request completion
    response.on('finish', () => {
      const durationMs = Date.now() - startTime;
      this.developerService.logApiUsage({
        apiKeyId: apiKey.id,
        organizationId: apiKey.organizationId,
        applicationId: apiKey.applicationId || undefined,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        statusCode: response.statusCode,
        durationMs,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });
    });

    return true;
  }
}
