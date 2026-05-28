"use client";

import { Paper, Title, Text, Group, Button, Badge, SimpleGrid, Box, Checkbox, Tabs } from "@mantine/core";
import { format } from "date-fns";
import { CATEGORIES } from "@/constants/categories";
import { GeneratingView } from "./GeneratingView";
import { QuestionReviewCards } from "../QuestionReviewCards";

interface Article {
  title: string;
  description: string;
  content?: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
}

interface TabState {
  articles: Article[];
  selectedIndices: number[];
  questions: { text: string; options: string[]; articleTitle?: string; articleUrl?: string; correctIndex: number; explanation: string }[];
  totalGenerated: number;
  saving: boolean;
  saved: boolean;
}

const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {};
for (const c of CATEGORIES) {
  CATEGORY_COLORS[c.slug] = { color: c.color, label: c.name };
}
CATEGORY_COLORS["general"] = { color: "#667eea", label: "General" };

const SOURCE_COLORS = [
  "#667eea", "#f59e0b", "#06b6d4", "#ec4899",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#6366f1", "#84cc16", "#d946ef",
];

function getSourceColor(source: string): string {
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = source.charCodeAt(i) + ((hash << 5) - hash);
  return SOURCE_COLORS[Math.abs(hash) % SOURCE_COLORS.length];
}

function ArticleCard({ article, selected, onToggle, sourceColor }: { article: Article; selected: boolean; onToggle: () => void; sourceColor: string }) {
  return (
    <Paper withBorder p="sm" radius="md" className="card-hover option-card"
      style={{
        borderColor: selected ? sourceColor : undefined,
        borderWidth: selected ? 2 : 1,
        background: selected ? `${sourceColor}10` : undefined,
      }}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onChange={onToggle} color="indigo" size="xs"
        label={
          <Box>
            <Text size="sm" fw={600} mb={2} className="text-wrap-pretty">{article.title}</Text>
            {article.description && <Text size="xs" c="dimmed" lineClamp={2}>{article.description}</Text>}
          </Box>
        }
        styles={{ label: { paddingLeft: 8, flex: 1 } }} style={{ alignItems: "flex-start" }}
      />
    </Paper>
  );
}

