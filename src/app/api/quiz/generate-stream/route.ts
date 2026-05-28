import { auth } from "@/lib/auth";
import { llmService } from "@/lib/services/generator/llm.service";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(sse({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const body = await request.json().catch(() => ({}));
  let { articles, category, date } = body;

  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return new Response(sse({ error: "At least one article is required" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (!category || typeof category !== "string") {
    return new Response(sse({ error: "Category is required" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  articles = articles.map((a: Record<string, unknown>) => ({
    title: String(a.title ?? "").slice(0, 300),
    description: String(a.description ?? "").slice(0, 500),
    source: String(a.source ?? "").slice(0, 100),
    content: a.content ? String(a.content).slice(0, 800) : undefined,
    url: a.url ? String(a.url) : undefined,
  }));

  const quizDate = typeof date === "string" ? date : today();
  const totalArticles = articles.length;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let totalQuestions = 0;

      controller.enqueue(encoder.encode(sse({ type: "start", totalArticles })));

      try {
        const all = await llmService.generateQuestionsBatched(
          category,
          quizDate,
          articles,
          5,
          (batch) => {
            totalQuestions += batch.length;
            controller.enqueue(
              encoder.encode(sse({ type: "batch", questions: batch, totalQuestions }))
            );
          }
        );

        controller.enqueue(
          encoder.encode(sse({ type: "done", totalQuestions: all.length, questions: all }))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Generation failed";
        controller.enqueue(encoder.encode(sse({ type: "error", error: message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
