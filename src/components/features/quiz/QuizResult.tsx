import { Container, Paper, Title, Text, Button, Stack, Group, Badge, Divider, RingProgress, Anchor } from "@mantine/core";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { QuestionResponse } from "@/types/api";

interface QuizResultProps {
  score: number;
  total: number;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  questions: QuestionResponse[];
  onBackHome: () => void;
  onRetake?: () => void;
}

const optionLabels = ["A", "B", "C", "D"];

export function QuizResultView({
  score,
  total,
  answers,
  questions,
  onBackHome,
  onRetake,
}: QuizResultProps) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= ACCURACY_THRESHOLD;

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" ta="center" mb="xl">
        <Title order={3} mb="lg">Quiz Complete!</Title>

        <Group justify="center" mb="lg">
          <RingProgress
            size={140} thickness={12} roundCaps
            sections={[{ value: percentage, color: passed ? "green" : "red" }]}
            label={<Text ta="center" fw={700} size="xl">{percentage}%</Text>}
          />
        </Group>

        <Text size="lg" fw={600}>{score} / {total} correct</Text>
        <Badge color={passed ? "green" : "red"} size="lg" mt="sm" variant="light">
          {passed ? "Passed" : "Needs Improvement"}
        </Badge>

        <Group mt="xl" grow>
          {onRetake && (
            <Button onClick={onRetake} variant="light" color="violet">Retake Quiz</Button>
          )}
          <Button onClick={onBackHome} variant="light">Back to Home</Button>
        </Group>
      </Paper>

      <Title order={4} mb="md">Review Answers</Title>

      <Stack gap="md">
        {questions.map((q, idx) => {
          const answer = answers.find((a) => a.questionId === q.id);
          const selectedIdx = answer?.selectedIndex;
          const isCorrect = answer?.isCorrect;

          return (
            <Paper key={q.id} withBorder p="md" radius="md">
              <Group mb="sm" gap="xs">
                <Text size="xs" c="dark.2" fw={600}>#{idx + 1}</Text>
                <Badge color={isCorrect ? "green" : "red"} size="sm" variant="light">
                  {isCorrect ? "Correct" : "Wrong"}
                </Badge>
                <Badge size="sm" variant="light" color="violet" radius="xl">
                  {q.category.name}
                </Badge>
              </Group>

              <Text fw={500} size="sm" mb="md">{q.text}</Text>

              <Stack gap={6}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = optIdx === selectedIdx;
                  const isCorrectOption = optIdx === q.correctIndex;
                  const isWrongSelection = isSelected && !isCorrect;

                  let bg = "white";
                  let borderColor = "var(--mantine-color-dark-4)";
                  let labelColor = "var(--mantine-color-dark-3)";
                  let labelBg = "var(--mantine-color-dark-6)";
                  let textColor: string | undefined;

                  if (isCorrectOption) {
                    bg = "var(--mantine-color-green-0)";
                    borderColor = "var(--mantine-color-green-6)";
                    labelColor = "white";
                    labelBg = "var(--mantine-color-green-6)";
                    textColor = "green";
                  } else if (isWrongSelection) {
                    bg = "var(--mantine-color-red-0)";
                    borderColor = "var(--mantine-color-red-6)";
                    labelColor = "white";
                    labelBg = "var(--mantine-color-red-6)";
                    textColor = "red";
                  }

                  return (
                    <Group key={optIdx} gap="sm" p="xs" style={{ background: bg, borderRadius: 8, border: `1px solid ${borderColor}` }}>
                      <div className="opt-circle-sm" style={{ background: labelBg, color: labelColor }}>
                        {optionLabels[optIdx]}
                      </div>
                      <Text size="sm" className="flex-1" td={isWrongSelection ? "line-through" : "none"} c={textColor} fw={isCorrectOption ? 600 : 400}>
                        {opt}{isCorrectOption && !isSelected && " ✓"}
                      </Text>
                    </Group>
                  );
                })}
              </Stack>

              {q.explanation && (
                <>
                  <Divider my="sm" />
                  <Group gap="xs" align="flex-start" wrap="nowrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mantine-color-violet-6)" strokeWidth="2" className="flex-shrink-0" style={{ marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                    <Text size="xs" c="dark.2">{q.explanation}</Text>
                  </Group>
                </>
              )}

              {q.articleUrl && (
                <Group mt="sm" gap="xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mantine-color-dark-3)" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <Anchor href={q.articleUrl} target="_blank" rel="noopener noreferrer" size="xs" c="dark.3">
                    Read source article
                  </Anchor>
                </Group>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Button onClick={onBackHome} fullWidth mt="xl" size="md">Back to Home</Button>
    </Container>
  );
}