import { prisma } from "../prisma";
import type { Prisma } from "@/generated/prisma/client";

export type TxFindAttempt = (userId: string, categoryId: string, date: string) =>
  Promise<{ id: string } | null>;
export type TxDeleteAttempt = (id: string) => Promise<{ id: string }>;
export type TxCreateAttempt = (data: {
  userId: string; categoryId: string; date: string;
  score: number; total: number;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
}) => Promise<{ id: string; score: number; total: number; answers: { isCorrect: boolean }[] }>;

export const quizRepository = {
  transaction: <T>(fn: (tx: {
    findAttempt: TxFindAttempt;
    deleteAttempt: TxDeleteAttempt;
    createAttempt: TxCreateAttempt;
  }) => Promise<T>) =>
    prisma.$transaction(async (prismaTx) => {
      const txRepo = {
        findAttempt: (userId: string, categoryId: string, date: string) =>
          prismaTx.quizAttempt.findUnique({
            where: { userId_categoryId_date: { userId, categoryId, date } },
          }),
        deleteAttempt: (id: string) =>
          prismaTx.quizAttempt.delete({ where: { id } }),
        createAttempt: (data: {
          userId: string;
          categoryId: string;
          date: string;
          score: number;
          total: number;
          answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
        }) =>
          prismaTx.quizAttempt.create({
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
      };
      return fn(txRepo);
    }),
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
              select: { id: true, text: true, options: true, correctIndex: true, explanation: true, source: true, articleUrl: true },
            },
          },
        },
      },
    }),
};
