"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Container, Title, Text, Paper, Badge, Group, Pagination, SimpleGrid, Box, Chip } from "@mantine/core";
import { useQuizHistory } from "@/hooks/use-quiz-history";
import { useCategories } from "@/hooks/use-categories";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";

const BORDER_COLORS = ["#4f46e5", "#f59e0b", "#06b6d4", "#ec4899", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981"];

function HistoryCard({ attempt, onClick, idx }: { attempt: { id: string; date: string; score: number; total: number; category: { name: string; slug: string } }; onClick: () => void; idx: number }) {
  const accuracy = Math.round((attempt.score / attempt.total) * 100);
  const passed = accuracy >= ACCURACY_THRESHOLD;
  const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];

  return (
    <Paper withBorder p="lg" radius="lg" bg="white" className="card-hover animate-up"
      style={{ cursor: "pointer", borderLeft: `4px solid ${borderColor}` }}
      onClick={onClick}
    >
      <Group justify="space-between" mb="sm">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase">{attempt.date}</Text>
        <Badge size="md" color={passed ? "green" : "red"} variant="light" radius="sm">{accuracy}%</Badge>
      </Group>
      <Text fw={700} size="md" mb="xs">{attempt.category.name}</Text>
      <Group gap={6}>
        <Text size="sm" fw={600}>{attempt.score}/{attempt.total}</Text>
        <Text size="xs" c="dimmed">correct</Text>
        {!passed && <Badge size="xs" color="red" variant="light">Needs work</Badge>}
      </Group>
    </Paper>
  );
}

function HistoryHeader({ total }: { total: number }) {
  return (
    <Paper withBorder p="lg" radius="lg" bg="white" mb="xl" className="animate-up">
      <Group>
        <Box className="icon-box-44" bg="indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </Box>
        <Box flex={1}>
          <Title order={3}>Quiz History</Title>
          <Text c="dimmed" size="sm">{total} attempt{total !== 1 ? "s" : ""} total</Text>
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

  if (loading && !attempts.length) return <LoadingState message="Loading history..." />;

  if (!attempts.length && !loading) {
    return (
      <Container size="md" py="xl">
        <Paper withBorder p="xl" radius="lg" bg="white" ta="center">
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

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className="animate-stagger">
        {attempts.map((a, idx) => (
          <HistoryCard key={a.id} attempt={a} idx={idx} onClick={() => router.push(`/history/${a.id}`)} />
        ))}
      </SimpleGrid>

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
    <Suspense fallback={<LoadingState message="Loading history..." />}>
      <HistoryContent />
    </Suspense>
  );
}
