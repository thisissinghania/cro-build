import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
});

const adapter = new PrismaPg(pool);

// Clear any stale cached instance without latest models
if (globalForPrisma.prisma) {
  if (!(globalForPrisma.prisma as any).auditReport || !(globalForPrisma.prisma as any).auditUsageLog) {
    try {
      (globalForPrisma.prisma as any).$disconnect?.();
    } catch { }
    globalForPrisma.prisma = undefined;
  }
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
