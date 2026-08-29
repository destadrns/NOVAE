import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';

describe('NOVAÉ Backend Foundation (e2e)', () => {
  let app: INestApplication;
  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health — should return 200 OK with health details', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('environment');
    expect(res.body.details.database).toEqual({
      status: 'up',
      database: 'postgresql',
    });
  });

  it('GET /api/v1/non-existent-route — should return standardized 404 exception payload', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/non-existent-route')
      .expect(404);

    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('path', '/api/v1/non-existent-route');
    expect(res.body).toHaveProperty('method', 'GET');
    expect(res.body).toHaveProperty('error', 'Not Found');
    expect(res.body).toHaveProperty('message');
  });
});
