import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : [],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle Prisma client connection errors gracefully
if (typeof globalForPrisma.prisma !== 'undefined') {
  globalForPrisma.prisma.$on('beforeExit', async () => {
    await globalForPrisma.prisma?.$disconnect?.();
  });
}

