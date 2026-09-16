import { Logger } from '@nestjs/common';

export function validateEnvironmentVariables() {
  const logger = new Logger('EnvValidation');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.warn(`Missing recommended environment variable(s): ${missing.join(', ')}.`);
    logger.warn('Fallback development values will be used. Ensure production env vars are set.');
  }

  // Ensure JWT secret is not using default fallback in production mode
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('default'))) {
    throw new Error('CRITICAL SECURITY ERROR: Strong JWT_SECRET must be set in production environment!');
  }

  logger.log('Environment configuration validated successfully.');
}
