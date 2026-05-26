import { prisma } from "../prisma";
import type { Prisma } from "@/generated/prisma/client";

export const quizRepository = {
  findAttempt: (userId: string, categoryId: string, date: string) =>
    prisma.quizAttempt.findUnique({
      where: {
        userId_categoryId_date: { userId, categoryId, date },
      },
    }),

  createAttempt: (data: {
    userId: string;
    categoryId: string;
    date: string;
    score: number;
    total: number;
    answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  }) =>
    prisma.quizAttempt.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        date: data.date,
        score: data.score,
        total: data.total,
        answers: { create: data.answers },
      },
      include: { answers: true },
    }),

  findHistory: (
    userId: string,
    options: { categoryId?: string; skip: number; take: number }
  ) => {
    const where: Prisma.QuizAttemptWhereInput = { userId };
    if (options.categoryId) where.categoryId = options.categoryId;

    return prisma.quizAttempt.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { completedAt: "desc" },
      skip: options.skip,
      take: options.take,
    });
  },

  countHistory: (userId: string, categoryId?: string) => {
    const where: Prisma.QuizAttemptWhereInput = { userId };
    if (categoryId) where.categoryId = categoryId;
    return prisma.quizAttempt.count({ where });
  },

  findAllByUser: (userId: string, limit: number = 100) =>
    prisma.quizAttempt.findMany({
      where: { userId },
      include: { category: { select: { name: true, slug: true, color: true } } },
      orderBy: { completedAt: "desc" },
      take: limit,
    }),

  groupByCategory: (userId: string) =>
    prisma.quizAttempt.groupBy({
      by: ["categoryId"],
      where: { userId },
      _sum: { score: true, total: true },
      _count: true,
    }),

  deleteAttempt: (id: string) =>
    prisma.quizAttempt.delete({ where: { id } }),

  findById: (id: string) =>
    prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        answers: {
          include: {
            question: {
              select: { id: true, text: true, options: true, correctIndex: true, explanation: true },
            },
          },
        },
      },
    }),
};
