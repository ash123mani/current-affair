"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Title, Text, Button, Stack, Paper, Group } from "@mantine/core";
import { useGeneratedQuiz } from "@/hooks/use-generated-quiz";
import { LoadingSkeleton } from "@/components/ui/LoadingState";
import { QuizTimer } from "@/components/ui/QuizTimer";
import { QuizHeader } from "./_components/QuizHeader";
import { QuestionCardView } from "./_components/QuestionCardView";
import { ResultView } from "./_components/ResultView";

function ErrorView({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <Container size="sm" py="xl" ta="center">
      <Paper withBorder p="xl" radius="lg">
        <Title order={3} mb="sm">Quiz Unavailable</Title>
        <Text c="dimmed" size="sm" mb="lg">{message}</Text>
        <Button onClick={onBack} variant="light">Back to Home</Button>
      </Paper>
    </Container>
  );
}

function GeneratedQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const { state, actions, allAnswered } = useGeneratedQuiz(category, date);

  if (state.loading) return <LoadingSkeleton page="generated-quiz" />;

  if (state.error || !state.questions.length) {
    return (
      <ErrorView
        message={state.error || "No questions available for this quiz."}
        onBack={() => router.push("/")}
      />
    );
  }

  if (state.submitted) {
    return (
      <ResultView
        score={state.score}
        total={state.questions.length}
        questions={state.questions}
        selected={state.selected}
        onBackHome={() => router.push("/")}
        onRetake={actions.retake}
      />
    );
  }

  const answeredCount = Object.keys(state.selected).length;

  return (
    <Container size="sm" py="xl">
      <QuizHeader answered={answeredCount} total={state.questions.length} />

      <Group justify="end" mb="md">
        <QuizTimer totalMinutes={5} />
      </Group>

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
        variant="filled" color="terracotta"
      >
        {state.submitting ? "Submitting..." : `Submit (${answeredCount}/${state.questions.length} answered)`}
      </Button>
    </Container>
  );
}

export default function GeneratedQuizPage() {
  return (
    <Suspense fallback={<LoadingSkeleton page="generated-quiz" />}>
      <GeneratedQuizContent />
    </Suspense>
  );
}
