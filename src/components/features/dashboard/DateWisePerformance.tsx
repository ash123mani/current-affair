"use client";

import { Paper, Title, Text, Group, Badge, Stack, Box } from "@mantine/core";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { AttemptResponse } from "@/types/api";

interface DateWisePerformanceProps {
  attempts: AttemptResponse[];
}

export function DateWisePerformance({ attempts }: DateWisePerformanceProps) {
  if (attempts.length === 0) return null;

  const groupedByDate: Record<string, AttemptResponse[]> = {};
  for (const a of attempts) {
    if (!groupedByDate[a.date]) groupedByDate[a.date] = [];
    groupedByDate[a.date].push(a);
  }

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <Paper withBorder p="lg" radius="lg" mb="xl" className="animate-up">
      <Title order={4} mb="md">Recent Activity</Title>
      <Stack gap="sm">
        {sortedDates.map((date) => {
          const dayAttempts = groupedByDate[date];
          const dayCorrect = dayAttempts.reduce((s, a) => s + a.score, 0);
          const dayTotal = dayAttempts.reduce((s, a) => s + a.total, 0);
          const dayAccuracy = dayTotal ? Math.round((dayCorrect / dayTotal) * 100) : 0;
          const passed = dayAccuracy >= ACCURACY_THRESHOLD;

          return (
            <Paper key={date} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid ${passed ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"}` }}>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={600}>{date}</Text>
                <Badge size="sm" color={passed ? "green" : "red"} variant="light">{dayAccuracy}%</Badge>
              </Group>
              <Text size="xs" c="dark.2">
                {dayAttempts.length} attempt{dayAttempts.length > 1 ? "s" : ""} &middot; {dayCorrect}/{dayTotal} correct
              </Text>
              <Group gap={4} mt={6}>
                {dayAttempts.map((a, i) => {
                  const aPassed = a.total ? Math.round((a.score / a.total) * 100) >= ACCURACY_THRESHOLD : false;
                  return (
                    <Box key={i}
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: aPassed ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)",
                      }}
                    />
                  );
                })}
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
