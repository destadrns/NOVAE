export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://novae:novae_secret@localhost:5432/novae_dev',
  },
  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
      .split(',')
      .map((origin) => origin.trim()),
  },
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://mock-novae-project.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'mock-anon-key-for-development',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key-for-development',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars',
  },
});
