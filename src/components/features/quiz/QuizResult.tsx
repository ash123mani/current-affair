import { Container, Paper, Title, Text, Button, Stack, Group, Badge, Divider } from "@mantine/core";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { QuestionResponse } from "@/types/api";

interface QuizResultProps {
  score: number;
  total: number;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  questions: QuestionResponse[];
  onBackHome: () => void;
}

export function QuizResultView({
  score,
  total,
  answers,
  questions,
  onBackHome,
}: QuizResultProps) {
  const percentage = Math.round((score / total) * 100);

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" ta="center" mb="xl">
        <Title order={2} mb="sm">
          Quiz Complete!
        </Title>
        <Text size="xl" fw={700}>
          {score} / {total}
        </Text>
        <Text size="lg" c={percentage >= ACCURACY_THRESHOLD ? "teal" : "red"}>
          {percentage}%
        </Text>
        <Button onClick={onBackHome} mt="md" variant="subtle">
          Back to Home
        </Button>
      </Paper>

      <Title order={3} mb="md">
        Review Answers
      </Title>

      <Stack>
        {questions.map((q, idx) => {
          const answer = answers.find((a) => a.questionId === q.id);
          const selectedIdx = answer?.selectedIndex;
          const isCorrect = answer?.isCorrect;

          return (
            <Paper key={q.id} withBorder p="md" radius="md">
              <Group mb="xs">
                <Text size="sm" c="dimmed">
                  #{idx + 1}
                </Text>
                <Badge color={isCorrect ? "teal" : "red"}>
                  {isCorrect ? "Correct" : "Wrong"}
                </Badge>
              </Group>

              <Text fw={500} mb="sm">
                {q.text}
              </Text>

              {q.options.map((opt, optIdx) => {
                const isSelected = optIdx === selectedIdx;
                const isCorrectOption = optIdx === q.correctIndex;
                let color: string | undefined;
                let decoration: string | undefined;

                if (isSelected && isCorrect) {
                  color = "teal";
                } else if (isSelected && !isCorrect) {
                  color = "red";
                  decoration = "line-through";
                } else if (isCorrectOption) {
                  color = "teal";
                }

                return (
                  <Text
                    key={optIdx}
                    size="sm"
                    c={color}
                    td={decoration as any}
                    style={{ fontWeight: isCorrectOption ? 600 : undefined }}
                  >
                    {opt}
                    {isCorrectOption && " ✓"}
                  </Text>
                );
              })}

              {q.explanation && (
                <>
                  <Divider my="sm" />
                  <Text size="sm" c="dimmed">
                    <Text span fw={500}>
                      Explanation:
                    </Text>{" "}
                    {q.explanation}
                  </Text>
                </>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Button onClick={onBackHome} fullWidth mt="xl">
        Back to Home
      </Button>
    </Container>
  );
}
