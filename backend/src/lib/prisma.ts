import { PrismaClient } from '@prisma/client';

const globalRef = global as unknown as { prisma: PrismaClient };

export const prisma = globalRef.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalRef.prisma = prisma;
}
