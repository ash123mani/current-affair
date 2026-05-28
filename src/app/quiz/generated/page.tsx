"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Text, Button, Stack, Loader } from "@mantine/core";
import { useGeneratedQuiz } from "@/hooks/use-generated-quiz";
import { QuizHeader } from "./_components/QuizHeader";
import { QuestionCardView } from "./_components/QuestionCardView";
import { ResultView } from "./_components/ResultView";

function LoadingFallback() {
  return (
    <Container size="sm" py="xl" ta="center">
      <Loader size="sm" color="indigo" />
      <Text size="sm" c="dimmed" mt="md">Loading quiz...</Text>
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
