"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Title, Text, Paper, Badge, Group, Pagination, SimpleGrid, Box, Chip } from "@mantine/core";
import { useQuizHistory } from "@/hooks/use-quiz-history";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";
import { api } from "@/lib/api/client";
import type { CategoryModel } from "@/types/models";

const BORDER_COLORS = ["#667eea", "#f59e0b", "#06b6d4", "#ec4899", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981"];

function HistoryCard({ attempt, onClick, idx }: { attempt: { id: string; date: string; score: number; total: number; category: { name: string; slug: string } }; onClick: () => void; idx: number }) {
  const accuracy = Math.round((attempt.score / attempt.total) * 100);
  const passed = accuracy >= ACCURACY_THRESHOLD;
  const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];

  return (
    <Paper
      withBorder
      p="lg"
      radius="lg"
      bg="white"
      className="card-hover animate-up"
      style={{ cursor: "pointer", borderLeft: `4px solid ${borderColor}` }}
      onClick={onClick}
    >
      <Group justify="space-between" mb="sm">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase">{attempt.date}</Text>
        <Badge size="md" color={passed ? "green" : "red"} variant="light" radius="sm">
          {accuracy}%
        </Badge>
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

export default function HistoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { attempts, total, page, totalPages, loading, setPage } = useQuizHistory(categoryFilter ?? undefined);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  if (loading && !attempts.length) {
    return <LoadingState message="Loading history..." />;
  }

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
      <Paper withBorder p="lg" radius="lg" bg="white" mb="xl" className="animate-up" style={{ borderLeft: "4px solid #667eea" }}>
        <Group>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <Box style={{ flex: 1 }}>
            <Title order={3}>Quiz History</Title>
            <Text c="dimmed" size="sm">{total} attempt{total !== 1 ? "s" : ""} total</Text>
          </Box>
        </Group>
      </Paper>

      <Group mb="lg" className="animate-fade">
        <Chip.Group multiple={false} value={categoryFilter || "all"} onChange={(v) => {
          setCategoryFilter(v === "all" ? null : v);
          setPage(1);
        }}>
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
