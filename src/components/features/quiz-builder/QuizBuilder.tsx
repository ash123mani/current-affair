"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Title, Text, Paper, Group, Button, Stack, Badge, SimpleGrid,
  Loader, Alert, ThemeIcon, Divider, Box, Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { format, subDays } from "date-fns";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { NewsSource } from "@/types/api";
import type { NewsArticle } from "@/lib/services/generator/news.service";

type Step = "country" | "sources" | "date" | "articles" | "generate";

const STEPS: { key: Step; label: string }[] = [
  { key: "country", label: "Country" },
  { key: "sources", label: "Newspapers" },
  { key: "date", label: "Date & Topic" },
  { key: "articles", label: "Articles" },
  { key: "generate", label: "Quiz" },
];

const COUNTRIES = [
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "za", name: "South Africa", flag: "🇿🇦" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
];

const NEWS_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
];

const CATEGORY_META: Record<string, { color: string; light: string }> = {
  general: { color: "#667eea", light: "#667eea12" },
  business: { color: "#f59e0b", light: "#f59e0b12" },
  technology: { color: "#06b6d4", light: "#06b6d412" },
  entertainment: { color: "#ec4899", light: "#ec489912" },
  sports: { color: "#3b82f6", light: "#3b82f612" },
  science: { color: "#8b5cf6", light: "#8b5cf612" },
  health: { color: "#ef4444", light: "#ef444412" },
};

const COUNTRY_FLAGS: Record<string, string> = {};
COUNTRIES.forEach((c) => { COUNTRY_FLAGS[c.code] = c.flag; });

