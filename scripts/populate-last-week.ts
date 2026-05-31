import "dotenv/config";
import { subDays, format } from "date-fns";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

interface Article {
  title: string;
  description: string;
  source: string;
}

function getMockArticles(categorySlug: string): Article[] {
  const all: Record<string, Article[]> = {
    politics: [
      { title: "India and Germany sign landmark trade agreement in Berlin", description: "The agreement is expected to boost bilateral trade by $50 billion annually.", source: "Times of India" },
      { title: "Parliament passes new digital governance bill", description: "The bill aims to regulate digital platforms and protect citizen data.", source: "The Hindu" },
    ],
    technology: [
      { title: "OpenAI announces GPT-5 with breakthrough reasoning capabilities", description: "The new model shows significant improvements in complex problem-solving.", source: "TechCrunch" },
      { title: "India semiconductor mission attracts $10 billion investment", description: "Major global chipmakers commit to setting up manufacturing units in India.", source: "Economic Times" },
    ],
    business: [
      { title: "Nifty 50 hits record high on strong FII inflows", description: "The benchmark index crossed the 85,000 mark for the first time.", source: "Bloomberg" },
      { title: "RBI holds repo rate steady amid inflation concerns", description: "The central bank maintains status quo for the third consecutive meeting.", source: "Reuters" },
    ],
    sports: [
      { title: "India wins 10 medals at Asian Games 2026", description: "Best-ever performance with 3 gold, 4 silver, and 3 bronze medals.", source: "ESPN" },
      { title: "Indian cricket team wins test series against Australia", description: "Historic series win Down Under after 7 years.", source: "Cricbuzz" },
    ],
    science: [
      { title: "Renewable energy surpasses 50% of global electricity generation", description: "A major milestone in the fight against climate change.", source: "National Geographic" },
      { title: "ISRO successfully launches next-gen navigation satellite", description: "The satellite will enhance GPS accuracy across the Indian region.", source: "ISRO" },
    ],
    world: [
      { title: "UN Security Council passes new resolution on climate security", description: "The resolution links climate change to global security threats.", source: "Reuters" },
      { title: "G7 nations agree on new digital trade framework", description: "The framework aims to standardize cross-border digital commerce.", source: "BBC" },
    ],
    entertainment: [
      { title: "Indian film wins Best Picture at International Film Festival", description: "The movie swept major awards including Best Director and Best Screenplay.", source: "Variety" },
      { title: "Streaming platforms invest $1 billion in Indian original content", description: "Major bet on regional language programming across genres.", source: "Hollywood Reporter" },
    ],
    health: [
      { title: "New breakthrough in mRNA vaccine technology announced", description: "Researchers develop a universal vaccine platform using mRNA.", source: "The Lancet" },
      { title: "WHO launches global mental health initiative", description: "The program aims to provide mental health support in 100 countries.", source: "WHO News" },
    ],
  };
  return all[categorySlug] ?? [];
}

function mockQuestion(article: Article, _categoryName: string) {
  return {
    text: `Based on recent reporting, what is the key takeaway from: "${article.title}"?`,
    options: [
      `${article.description} — this was confirmed by ${article.source} and marks a significant shift.`,
      `This is a speculative claim with no official confirmation`,
      `This is a routine update with no major implications`,
      `This report contradicts established facts in the field`,
    ],
    correctIndex: 0,
    explanation: `According to ${article.source}, ${article.description}. The other options misrepresent the nature of the report.`,
  };
}

const CATEGORIES: { slug: string; name: string }[] = [
  { slug: "politics", name: "Politics" },
  { slug: "technology", name: "Technology" },
  { slug: "business", name: "Business & Economy" },
  { slug: "sports", name: "Sports" },
  { slug: "science", name: "Science & Environment" },
  { slug: "world", name: "World" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "health", name: "Health" },
];

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  for (let i = 1; i <= 7; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    console.log(`\n=== Populating ${date} (${i}/7) ===`);

    for (const cat of CATEGORIES) {
      const dbCategory = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (!dbCategory) {
        console.log(`  ${cat.name}: category not found, skipping`);
        continue;
      }

      const existingPublished = await prisma.question.count({
        where: { categoryId: dbCategory.id, date, status: "published" },
      });
      if (existingPublished >= 3) {
        console.log(`  ${cat.name}: ${existingPublished} published exist, skipping`);
        continue;
      }

      const articles = getMockArticles(cat.slug);
      if (articles.length === 0) {
        console.log(`  ${cat.name}: no articles, skipping`);
        continue;
      }

      let created = 0;
      for (const article of articles) {
        if (created >= 3) break;
        const q = mockQuestion(article, cat.name);

        try {
          await prisma.question.create({
            data: {
              categoryId: dbCategory.id,
              date,
              text: q.text,
              options: JSON.stringify(q.options),
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              source: `Mock: ${article.source}`,
              status: "published",
            },
          });
          created++;
        } catch (e) {
          console.log(`  ${cat.name}: save failed — ${e instanceof Error ? e.message : "Unknown"}`);
        }
      }

      console.log(`  ${cat.name}: ${created} question(s) published`);
    }
  }

  await prisma.$disconnect();
  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
