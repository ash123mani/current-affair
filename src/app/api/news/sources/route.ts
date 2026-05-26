import { NextRequest } from "next/server";
import { newsService } from "@/lib/services/generator/news.service";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const country = request.nextUrl.searchParams.get("country") || "in";
    const sources = await newsService.fetchSources(country);
    return ok({ sources });
  } catch (error) {
    return err(error);
  }
}