export function QuizBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("country");
  const [country, setCountry] = useState<string>("in");
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [questions, setQuestions] = useState<{ text: string; options: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "sources") {
      setLoading(true);
      api.news.sources(country).then((data) => {
        setSources(data.sources);
        setSelectedSources([]);
      }).catch(() => setSources([])).finally(() => setLoading(false));
    }
  }, [step, country]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  async function handleFetchArticles() {
    if (selectedSources.length === 0 || !selectedCategory) return;
    setLoading(true);
    setError(null);
    try {
      const fromDate = format(date, "yyyy-MM-dd");
      const toDate = format(date, "yyyy-MM-dd");
      const data = await api.news.articles(country, selectedSources, fromDate, toDate);
      setArticles(data.articles);
      setStep("articles");
      if (data.articles.length === 0) {
        notifyError("No articles found", "Try different sources or a different date");
      } else {
        notifySuccess(`${data.articles.length} articles fetched`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQuiz() {
    if (articles.length === 0 || !selectedCategory) return;
    setLoading(true);
    setError(null);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const data = await api.quiz.generate(articles, selectedCategory, dateStr);
      setQuestions(data.questions);
      setStep("generate");
      notifySuccess("Quiz generated!", `${data.questions.length} questions ready`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  function handleStartQuiz() {
    sessionStorage.setItem("generatedQuiz", JSON.stringify({ questions, category: selectedCategory }));
    router.push(`/quiz/generated?category=${selectedCategory}`);
  }

  return (
    <Box ref={containerRef}>
      {/* Step Progress */}
      <Paper withBorder p="md" radius="lg" bg="white" mb="lg" className="animate-fade">
        <Group justify="space-between" wrap="nowrap">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <Group key={s.key} gap={6} wrap="nowrap" style={{ flex: 1 }}>
                <ThemeIcon
                  size={28}
                  radius="xl"
                  color={done ? "green" : active ? "violet" : "gray"}
                  variant={done || active ? "filled" : "light"}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <Text size="xs" fw={700}>{i + 1}</Text>
                  )}
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={active ? 600 : 400} c={active ? undefined : "dimmed"} truncate>{s.label}</Text>
                </Box>
                {i < STEPS.length - 1 && (
                  <Box style={{ flex: 1, height: 2, margin: "0 4px", borderRadius: 1, background: done ? "var(--mantine-color-green-5)" : "var(--mantine-color-gray-2)" }} />
                )}
              </Group>
            );
          })}
        </Group>
      </Paper>

      {error && (
        <Alert color="red" variant="light" radius="md" mb="lg" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && step === "sources" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" ta="center" className="animate-fade">
          <Loader size="sm" color="violet" mb="md" />
          <Text size="sm" c="dimmed" fw={500}>Loading sources...</Text>
        </Paper>
      )}

      {loading && step !== "sources" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" ta="center" className="animate-fade">
          <Loader size="sm" color="violet" mb="md" />
          <Text size="sm" c="dimmed" fw={500}>
            {step === "articles" ? "Fetching articles..." : "Generating questions..."}
          </Text>
        </Paper>
      )}

      {/* Step: Country */}
      {!loading && step === "country" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
          <Title order={3} mb={4}>Select Country</Title>
          <Text c="dimmed" size="sm" mb="lg">Choose a country to fetch news from</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm" mb="xl">
            {COUNTRIES.map((c) => {
              const active = country === c.code;
              return (
                <Paper
                  key={c.code}
                  withBorder
                  p="md"
                  radius="lg"
                  ta="center"
                  className="card-hover"
                  style={{
                    cursor: "pointer",
                    borderColor: active ? "var(--mantine-color-violet-6)" : undefined,
                    borderWidth: active ? 2 : 1,
                    background: active ? "var(--mantine-color-violet-0)" : undefined,
                  }}
                  onClick={() => setCountry(c.code)}
                >
                  <Text style={{ fontSize: 28 }} mb={4}>{c.flag}</Text>
                  <Text fw={600} size="sm">{c.name}</Text>
                </Paper>
              );
            })}
          </SimpleGrid>
          <Group>
            <Button
              size="md"
              variant="gradient"
              gradient={{ from: "violet", to: "pink", deg: 45 }}
              onClick={() => setStep("sources")}
              ml="auto"
              rightSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              }
            >
              Pick Newspapers
            </Button>
          </Group>
        </Paper>
      )}

      {/* Step: Sources */}
      {!loading && step === "sources" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
          <Group mb="lg">
            <Box style={{ flex: 1 }}>
              <Title order={3} mb={4}>Select Newspapers</Title>
              <Text c="dimmed" size="sm">
                {COUNTRY_FLAGS[country] || "🌍"} Showing sources from {COUNTRIES.find((c) => c.code === country)?.name || country}
              </Text>
            </Box>
            <Button variant="subtle" color="gray" size="sm" onClick={() => setStep("country")}>
              ← Change country
            </Button>
          </Group>

          {sources.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No sources available for this country.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mb="xl" className="animate-stagger">
              {sources.map((source) => {
                const selected = selectedSources.includes(source.id);
                const meta = CATEGORY_META[source.category] || CATEGORY_META.general!;
                return (
                  <Paper
                    key={source.id}
                    withBorder
                    p="md"
                    radius="lg"
                    className="card-hover"
                    style={{
                      cursor: "pointer",
                      borderColor: selected ? meta.color : undefined,
                      borderWidth: selected ? 2 : 1,
                      background: selected ? meta.light : undefined,
                      opacity: selected ? 1 : 0.85,
                    }}
                    onClick={() => {
                      setSelectedSources((prev) =>
                        prev.includes(source.id)
                          ? prev.filter((s) => s !== source.id)
                          : [...prev, source.id]
                      );
                    }}
                  >
                    <Group mb={4}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: meta.light, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: meta.color, flexShrink: 0,
                      }}>
                        {source.name.charAt(0)}
                      </div>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={600} truncate>{source.name}</Text>
                      </Box>
                      {selected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={2} mb={6}>{source.description}</Text>
                    <Badge size="xs" variant="light" color="gray">{source.category}</Badge>
                  </Paper>
                );
              })}
            </SimpleGrid>
          )}

          <Group>
            {selectedSources.length > 0 && (
              <Text size="sm" c="dimmed" fw={500}>{selectedSources.length} source{selectedSources.length > 1 ? "s" : ""} selected</Text>
            )}
            <Button
              size="md"
              disabled={selectedSources.length === 0}
              onClick={() => setStep("date")}
              ml="auto"
              variant="gradient"
              gradient={{ from: "violet", to: "pink", deg: 45 }}
              rightSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              }
            >
              Continue
            </Button>
          </Group>
        </Paper>
      )}

      {/* Step: Date & Topic */}
      {!loading && step === "date" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
          <Group mb="lg">
            <Box style={{ flex: 1 }}>
              <Title order={3} mb={4}>Date & Topic</Title>
              <Text c="dimmed" size="sm">Choose a date and topic for your quiz</Text>
            </Box>
            <Button variant="subtle" color="gray" size="sm" onClick={() => setStep("sources")}>
              ← Change sources
            </Button>
          </Group>

          <Box mb="xl">
            <Text size="sm" fw={600} mb="sm">Select Date</Text>
            <Group gap="xs" mb="sm" wrap="wrap">
              {[0, 1, 2, 3, 6].map((d) => {
                const day = subDays(new Date(), d);
                const key = format(day, "yyyy-MM-dd");
                const active = format(date, "yyyy-MM-dd") === key;
                const label = d === 0 ? "Today" : d === 1 ? "Yesterday" : format(day, "MMM dd");
                return (
                  <Button
                    key={key}
                    variant={active ? "filled" : "default"}
                    size="sm"
                    radius="xl"
                    onClick={() => setDate(day)}
                  >
                    {label}
                  </Button>
                );
              })}
              <DatePickerInput
                value={date}
                onChange={(v) => { if (v) setDate(new Date(v)); }}
                placeholder="Pick date"
                maxDate={new Date()}
                size="sm"
                radius="xl"
                style={{ width: 140 }}
              />
            </Group>
          </Box>

          <Divider mb="xl" />

          <Text size="sm" fw={600} mb="sm">Select Topic</Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="xl">
            {NEWS_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              const meta = CATEGORY_META[cat.value] || CATEGORY_META.general!;
              return (
                <Paper
                  key={cat.value}
                  withBorder
                  p="md"
                  radius="lg"
                  ta="center"
                  className="card-hover"
                  style={{
                    cursor: "pointer",
                    borderColor: active ? meta.color : undefined,
                    borderWidth: active ? 2 : 1,
                    background: active ? meta.light : undefined,
                  }}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <Text fw={600} size="sm">{cat.label}</Text>
                </Paper>
              );
            })}
          </SimpleGrid>

          <Group>
            <Button
              size="md"
              variant="gradient"
              gradient={{ from: "violet", to: "pink", deg: 45 }}
              disabled={!selectedCategory}
              onClick={handleFetchArticles}
              loading={loading}
              ml="auto"
              rightSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              }
            >
              Fetch Articles
            </Button>
          </Group>
        </Paper>
      )}

      {/* Step: Articles */}
      {!loading && step === "articles" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
          <Group mb="lg">
            <Box style={{ flex: 1 }}>
              <Title order={3} mb={4}>Articles Found ({articles.length})</Title>
              <Group gap="xs">
                <Badge size="sm" variant="light" color="violet">{selectedCategory}</Badge>
                <Badge size="sm" variant="light" color="gray">{format(date, "MMM dd, yyyy")}</Badge>
                <Badge size="sm" variant="light" color="gray">{selectedSources.length} sources</Badge>
              </Group>
            </Box>
            <Button variant="subtle" color="gray" size="sm" onClick={() => setStep("date")}>
              ← Change
            </Button>
          </Group>

          {articles.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No articles found for this date and sources.</Text>
          ) : (
            <Stack gap="sm" mb="lg">
              {articles.slice(0, 15).map((article, idx) => (
                <Paper key={idx} withBorder p="md" radius="md" className="card-hover" style={{ cursor: "default" }}>
                  <Group gap="sm" mb={4}>
                    <Badge size="xs" variant="filled" color="gray" radius="sm">#{idx + 1}</Badge>
                    <Text size="xs" c="dimmed" fs="italic">{article.source}</Text>
                  </Group>
                  <Text size="sm" fw={600} mb={2}>{article.title}</Text>
                  {article.description && (
                    <Text size="xs" c="dimmed" lineClamp={2}>{article.description}</Text>
                  )}
                </Paper>
              ))}
              {articles.length > 15 && (
                <Text size="xs" c="dimmed" ta="center" py="sm">
                  +{articles.length - 15} more articles
                </Text>
              )}
            </Stack>
          )}

          <Group>
            <Text size="sm" c="dimmed">
              {articles.length > 0
                ? `Generate a quiz from ${articles.length} article${articles.length > 1 ? "s" : ""}`
                : "Try different sources or date"}
            </Text>
            <Button
              size="md"
              ml="auto"
              variant="gradient"
              gradient={{ from: "violet", to: "pink", deg: 45 }}
              disabled={articles.length === 0}
              onClick={handleGenerateQuiz}
              loading={loading}
              rightSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              }
            >
              Generate Quiz
            </Button>
          </Group>
        </Paper>
      )}

      {/* Step: Quiz Ready */}
      {!loading && step === "generate" && (
        <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-scale" ta="center">
          <ThemeIcon size={56} radius="xl" color="green" variant="light" mb="md" mx="auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </ThemeIcon>
          <Title order={3} mb={4}>Quiz Ready!</Title>
          <Text c="dimmed" size="sm" mb="lg">
            {questions.length} question{questions.length > 1 ? "s" : ""} · {articles.length} articles · {format(date, "MMM dd, yyyy")}
          </Text>

          <Stack gap="sm" mb="xl" ta="left">
            {questions.map((q, idx) => (
              <Paper key={idx} withBorder p="md" radius="md" className="animate-slide-right" style={{ animationDelay: `${idx * 0.06}s` }}>
                <Group gap="sm" mb={4}>
                  <Badge size="xs" variant="filled" color="violet" radius="sm">Q{idx + 1}</Badge>
                </Group>
                <Text size="sm" fw={500}>{q.text}</Text>
                <Group gap={4} mt={6}>
                  {q.options.map((_, oi) => (
                    <Badge key={oi} size="xs" variant="light" color="gray">{["A", "B", "C", "D"][oi]}</Badge>
                  ))}
                </Group>
              </Paper>
            ))}
          </Stack>

          <Group justify="center">
            <Button variant="light" color="gray" onClick={() => { setStep("country"); setQuestions([]); setArticles([]); }}>
              Start Over
            </Button>
            <Button
              size="lg"
              variant="gradient"
              gradient={{ from: "violet", to: "pink", deg: 45 }}
              onClick={handleStartQuiz}
              rightSection={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              }
            >
              Start Quiz
            </Button>
          </Group>
        </Paper>
      )}
    </Box>
  );
}
