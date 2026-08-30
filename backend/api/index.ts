import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });

    const configService = app.get(ConfigService);
    const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';

    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

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

    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.init();
    cachedApp = app;
  }
  return server;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  return app(req, res);
}
