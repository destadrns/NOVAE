import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:5173,http://localhost:5174';

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  SUPABASE_URL: string = 'https://mock-novae-project.supabase.co';

  @IsString()
  @IsOptional()
  SUPABASE_ANON_KEY: string = 'mock-anon-key-for-development';

  @IsString()
  @IsOptional()
  SUPABASE_SERVICE_ROLE_KEY: string = 'mock-service-role-key-for-development';

  @IsString()
  @IsOptional()
  SUPABASE_JWT_SECRET: string = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
