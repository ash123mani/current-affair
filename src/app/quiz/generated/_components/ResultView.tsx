"use client";

import { Container, Title, Text, Paper, Button, Stack, RingProgress, Badge } from "@mantine/core";
import { ReviewAnswerItem } from "./ReviewAnswerItem";

export function ResultView({
  score, total, questions, selected, onBackHome,
}: {
  score: number; total: number;
  questions: { text: string; options: string[]; correctIndex: number; explanation?: string | null }[];
  selected: Record<number, number>;
  onBackHome: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="lg" bg="white" mb="xl" ta="center">
        <RingProgress size={140} thickness={12} roundCaps
          sections={[{ value: pct, color: passed ? "green" : "red" }]}
          label={<Text ta="center" fw={700} size="xl">{pct}%</Text>}
        />
        <Title order={3} mt="md">{score} / {total} correct</Title>
        <Badge color={passed ? "green" : "red"} size="lg" mt="sm" variant="light">
          {passed ? "Passed" : "Needs Improvement"}
        </Badge>
        <Button onClick={onBackHome} mt="xl" variant="light" fullWidth>Back to Home</Button>
      </Paper>
      <Title order={4} mb="md">Review Answers</Title>
      <Stack gap="md">
        {questions.map((qq, idx) => (
          <ReviewAnswerItem
            key={idx}
            question={qq}
            selectedIdx={idx}
            correctIdx={qq.correctIndex}
            isCorrect={selected[idx] === qq.correctIndex}
            userSelected={selected[idx]}
          />
        ))}
      </Stack>
      <Button onClick={onBackHome} fullWidth mt="xl" size="md">Back to Home</Button>
    </Container>
  );
}
