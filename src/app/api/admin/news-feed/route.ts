import { requireAdmin } from "@/lib/require-admin";
import { newsService } from "@/lib/services/generator/news.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/news-feed:
 *   get:
 *     tags: [Admin - News Feed]
 *     summary: Fetch latest news articles across categories (admin)
 *     description: |-
 *       Fetches top headlines from Indian and international sources,
 *       categorized by the app's category system.
 *       Falls back to mock data when no API key is configured.
 *       Requires admin role.
 *     operationId: adminNewsFeed
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *           default: in
 *         description: Country code for top headlines
 *     responses:
 *       200:
 *         description: Categorized news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categorySlug:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       articles:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/NewsArticle'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const country = request.nextUrl.searchParams.get("country") ?? "in";
    const categories = await newsService.fetchTopHeadlines(country);

    return ok({ categories });
  } catch (error) {
    return err(error);
  }
}
