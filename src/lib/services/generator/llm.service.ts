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
      });
    }
    this.model = config.model ?? "stepfun-ai/step-3.5-flash";
    this.maxRetries = config.maxRetries ?? 2;
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

    const prompt = this.buildPrompt(categoryName, date, articles, count);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.callLLM(prompt);
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

    return `You are a current affairs quiz generator. Generate ${count} multiple-choice questions based SOLELY on the following news articles for the "${category}" category on ${date}.

Rules:
- Questions must be based ONLY on the provided articles
- Each question must have exactly 4 options
- Exactly one option must be correct (index 0-3)
- Provide a brief explanation for the correct answer
- Return ONLY valid JSON, no markdown formatting

Articles:
${articlesText}

Return format as a JSON array:
[
  {
    "text": "question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "explanation of the correct answer"
  }
]`;
  }

  private async callLLM(prompt: string): Promise<string> {
    const completion = await this.client!.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You generate current affairs quiz questions from news articles. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
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

  private mockGenerate(
    categoryName: string,
    articles: { title: string; description: string; source: string }[],
    _count: number
  ): GeneratedQuestion[] {
    if (articles.length === 0) {
      return [
        {
          text: `What major development happened in ${categoryName} recently?`,
          options: ["Development A", "Development B", "Development C", "Development D"],
          correctIndex: 0,
          explanation: `This was a significant event in ${categoryName}.`,
        },
      ];
    }

    return articles.slice(0, _count).map((article) => ({
      text: `According to recent news, ${article.title}?`,
      options: [
        `Yes, this was reported by ${article.source}`,
        "No, this is false",
        "Partially true",
        "There is no evidence for this",
      ],
      correctIndex: 0,
      explanation: article.description || `This was reported by ${article.source}.`,
    }));
  }
}

export const llmService = new LLMService();
