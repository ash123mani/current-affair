"use client";

import { Suspense, useCallback, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Title, Text, Button, Stack, Paper, Group, Box } from "@mantine/core";
import { useGeneratedQuiz } from "@/hooks/use-generated-quiz";
import { QuestionCardView } from "./_components/QuestionCardView";
import { QuizProgressDots } from "./_components/QuizProgressDots";
import { QuizTimer } from "@/components/ui/QuizTimer";
import { QuizHeader } from "./_components/QuizHeader";
import { ResultView } from "./_components/ResultView";

function SkeletonQuestion() {
  return (
    <Paper withBorder p="xl" radius="lg">
      <Box className="skeleton-shimmer" h={20} w="30%" mb={12} />
      <Box className="skeleton-shimmer" h={16} w="80%" mb={16} />
      {[1, 2, 3, 4].map((j) => (
        <Box key={j} className="skeleton-shimmer" h={48} mb={8} style={{ borderRadius: 10 }} />
      ))}
    </Paper>
  );
}

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

function StreamingIndicator() {
  return (
    <Paper withBorder p="sm" radius="lg" ta="center" bg="terracotta.0">
      <Group justify="center" gap="xs">
        <Box className="skeleton-shimmer" style={{ width: 12, height: 12, borderRadius: "50%" }} />
        <Text size="sm" c="terracotta.7" fw={500}>Generating more questions...</Text>
      </Group>
    </Paper>
  );
}

function GeneratedQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const { state, actions, allAnswered } = useGeneratedQuiz(category, date);
  const [visibleQ, setVisibleQ] = useState(0);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (state.loading || state.submitted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-qidx"));
            if (!isNaN(idx)) setVisibleQ(idx);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    questionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [state.loading, state.submitted, state.questions.length]);

  const scrollToQuestion = useCallback((idx: number) => {
    const el = questionRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setVisibleQ(idx);
    }
  }, []);

  if (state.error && !state.questions.length) {
    return (
      <ErrorView
        message={state.error}
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
      {state.questions.length > 0 && !state.loading && (
        <>
          <QuizHeader answered={answeredCount} total={state.questions.length} />

          <Group justify="space-between" align="center" mb="md">
            <QuizProgressDots
              total={state.questions.length}
              currentIndex={visibleQ}
              answered={state.selected}
              onJump={scrollToQuestion}
            />
            <QuizTimer totalMinutes={5} onTimeout={actions.submit} />
          </Group>
        </>
      )}

      <Stack gap="md">
        {state.loading && (
          <>
            <SkeletonQuestion />
            <SkeletonQuestion />
            <SkeletonQuestion />
          </>
        )}

        {state.questions.map((qq, idx) => (
          <div key={idx} ref={(el) => { questionRefs.current[idx] = el; }} data-qidx={idx}>
            <QuestionCardView
              question={qq}
              selectedOption={state.selected[idx]}
              onSelect={(optIdx) => actions.selectAnswer(idx, optIdx)}
              questionNum={idx}
            />
          </div>
        ))}

        {state.streaming && state.questions.length > 0 && (
          <StreamingIndicator />
        )}
      </Stack>

      {state.questions.length > 0 && !state.loading && (
        <Button
          fullWidth size="lg" mt="xl"
          onClick={actions.submit}
          disabled={!allAnswered || state.submitting}
          loading={state.submitting}
          variant="filled" color={allAnswered ? "terracotta" : "gray"}
        >
          {state.submitting
            ? "Submitting..."
            : allAnswered
              ? `Submit (${answeredCount}/${state.questions.length})`
              : `Answer all questions to submit (${answeredCount}/${state.questions.length})`}
        </Button>
      )}
      {state.error && state.questions.length > 0 && (
        <Text c="red" size="sm" mt="sm" ta="center">{state.error}</Text>
      )}
    </Container>
  );
}

export default function GeneratedQuizPage() {
  return (
    <Suspense fallback={
      <Container size="sm" py="xl">
        <Stack gap="md">
          <SkeletonQuestion />
          <SkeletonQuestion />
        </Stack>
      </Container>
    }>
      <GeneratedQuizContent />
    </Suspense>
  );
}
