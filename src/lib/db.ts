import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Check if DATABASE_URL exists
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL is not set. Database operations will fail.')
}

export const db = databaseUrl 
  ? (globalForPrisma.prisma ?? prismaClientSingleton())
  : null as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production' && databaseUrl) {
  globalForPrisma.prisma = db
}
