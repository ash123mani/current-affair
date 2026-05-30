"use client";

import { Paper, Title, Text, Group, Button, Badge, SimpleGrid, Box, Checkbox, Accordion } from "@mantine/core";
import { format } from "date-fns";
import { CATEGORIES } from "@/constants/categories";

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
}

const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {};
for (const c of CATEGORIES) {
  CATEGORY_COLORS[c.slug] = { color: c.color, label: c.name };
}
CATEGORY_COLORS["general"] = { color: "#8b5cf6", label: "General" };

const SOURCE_COLORS = [
  "#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9",
  "#3b82f6", "#60a5fa", "#2563eb", "#1d4ed8",
  "#10b981", "#34d399", "#059669", "#047857",
  "#f59e0b", "#f97316", "#ef4444", "#ec4899",
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
        background: selected ? `${sourceColor}15` : undefined,
      }}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onChange={onToggle} color="violet" size="xs"
        label={
          <Box>
            <Text size="sm" fw={600} mb={2} c="white" className="text-wrap-pretty">{article.title}</Text>
            {article.description && <Text size="xs" c="gray.6" lineClamp={2}>{article.description}</Text>}
          </Box>
        }
        styles={{ label: { paddingLeft: 8, flex: 1 } }} style={{ alignItems: "flex-start" }}
      />
    </Paper>
  );
}

export function CategoryTabs({
  date, slugs, tabs,
  onSelectAll, onClearAll, onToggleArticle, onGenerateQuiz,
}: {
  date: Date;
  slugs: string[];
  tabs: Record<string, TabState>;
  onSelectAll: (slug: string) => void;
  onClearAll: (slug: string) => void;
  onToggleArticle: (slug: string, idx: number) => void;
  onGenerateQuiz: () => void;
}) {
  const totalArticles = slugs.reduce((sum, s) => sum + (tabs[s]?.articles.length ?? 0), 0);
  const totalSelected = slugs.reduce((sum, s) => sum + (tabs[s]?.selectedIndices.length ?? 0), 0);

  return (
    <Paper withBorder p="xl" radius="lg" mb="lg" className="animate-up">
      <Group mb="lg">
        <Box flex={1}>
          <Title order={3} c="white" mb={4}>Articles by Topic ({slugs.length})</Title>
          <Group gap="xs">
            <Badge size="sm" variant="light" color="dark.4">{format(date, "MMM dd, yyyy")}</Badge>
            <Badge size="sm" variant="light" color="blue">{totalArticles} fetched</Badge>
            {totalSelected > 0 && (
              <Badge size="sm" variant="light" color="violet">{totalSelected} selected</Badge>
            )}
          </Group>
        </Box>
      </Group>

      <Accordion variant="filled" radius="md" chevronPosition="left" multiple={false}>
        {slugs.map((slug) => {
          const meta = CATEGORY_COLORS[slug] ?? CATEGORY_COLORS.general!;
          const tab = tabs[slug];
          if (!tab) return null;

          const groupedBySource: Record<string, Article[]> = {};
          tab.articles.forEach((a) => {
            (groupedBySource[a.source] ??= []).push(a);
          });

          const selectedCount = tab.selectedIndices.length;
          const totalCount = tab.articles.length;

          return (
            <Accordion.Item key={slug} value={slug}>
              <Accordion.Control icon={
                <Box w={10} h={10} style={{ borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
              }>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={500} c="gray.4">{meta.label}</Text>
                  <Badge size="xs" variant="light" color="dark.4">{totalCount}</Badge>
                  {selectedCount > 0 && selectedCount < totalCount && (
                    <Badge size="xs" variant="light" color="violet">{selectedCount} selected</Badge>
                  )}
                  {selectedCount === totalCount && totalCount > 0 && (
                    <Badge size="xs" variant="light" color="green">all selected</Badge>
                  )}
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Group mb="md">
                  <Button size="xs" variant="light" onClick={() => onSelectAll(slug)}>Select All</Button>
                  <Button size="xs" variant="light" color="dark.4" onClick={() => onClearAll(slug)}>Clear</Button>
                  <Text size="sm" c="gray.6" fw={500}>{selectedCount}/{totalCount} selected</Text>
                </Group>

                {Object.entries(groupedBySource).map(([source, articles]) => (
                  <Box key={source} mb="md">
                    <Group gap="xs" mb="xs" px={4}>
                      <Box w={10} h={10} style={{ borderRadius: "50%", background: getSourceColor(source) }} />
                      <Text size="sm" fw={600} c="gray.4">{source}</Text>
                      <Text size="xs" c="gray.6">({articles.length})</Text>
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

              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>

      <Paper withBorder p="md" radius="lg" mt="lg" style={{ borderColor: totalSelected > 0 ? 'var(--mantine-color-violet-5)' : undefined }}>
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text size="sm" fw={500} c="gray.4">
              {totalSelected > 0
                ? `${totalSelected} article${totalSelected > 1 ? "s" : ""} selected...`
                : "Select articles from the topics above"}
            </Text>
            {totalSelected > 0 && (
              <Text size="xs" c="gray.6">Questions will be generated as they arrive from the AI</Text>
            )}
          </Box>
          <Button size="md" variant="gradient" gradient={{ from: "violet", to: "violet.6", deg: 45 }}
            disabled={totalSelected === 0}
            onClick={onGenerateQuiz}
            rightSection={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            }
          >
            Generate Quiz{totalSelected > 0 ? ` (${totalSelected})` : ""}
          </Button>
        </Group>
      </Paper>
    </Paper>
  );
}
