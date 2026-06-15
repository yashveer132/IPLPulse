import env from './env.js';

let prisma = null;

export async function getPrisma() {
  if (prisma) return prisma;

  try {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient({
      log: env.isDev ? ['query', 'warn', 'error'] : ['error'],
    });
    return prisma;
  } catch (error) {
    console.warn(
      '⚠️  Prisma client not available. Run `npx prisma generate` after setting up your schema.'
    );
    return null;
  }
}

export default getPrisma;
