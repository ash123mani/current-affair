import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

interface ArticleInput {
  title: string;
  description: string;
  content?: string;
  url: string;
  source: string;
  sourceSlug: string;
  publishedAt: Date | null;
  imageUrl?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politics: ["politics", "government", "election", "parliament", "policy", "minister", "president", "pm ", "nda", "congress", "bjp", "supreme court", "bill", "legislat", "vote", "cabinet"],
  technology: ["tech", "ai ", "ai,", "software", "digital", "cyber", "startup", "apple", "google", "microsoft", "smartphone", "computer", "internet", "data breach", "blockchain"],
  business: ["business", "economy", "stock", "market", "finance", "banking", "trade", "startup", "ipo", "gdp", "inflation", "rupee", "budget", "tax", "investment"],
  sports: ["sports", "cricket", "football", "olympic", "championship", "tennis", "fifa", "ipl", "bcci", "athlete", "match", "tournament", "medal"],
  science: ["science", "climate", "environment", "research", "space", "nasa", "discovery", "nature", "isro", "chandrayaan", "carbon", "emission", "renewable"],
  world: ["world", "international", "foreign", "global", "united nations", "treaty", "diplomat", "border", "china", "us ", "russia", "ukraine", "middle east"],
  entertainment: ["entertainment", "movie", "film", "music", "celebrity", "award", "bollywood", "hollywood", "actor", "actress", "ott", "netflix"],
  health: ["health", "medical", "disease", "hospital", "vaccine", "mental health", "fitness", "covid", "doctor", "patient", "drug", "medicine", "healthcare"],
};

function classifyArticle(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  const scores: Record<string, number> = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter((kw) => text.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "general";
}

function parseRssDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CurrentAffairBot/1.0; +https://current-affair.app)",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} for ${url}`);
  return res.text();
}

// ── RSS Scraping ──────────────────────────────────────────────

interface RssSource {
  name: string;
  slug: string;
  feeds: string[];
}

const RSS_SOURCES: RssSource[] = [
  {
    name: "Hindustan Times",
    slug: "hindustan-times",
    feeds: [
      "https://www.hindustantimes.com/feeds/rss/top-stories.xml",
      "https://www.hindustantimes.com/feeds/rss/india-news.xml",
    ],
  },
  {
    name: "Indian Express",
    slug: "indian-express",
    feeds: [
      "https://indianexpress.com/feed/",
      "https://indianexpress.com/section/india/feed/",
    ],
  },
  {
    name: "Times of India",
    slug: "times-of-india",
    feeds: [
      "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    ],
  },
  {
    name: "NDTV",
    slug: "ndtv",
    feeds: [
      "https://feeds.feedburner.com/ndtvnews-latest",
    ],
  },
  {
    name: "The Economic Times",
    slug: "economic-times",
    feeds: [
      "https://economictimes.indiatimes.com/rssfeeds/1335230.cms",
    ],
  },
];

function extractRssItems($: cheerio.CheerioAPI): ArticleInput[] {
  const items: ArticleInput[] = [];
  $("item, entry").each((_, el) => {
    const $el = $(el);
    const title = $el.find("title").first().text().trim();
    if (!title) return;
    const description = $el.find("description").first().text().trim()
      || $el.find("summary").first().text().trim();
    const content = $el.find("content\\:encoded").first().text().trim()
      || $el.find("content").first().text().trim();
    const link = ($el.find("link").first().attr("href") || $el.find("link").first().text().trim()).replace(/\s/g, "").trim();
    if (!link || !link.startsWith("http")) return;
    const pubDateStr = $el.find("pubDate").first().text().trim()
      || $el.find("published").first().text().trim()
      || $el.find("updated").first().text().trim();
    const publishedAt = parseRssDate(pubDateStr);
    const mediaContent = $el.find("media\\:content, enclosure").first();
    const imageUrl = mediaContent.attr("url") || undefined;
    const cleanDesc = description.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
    const cleanContent = content
      ? content.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim()
      : undefined;
    if (cleanDesc && cleanDesc.length > 5) {
      items.push({
        title, description: cleanDesc.slice(0, 1000),
        content: cleanContent?.slice(0, 5000),
        url: link, source: "", sourceSlug: "",
        publishedAt, imageUrl,
      });
    }
  });
  return items;
}

async function scrapeRss(dateStr: string, targetDate: Date, nextDay: Date): Promise<ArticleInput[]> {
  const all: ArticleInput[] = [];
  for (const source of RSS_SOURCES) {
    for (const feedUrl of source.feeds) {
      try {
        const xml = await fetchPage(feedUrl);
        const $ = cheerio.load(xml, { xmlMode: true });
        const items = extractRssItems($);
        for (const item of items) {
          item.source = source.name;
          item.sourceSlug = source.slug;
        }
        const matched = items.filter((item) => {
          if (!item.publishedAt) return false;
          return item.publishedAt >= targetDate && item.publishedAt < nextDay;
        });
        all.push(...matched);
      } catch (e) {
        console.warn(`[IndianNewsService] RSS failed ${feedUrl}:`, e);
      }
    }
  }
  return all;
}

// ── Archive Scraping ──────────────────────────────────────────

interface ArchiveSource {
  name: string;
  slug: string;
  archiveUrl(year: string, month: string, day: string): string;
  parseArticleLinks($: cheerio.CheerioAPI): { url: string; title: string }[];
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const ARCHIVE_SOURCES: ArchiveSource[] = [
  {
    name: "Indian Express",
    slug: "indian-express",
    archiveUrl(year, month, day) {
      return `https://indianexpress.com/archive/${year}/${month}/${day}/`;
    },
    parseArticleLinks($) {
      const links: { url: string; title: string }[] = [];
      $("a[href*='indianexpress.com/article/']").each((_, el) => {
        const $el = $(el);
        const url = $el.attr("href");
        const title = $el.text().trim();
        if (url && title && url.startsWith("http") && title.length > 20) {
          links.push({ url, title });
        }
      });
      return links;
    },
  },
  {
    name: "Times of India",
    slug: "times-of-india",
    archiveUrl(year, month, day) {
      return `https://timesofindia.indiatimes.com/${year}/${month}/${day}/archive.cms`;
    },
    parseArticleLinks($) {
      const links: { url: string; title: string }[] = [];
      $("a[href*='articleshow']").each((_, el) => {
        const $el = $(el);
        let url = $el.attr("href") || "";
        if (url.startsWith("/")) {
          url = "https://timesofindia.indiatimes.com" + url;
        }
        const title = $el.text().trim();
        if (url.startsWith("http") && title.length > 20) {
          links.push({ url, title });
        }
      });
      return links;
    },
  },
  {
    name: "Hindustan Times",
    slug: "hindustan-times",
    archiveUrl(year, month, day) {
      return `https://www.hindustantimes.com/archives/${year}-${month}-${day}`;
    },
    parseArticleLinks($) {
      const links: { url: string; title: string }[] = [];
      $("a[href*='hindustantimes.com']").each((_, el) => {
        const $el = $(el);
        const url = $el.attr("href");
        const title = $el.text().trim();
        if (url && title && url.startsWith("http") && title.length > 20) {
          links.push({ url, title });
        }
      });
      return links;
    },
  },
];

async function scrapeArchive(dateStr: string): Promise<ArticleInput[]> {
  const [year, month, day] = dateStr.split("-");
  const results: ArticleInput[] = [];

  for (const source of ARCHIVE_SOURCES) {
    try {
      const url = source.archiveUrl(year, month, day);
      const html = await fetchPage(url);
      const $ = cheerio.load(html);
      const links = source.parseArticleLinks($);

      const seenUrls = new Set<string>();
      for (const link of links) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);

        const cleanTitle = link.title.replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();

        results.push({
          title: cleanTitle,
          description: cleanTitle,
          url: link.url,
          source: source.name,
          sourceSlug: source.slug,
          publishedAt: null,
          imageUrl: undefined,
        });
      }
    } catch (e) {
      console.warn(`[IndianNewsService] Archive failed for ${source.name}:`, e);
    }
  }

  return results;
}

