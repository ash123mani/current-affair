import { prisma } from "../prisma";
import type { Prisma } from "@/generated/prisma/client";

export const QUESTION_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type QuestionStatus = (typeof QUESTION_STATUS)[keyof typeof QUESTION_STATUS];

export interface CreateQuestionData {
  categoryId: string;
  date: string;
  text: string;
  options: string;
  correctIndex: number;
  explanation?: string;
  source?: string;
  articleUrl?: string;
  status?: QuestionStatus;
}

export const questionRepository = {
  findByCategoryAndDate: (categoryId: string, date: string) =>
    prisma.question.findMany({
      where: { categoryId, date, status: QUESTION_STATUS.PUBLISHED },
      select: {
        id: true,
        text: true,
        options: true,
        date: true,
        source: true,
        articleUrl: true,
        category: { select: { name: true, slug: true } },
      },
    }),

  findFullByCategoryAndDate: (categoryId: string, date: string) =>
    prisma.question.findMany({
      where: { categoryId, date, status: QUESTION_STATUS.PUBLISHED },
      include: { category: { select: { name: true, slug: true } } },
    }),

  findWithCategory: (where: Prisma.QuestionWhereInput) =>
    prisma.question.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { date: "desc" },
    }),

  findById: (id: string) =>
    prisma.question.findUnique({ where: { id }, include: { category: { select: { name: true, slug: true } } } }),

  findFullByIds: (ids: string[]) =>
    prisma.question.findMany({
      where: { id: { in: ids }, status: QUESTION_STATUS.PUBLISHED },
      include: { category: { select: { name: true, slug: true } } },
    }),

  findDraftQuestions: (date?: string) =>
    prisma.question.findMany({
      where: { status: QUESTION_STATUS.DRAFT, ...(date ? { date } : {}) },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),

  countByCategoryAndDate: (categoryId: string, date: string, status?: QuestionStatus) =>
    prisma.question.count({
      where: { categoryId, date, ...(status ? { status } : {}) },
    }),

  groupCountByCategory: (date: string) =>
    prisma.question.groupBy({
      by: ["categoryId"],
      where: { date, status: QUESTION_STATUS.PUBLISHED },
      _count: true,
    }),

  create: (data: CreateQuestionData) => prisma.question.create({ data }),

  update: (
    id: string,
      data: {
        text?: string;
        options?: string;
        correctIndex?: number;
        explanation?: string;
        source?: string;
        articleUrl?: string;
        status?: QuestionStatus;
        date?: string;
        categoryId?: string;
      }
  ) => prisma.question.update({ where: { id }, data }),

  updateStatus: (id: string, status: QuestionStatus) =>
    prisma.question.update({
      where: { id },
      data: { status },
    }),

  deleteById: (id: string) =>
    prisma.question.delete({ where: { id } }),

  countByStatus: (status: QuestionStatus) =>
    prisma.question.count({ where: { status } }),
};
