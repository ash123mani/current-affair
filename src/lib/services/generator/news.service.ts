import { CATEGORIES } from "@/constants/categories";
import { today } from "@/lib/date";

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface CategorizedNews {
  categorySlug: string;
  categoryName: string;
  articles: NewsArticle[];
}

const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  politics: ["politics", "government", "election", "parliament", "policy", "minister", "president"],
  technology: ["tech", "ai", "software", "digital", "cyber", "startup", "apple", "google", "microsoft"],
  business: ["business", "economy", "stock", "market", "finance", "banking", "trade", "startup"],
  sports: ["sports", "cricket", "football", "olympic", "championship", "tennis", "fifa"],
  science: ["science", "climate", "environment", "research", "space", "nasa", "discovery", "nature"],
  world: ["world", "international", "foreign", "global", "united nations", "treaty", "diplomat"],
  entertainment: ["entertainment", "movie", "film", "music", "celebrity", "award", "hollywood"],
  health: ["health", "medical", "disease", "hospital", "vaccine", "mental health", "fitness", "covid"],
};

export class NewsService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://newsapi.org/v2";

  constructor() {
    const key = process.env.NEWSAPI_KEY;
    if (!key) {
      console.warn("[NewsService] NEWSAPI_KEY not set. Using mock data.");
    }
    this.apiKey = key ?? "";
  }

  async fetchTopHeadlines(country: string = "in"): Promise<CategorizedNews[]> {
    if (!this.apiKey) {
      return this.getMockNews();
    }

    const url = `${this.baseUrl}/top-headlines?country=${country}&pageSize=50&apiKey=${this.apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return this.categorizeArticles(data.articles ?? []);
  }

  async fetchByCategory(categorySlug: string, country: string = "in"): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      return this.getMockNews().find((c) => c.categorySlug === categorySlug)?.articles ?? [];
    }

    const categoryParam = this.mapSlugToNewsApiCategory(categorySlug);
    const url = `${this.baseUrl}/top-headlines?country=${country}&category=${categoryParam}&pageSize=10&apiKey=${this.apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return this.normalizeArticles(data.articles ?? []);
  }

  private categorizeArticles(rawArticles: unknown[]): CategorizedNews[] {
    const articles = this.normalizeArticles(rawArticles);

    return CATEGORIES.map((cat) => ({
      categorySlug: cat.slug,
      categoryName: cat.name,
      articles: articles.filter((a) =>
        CATEGORY_KEYWORD_MAP[cat.slug]?.some((k) =>
          (a.title + " " + a.description).toLowerCase().includes(k)
        )
      ),
    })).filter((c) => c.articles.length > 0);
  }

  private normalizeArticles(raw: unknown[]): NewsArticle[] {
    return raw.map((a) => {
      const article = a as Record<string, unknown>;
      return {
        title: String(article.title ?? ""),
        description: String(article.description ?? ""),
        source: (article.source as Record<string, unknown>)?.name as string ?? "",
        url: String(article.url ?? ""),
        publishedAt: String(article.publishedAt ?? ""),
      };
    }).filter((a) => a.title && a.title !== "[Removed]");
  }

  private mapSlugToNewsApiCategory(slug: string): string {
    const map: Record<string, string> = {
      politics: "general",
      technology: "technology",
      business: "business",
      sports: "sports",
      science: "science",
      world: "general",
      entertainment: "entertainment",
      health: "health",
    };
    return map[slug] ?? "general";
  }

  private getMockNews(): CategorizedNews[] {
    const todayStr = today();

    return [
      {
        categorySlug: "politics",
        categoryName: "Politics",
        articles: [
          {
            title: "India and Germany sign landmark trade agreement in Berlin",
            description: "The agreement is expected to boost bilateral trade by $50 billion annually.",
            source: "Times of India",
            url: "https://example.com/trade-deal",
            publishedAt: todayStr,
          },
          {
            title: "Parliament passes new digital governance bill",
            description: "The bill aims to regulate digital platforms and protect citizen data.",
            source: "The Hindu",
            url: "https://example.com/digital-bill",
            publishedAt: todayStr,
          },
        ],
      },
      {
        categorySlug: "technology",
        categoryName: "Technology",
        articles: [
          {
            title: "OpenAI announces GPT-5 with breakthrough reasoning capabilities",
            description: "The new model shows significant improvements in complex problem-solving.",
            source: "TechCrunch",
            url: "https://example.com/gpt5",
            publishedAt: todayStr,
          },
          {
            title: "India's semiconductor mission attracts $10 billion investment",
            description: "Major global chipmakers commit to setting up manufacturing units in India.",
            source: "Economic Times",
            url: "https://example.com/semiconductor",
            publishedAt: todayStr,
          },
        ],
      },
      {
        categorySlug: "business",
        categoryName: "Business & Economy",
        articles: [
          {
            title: "Nifty 50 hits record high on strong FII inflows",
            description: "The benchmark index crossed the 85,000 mark for the first time.",
            source: "Bloomberg",
            url: "https://example.com/nifty",
            publishedAt: todayStr,
          },
        ],
      },
      {
        categorySlug: "sports",
        categoryName: "Sports",
        articles: [
          {
            title: "India wins 10 medals at Asian Games 2026",
            description: "Best-ever performance with 3 gold, 4 silver, and 3 bronze medals.",
            source: "ESPN",
            url: "https://example.com/asian-games",
            publishedAt: todayStr,
          },
        ],
      },
      {
        categorySlug: "science",
        categoryName: "Science & Environment",
        articles: [
          {
            title: "Renewable energy surpasses 50% of global electricity generation",
            description: "A major milestone in the fight against climate change.",
            source: "National Geographic",
            url: "https://example.com/renewable",
            publishedAt: todayStr,
          },
        ],
      },
    ];
  }
}

export const newsService = new NewsService();
