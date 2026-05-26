import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx prisma/promote-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`Promoted ${user.name ?? email} (${email}) to admin.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
