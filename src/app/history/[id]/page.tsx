"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Container, Paper, Title, Text, Button, Stack, Group, Badge, Divider, RingProgress, Box } from "@mantine/core";
import { useAttemptDetail } from "@/hooks/use-attempt-detail";
import { LoadingSkeleton } from "@/components/ui/LoadingState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { ACCURACY_THRESHOLD } from "@/constants";

const optionLabels = ["A", "B", "C", "D"];

function DetailCard({ attempt }: { attempt: NonNullable<ReturnType<typeof useAttemptDetail>["attempt"]> }) {
  const router = useRouter();
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const passed = pct >= ACCURACY_THRESHOLD;

  return (
    <Paper withBorder p="xl" radius="lg" mb="xl" ta="center" className="animate-scale">
      <Group justify="center" mb="md">
        <RingProgress size={140} thickness={12} roundCaps
          sections={[{ value: pct, color: passed ? "green" : "red" }]}
          label={<Text ta="center" fw={800} size="xl">{pct}%</Text>}
        />
      </Group>
      <Title order={3}>{attempt.category.name}</Title>
      <Text c="dark.2" size="sm" mb="md">{attempt.date}</Text>
      <Text size="lg" fw={600}>{attempt.score} / {attempt.total} correct</Text>
      <Badge color={passed ? "green" : "red"} size="lg" mt="sm" variant="light">
        {passed ? "Passed" : "Needs Improvement"}
      </Badge>
      <Button onClick={() => router.push("/history")} mt="xl" variant="light" fullWidth>
        Back to History
      </Button>
    </Paper>
  );
}

function AnswerReview({
  answer, idx,
}: {
  answer: {
    question: { text: string; options: string[]; correctIndex: number; explanation?: string | null };
    selectedIndex: number;
    isCorrect: boolean;
  };
  idx: number;
}) {
  const isSelected = (optIdx: number) => optIdx === answer.selectedIndex;
  const isCorrectOption = (optIdx: number) => optIdx === answer.question.correctIndex;
  const isWrongSelection = (optIdx: number) => isSelected(optIdx) && !answer.isCorrect;

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group mb="sm">
        <Badge size="sm" variant="filled" color={answer.isCorrect ? "green" : "red"}>#{idx + 1}</Badge>
        <Badge color={answer.isCorrect ? "green" : "red"} size="sm" variant="light">
          {answer.isCorrect ? "Correct" : "Wrong"}
        </Badge>
      </Group>
      <Text fw={500} size="sm" mb="md">{answer.question.text}</Text>
      <Stack gap={6}>
        {answer.question.options.map((opt, optIdx) => {
          const correctOpt = isCorrectOption(optIdx);
          const wrongSel = isWrongSelection(optIdx);
          const sel = isSelected(optIdx);
          return (
            <Group key={optIdx} gap="sm" p="xs"
              bg={correctOpt ? "green.0" : wrongSel ? "red.0" : undefined}
              style={{ borderRadius: 8, border: `1px solid ${correctOpt ? "var(--mantine-color-green-6)" : wrongSel ? "var(--mantine-color-red-6)" : "transparent"}` }}
            >
              <Box className="opt-circle-sm"
                bg={correctOpt ? "green.6" : wrongSel ? "red.6" : "dark.5"}
                c={correctOpt || wrongSel ? "white" : "dark.3"}
              >
                {optionLabels[optIdx]}
              </Box>
              <Text size="sm" flex={1} td={wrongSel ? "line-through" : "none"}
                c={correctOpt ? "green" : wrongSel ? "red" : undefined}
                fw={correctOpt ? 600 : 400}
              >
                {opt}{correctOpt && !sel && " ✓"}
              </Text>
            </Group>
          );
        })}
      </Stack>
      {answer.question.explanation && (
        <>
          <Divider my="sm" />
          <Group gap="xs" align="flex-start" wrap="nowrap">
              <Box className="opt-circle-sm" bg="violet.6" c="white" mt={2}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
            </Box>
            <Text size="xs" c="dark.2">{answer.question.explanation}</Text>
          </Group>
        </>
      )}
    </Paper>
  );
}

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { attempt, loading, error } = useAttemptDetail(id);

  if (loading) return <LoadingSkeleton page="quiz" />;
  if (error) return <ErrorAlert message={error} />;
  if (!attempt) return <ErrorAlert message="Attempt not found" />;

  return (
    <Container size="sm" py="xl">
      <DetailCard attempt={attempt} />
      <Title order={4} mb="md">Review Answers</Title>
      <Stack gap="md">
        {attempt.answers.map((a, idx) => (
          <AnswerReview key={a.questionId} answer={a} idx={idx} />
        ))}
      </Stack>
      <Button onClick={() => router.push("/history")} fullWidth mt="xl" size="md" variant="light">
        Back to History
      </Button>
    </Container>
  );
}
