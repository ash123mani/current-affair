import OpenAI from "openai";

export interface GeneratedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  articleTitle?: string;
  articleUrl?: string;
}

export interface LLMServiceConfig {
  model?: string;
  maxRetries?: number;
}

export class LLMService {
  private readonly client: OpenAI | null;
  private readonly model: string;
  private readonly maxRetries: number;

  constructor(config: LLMServiceConfig = {}) {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) {
      console.warn("[LLMService] NVIDIA_API_KEY not set.");
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: key,
        baseURL: "https://integrate.api.nvidia.com/v1",
        timeout: 60000,
      });
    }
    this.model = config.model ?? "meta/llama-4-maverick-17b-128e-instruct";
    this.maxRetries = config.maxRetries ?? 1;
  }

  private requireClient(): OpenAI {
    if (!this.client) {
      throw new Error("NVIDIA_API_KEY environment variable is not set — cannot generate questions");
    }
    return this.client;
  }

  async generateQuestions(
    categoryName: string,
    date: string,
    articles: { title: string; description: string; content?: string; source: string }[],
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    const topArticles = articles.slice(0, 10);
    const prompt = this.buildPrompt(categoryName, date, topArticles, count);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.callLLM(prompt, 2048);
        const parsed = this.parseResponse(result);
        if (this.validateQuestions(parsed, count)) {
          return parsed;
        }
      } catch (error) {
        console.warn(`[LLMService] Attempt ${attempt + 1} failed:`, error);
        if (attempt === this.maxRetries) {
          throw new Error(`LLM generation failed after ${this.maxRetries + 1} attempts: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    throw new Error("LLM generation failed");
  }

  async generateQuestionsBatched(
    categoryName: string,
    date: string,
    articles: { title: string; description: string; content?: string; source: string; url: string }[],
    batchSize: number = 5,
    onBatch?: (questions: GeneratedQuestion[]) => void
  ): Promise<GeneratedQuestion[]> {
    const all: GeneratedQuestion[] = [];
    const batches: { title: string; description: string; content?: string; source: string; url: string }[][] = [];

    for (let i = 0; i < articles.length; i += batchSize) {
      batches.push(articles.slice(i, i + batchSize));
    }

    await Promise.all(
      batches.map(async (batch) => {
        const questions = await this.generateQuestions(categoryName, date, batch, batch.length * 2);
        const tagged = questions.map((q) => {
          const article = this.findBestArticle(q, batch);
          return { ...q, articleTitle: article?.title, articleUrl: article?.url };
        });
        all.push(...tagged);
        onBatch?.(tagged);
      })
    );

    return all;
  }

  private findBestArticle(
    question: GeneratedQuestion,
    batch: { title: string; description: string; content?: string; source: string; url: string }[]
  ): { title: string; url: string } | null {
    if (batch.length === 1) return { title: batch[0].title, url: batch[0].url };

    const qWords = new Set(question.text.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    let best = batch[0];
    let bestScore = 0;

    for (const article of batch) {
      const aWords = (article.title + " " + (article.description ?? "")).toLowerCase();
      let score = 0;
      for (const word of qWords) {
        if (aWords.includes(word)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = article;
      }
    }

    return { title: best.title, url: best.url };
  }

  private buildPrompt(
    category: string,
    _date: string,
    articles: { title: string; description: string; content?: string; source: string }[],
    count: number
  ): string {
    const articlesText = articles
      .map((a) => `- Title: ${a.title}\n  Context: ${a.description || "No additional context"}\n  Content: ${a.content || "No full content available"} (Source: ${a.source})`)
      .join("\n\n");

    return `You are an expert quiz setter for Indian competitive examinations (UPSC, SSC, Banking, Railway, State PSC). Generate ${count} high-quality general-knowledge multiple-choice questions INSPIRED by the articles below.

CRITICAL: Questions must be SELF-CONTAINED — no dates, no "recently" / "in a landmark judgment" / "according to a new study" references. Test permanent knowledge drawn from the article's topic.

QUESTION STRUCTURE RULES:
1. Stem (the question text) must be a complete, answerable sentence — not a fill-in-the-blank. The stem alone should give enough context to understand what is being asked.
2. All 4 options must be the SAME TYPE and SIMILAR LENGTH — all nouns, all statements, all policy names, etc. Unequal length reveals the answer.
3. Each wrong option (distractor) must be a SPECIFIC, CONCRETE claim that sounds reasonable to someone familiar with the subject — never "none of the above", "all of the above", or vague dismissals like "this contradicts known facts".
4. The correct answer must be DEFINTIVELY supported by the article content. Distractors should be invented but plausible within the same domain.

DISTRACTOR QUALITY CHECKLIST (apply to every question):
- Would a student who studied this topic find the wrong options tempting? [YES/NO]
- Is each wrong option a complete, specific statement rather than a vague judgment? [YES/NO]
- Do all options have similar grammatical structure? [YES/NO]
- Could each wrong option conceivably be true in a different context? [YES/NO]

EXAMPLES OF GOOD vs POOR QUESTIONS:

POOR (what NOT to do):
Article: "Supreme Court holds in-laws cannot be prosecuted for dowry cruelty merely because they lived jointly"
Bad Q: "What did the Supreme Court rule about in-laws?"
Bad options: ["They cannot be prosecuted merely for living jointly", "This is speculative", "This is minor", "This contradicts known facts"]
Why bad: Options 2-4 are vague placeholders, not real claims.

GOOD (what TO do):
Article: "Supreme Court holds in-laws cannot be prosecuted for dowry cruelty merely because they lived jointly"
Good Q: "Under which legal principle did the Supreme Court rule that in-laws cannot be held liable for dowry harassment solely on the basis of shared residence?"
Good options: [
  "Principle of actus reus — mere presence does not constitute active participation in an offense",
  "Principle of vicarious liability — family members are automatically liable for acts within the household",
  "Principle of joint family responsibility — all adult members share legal culpability for domestic offenses",
  "Principle of reversed burden — the accused must prove their innocence in dowry-related cases"
]
Correct: 0 (actus reus)

ANOTHER GOOD EXAMPLE:
Article: "RBI keeps repo rate unchanged at 6.5% for the fifth consecutive time"
Good Q: "A central bank's decision to maintain the repo rate over multiple consecutive meetings is primarily aimed at:"
Good options: [
  "Anchoring inflation expectations while supporting continued economic growth",
  "Encouraging commercial banks to reduce their lending rates for retail borrowers",
  "Decreasing the money supply to curb excessive speculative activity in equity markets",
  "Aligning domestic interest rates with the US Federal Reserve's monetary policy stance"
]
Correct: 0

ANOTHER GOOD EXAMPLE:
Article: "ISRO successfully tests crew escape system for Gaganyaan mission"
Good Q: "The Crew Escape System tested by ISRO for the Gaganyaan mission is designed to:"
Good options: [
  "Detach the crew module from the launch vehicle within milliseconds of a anomaly and parachute it to safety",
  "Provide emergency life support to astronauts for up to 72 hours in the event of cabin depressurization",
  "Enable manual override of the automated docking sequence during orbital rendezvous maneuvers",
  "Eject the payload fairing at a lower altitude than nominal to reduce splashdown velocity"
]
Correct: 0

RULE ENFORCEMENT - You MUST follow this EXACT output format. Every question MUST have the "text", "options" (array of 4 strings), "correctIndex" (0-3), and "explanation" fields. No markdown, no code fences.

Articles to draw from:
${articlesText}

Generate exactly ${count} questions. Return ONLY a valid JSON array:
[
  {
    "text": "question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Why correct is right and why each distractor is wrong (2-3 sentences)"
  }
]`;
  }

  private async callLLM(prompt: string, maxTokens: number = 2048): Promise<string> {
    const completion = await this.requireClient().chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are an expert quiz setter for Indian competitive exams (UPSC, SSC, Banking). You generate general-knowledge multiple-choice questions inspired by current affairs articles. Every question must have 4 specific, plausible options of similar length and type — no vague placeholders. No dates or current-event references in questions. Return only valid JSON arrays — no markdown, no commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    });

    return completion.choices?.[0]?.message?.content ?? "";
  }

  private parseResponse(raw: string): GeneratedQuestion[] {
    const cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("LLM response is not an array");
    }

    return parsed.map((q: Partial<GeneratedQuestion>) => ({
      text: String(q.text ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctIndex: Number(q.correctIndex) ?? 0,
      explanation: String(q.explanation ?? ""),
      articleTitle: q.articleTitle ? String(q.articleTitle) : undefined,
      articleUrl: q.articleUrl ? String(q.articleUrl) : undefined,
    }));
  }

  private validateQuestions(questions: GeneratedQuestion[], expectedCount: number): boolean {
    if (questions.length === 0 || questions.length > expectedCount + 2) return false;

    return questions.every(
      (q) =>
        q.text.length > 10 &&
        q.options.length === 4 &&
        q.options.every((o) => o.length > 0) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3 &&
        q.explanation.length > 5
    );
  }

  async generateSingleQuestion(
    categoryName: string,
    date: string,
    article: { title: string; description: string; content?: string; source: string }
  ): Promise<GeneratedQuestion> {
    const prompt = this.buildSinglePrompt(categoryName, date, article);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.callLLM(prompt, 1536);
        const parsed = this.parseSingleResponse(result);
        if (this.validateSingleQuestion(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn(`[LLMService] Attempt ${attempt + 1} failed:`, error);
        if (attempt === this.maxRetries) {
          throw new Error(`LLM single question generation failed after ${this.maxRetries + 1} attempts: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    throw new Error("LLM single question generation failed");
  }

  private buildSinglePrompt(
    category: string,
    _date: string,
    article: { title: string; description: string; content?: string; source: string }
  ): string {
    return `You are an expert quiz setter for Indian competitive examinations. Craft a general-knowledge multiple-choice question INSPIRED by this article.

Use ONLY this article:

Title: ${article.title}
Context: ${article.description || "N/A"}
Content: ${article.content || "N/A"}
Source: ${article.source}

QUESTION STRUCTURE RULES:
- The question must be SELF-CONTAINED — no dates, no "recently" or "according to a study" references
- Stem must be a complete, answerable sentence (not fill-in-the-blank)
- All 4 options must be the SAME TYPE and SIMILAR LENGTH — all nouns / all policy statements / all mechanisms
- Each wrong option must be a SPECIFIC, CONCRETE claim that sounds reasonable in this domain — never vague
- The correct answer must be definitively supported by the article
- Explanation: 2-3 sentences — why correct is right AND why each distractor is wrong

If the article is rich enough, generate up to 2 questions. Return ONLY valid JSON, no markdown.

{
  "text": "question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "explanation"
}`;
  }

  private parseSingleResponse(raw: string): GeneratedQuestion {
    const cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return this.parseResponse(cleaned)[0];
    }

    return {
      text: String(parsed.text ?? ""),
      options: Array.isArray(parsed.options) ? parsed.options.map(String) : [],
      correctIndex: Number(parsed.correctIndex) ?? 0,
      explanation: String(parsed.explanation ?? ""),
    };
  }

  private validateSingleQuestion(q: GeneratedQuestion): boolean {
    return (
      q.text.length > 10 &&
      q.options.length === 4 &&
      q.options.every((o) => o.length > 0) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3 &&
      q.explanation.length > 5
    );
  }
}

export const llmService = new LLMService();
