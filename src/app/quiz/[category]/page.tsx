"use client";

import { useEffect, useState, use } from "react";
import { Container, Button, Group, Alert } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/hooks/use-quiz";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { QuestionCard } from "@/components/features/quiz/QuestionCard";
import { QuizProgress } from "@/components/features/quiz/QuizProgress";
import { QuizResultView } from "@/components/features/quiz/QuizResult";

export default function QuizPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const router = useRouter();
  const { questions, loading, submitting, error, result, fetchQuestions, submit } =
    useQuiz(category);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchQuestions();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load questions";
        if (msg.includes("401")) {
          router.push(`/auth/login?callbackUrl=/quiz/${category}`);
          return;
        }
        setLoadError(msg);
      }
    };
    load();
  }, [fetchQuestions, category, router]);

  if (loading) return <LoadingState message="Loading questions..." />;
  if (loadError) return <ErrorAlert message={loadError} />;
  if (!questions.length) {
    return (
      <Container size="sm" py="xl">
        <Alert>No questions available for this category today.</Alert>
        <Button onClick={() => router.push("/")} variant="subtle" mt="md">
          Back to Home
        </Button>
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
      />
    );
  }

  const current = questions[currentIdx];
  const answered = Object.keys(selected).length;
  const allAnswered = answered === questions.length;

  async function handleSubmit() {
    const answers = Object.entries(selected).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));
    await submit(questions[0]?.date ?? "", answers);
  }

  return (
    <Container size="sm" py="xl">
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
        onSelect={(value) =>
          setSelected((prev) => ({ ...prev, [current.id]: value }))
        }
      />

      <Group justify="space-between">
        <Button
          variant="subtle"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
        >
          Previous
        </Button>

        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => i + 1)}>Next</Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!allAnswered}
          >
            Submit
          </Button>
        )}
      </Group>
    </Container>
  );
}
