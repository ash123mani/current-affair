import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
  } else {
    const host = url.split("@")[1]?.split("?")[0];
    console.error(
      `[prisma] DATABASE_URL host: ${host}`,
      host?.includes("supabase.co") ? "(direct)" : "(pooler)"
    );
  }
  const adapter = new PrismaPg(url!);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