// ── Insert into DB ────────────────────────────────────────────

async function insertArticles(dateStr: string, articles: ArticleInput[]): Promise<number> {
  const unique = new Map<string, ArticleInput>();
  for (const article of articles) {
    if (!unique.has(article.url)) {
      unique.set(article.url, article);
    }
  }

  const toInsert = Array.from(unique.values()).map((a) => ({
    title: a.title,
    description: a.description || "No description",
    content: a.content,
    url: a.url,
    source: a.source,
    sourceSlug: a.sourceSlug,
    publishedAt: a.publishedAt,
    date: dateStr,
    imageUrl: a.imageUrl,
    category: classifyArticle(a.title, a.description),
  }));

  if (toInsert.length === 0) return 0;

  let inserted = 0;
  for (const article of toInsert) {
    try {
      await prisma.article.upsert({
        where: { url: article.url },
        update: {},
        create: article,
      });
      inserted++;
    } catch {
      // duplicate
    }
  }
  return inserted;
}

// ── Service ───────────────────────────────────────────────────

export class IndianNewsService {
  async fetchArticlesForDate(dateStr: string): Promise<number> {
    const cached = await prisma.article.findFirst({
      where: { date: dateStr },
      select: { id: true },
    });
    if (cached) return 0;

    const targetDate = new Date(dateStr + "T00:00:00+05:30");
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Try RSS first (works best for today / yesterday)
    const rssArticles = await scrapeRss(dateStr, targetDate, nextDay);
    if (rssArticles.length >= 10) {
      return insertArticles(dateStr, rssArticles);
    }

    // Fallback: scrape archive pages
    const archiveArticles = await scrapeArchive(dateStr);
    if (archiveArticles.length > 0) {
      return insertArticles(dateStr, archiveArticles);
    }

    // If RSS gave some but not enough, merge both
    if (rssArticles.length > 0) {
      return insertArticles(dateStr, [...rssArticles, ...archiveArticles]);
    }

    return 0;
  }

  async getArticlesForDate(dateStr: string) {
    return prisma.article.findMany({
      where: { date: dateStr },
      orderBy: [{ sourceSlug: "asc" }, { publishedAt: "asc" }],
    });
  }

  async hasArticlesForDate(dateStr: string): Promise<boolean> {
    const count = await prisma.article.count({
      where: { date: dateStr },
      take: 1,
    });
    return count > 0;
  }
}

export const indianNewsService = new IndianNewsService();
