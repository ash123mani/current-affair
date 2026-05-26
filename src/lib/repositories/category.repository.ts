import { prisma } from "../prisma";

export const categoryRepository = {
  findAll: () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),

  findBySlug: (slug: string) =>
    prisma.category.findUnique({ where: { slug } }),

  findById: (id: string) =>
    prisma.category.findUnique({ where: { id } }),

  create: (data: { name: string; slug: string; icon: string; color: string }) =>
    prisma.category.create({ data }),

  update: (id: string, data: { name?: string; slug?: string; icon?: string; color?: string }) =>
    prisma.category.update({ where: { id }, data }),

  deleteById: (id: string) =>
    prisma.category.delete({ where: { id } }),
};
