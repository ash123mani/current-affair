"use client";

import { Suspense, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container, Title, Text, Button, Stack, Paper, Group, Box, Badge, Modal, Anchor } from "@mantine/core";
import { useGeneratedQuiz } from "@/hooks/use-generated-quiz";
import type { QuestionData } from "@/hooks/use-generated-quiz";
import { api } from "@/lib/api/client";
import { QuizProgressDots } from "./_components/QuizProgressDots";
import { QuizTimer } from "@/components/ui/QuizTimer";
import { ResultView } from "./_components/ResultView";
import { CATEGORIES } from "@/constants/categories";
const optionLabels = ["A", "B", "C", "D"];

const CATEGORY_MAP: Record<string, { name: string; color: string }> = {};
for (const c of CATEGORIES) {
  CATEGORY_MAP[c.slug] = { name: c.name, color: c.color };
}
CATEGORY_MAP["general"] = { name: "General", color: "#D97B4F" };
CATEGORY_MAP["mixed"] = { name: "Mixed", color: "#7C3AED" };

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

function LoadingSkeletonStack() {
  return (
    <Stack gap={24}>
      <SkeletonQuestion />
      <SkeletonQuestion />
      <SkeletonQuestion />
    </Stack>
  );
}

function ErrorView({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <Container size="sm" py="xl" ta="center">
      <Paper withBorder p="xl" radius="lg">
        <Title order={3} mb="sm">Quiz Unavailable</Title>
        <Text c="dark.2" size="sm" mb="lg">{message}</Text>
        <Button onClick={onBack} variant="light">Back to Home</Button>
      </Paper>
    </Container>
  );
}

function StreamingIndicator() {
  return (
    <Paper withBorder p="sm" radius="lg" ta="center" bg="violet.0">
      <Group justify="center" gap="xs">
        <Box className="skeleton-shimmer" style={{ width: 12, height: 12, borderRadius: "50%" }} />
        <Text size="sm" c="violet.7" fw={500}>Generating more questions...</Text>
      </Group>
    </Paper>
  );
}

/* ── Swipeable Card ── */

