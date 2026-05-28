"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Title, Text, Paper, Button, Group, Stack, Badge, Divider, RingProgress, Box, Loader } from "@mantine/core";
import { useGeneratedQuiz } from "@/hooks/use-generated-quiz";

const optionLabels = ["A", "B", "C", "D"];

function LoadingFallback() {
  return (
    <Container size="sm" py="xl" ta="center">
      <Loader size="sm" color="indigo" />
      <Text size="sm" c="dimmed" mt="md">Loading quiz...</Text>
    </Container>
  );
}

function QuizHeader({ answered, total }: { answered: number; total: number }) {
  return (
    <Paper withBorder p="lg" radius="lg" bg="white" mb="lg">
      <Group>
        <Box style={{ flex: 1 }}>
          <Title order={3}>Quiz</Title>
          <Text size="sm" c="dimmed">{total} questions</Text>
        </Box>
        <Badge size="lg" variant="light" color="indigo">{answered}/{total}</Badge>
      </Group>
    </Paper>
  );
}

function QuestionCardView({
  question, selectedOption, onSelect, questionNum,
}: {
  question: { text: string; options: string[] };
  selectedOption: number | undefined;
  onSelect: (idx: number) => void;
  questionNum: number;
}) {
  return (
    <Paper key={questionNum} withBorder p="lg" radius="lg" bg="white">
      <Group mb="md">
        <Badge size="sm" variant="filled" color="indigo">Q{questionNum + 1}</Badge>
      </Group>
      <Text fw={500} size="sm" mb="md">{question.text}</Text>
      <Stack gap={8}>
        {question.options.map((opt, optIdx) => {
          const sel = selectedOption === optIdx;
          return (
            <Paper key={optIdx} withBorder p="sm" radius="md" className="card-hover"
              style={{
                cursor: "pointer",
                borderColor: sel ? "var(--mantine-color-indigo-6)" : undefined,
                borderWidth: sel ? 2 : 1,
                background: sel ? "var(--mantine-color-indigo-0)" : undefined,
              }}
              onClick={() => onSelect(optIdx)}
            >
              <Group gap="sm">
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: sel ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-1)",
                  color: sel ? "white" : "var(--mantine-color-gray-6)",
                  fontWeight: 700, fontSize: 12,
                }}>
                  {optionLabels[optIdx]}
                </div>
                <Text size="sm" fw={sel ? 600 : 400}>{opt}</Text>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}

function ReviewAnswerItem({
  question, selectedIdx, correctIdx, isCorrect, userSelected,
}: {
  question: { text: string; options: string[]; explanation?: string | null };
  selectedIdx: number;
  correctIdx: number;
  isCorrect: boolean;
  userSelected: number;
}) {
  return (
    <Paper withBorder p="md" radius="lg" bg="white">
      <Group mb="sm">
        <Badge size="sm" variant="filled" color={isCorrect ? "green" : "red"}>#{selectedIdx + 1}</Badge>
        <Badge color={isCorrect ? "green" : "red"} size="sm" variant="light">
          {isCorrect ? "Correct" : "Wrong"}
        </Badge>
      </Group>
      <Text fw={500} size="sm" mb="md">{question.text}</Text>
      <Stack gap={6}>
        {question.options.map((opt, optIdx) => {
          const sel = optIdx === userSelected;
          const correctOpt = optIdx === correctIdx;
          const wrongSel = sel && !isCorrect;
          let bg = "var(--mantine-color-gray-0)";
          let border = "transparent";
          let lbg = "var(--mantine-color-gray-2)";
          let lc = "var(--mantine-color-gray-6)";
          if (correctOpt) { bg = "var(--mantine-color-green-0)"; border = "var(--mantine-color-green-6)"; lbg = "var(--mantine-color-green-6)"; lc = "white"; }
          else if (wrongSel) { bg = "var(--mantine-color-red-0)"; border = "var(--mantine-color-red-6)"; lbg = "var(--mantine-color-red-6)"; lc = "white"; }
          return (
            <Group key={optIdx} gap="sm" p="xs" style={{ background: bg, borderRadius: 8, border: `1px solid ${border}` }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: lbg, color: lc, fontWeight: 700, fontSize: 11, flexShrink: 0,
              }}>
                {optionLabels[optIdx]}
              </div>
              <Text size="sm" style={{ flex: 1, textDecoration: wrongSel ? "line-through" : "none" }}
                c={correctOpt ? "green" : wrongSel ? "red" : undefined} fw={correctOpt ? 600 : 400}>
                {opt}{correctOpt && !sel && " ✓"}
              </Text>
            </Group>
          );
        })}
      </Stack>
      {question.explanation && <Divider my="sm" />}
      {question.explanation && <Text size="xs" c="dimmed">{question.explanation}</Text>}
    </Paper>
  );
}

function ResultView({
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

function GeneratedQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const { state, actions, allAnswered } = useGeneratedQuiz(category, date);

  if (state.loading) return <LoadingFallback />;
  if (state.error || !state.questions.length) {
    router.push("/");
    return null;
  }

  if (state.submitted) {
    return (
      <ResultView
        score={state.score}
        total={state.questions.length}
        questions={state.questions}
        selected={state.selected}
        onBackHome={() => router.push("/")}
      />
    );
  }

  return (
    <Container size="sm" py="xl">
      <QuizHeader answered={Object.keys(state.selected).length} total={state.questions.length} />

      <Stack gap="md">
        {state.questions.map((qq, idx) => (
          <QuestionCardView
            key={idx}
            question={qq}
            selectedOption={state.selected[idx]}
            onSelect={(optIdx) => actions.selectAnswer(idx, optIdx)}
            questionNum={idx}
          />
        ))}
      </Stack>

      <Button
        fullWidth size="lg" mt="xl"
        onClick={allAnswered && !state.submitting ? actions.submit : undefined}
        loading={state.submitting}
        style={{ opacity: allAnswered ? 1 : 0.5 }}
        variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 45 }}
      >
        {state.submitting ? "Submitting..." : `Submit (${Object.keys(state.selected).length}/${state.questions.length} answered)`}
      </Button>
    </Container>
  );
}

export default function GeneratedQuizPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratedQuizContent />
    </Suspense>
  );
}
