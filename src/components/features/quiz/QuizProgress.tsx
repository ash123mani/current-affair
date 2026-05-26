import { Group, Text, Progress, Paper, Badge } from "@mantine/core";

interface QuizProgressProps {
  answered: number;
  total: number;
  currentIndex: number;
  categoryName: string;
}

export function QuizProgress({
  answered,
  total,
  currentIndex,
  categoryName,
}: QuizProgressProps) {
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <Paper withBorder p="md" radius="md" mb="lg">
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <Text fw={600} size="md">
            {categoryName}
          </Text>
          <Badge size="sm" variant="light" color="blue">
            {currentIndex + 1}/{total}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {answered}/{total} answered
        </Text>
      </Group>
      <Progress
        value={progress}
        color={progress === 100 ? "green" : "blue"}
        size="sm"
        radius="md"
        animated={progress < 100}
      />
      <Group gap={4} mt="xs" justify="center">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                i === currentIndex
                  ? "var(--mantine-color-blue-6)"
                  : i < currentIndex
                    ? "var(--mantine-color-green-4)"
                    : "var(--mantine-color-gray-3)",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </Group>
    </Paper>
  );
}