function SwipeableCard({
  question,
  selectedOption,
  onSelect,
  questionNum,
  onNext,
  isLast,
}: {
  question: QuestionData;
  selectedOption: number | undefined;
  onSelect: (idx: number) => void;
  questionNum: number;
  onNext: () => void;
  isLast: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragRotate, setDragRotate] = useState(0);

  const resetDrag = useCallback(() => {
    setDragX(0);
    setDragRotate(0);
    dragStart.current = null;
    dragging.current = false;
  }, []);

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    if (selectedOption === undefined) return;
    dragStart.current = { x: clientX, y: clientY };
    dragging.current = false;
  }, [selectedOption]);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!dragStart.current) return;
    const dx = clientX - dragStart.current.x;
    if (Math.abs(dx) > 5) dragging.current = true;
    setDragX(dx);
    setDragRotate(dx * 0.06);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (dragging.current && Math.abs(dragX) > 80) {
      onNext();
    }
    resetDrag();
  }, [dragX, onNext, resetDrag]);

  const answered = selectedOption !== undefined;

  return (
    <Paper
      ref={cardRef}
      withBorder
      p="lg"
      radius="lg"
      className="card-stack-drag"
      style={{
        transform: `translateX(${dragX}px) rotate(${dragRotate}deg)`,
        transition: dragging.current ? 'none' : 'transform 0.3s ease',
        background: 'var(--mantine-color-body)',
      }}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => { if (dragStart.current) handlePointerMove(e.clientX); }}
      onMouseUp={handlePointerUp}
      onMouseLeave={() => { if (dragStart.current) { resetDrag(); } }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        handlePointerDown(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        if (dragStart.current) {
          handlePointerMove(e.touches[0].clientX);
        }
      }}
      onTouchEnd={handlePointerUp}
    >
      <Group mb="lg" justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Badge size="sm" variant="filled" color="violet" radius="xl">
            Q{questionNum + 1}
          </Badge>
          {question.categorySlug && CATEGORY_MAP[question.categorySlug] && (
            <Badge size="sm" variant="light" radius="xl"
              style={{
                background: `${CATEGORY_MAP[question.categorySlug].color}15`,
                color: CATEGORY_MAP[question.categorySlug].color,
                border: `0.5px solid ${CATEGORY_MAP[question.categorySlug].color}30`,
              }}
            >
              {CATEGORY_MAP[question.categorySlug].name}
            </Badge>
          )}
        </Group>
        {answered && (
          <Badge size="sm" variant="light" color="green" radius="xl">
            Answered
          </Badge>
        )}
      </Group>

      <Text fw={500} size="md" mb="xl" lh={1.6}>
        {question.text}
      </Text>

      <Stack gap={8}>
        {question.options.map((opt, optIdx) => {
          const sel = selectedOption === optIdx;
          return (
            <Paper
              key={optIdx}
              withBorder
              p="sm"
              radius="md"
              className="option-card"
              role="radio"
              tabIndex={0}
              aria-checked={sel}
              style={{
                borderColor: sel ? 'var(--mantine-color-violet-6)' : undefined,
                borderWidth: sel ? 2 : 1,
                background: sel ? 'var(--mantine-color-violet-0)' : undefined,
              }}
              onClick={() => onSelect(optIdx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(optIdx);
                }
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Box
                  className="opt-circle"
                  style={{
                    background: sel
                      ? 'var(--mantine-color-violet-6)'
                      : 'var(--mantine-color-dark-6)',
                    color: sel ? 'white' : 'var(--mantine-color-dark-3)',
                  }}
                >
                  {optionLabels[optIdx]}
                </Box>
                <Text size="sm" flex={1} fw={sel ? 600 : 400}>
                  {opt}
                </Text>
              </Group>
            </Paper>
          );
        })}
      </Stack>

      {question.articleUrl && (
        <Group mt="md" gap="xs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mantine-color-dark-3)" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <Anchor href={question.articleUrl} target="_blank" rel="noopener noreferrer" size="xs" c="dark.3">
            Read source article
          </Anchor>
        </Group>
      )}

      {!isLast && (
        <>
          <Box mt="xl">
            <Button
              fullWidth
              size="md"
              variant={answered ? 'filled' : 'light'}
              color="violet"
              disabled={!answered}
              onClick={() => { if (answered) onNext(); }}
              rightSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              }
            >
              {answered ? 'Next Question' : 'Select an answer'}
            </Button>
          </Box>

          <Text size="xs" c="dark.2" ta="center" mt="sm">
            {answered ? 'Swipe right or tap Next' : 'Tap an option to select'}
          </Text>
        </>
      )}
    </Paper>
  );
}

/* ── Card Stack ── */

