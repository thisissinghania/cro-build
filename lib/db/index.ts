import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Clear any stale cached instance without latest fields
if (globalForPrisma.prisma) {
  const userModel = (globalForPrisma.prisma as any)._dmmf?.datamodel?.models?.find?.((m: any) => m.name === 'User');
  const hasNotificationsReadAt = userModel?.fields?.some?.((f: any) => f.name === 'notificationsReadAt');
  if (!(globalForPrisma.prisma as any).auditReport || !hasNotificationsReadAt) {
    try {
      (globalForPrisma.prisma as any).$disconnect?.();
    } catch {}
    globalForPrisma.prisma = undefined;
  }
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
