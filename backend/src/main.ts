import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnvironmentVariables } from './common/config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  validateEnvironmentVariables();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Allow all origins in development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('LaunchPad Core Backend API')
    .setDescription('Enterprise Reusable Application Platform API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'User login, registration, and JWT refresh tokens')
    .addTag('Users', 'User management, profiles, and role assignments')
    .addTag('Organizations', 'Multi-tenant organization management and isolation')
    .addTag('Roles & Permissions', 'RBAC role definitions and permission matrices')
    .addTag('Applications', 'Application creation wizard, configuration, and modules')
    .addTag('Templates', 'Pre-configured application starter templates')
    .addTag('Settings', 'Platform and tenant settings')
    .addTag('Audit Logs', 'Platform audit logging and compliance action trails')
    .addTag('Developer Portal & API Management', 'API Keys, rate limits, webhooks, and docs')
    .addTag('Platform Governance & System Health', 'Governance, policy checks, health probes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 LaunchPad Core Backend API running on http://localhost:${port}`);
  logger.log(`📚 Swagger Documentation accessible at http://localhost:${port}/api/docs`);
}

bootstrap();