function CardStack({
  questions,
  selected,
  onSelect,
  currentIdx,
  onAdvance,
}: {
  questions: QuestionData[];
  selected: Record<number, number>;
  onSelect: (qIdx: number, optIdx: number) => void;
  currentIdx: number;
  onAdvance: () => void;
}) {
  const stackCards = questions.slice(currentIdx, currentIdx + 3);
  const isLast = currentIdx >= questions.length - 1;

  return (
    <Box className="card-stack-container" mb="xl">
      {stackCards.map((qq, i) => {
        const actualIdx = currentIdx + i;
        const isCurrent = i === 0;

        return (
          <Box
            key={actualIdx}
            className="card-stack-item"
            style={{
              zIndex: stackCards.length - i,
              transform: isCurrent
                ? 'translateY(0) scale(1)'
                : `translateY(${i * 12}px) scale(${1 - i * 0.04})`,
              opacity: isCurrent ? 1 : 0.5 - i * 0.12,
              pointerEvents: isCurrent ? 'auto' : 'none',
              position: isCurrent ? 'relative' : 'absolute',
              top: isCurrent ? 0 : 0,
            }}
          >
            {isCurrent ? (
              <SwipeableCard
                question={qq}
                selectedOption={selected[actualIdx]}
                onSelect={(optIdx) => onSelect(actualIdx, optIdx)}
                questionNum={actualIdx}
                onNext={onAdvance}
                isLast={isLast}
              />
            ) : (
              <Box p="lg">
                <Group mb="md">
                  <Badge size="sm" variant="light" color="dark.4" radius="xl">
                    Q{actualIdx + 1}
                  </Badge>
                  {selected[actualIdx] !== undefined && (
                    <Badge size="sm" variant="light" color="green" radius="xl">
                      Answered
                    </Badge>
                  )}
                </Group>
                <Text fw={500} size="sm" lh={1.6} lineClamp={3}>
                  {qq.text}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/* ── Main Content ── */

function GeneratedQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const category = searchParams.get('category');
  const date = searchParams.get('date');
  const sessionId = searchParams.get('sessionId');
  const { state, actions, allAnswered } = useGeneratedQuiz(category, date, sessionId);
  const [perCategoryIdx, setPerCategoryIdx] = useState<Record<string, number>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pausedSessionId, setPausedSessionId] = useState<string | null>(null);

  const effectiveIdx = selectedCategory ? (perCategoryIdx[selectedCategory] ?? 0) : 0;

  const answeredCount = Object.keys(state.selected).length;
  const totalQuestions = state.questions.length;

  const questionsByCategory = useMemo(() => {
    const groups: Record<string, QuestionData[]> = {};
    for (const q of state.questions) {
      const slug = q.categorySlug || "general";
      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(q);
    }
    return groups;
  }, [state.questions]);

  const categorySlugs = useMemo(() => Object.keys(questionsByCategory), [questionsByCategory]);

  const filteredQuestions = useMemo(() => {
    if (!selectedCategory || !questionsByCategory[selectedCategory]) return state.questions;
    return questionsByCategory[selectedCategory];
  }, [selectedCategory, questionsByCategory, state.questions]);

  useEffect(() => {
    if (categorySlugs.length > 0 && !selectedCategory) {
      setSelectedCategory(categorySlugs[0]);
    }
  }, [categorySlugs, selectedCategory]);

  useEffect(() => {
    if (sessionId && !pausedSessionId) {
      setPausedSessionId(sessionId);
    }
  }, [sessionId, pausedSessionId]);

  useEffect(() => {
    const idx = state.restoredIndex;
    if (idx !== null) {
      const target = selectedCategory ?? categorySlugs[0];
      if (target) {
        setPerCategoryIdx((prev) => ({ ...prev, [target]: idx }));
      }
    }
  }, [state.restoredIndex, selectedCategory, categorySlugs]);

  useEffect(() => {
    const hasPending = (() => {
      try {
        const stored = sessionStorage.getItem("pendingQuizArticles");
        return stored ? JSON.parse(stored).articles?.length > 0 : false;
      } catch { return false; }
    })();
    const hasStored = (() => {
      try {
        const stored = sessionStorage.getItem("generatedQuiz");
        return stored ? JSON.parse(stored).questions?.length > 0 : false;
      } catch { return false; }
    })();
    if (!hasPending && !hasStored && !category && !date) {
      router.replace('/');
      return;
    }

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      if (answeredCount > 0 && !state.submitted) {
        setShowExitConfirm(true);
        window.history.pushState(null, '', window.location.href);
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const advanceToNext = useCallback(() => {
    if (effectiveIdx < filteredQuestions.length - 1) {
      setTimeout(() => {
        setPerCategoryIdx((prev) => {
          const key = selectedCategory ?? '';
          return { ...prev, [key]: (prev[key] ?? 0) + 1 };
        });
      }, 200);
    }
  }, [effectiveIdx, filteredQuestions.length, selectedCategory]);

  const handleSelect = useCallback(
    (qIdx: number, optIdx: number) => {
      actions.selectAnswer(qIdx, optIdx);
    },
    [actions]
  );

  const handleDotJump = useCallback((idx: number) => {
    setPerCategoryIdx((prev) => {
      const key = selectedCategory ?? '';
      return { ...prev, [key]: idx };
    });
  }, [selectedCategory]);

  const answeredByCategory = useMemo(() => {
    const result: Record<string, { answered: number; total: number }> = {};
    let globalIdx = 0;
    for (const slug of categorySlugs) {
      const questions = questionsByCategory[slug];
      let answered = 0;
      for (const _ of questions) {
        if (state.selected[globalIdx] !== undefined) answered++;
        globalIdx++;
      }
      result[slug] = { answered, total: questions.length };
    }
    return result;
  }, [categorySlugs, questionsByCategory, state.selected]);

  const globalQuestionIndex = useMemo(() => {
    if (!selectedCategory || !questionsByCategory[selectedCategory]) return 0;
    let idx = 0;
    for (const slug of categorySlugs) {
      if (slug === selectedCategory) return idx;
      idx += questionsByCategory[slug].length;
    }
    return 0;
  }, [selectedCategory, categorySlugs, questionsByCategory]);

  if (state.error && !state.questions.length) {
    return (
      <ErrorView message={state.error} onBack={() => router.replace('/')} />
    );
  }

  if (state.submitted) {
    return (
      <ResultView
        score={state.score}
        total={state.questions.length}
        questions={state.questions}
        selected={state.selected}
        onBackHome={() => router.push('/')}
        onRetake={actions.retake}
      />
    );
  }

  return (
    <>
      <Container size="sm" py="xl" pb={100}>
        {totalQuestions > 0 && !state.loading && (
          <>
            <Paper withBorder p="lg" radius="lg" mb="lg">
            <Group>
              <Box flex={1}>
                <Title order={3}>Quiz</Title>
                <Text size="sm" c="dark.2">{totalQuestions} questions</Text>
              </Box>
              <Badge size="lg" variant="light" color="violet">
                {answeredCount}/{totalQuestions}
              </Badge>
              {session?.user && (
                <Button
                  variant="subtle"
                  color="yellow"
                  size="sm"
                  onClick={async () => {
                    const payload = {
                      quizType: "generated" as const,
                      currentIndex: effectiveIdx,
                      selectedAnswers: state.selected as Record<string, number>,
                      questions: state.questions,
                      timeRemaining: undefined,
                    };
                    if (pausedSessionId) {
                      await api.quizSession.update(pausedSessionId, payload);
                    } else {
                      const res = await api.quizSession.pause(payload);
                      setPausedSessionId(res.id);
                    }
                    router.replace('/sessions');
                  }}
                >
                  Pause
                </Button>
              )}
              <Button
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  if (answeredCount > 0 && !state.submitted) setShowExitConfirm(true);
                  else {
                    if (pausedSessionId) api.quizSession.remove(pausedSessionId).catch(() => {});
                    router.replace('/');
                  }
                }}
              >
                End Game
              </Button>
            </Group>
          </Paper>

          {categorySlugs.length > 1 && (
            <Paper withBorder p="sm" radius="lg" mb="md">
              <Group gap={6} wrap="wrap" justify="center">
                {categorySlugs.map((slug) => {
                  const meta = CATEGORY_MAP[slug] ?? { name: "General", color: "#7C3AED" };
                  const isActive = selectedCategory === slug;
                  const catInfo = answeredByCategory[slug] ?? { answered: 0, total: 0 };
                  const allDone = catInfo.answered === catInfo.total && catInfo.total > 0;
                  return (
                    <Badge
                      key={slug}
                      size="lg"
                      radius="xl"
                      variant={isActive ? "filled" : "light"}
                      style={{
                        background: isActive ? meta.color : `${meta.color}15`,
                        color: isActive ? "white" : meta.color,
                        border: `1px solid ${meta.color}30`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => { setSelectedCategory(slug); }}
                      leftSection={allDone ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill={isActive ? "white" : "#22c55e"} stroke="none">
                          <path d="M20 6L9 17l-5-5" strokeWidth="3" stroke={isActive ? "white" : "#22c55e"} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <Box
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: catInfo.answered > 0 ? meta.color : (isActive ? 'rgba(255,255,255,0.5)' : `${meta.color}40`),
                          }}
                        />
                      )}
                    >
                      {meta.name} {catInfo.answered}/{catInfo.total}
                    </Badge>
                  );
                })}
              </Group>
            </Paper>
          )}

          <Group justify="space-between" align="center" mb="md">
            <QuizProgressDots
              total={filteredQuestions.length}
              currentIndex={effectiveIdx}
              answered={Object.fromEntries(
                Object.entries(state.selected).map(([k, v]) => [Number(k) - globalQuestionIndex, v])
                  .filter(([k]) => k >= 0 && k < filteredQuestions.length)
              )}
              onJump={handleDotJump}
            />
            <QuizTimer totalMinutes={5} onTimeout={actions.submit} />
          </Group>
        </>
      )}

      {state.loading && totalQuestions === 0 && (
        <LoadingSkeletonStack />
      )}

      {totalQuestions > 0 && (
        <CardStack
          questions={filteredQuestions}
          selected={state.selected}
          onSelect={handleSelect}
          currentIdx={effectiveIdx}
          onAdvance={advanceToNext}
        />
      )}

      {state.streaming && totalQuestions > 0 && (
        <StreamingIndicator />
      )}

      {state.error && totalQuestions > 0 && (
        <Text c="red" size="sm" mt="sm" ta="center">
          {state.error}
        </Text>
      )}

      <Modal
        opened={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Leave Quiz?"
        centered
      >
        <Text size="sm" mb="lg">
          You have answered {answeredCount} of {totalQuestions} questions.
          Your progress will be lost if you leave.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={() => setShowExitConfirm(false)}>
            Stay
          </Button>
          <Button color="red" onClick={() => {
            setShowExitConfirm(false);
            if (pausedSessionId) api.quizSession.remove(pausedSessionId).catch(() => {});
            router.replace('/');
          }}>
            Leave Quiz
          </Button>
        </Group>
      </Modal>
    </Container>

    {totalQuestions > 0 && !state.loading && !state.submitted && (
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--mantine-color-body)',
          borderTop: '1px solid var(--mantine-color-dark-5)',
          padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
        }}
      >
        <Container size="sm">
          <Group>
            <Text size="sm" c="dark.2">
              {answeredCount}/{totalQuestions}
            </Text>
            <Button
              flex={1}
              size="md"
              onClick={async () => {
                if (pausedSessionId) {
                  api.quizSession.remove(pausedSessionId).catch(() => {});
                }
                await actions.submit();
              }}
              disabled={state.submitting || answeredCount === 0}
              loading={state.submitting}
              variant={allAnswered ? 'gradient' : 'outline'}
              color="violet"
              gradient={allAnswered ? { from: 'violet', to: 'violet.6', deg: 45 } : undefined}
              rightSection={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            >
              {state.submitting
                ? 'Submitting...'
                : allAnswered
                  ? `Submit Quiz (${answeredCount}/${totalQuestions})`
                  : `End Quiz (${answeredCount}/${totalQuestions})`}
            </Button>
          </Group>
        </Container>
      </Box>
    )}
  </>
  );
}

export default function GeneratedQuizPage() {
  return (
    <Suspense
      fallback={
        <Container size="sm" py="xl">
          <Stack gap="md">
            <SkeletonQuestion />
          </Stack>
        </Container>
      }
    >
      <GeneratedQuizContent />
    </Suspense>
  );
}
