"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Container, Title, Text, Paper, Badge, Group, Pagination, SimpleGrid, Box, Chip } from "@mantine/core";
import { useQuizHistory } from "@/hooks/use-quiz-history";
import { useCategories } from "@/hooks/use-categories";
import { LoadingSkeleton, LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";

const BORDER_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f472b6", "#22d3ee", "#fb923c", "#c084fc", "#4ade80"];

function HistoryCard({ attempt, onClick, idx }: { attempt: { id: string; date: string; score: number; total: number; category: { name: string; slug: string } }; onClick: () => void; idx: number }) {
  const accuracy = Math.round((attempt.score / attempt.total) * 100);
  const passed = accuracy >= ACCURACY_THRESHOLD;
  const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];

  return (
    <Paper withBorder p="lg" radius="lg" className="card-hover animate-up cursor-pointer"
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={onClick}
    >
      <Group justify="space-between" mb="sm">
        <Text size="xs" c="dark.2" fw={600} tt="uppercase">{attempt.date}</Text>
        <Badge size="md" color={passed ? "green" : "red"} variant="light" radius="sm">{accuracy}%</Badge>
      </Group>
      <Text fw={700} size="md" mb="xs">{attempt.category.name}</Text>
      <Group gap={6}>
        <Text size="sm" fw={600}>{attempt.score}/{attempt.total}</Text>
        <Text size="xs" c="dark.2">correct</Text>
        {!passed && <Badge size="xs" color="red" variant="light">Needs work</Badge>}
      </Group>
    </Paper>
  );
}

function HistoryHeader({ total }: { total: number }) {
  return (
    <Paper withBorder p="lg" radius="lg" mb="xl" className="animate-up">
      <Group>
        <Box className="icon-box-44" bg="violet.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </Box>
        <Box flex={1}>
          <Title order={3}>Quiz History</Title>
          <Text c="dark.2" size="sm">{total} attempt{total !== 1 ? "s" : ""} total</Text>
        </Box>
      </Group>
    </Paper>
  );
}

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const { categories } = useCategories();
  const { attempts, total, page, totalPages, loading } = useQuizHistory(categoryParam ?? undefined, pageParam);

  const setFilter = useCallback((cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    params.set("page", "1");
    router.push(`/history?${params.toString()}`);
  }, [router, searchParams]);

  const setPage = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/history?${params.toString()}`);
  }, [router, searchParams]);

  if (loading && !attempts.length) return <LoadingSkeleton page="history" />;

  if (!attempts.length && !loading) {
    return (
      <Container size="md" py="xl">
        <Paper withBorder p="xl" radius="lg" ta="center">
          <Title order={3} mb="xs">Quiz History</Title>
          <EmptyState message="No quizzes attempted yet. Generate one from the home page!" />
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <HistoryHeader total={total} />

      <Group mb="lg" className="animate-fade">
        <Chip.Group multiple={false} value={categoryParam || "all"} onChange={(v) => setFilter(v === "all" ? null : v)}>
          <Group gap={6}>
            <Chip value="all" size="sm" radius="xl">All</Chip>
            {categories.map((c) => (
              <Chip key={c.slug} value={c.slug} size="sm" radius="xl">{c.name}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>

      {(() => {
        const groupedByDate: Record<string, typeof attempts> = {};
        for (const a of attempts) {
          if (!groupedByDate[a.date]) groupedByDate[a.date] = [];
          groupedByDate[a.date].push(a);
        }
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

        return sortedDates.map((date) => {
          const dayAttempts = groupedByDate[date];
          const dayCorrect = dayAttempts.reduce((s, a) => s + a.score, 0);
          const dayTotal = dayAttempts.reduce((s, a) => s + a.total, 0);
          const dayAccuracy = dayTotal ? Math.round((dayCorrect / dayTotal) * 100) : 0;
          const passed = dayAccuracy >= ACCURACY_THRESHOLD;

          return (
            <Box key={date} mb="lg">
              <Paper withBorder p="sm" radius="md" mb="sm" style={{ borderLeft: `3px solid ${passed ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"}` }}>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text fw={600} size="sm">{date}</Text>
                    <Badge size="sm" variant="light" color="gray">{dayAttempts.length} attempt{dayAttempts.length > 1 ? "s" : ""}</Badge>
                  </Group>
                  <Badge size="sm" color={passed ? "green" : "red"} variant="light">{dayAccuracy}%</Badge>
                </Group>
                <Text size="xs" c="dark.2" mt={2}>{dayCorrect}/{dayTotal} correct across {dayAttempts.length} quiz{dayAttempts.length > 1 ? "zes" : ""}</Text>
              </Paper>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                {dayAttempts.map((a, idx) => (
                  <HistoryCard key={a.id} attempt={a} idx={idx} onClick={() => router.push(`/history/${a.id}`)} />
                ))}
              </SimpleGrid>
            </Box>
          );
        });
      })()}

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination total={totalPages} value={page} onChange={setPage} size="sm" radius="xl" />
        </Group>
      )}
    </Container>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<LoadingSkeleton page="history" />}>
      <HistoryContent />
    </Suspense>
  );
}
