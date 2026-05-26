import { NextRequest } from "next/server";
import { newsService } from "@/lib/services/generator/news.service";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const country = request.nextUrl.searchParams.get("country") || "in";
    const sources = request.nextUrl.searchParams.get("sources");
    const fromDate = request.nextUrl.searchParams.get("from");
    const toDate = request.nextUrl.searchParams.get("to");
    const sourceList = sources ? sources.split(",").filter(Boolean) : [];

    if (sourceList.length === 0) {
      return ok({ articles: [] });
    }

    const articles = fromDate && toDate
      ? await newsService.fetchBySourcesWithDate(sourceList, fromDate, toDate)
      : await newsService.fetchBySources(sourceList);

    return ok({ articles });
  } catch (error) {
    return err(error);
  }
}
