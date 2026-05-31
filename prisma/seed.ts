import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const categories = [
  { name: "Politics", slug: "politics", icon: "🏛️", color: "#1a1a2e" },
  { name: "Technology", slug: "technology", icon: "💻", color: "#16213e" },
  { name: "Business & Economy", slug: "business", icon: "📈", color: "#0f3460" },
  { name: "Sports", slug: "sports", icon: "⚽", color: "#1a1a2e" },
  { name: "Science & Environment", slug: "science", icon: "🔬", color: "#16213e" },
  { name: "World", slug: "world", icon: "🌍", color: "#0f3460" },
  { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "#1a1a2e" },
  { name: "Health", slug: "health", icon: "🏥", color: "#16213e" },
];

async function main() {
  console.log("Seeding categories...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Seeding sample questions...");

  const todayStr = today();

  const sampleQuestions = [
    {
      categorySlug: "politics",
      text: "Which country recently signed a new bilateral trade agreement with India in 2026?",
      options: JSON.stringify(["Japan", "Germany", "Brazil", "Australia"]),
      correctIndex: 1,
      explanation: "India and Germany signed a comprehensive trade agreement in early 2026.",
      source: "Sample data",
    },
    {
      categorySlug: "technology",
      text: "What is the name of the latest AI model released by OpenAI in 2026?",
      options: JSON.stringify(["GPT-5", "Claude 4", "Gemini Ultra 2", "Llama 4"]),
      correctIndex: 0,
      explanation: "OpenAI released GPT-5 with significant improvements in reasoning.",
      source: "Sample data",
    },
    {
      categorySlug: "business",
      text: "Which stock index reached a new all-time high in Q1 2026?",
      options: JSON.stringify(["S&P 500", "Nifty 50", "Nikkei 225", "FTSE 100"]),
      correctIndex: 1,
      explanation: "Nifty 50 hit a record high in Q1 2026 driven by strong FII inflows.",
      source: "Sample data",
    },
    {
      categorySlug: "sports",
      text: "Which nation hosted the 2026 FIFA World Cup?",
      options: JSON.stringify(["USA", "Qatar", "Canada", "Morocco"]),
      correctIndex: 0,
      explanation: "The 2026 FIFA World Cup was hosted across USA, Canada, and Mexico.",
      source: "Sample data",
    },
    {
      categorySlug: "science",
      text: "What major climate milestone was achieved globally in 2025?",
      options: JSON.stringify([
        "Net-zero emissions reached",
        "Renewable energy surpassed 50% of global electricity",
        "Amazon rainforest deforestation halted",
        "Arctic sea ice fully recovered",
      ]),
      correctIndex: 1,
      explanation: "Renewable energy sources surpassed 50% of global electricity generation.",
      source: "Sample data",
    },
  ];

  for (const q of sampleQuestions) {
    const category = await prisma.category.findUnique({
      where: { slug: q.categorySlug },
    });
    if (!category) continue;

    await prisma.question.upsert({
      where: {
        categoryId_date_text: {
          categoryId: category.id,
          date: todayStr,
          text: q.text,
        },
      },
      update: {},
      create: {
        categoryId: category.id,
        date: todayStr,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        source: q.source,
      },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
