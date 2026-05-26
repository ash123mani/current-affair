import { Group, Text, Progress } from "@mantine/core";

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
  const progress = Math.round((answered / total) * 100);

  return (
    <>
      <Group justify="space-between" mb="md">
        <div>
          <Text fw={500} size="lg">
            {categoryName}
          </Text>
          <Text size="sm" c="dimmed">
            Question {currentIndex + 1} of {total}
          </Text>
        </div>
        <Text size="sm" c="dimmed">
          {answered}/{total} answered
        </Text>
      </Group>
      <Progress value={progress} mb="xl" />
    </>
  );
}
