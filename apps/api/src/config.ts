export type Config = {
  port: number;
  host: string;
  dbPath: string;
  jwtSecret: string;
  corsOrigins: string[];
  cookieSameSite: 'lax' | 'strict' | 'none';
  cookieSecure: boolean;
  adminEmail?: string;
  adminPassword?: string;
  nodeEnv: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const jwtSecret = env.JWT_SECRET ?? (nodeEnv === 'production' ? '' : 'dev-only-secret-change-me-please-0123456789');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  const sameSite = (env.COOKIE_SAMESITE ?? 'lax') as Config['cookieSameSite'];
  return {
    port: Number(env.PORT ?? 4000),
    host: env.HOST ?? '0.0.0.0',
    dbPath: env.DATABASE_PATH ?? './data/portfolio.db',
    jwtSecret,
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean),
    cookieSameSite: sameSite,
    cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : nodeEnv === 'production' || sameSite === 'none',
    adminEmail: env.ADMIN_EMAIL,
    adminPassword: env.ADMIN_PASSWORD,
    nodeEnv,
  };
}