export function CategoryTabs({
  date, slugs, activeTab, tabs, phase, cancelTab,
  onSetActiveTab, onSelectAll, onClearAll, onToggleArticle, onGenerateQuiz, onCancelGeneration, onSaveAndStart, onResetQuestions,
}: {
  date: Date;
  slugs: string[];
  activeTab: string | null;
  tabs: Record<string, TabState>;
  phase: string;
  cancelTab: string | null;
  onSetActiveTab: (slug: string) => void;
  onSelectAll: (slug: string) => void;
  onClearAll: (slug: string) => void;
  onToggleArticle: (slug: string, idx: number) => void;
  onGenerateQuiz: (slug: string) => void;
  onCancelGeneration: (slug: string) => void;
  onSaveAndStart: (slug: string) => void;
  onResetQuestions: (slug: string) => void;
}) {
  const tab = activeTab ? tabs[activeTab] : undefined;

  return (
    <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
      <Group mb="md">
        <Box flex={1}>
          <Title order={3} mb={4}>Categories ({slugs.length})</Title>
          <Group gap="xs">
            <Badge size="sm" variant="light" color="green">India</Badge>
            <Badge size="sm" variant="light" color="gray">{format(date, "MMM dd, yyyy")}</Badge>
          </Group>
        </Box>
      </Group>

      <Tabs value={activeTab} onChange={(v) => v && onSetActiveTab(v)} variant="pills" radius="xl">
        <Tabs.List mb="md">
          {slugs.map((slug) => {
            const meta = CATEGORY_COLORS[slug];
            const t = tabs[slug];
            const hasQuestions = t && t.questions.length > 0 && phase !== "generating";
            return (
              <Tabs.Tab key={slug} value={slug}
                style={{
                  borderColor: activeTab === slug ? meta?.color : undefined,
                  borderWidth: activeTab === slug ? 2 : 0,
                  borderStyle: "solid",
                  background: activeTab === slug ? `${meta?.color}15` : undefined,
                  fontWeight: activeTab === slug ? 600 : 400,
                }}
              >
                <Group gap={4}>
                  <Text size="sm">{meta?.label ?? slug}</Text>
                  <Badge size="xs" variant="light" color="gray">{t?.articles.length ?? 0}</Badge>
                  {hasQuestions && <Badge size="xs" variant="filled" color="green">{t!.questions.length}</Badge>}
                </Group>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {slugs.map((slug) => {
          if (activeTab !== slug || !tab) return null;
          const meta = CATEGORY_COLORS[slug] ?? CATEGORY_COLORS.general!;

          if (phase === "generating" && cancelTab === slug) {
            return (
              <GeneratingView key={slug}
                questions={tab.questions}
                totalGenerated={tab.totalGenerated}
                onCancel={() => onCancelGeneration(slug)}
              />
            );
          }

          if (tab.questions.length > 0) {
            return (
              <Box key={slug}>
                <QuestionReviewCards
                  questions={tab.questions}
                  selectedCount={tab.selectedIndices.length}
                  onStartQuiz={() => onSaveAndStart(slug)}
                  onReset={() => onResetQuestions(slug)}
                  saving={tab.saving}
                />
              </Box>
            );
          }

          const groupedBySource: Record<string, Article[]> = {};
          tab.articles.forEach((a) => {
            (groupedBySource[a.source] ??= []).push(a);
          });

          return (
            <Box key={slug}>
              <Group mb="md">
                <Box flex={1}>
                  <Title order={4}>{meta.label}</Title>
                  <Text size="xs" c="dimmed">{tab.articles.length} articles</Text>
                </Box>
              </Group>

              <Group mb="md">
                <Button size="xs" variant="light" onClick={() => onSelectAll(slug)}>Select All</Button>
                <Button size="xs" variant="light" color="gray" onClick={() => onClearAll(slug)}>Clear</Button>
                <Text size="sm" c="dimmed" fw={500}>{tab.selectedIndices.length} selected</Text>
              </Group>

              {Object.entries(groupedBySource).map(([source, articles]) => (
                <Box key={source} mb="md">
                  <Group gap="xs" mb="xs" px={4}>
                    <Box w={10} h={10} style={{ borderRadius: "50%", background: getSourceColor(source) }} />
                    <Text size="sm" fw={600} c="dimmed">{source}</Text>
                    <Text size="xs" c="gray">({articles.length})</Text>
                  </Group>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                    {articles.map((article, li) => {
                      const flatIdx = tab.articles.indexOf(article);
                      const selected = tab.selectedIndices.includes(flatIdx);
                      return (
                        <ArticleCard key={`${source}-${li}`}
                          article={article}
                          selected={selected}
                          onToggle={() => onToggleArticle(slug, flatIdx)}
                          sourceColor={getSourceColor(source)}
                        />
                      );
                    })}
                  </SimpleGrid>
                </Box>
              ))}

              <Group mt="lg">
                <Text size="sm" c="dimmed">
                  {tab.selectedIndices.length > 0
                    ? `Generate quiz from ${tab.selectedIndices.length} article${tab.selectedIndices.length > 1 ? "s" : ""}`
                    : "Select articles to generate a quiz"}
                </Text>
                <Button size="md" ml="auto" variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 45 }}
                  onClick={() => tab.selectedIndices.length > 0 && onGenerateQuiz(slug)}
                  style={{ opacity: tab.selectedIndices.length > 0 ? 1 : 0.5 }}
                  rightSection={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  }
                >
                  Generate Quiz
                </Button>
              </Group>
            </Box>
          );
        })}
      </Tabs>
    </Paper>
  );
}
