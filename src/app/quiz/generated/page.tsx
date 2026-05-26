"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Title, Text, Paper, Button, Group, Stack, Badge, Divider, RingProgress, Box, SimpleGrid } from "@mantine/core";
import { notifySuccess } from "@/lib/notify";

interface QuestionData {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StoredQuiz {
  questions: QuestionData[];
  category: string;
}

const optionLabels = ["A", "B", "C", "D"];

export default function GeneratedQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedQuiz");
    if (stored) {
      try { setQuiz(JSON.parse(stored)); }
      catch { router.push("/"); }
    } else {
      router.push("/");
    }
  }, [router]);

  if (!quiz) return null;
  const q = quiz;

  const allAnswered = q.questions.every((_, i) => selected[i] !== undefined);

  function handleSubmit() {
    let correct = 0;
    q.questions.forEach((qq, i) => {
      if (selected[i] === qq.correctIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    sessionStorage.removeItem("generatedQuiz");
    notifySuccess("Quiz completed!", `${correct}/${q.questions.length} correct`);
  }

  if (submitted) {
    const pct = Math.round((score / q.questions.length) * 100);
    const passed = pct >= 60;
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="lg" bg="white" mb="xl" ta="center">
          <RingProgress size={140} thickness={12} roundCaps
            sections={[{ value: pct, color: passed ? "green" : "red" }]}
            label={<Text ta="center" fw={700} size="xl">{pct}%</Text>}
          />
          <Title order={3} mt="md">{score} / {q.questions.length} correct</Title>
          <Badge color={passed ? "green" : "red"} size="lg" mt="sm" variant="light">
            {passed ? "Passed" : "Needs Improvement"}
          </Badge>
          <Button onClick={() => router.push("/")} mt="xl" variant="light" fullWidth>
            Back to Home
          </Button>
        </Paper>
        <Title order={4} mb="md">Review Answers</Title>
        <Stack gap="md">
          {q.questions.map((qq, idx) => {
            const isCorrect = selected[idx] === qq.correctIndex;
            return (
              <Paper key={idx} withBorder p="md" radius="lg" bg="white">
                <Group mb="sm">
                  <Badge size="sm" variant="filled" color={isCorrect ? "green" : "red"}>#{idx + 1}</Badge>
                  <Badge color={isCorrect ? "green" : "red"} size="sm" variant="light">
                    {isCorrect ? "Correct" : "Wrong"}
                  </Badge>
                </Group>
                <Text fw={500} size="sm" mb="md">{qq.text}</Text>
                <Stack gap={6}>
                  {qq.options.map((opt, optIdx) => {
                    const sel = optIdx === selected[idx];
                    const correctOpt = optIdx === qq.correctIndex;
                    const wrongSel = sel && !isCorrect;
                    let bg = "var(--mantine-color-gray-0)";
                    let border = "transparent";
                    let lbg = "var(--mantine-color-gray-2)";
                    let lc = "var(--mantine-color-gray-6)";
                    if (correctOpt) { bg = "var(--mantine-color-green-0)"; border = "var(--mantine-color-green-6)"; lbg = "var(--mantine-color-green-6)"; lc = "white"; }
                    else if (wrongSel) { bg = "var(--mantine-color-red-0)"; border = "var(--mantine-color-red-6)"; lbg = "var(--mantine-color-red-6)"; lc = "white"; }
                    return (
                      <Group key={optIdx} gap="sm" p="xs" style={{ background: bg, borderRadius: 8, border: `1px solid ${border}` }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: lbg, color: lc, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                          {optionLabels[optIdx]}
                        </div>
                        <Text size="sm" style={{ flex: 1, textDecoration: wrongSel ? "line-through" : "none" }} c={correctOpt ? "green" : wrongSel ? "red" : undefined} fw={correctOpt ? 600 : 400}>
                          {opt}{correctOpt && !sel && " ✓"}
                        </Text>
                      </Group>
                    );
                  })}
                </Stack>
                {qq.explanation && <Divider my="sm" />}
                {qq.explanation && <Text size="xs" c="dimmed">{qq.explanation}</Text>}
              </Paper>
            );
          })}
        </Stack>
        <Button onClick={() => router.push("/")} fullWidth mt="xl" size="md">Back to Home</Button>
      </Container>
    );
  }

  // Taking the quiz
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="lg" radius="lg" bg="white" mb="lg">
        <Group>
          <Box style={{ flex: 1 }}>
            <Title order={3}>Quiz</Title>
            <Text size="sm" c="dimmed">{q.questions.length} questions</Text>
          </Box>
          <Badge size="lg" variant="light" color="violet">
            {Object.keys(selected).length}/{q.questions.length}
          </Badge>
        </Group>
      </Paper>

      <Stack gap="md">
        {q.questions.map((qq, idx) => (
          <Paper key={idx} withBorder p="lg" radius="lg" bg="white">
            <Group mb="md">
              <Badge size="sm" variant="filled" color="violet">Q{idx + 1}</Badge>
            </Group>
            <Text fw={500} size="sm" mb="md">{qq.text}</Text>
            <Stack gap={8}>
              {qq.options.map((opt, optIdx) => {
                const sel = selected[idx] === optIdx;
                return (
                  <Paper
                    key={optIdx}
                    withBorder
                    p="sm"
                    radius="md"
                    className="card-hover"
                    style={{
                      cursor: "pointer",
                      borderColor: sel ? "var(--mantine-color-violet-6)" : undefined,
                      borderWidth: sel ? 2 : 1,
                      background: sel ? "var(--mantine-color-violet-0)" : undefined,
                    }}
                    onClick={() => setSelected((prev) => ({ ...prev, [idx]: optIdx }))}
                  >
                    <Group gap="sm">
                      <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "var(--mantine-color-violet-6)" : "var(--mantine-color-gray-1)", color: sel ? "white" : "var(--mantine-color-gray-6)", fontWeight: 700, fontSize: 12 }}>
                        {optionLabels[optIdx]}
                      </div>
                      <Text size="sm" fw={sel ? 600 : 400}>{opt}</Text>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Button
        fullWidth
        size="lg"
        mt="xl"
        onClick={handleSubmit}
        disabled={!allAnswered}
        variant="gradient"
        gradient={{ from: "violet", to: "pink", deg: 45 }}
      >
        Submit ({Object.keys(selected).length}/{q.questions.length} answered)
      </Button>
    </Container>
  );
}
