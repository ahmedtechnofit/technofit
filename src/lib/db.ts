import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force new client when schema changes
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Only create PrismaClient if DATABASE_URL is available
export const db = process.env.DATABASE_URL 
  ? (globalForPrisma.prisma ?? prismaClientSingleton())
  : null as unknown as PrismaClient; // Type cast for build time

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = db
}
