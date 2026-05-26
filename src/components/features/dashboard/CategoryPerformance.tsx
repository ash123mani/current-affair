import { SimpleGrid, Paper, Group, Text, RingProgress } from "@mantine/core";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { CategoryStat } from "@/types/api";

interface CategoryPerformanceProps {
  stats: CategoryStat[];
}

export function CategoryPerformance({ stats }: CategoryPerformanceProps) {
  if (stats.length === 0) {
    return (
      <EmptyState message="No quizzes attempted yet. Start playing to see your stats!" />
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
      {stats.map((cat) => (
        <Paper key={cat.slug} withBorder p="md" radius="md">
          <Group>
            <RingProgress
              size={80}
              thickness={8}
              sections={[
                {
                  value: cat.accuracy,
                  color: cat.accuracy >= ACCURACY_THRESHOLD ? "teal" : "red",
                },
              ]}
            />
            <div>
              <Text fw={500}>{cat.name}</Text>
              <Text size="sm" c="dimmed">
                {cat.totalScore}/{cat.totalQuestions} correct ({cat.accuracy}%)
              </Text>
              <Text size="xs" c="dimmed">
                {cat.attempts} attempt{cat.attempts > 1 ? "s" : ""}
              </Text>
            </div>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
