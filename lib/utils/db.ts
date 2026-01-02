import { PrismaClient } from '@/lib/generated/prisma/client';
import type { Prisma } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Settings } from '@/lib/config/settings';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: Settings.DATABASE_URL,
});

const logLevel: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: logLevel,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

