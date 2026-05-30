import { SimpleGrid, Paper, Group, Text, RingProgress, Badge, Box } from "@mantine/core";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { CategoryStat } from "@/types/api";

interface CategoryPerformanceProps {
  stats: CategoryStat[];
}

const BORDER_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f472b6", "#22d3ee", "#fb923c", "#c084fc", "#4ade80"];

export function CategoryPerformance({ stats }: CategoryPerformanceProps) {
  if (stats.length === 0) {
    return <EmptyState message="No quizzes attempted yet. Start playing to see your stats!" />;
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="xl">
      {stats.map((cat, idx) => {
        const passed = cat.accuracy >= ACCURACY_THRESHOLD;
        const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];
        return (
          <Paper
            key={cat.slug}
            withBorder
            p="lg"
            radius="lg"
            className="animate-up card-hover"
            style={{ borderLeft: `4px solid ${borderColor}` }}
          >
            <Group>
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[{ value: cat.accuracy, color: passed ? "green" : "red" }]}
                label={<Text ta="center" fw={700} size="xs">{cat.accuracy}%</Text>}
              />
              <Box style={{ flex: 1 }}>
                <Group gap="xs" mb={2}>
                  <Text fw={600} size="sm">{cat.name}</Text>
                </Group>
                <Text size="xs" c="dark.2" mb={4}>
                  {cat.totalScore}/{cat.totalQuestions} correct
                </Text>
                <Group gap="xs">
                  <Badge size="xs" color={passed ? "green" : "red"} variant="light">
                    {cat.attempts} attempt{cat.attempts > 1 ? "s" : ""}
                  </Badge>
                  <Badge size="xs" color="dark.4" variant="light">
                    {cat.accuracy}% acc
                  </Badge>
                </Group>
              </Box>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
