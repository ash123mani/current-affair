export const CATEGORIES = [
  { name: "Politics", slug: "politics", icon: "🏛️", color: "#1a1a2e" },
  { name: "Technology", slug: "technology", icon: "💻", color: "#16213e" },
  { name: "Business & Economy", slug: "business", icon: "📈", color: "#0f3460" },
  { name: "Sports", slug: "sports", icon: "⚽", color: "#1a1a2e" },
  { name: "Science & Environment", slug: "science", icon: "🔬", color: "#16213e" },
  { name: "World", slug: "world", icon: "🌍", color: "#0f3460" },
  { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "#1a1a2e" },
  { name: "Health", slug: "health", icon: "🏥", color: "#16213e" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
