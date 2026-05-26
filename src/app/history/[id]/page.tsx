"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Container, Paper, Title, Text, Button, Stack, Group, Badge, Divider, RingProgress, Box } from "@mantine/core";
import { api } from "@/lib/api/client";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { ACCURACY_THRESHOLD } from "@/constants";
import type { AttemptDetailResponse } from "@/types/api";

const optionLabels = ["A", "B", "C", "D"];

export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.quiz.attemptDetails(id).then(setAttempt).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load attempt");
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading attempt details..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!attempt) return <ErrorAlert message="Attempt not found" />;

  const pct = Math.round((attempt.score / attempt.total) * 100);
  const passed = pct >= ACCURACY_THRESHOLD;

  return (
    <Container size="sm" py="xl">
      {/* Score Card */}
      <Paper withBorder p="xl" radius="lg" bg="white" mb="xl" ta="center" className="animate-scale">
        <Group justify="center" mb="md">
          <RingProgress
            size={140} thickness={12} roundCaps
            sections={[{ value: pct, color: passed ? "green" : "red" }]}
            label={<Text ta="center" fw={800} size="xl">{pct}%</Text>}
          />
        </Group>
        <Title order={3}>{attempt.category.name}</Title>
        <Text c="dimmed" size="sm" mb="md">{attempt.date}</Text>
        <Text size="lg" fw={600}>{attempt.score} / {attempt.total} correct</Text>
        <Badge color={passed ? "green" : "red"} size="lg" mt="sm" variant="light">
          {passed ? "Passed" : "Needs Improvement"}
        </Badge>
        <Button onClick={() => router.push("/history")} mt="xl" variant="light" fullWidth>
          Back to History
        </Button>
      </Paper>

      {/* Review */}
      <Title order={4} mb="md" className="animate-up">Review Answers</Title>
      <Stack gap="md">
        {attempt.answers.map((a, idx) => (
          <Paper key={a.questionId} withBorder p="lg" radius="lg" bg="white" className="animate-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <Group mb="sm">
              <Badge size="sm" variant="filled" color={a.isCorrect ? "green" : "red"}>#{idx + 1}</Badge>
              <Badge color={a.isCorrect ? "green" : "red"} size="sm" variant="light">
                {a.isCorrect ? "Correct" : "Wrong"}
              </Badge>
            </Group>
            <Text fw={500} size="sm" mb="md">{a.question.text}</Text>
            <Stack gap={6}>
              {a.question.options.map((opt, optIdx) => {
                const isSelected = optIdx === a.selectedIndex;
                const isCorrectOption = optIdx === a.question.correctIndex;
                const isWrongSelection = isSelected && !a.isCorrect;
                let bg = "transparent";
                let border = "transparent";
                let lbg = "var(--mantine-color-gray-1)";
                let lc = "var(--mantine-color-gray-6)";
                if (isCorrectOption) {
                  bg = "var(--mantine-color-green-0)";
                  border = "var(--mantine-color-green-6)";
                  lbg = "var(--mantine-color-green-6)";
                  lc = "white";
                } else if (isWrongSelection) {
                  bg = "var(--mantine-color-red-0)";
                  border = "var(--mantine-color-red-6)";
                  lbg = "var(--mantine-color-red-6)";
                  lc = "white";
                }
                return (
                  <Group key={optIdx} gap="sm" p="xs" style={{ background: bg, borderRadius: 8, border: `1px solid ${border}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: lbg, color: lc, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                      {optionLabels[optIdx]}
                    </div>
                    <Text size="sm" style={{ flex: 1, textDecoration: isWrongSelection ? "line-through" : "none" }}
                      c={isCorrectOption ? "green" : isWrongSelection ? "red" : undefined}
                      fw={isCorrectOption ? 600 : 400}>
                      {opt}{isCorrectOption && !isSelected && " ✓"}
                    </Text>
                  </Group>
                );
              })}
            </Stack>
            {a.question.explanation && (
              <>
                <Divider my="sm" />
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mantine-color-blue-6)" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                  </svg>
                  <Text size="xs" c="dimmed">{a.question.explanation}</Text>
                </Group>
              </>
            )}
          </Paper>
        ))}
      </Stack>

      <Button onClick={() => router.push("/history")} fullWidth mt="xl" size="md" variant="light">
        Back to History
      </Button>
    </Container>
  );
}
