export const CATEGORIES = [
  { name: "Politics", slug: "politics", icon: "🏛️", color: "#a78bfa" },
  { name: "Technology", slug: "technology", icon: "💻", color: "#60a5fa" },
  { name: "Business & Economy", slug: "business", icon: "📈", color: "#34d399" },
  { name: "Sports", slug: "sports", icon: "⚽", color: "#f472b6" },
  { name: "Science & Environment", slug: "science", icon: "🔬", color: "#22d3ee" },
  { name: "World", slug: "world", icon: "🌍", color: "#fb923c" },
  { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "#c084fc" },
  { name: "Health", slug: "health", icon: "🏥", color: "#4ade80" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
