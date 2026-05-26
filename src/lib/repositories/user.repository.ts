import { prisma } from "../prisma";

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { name: string; email: string; passwordHash: string }) =>
    prisma.user.create({ data }),
};
