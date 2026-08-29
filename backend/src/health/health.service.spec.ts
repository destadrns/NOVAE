import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { PrismaService } from '../database/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return status ok when database is healthy', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.environment).toBe('test');
    expect(result.details.database.status).toBe('up');
    expect(result.details.database.database).toBe('postgresql');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();
  });

  it('should return status error when database is down', async () => {
    jest.spyOn(prismaService, 'isHealthy').mockResolvedValueOnce(false);

    const result = await service.check();
    expect(result.status).toBe('error');
    expect(result.details.database.status).toBe('down');
  });
});
