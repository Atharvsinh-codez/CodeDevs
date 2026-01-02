import { z } from 'zod';

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  API_KEYS: z.string().min(1, 'API_KEYS is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CACHE_ENABLED: z.string().default('true').transform(val => val === 'true'),
  DEFAULT_CACHE_TTL: z.string().default('3600').transform(val => parseInt(val, 10)),
  DEBUG: z.string().default('false').transform(val => val === 'true'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SCREENSHOT_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      API_KEYS: process.env.API_KEYS,
      DATABASE_URL: process.env.DATABASE_URL,
      CACHE_ENABLED: process.env.CACHE_ENABLED,
      DEFAULT_CACHE_TTL: process.env.DEFAULT_CACHE_TTL,
      DEBUG: process.env.DEBUG,
      NODE_ENV: process.env.NODE_ENV,
      SCREENSHOT_API_URL: process.env.SCREENSHOT_API_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

const env = validateEnv();

export const Settings = {
  GROQ_API_KEY: env.GROQ_API_KEY,
  GITHUB_TOKEN: env.GITHUB_TOKEN,
  GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
  API_KEYS: env.API_KEYS.split(',').map(key => key.trim()),
  DATABASE_URL: env.DATABASE_URL,
  CACHE_ENABLED: env.CACHE_ENABLED,
  DEFAULT_CACHE_TTL: env.DEFAULT_CACHE_TTL,
  DEBUG: env.DEBUG,
  NODE_ENV: env.NODE_ENV,
  SCREENSHOT_API_URL: env.SCREENSHOT_API_URL,
  NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
} as const;

