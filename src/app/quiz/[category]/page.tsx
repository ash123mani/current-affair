"use client";

import { useState, use, Suspense, useCallback, useEffect } from "react";
import { Container, Button, Group, Alert, Paper, Title, Text, Badge, Box, Modal } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuiz } from "@/hooks/use-quiz";
import { LoadingSkeleton } from "@/components/ui/LoadingState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { QuestionCard } from "@/components/features/quiz/QuestionCard";
import { QuizProgress } from "@/components/features/quiz/QuizProgress";
import { QuizResultView } from "@/components/features/quiz/QuizResult";
import { api } from "@/lib/api/client";

function QuizContent({ category, date }: { category: string; date: string | undefined }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { questions, loading, submitting, error, result, actions } = useQuiz(category, date);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [isRetake, setIsRetake] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pausedSessionId, setPausedSessionId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    if (!sessionId || !session?.user || questions.length === 0 || restoring) return;
    setRestoring(true);
    api.quizSession.get(sessionId)
      .then((data) => {
        setCurrentIdx(data.currentIndex);
        if (data.selectedAnswers && typeof data.selectedAnswers === "object") {
          setSelected(data.selectedAnswers as Record<string, number>);
        }
        setPausedSessionId(sessionId);
      })
      .catch(() => {});
  }, [sessionId, session, questions.length, restoring]);

  if (loading || restoring) return <LoadingSkeleton page="quiz" />;
  if (error) return <ErrorAlert message={error} />;
  if (!questions.length) {
    return (
      <Container size="sm" py="xl">
        <Alert>No questions available for this category today.</Alert>
        <Button onClick={() => router.push("/")} variant="subtle" mt="md">Back to Home</Button>
      </Container>
    );
  }

  if (result) {
    return (
      <QuizResultView
        score={result.score}
        total={result.total}
        answers={result.answers}
        questions={questions}
        onBackHome={() => router.push("/")}
        onRetake={() => {
          setIsRetake(true);
          setSelected({});
          actions.retake();
        }}
      />
    );
  }

  const current = questions[currentIdx];
  const answered = Object.keys(selected).length;
  const allAnswered = answered === questions.length;

  async function handleSubmit() {
    if (pausedSessionId) {
      api.quizSession.remove(pausedSessionId).catch(() => {});
    }
    const answers = Object.entries(selected).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    await actions.submit(questions[0]?.date ?? "", answers, isRetake);
  }

  const handlePause = useCallback(async () => {
    if (!session?.user) return;
    const payload = {
      quizType: "traditional" as const,
      categorySlug: category,
      date: questions[0]?.date ?? undefined,
      currentIndex: currentIdx,
      selectedAnswers: selected,
      questions,
      timeRemaining: undefined,
    };
    if (pausedSessionId) {
      await api.quizSession.update(pausedSessionId, payload);
    } else {
      const res = await api.quizSession.pause({ ...payload });
      setPausedSessionId(res.id);
    }
    router.push("/sessions");
  }, [category, currentIdx, selected, questions, pausedSessionId, session, router]);

  const handleEndGame = useCallback(() => {
    if (answered > 0) {
      setShowExitConfirm(true);
    } else {
      if (pausedSessionId) api.quizSession.remove(pausedSessionId).catch(() => {});
      router.push("/");
    }
  }, [answered, pausedSessionId, router]);

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="lg" radius="lg" mb="lg">
        <Group>
          <Box flex={1}>
            <Title order={3}>Quiz</Title>
            <Text size="sm" c="dark.2">{questions.length} questions</Text>
          </Box>
          <Badge size="lg" variant="light" color="violet">
            {answered}/{questions.length}
          </Badge>
          {session?.user && (
            <Button
              variant="subtle"
              color="yellow"
              size="sm"
              onClick={handlePause}
            >
              Pause
            </Button>
          )}
          <Button
            variant="subtle"
            color="red"
            size="sm"
            onClick={handleEndGame}
          >
            End Game
          </Button>
        </Group>
      </Paper>

      <QuizProgress
        answered={answered}
        total={questions.length}
        currentIndex={currentIdx}
        categoryName={current.category.name}
      />

      {error && <Alert color="red">{error}</Alert>}

      <QuestionCard
        question={current}
        selected={selected[current.id] ?? null}
        onSelect={(value) => setSelected((prev) => ({ ...prev, [current.id]: value }))}
      />

      <Group justify="space-between">
        <Button variant="subtle" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
          Previous
        </Button>
        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => i + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} disabled={!allAnswered}>
            Submit
          </Button>
        )}
      </Group>

      <Modal
        opened={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="End Quiz?"
        centered
      >
        <Text size="sm" mb="lg">
          You have answered {answered} of {questions.length} questions.
          Your progress will be lost if you end now.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={() => setShowExitConfirm(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={() => {
            setShowExitConfirm(false);
            if (pausedSessionId) api.quizSession.remove(pausedSessionId).catch(() => {});
            router.push("/");
          }}>
            End Game
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;

  return (
    <Suspense fallback={<LoadingSkeleton page="quiz" />}>
      <QuizContent category={category} date={date} />
    </Suspense>
  );
}