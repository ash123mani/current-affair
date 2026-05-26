import OpenAI from "openai";

export interface GeneratedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
      console.warn("[LLMService] NVIDIA_API_KEY not set. Using mock generator.");
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: key,
        baseURL: "https://integrate.api.nvidia.com/v1",
        timeout: 30000,
      });
    }
    this.model = config.model ?? "mistralai/mistral-7b-instruct-v0.3";
    this.maxRetries = config.maxRetries ?? 1;
  }

  async generateQuestions(
    categoryName: string,
    date: string,
    articles: { title: string; description: string; source: string }[],
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    if (!this.client) {
      return this.mockGenerate(categoryName, articles, count);
    }

    const topArticles = articles.slice(0, 5);
    const prompt = this.buildPrompt(categoryName, date, topArticles, count);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.callLLM(prompt, 2048);
        const parsed = this.parseResponse(result);
        if (this.validateQuestions(parsed, count)) {
          return parsed;
        }
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        console.warn(`[LLMService] Attempt ${attempt + 1} failed, retrying...`);
      }
    }

    throw new Error("Failed to generate valid questions after retries");
  }

  private buildPrompt(
    category: string,
    date: string,
    articles: { title: string; description: string; source: string }[],
    count: number
  ): string {
    const articlesText = articles
      .map((a) => `- ${a.title}${a.description ? `: ${a.description}` : ""} (${a.source})`)
      .join("\n");

    return `You are a UPSC/SSC exam question paper setter. Generate ${count} multiple-choice questions for "${category}" category. Date: ${date}. Use ONLY the articles below.

Rules:
- Ask about the WHAT, WHY, or SIGNIFICANCE of each event — not trivial recall of names, dates, or numbers
- Each question: 4 options, 3 plausible distractors + 1 correct answer
- Wrong options must mislead someone who only skimmed the headline
- Correct answer must be definitively supported by the article
- Frame like real UPSC Prelims / SSC CGL: clear stem, concise options, no ambiguity
- Explanation: 2-3 sentences — why correct is right AND why each distractor is wrong

Articles:
${articlesText}

Return ONLY a valid JSON array (no markdown):
[
  {
    "text": "question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "explanation"
  }
]`;
  }

  private async callLLM(prompt: string, maxTokens: number = 2048): Promise<string> {
    const completion = await this.client!.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You generate current affairs quiz questions from news articles. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
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
    article: { title: string; description: string; source: string }
  ): Promise<GeneratedQuestion> {
    if (!this.client) {
      return this.mockGenerate(categoryName, [article], 1)[0];
    }

    const prompt = this.buildSinglePrompt(categoryName, date, article);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.callLLM(prompt, 1024);
        const parsed = this.parseSingleResponse(result);
        if (this.validateSingleQuestion(parsed)) {
          return parsed;
        }
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        console.warn(`[LLMService] Attempt ${attempt + 1} failed, retrying...`);
      }
    }

    throw new Error("Failed to generate valid question after retries");
  }

  private buildSinglePrompt(
    category: string,
    date: string,
    article: { title: string; description: string; source: string }
  ): string {
    return `You are a UPSC/SSC exam question paper setter. Craft one high-quality multiple-choice question from this news article.

Context: Generate exactly 1 question for "${category}" category. Date: ${date}. Use ONLY this article:

Title: ${article.title}
Description: ${article.description || "N/A"}
Source: ${article.source}

Instructions:
- Ask about the WHAT, WHY, or SIGNIFICANCE of the event — not trivial details like names, dates, or numbers
- Write 4 options where 3 are plausible distractors. Each wrong option must sound reasonable to someone who only skimmed the news
- The correct answer must be definitively supported by the article
- Frame it like a real UPSC Prelims or SSC CGL question: clear stem, concise options, no ambiguity
- Explanation: 2-3 sentences explaining WHY the correct answer is right and WHY each distractor is wrong

Format requirements:
- Exactly 4 options (indices 0-3)
- Return ONLY valid JSON, no markdown, no commentary

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

  private mockGenerate(
    categoryName: string,
    articles: { title: string; description: string; source: string }[],
    _count: number
  ): GeneratedQuestion[] {
    if (articles.length === 0) {
      return [
        {
          text: `Which of the following best describes a major recent development in ${categoryName}?`,
          options: [
            `A landmark policy change in ${categoryName}`,
            `A breakthrough innovation in ${categoryName}`,
            `A significant diplomatic or economic shift in ${categoryName}`,
            `A major event reshaping ${categoryName} globally`,
          ],
          correctIndex: 0,
          explanation: `Recent reporting highlights a transformative development in ${categoryName}, with implications that extend beyond the sector itself. The other options, while plausible, do not capture the specific breakthrough that was widely reported.`,
        },
      ];
    }

    return articles.slice(0, _count).map((article) => ({
      text: `Based on recent reporting, what is the key takeaway from the following development: "${article.title}"?`,
      options: [
        `${article.description || `This development was confirmed by ${article.source} and marks a significant shift.`}`,
        `This is a speculative claim with no official confirmation`,
        `This is a routine update with no major implications`,
        `This report contradicts established facts in the field`,
      ],
      correctIndex: 0,
      explanation: `According to ${article.source}, ${article.description || `this development represents a notable event in ${categoryName}. The other options misrepresent the nature of the report — it was a confirmed, significant development, not speculative or routine.`}`,
    }));
  }
}

export const llmService = new LLMService();
