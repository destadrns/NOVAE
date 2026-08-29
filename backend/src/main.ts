import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  const corsOrigins = configService.get<string[]>('cors.origins') || [
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  // Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filter & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Graceful Shutdown
  app.enableShutdownHooks();

  // Swagger / OpenAPI Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NOVAÉ — Digital Fashion Atelier API')
    .setDescription(
      'Official REST API foundation for the NOVAÉ luxury fashion storefront and Atelier Operations admin portal.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health & System', 'System telemetry, uptime, and database probes')
    .addTag('Authentication', 'Customer and administrator identity verification')
    .addTag('Admin Operations (Protected)', 'Protected atelier backoffice routes requiring role=admin')
    .addTag('Catalog', 'Public luxury catalog browsing, filtering, and detail')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customSiteTitle: 'NOVAÉ API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(port);
  logger.log(`🚀 NOVAÉ Backend listening on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger Documentation at: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`🩺 Health check probe at: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
