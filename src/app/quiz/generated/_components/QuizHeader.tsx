"use client";

import { Paper, Title, Text, Group, Badge, Box } from "@mantine/core";

export function QuizHeader({ answered, total }: { answered: number; total: number }) {
  return (
    <Paper withBorder p="lg" radius="lg" bg="white" mb="lg">
      <Group>
        <Box flex={1}>
          <Title order={3}>Quiz</Title>
          <Text size="sm" c="dimmed">{total} questions</Text>
        </Box>
        <Badge size="lg" variant="light" color="terracotta">{answered}/{total}</Badge>
      </Group>
    </Paper>
  );
}
