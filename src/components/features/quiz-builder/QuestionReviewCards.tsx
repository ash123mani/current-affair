"use client";

import { useState, useMemo } from "react";
import {
  Paper, Title, Text, Group, Badge, Button, Box, ActionIcon, Stack, Anchor,
} from "@mantine/core";
import type { GeneratedQuestion } from "@/lib/services/generator/llm.service";

interface QuestionReviewCardsProps {
  questions: GeneratedQuestion[];
  selectedCount: number;
  onStartQuiz: () => void;
  onReset: () => void;
  saving?: boolean;
}

type Reaction = "like" | "dislike" | "bookmark" | null;

export function QuestionReviewCards({ questions, selectedCount, onStartQuiz, onReset, saving }: QuestionReviewCardsProps) {
  const [index, setIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<number, Reaction>>({});
  const [selectedOption, setSelectedOption] = useState<Record<number, number>>({});
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  const current = questions[index];
  const isLast = index >= questions.length - 1;
  const progress = questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0;

  const likedCount = useMemo(() => Object.values(reactions).filter((r) => r === "like").length, [reactions]);
  const bookmarkedCount = useMemo(() => Object.values(reactions).filter((r) => r === "bookmark").length, [reactions]);
  const dislikedCount = useMemo(() => Object.values(reactions).filter((r) => r === "dislike").length, [reactions]);

  function setReaction(reaction: Reaction) {
    setReactions((prev) => ({ ...prev, [index]: reaction }));
  }

  function next() {
    setAnimDir("left");
    setTimeout(() => {
      if (!isLast) setIndex((i) => i + 1);
      setAnimDir(null);
    }, 150);
  }

  function prev() {
    setAnimDir("right");
    setTimeout(() => {
      if (index > 0) setIndex((i) => i - 1);
      setAnimDir(null);
    }, 150);
  }

  if (!current) return null;

  const reaction = reactions[index];
  const optLabels = ["A", "B", "C", "D"];

  return (
    <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" ta="center" className="animate-up">
      <Box mb="md" className="progress-bar">
        <Box className="progress-fill" style={{ width: `${progress}%`, background: "var(--mantine-color-indigo-5)" }} />
      </Box>

      <Group justify="space-between" mb="md">
        <Text size="sm" fw={600} c="dimmed">Q{index + 1} of {questions.length}</Text>
        <Group gap={4}>
          <Badge size="xs" variant="light" color="green">{likedCount} liked</Badge>
          <Badge size="xs" variant="light" color="yellow">{bookmarkedCount} saved</Badge>
          <Badge size="xs" variant="light" color="red">{dislikedCount} skipped</Badge>
        </Group>
      </Group>

      <Paper
        withBorder p="lg" radius="lg" shadow="sm" mb="lg"
        style={{
          minHeight: 260,
          transition: "all 0.15s ease",
          transform: animDir === "left" ? "translateX(-20px) scale(0.98)" : animDir === "right" ? "translateX(20px) scale(0.98)" : "none",
          opacity: animDir ? 0.6 : 1,
        }}
      >
        {current.articleTitle && (
          <Group justify="center" mb="md">
            <Badge size="sm" variant="light" color="gray" styles={{ root: { maxWidth: 300 } }}>
              {current.articleUrl ? (
                <Anchor href={current.articleUrl} target="_blank" rel="noopener noreferrer" size="xs" c="dimmed" underline="never">
                  {current.articleTitle.length > 50 ? current.articleTitle.slice(0, 50) + "…" : current.articleTitle}
                </Anchor>
              ) : (
                current.articleTitle.length > 50 ? current.articleTitle.slice(0, 50) + "…" : current.articleTitle
              )}
            </Badge>
          </Group>
        )}

        <Title order={4} mb="xl" className="text-wrap-pretty lh-1-5">
          {current.text}
        </Title>

        <Stack gap="sm">
          {current.options.map((opt, oi) => {
            const isSelected = selectedOption[index] === oi;
            return (
              <Paper
                key={oi}
                withBorder p="sm" radius="md" className="option-card"
                style={{
                  borderColor: isSelected ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-3)",
                  borderWidth: isSelected ? 2 : 1,
                  background: isSelected ? "var(--mantine-color-indigo-0)" : "var(--mantine-color-gray-0)",
                  textAlign: "left",
                }}
                onClick={() => {
                  setSelectedOption((prev) => {
                    const next = { ...prev };
                    if (next[index] === oi) {
                      delete next[index];
                    } else {
                      next[index] = oi;
                    }
                    return next;
                  });
                }}
              >
                <Group gap="sm" wrap="nowrap">
                  <div className="opt-circle-sm"
                    style={{
                      background: isSelected ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-2)",
                      color: isSelected ? "white" : "var(--mantine-color-gray-6)",
                    }}
                  >
                    {optLabels[oi]}
                  </div>
                  <Text size="sm" className="text-wrap-pretty">{opt}</Text>
                  {isSelected && (
                    <Badge size="xs" variant="filled" color="indigo" ml="auto" className="flex-shrink-0">
                      Selected
                    </Badge>
                  )}
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Paper>

      <Group justify="center" gap="lg" mb="lg">
        <ActionIcon
          size={52} radius="xl"
          variant={reaction === "dislike" ? "filled" : "light"} color="red"
          onClick={() => { setReaction(reaction === "dislike" ? null : "dislike"); }}
          style={{ transition: "all 0.15s ease", transform: reaction === "dislike" ? "scale(1.1)" : "none" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={reaction === "dislike" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10Z" />
            <path d="M22 2h-3v13h3V2Z" />
          </svg>
        </ActionIcon>

        <ActionIcon
          size={52} radius="xl"
          variant={reaction === "bookmark" ? "filled" : "light"} color="yellow"
          onClick={() => { setReaction(reaction === "bookmark" ? null : "bookmark"); }}
          style={{ transition: "all 0.15s ease", transform: reaction === "bookmark" ? "scale(1.1)" : "none" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={reaction === "bookmark" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </ActionIcon>

        <ActionIcon
          size={52} radius="xl"
          variant={reaction === "like" ? "filled" : "light"} color="green"
          onClick={() => { setReaction(reaction === "like" ? null : "like"); }}
          style={{ transition: "all 0.15s ease", transform: reaction === "like" ? "scale(1.1)" : "none" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={reaction === "like" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
            <path d="M2 22V11h3v11H2Z" />
          </svg>
        </ActionIcon>
      </Group>

      <Group justify="center" gap="md">
        <Button variant="light" color="gray" onClick={prev} disabled={index === 0}>← Previous</Button>
        {isLast ? (
          <Button
            variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 45 }}
            size="lg" onClick={saving ? undefined : onStartQuiz} loading={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
            rightSection={saving ? undefined : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          >
            {saving ? "Saving..." : `Start Quiz (${likedCount + bookmarkedCount + (questions.length - likedCount - bookmarkedCount - dislikedCount)} questions)`}
          </Button>
        ) : (
          <Button variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 45 }} onClick={next}>Next →</Button>
        )}
      </Group>

      <Group justify="center" mt="md">
        <Button variant="subtle" color="gray" size="xs" onClick={onReset}>Start Over</Button>
      </Group>
    </Paper>
  );
}
