import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // OpenAPI Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('LaunchPad OS - Enterprise API Reference')
    .setDescription('Production-Ready Enterprise Business Application Platform API & Integration Hub')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .addTag('Authentication')
    .addTag('Organization & Tenants')
    .addTag('Integration Hub & Connectors')
    .addTag('Canonical Data Models (Dual Mode Router)')
    .addTag('Workflow Engine')
    .addTag('Industry Starter Templates')
    .addTag('AI Setup Wizard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 LaunchPad OS API running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger OpenAPI Documentation live on http://localhost:${port}/api/docs`);
}
bootstrap();
