"use client";

import { Paper, Text, Group, Badge, Stack, Divider, Anchor } from "@mantine/core";

const optionLabels = ["A", "B", "C", "D"];

const CATEGORY_MAP: Record<string, { name: string; color: string }> = {
  general: { name: "General", color: "#D97B4F" },
  mixed: { name: "Mixed", color: "#7C3AED" },
};

export function ReviewAnswerItem({
  question, selectedIdx, correctIdx, isCorrect, userSelected,
}: {
  question: { text: string; options: string[]; explanation?: string | null; categorySlug?: string | null; articleUrl?: string | null };
  selectedIdx: number;
  correctIdx: number;
  isCorrect: boolean;
  userSelected: number;
}) {
  const catMeta = question.categorySlug ? CATEGORY_MAP[question.categorySlug] : null;

  return (
    <Paper withBorder p="md" radius="lg">
      <Group mb="sm">
        <Badge size="sm" variant="filled" color={isCorrect ? "green" : "red"}>#{selectedIdx + 1}</Badge>
        <Badge color={isCorrect ? "green" : "red"} size="sm" variant="light">
          {isCorrect ? "Correct" : "Wrong"}
        </Badge>
        {catMeta && (
          <Badge size="sm" variant="light" radius="xl"
            style={{
              background: `${catMeta.color}15`,
              color: catMeta.color,
              border: `0.5px solid ${catMeta.color}30`,
            }}
          >
            {catMeta.name}
          </Badge>
        )}
      </Group>
      <Text fw={500} size="sm" mb="md">{question.text}</Text>
      <Stack gap={6}>
        {question.options.map((opt, optIdx) => {
          const sel = optIdx === userSelected;
          const correctOpt = optIdx === correctIdx;
          const wrongSel = sel && !isCorrect;
          const bg = correctOpt ? "var(--mantine-color-green-0)" : wrongSel ? "var(--mantine-color-red-0)" : "var(--mantine-color-dark-6)";
          const border = correctOpt ? "var(--mantine-color-green-6)" : wrongSel ? "var(--mantine-color-red-6)" : "transparent";
          const lbg = correctOpt ? "var(--mantine-color-green-6)" : wrongSel ? "var(--mantine-color-red-6)" : "var(--mantine-color-dark-5)";
          const lc = correctOpt || wrongSel ? "white" : "var(--mantine-color-dark-3)";
          return (
            <Group key={optIdx} gap="sm" p="xs" style={{ background: bg, borderRadius: 8, border: `1px solid ${border}` }}>
              <div className="opt-circle-sm" style={{ background: lbg, color: lc }}>
                {optionLabels[optIdx]}
              </div>
              <Text size="sm" flex={1} td={wrongSel ? "line-through" : "none"}
                c={correctOpt ? "green" : wrongSel ? "red" : undefined}
                fw={correctOpt ? 600 : 400}
              >
                {opt}{correctOpt && !sel && " ✓"}
              </Text>
            </Group>
          );
        })}
      </Stack>
      {question.explanation && <Divider my="sm" />}
      {question.explanation && <Text size="xs" c="dark.2">{question.explanation}</Text>}
      {question.articleUrl && (
        <Group mt="sm" gap="xs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mantine-color-dark-3)" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <Anchor href={question.articleUrl} target="_blank" rel="noopener noreferrer" size="xs" c="dark.3">
            Read source article
          </Anchor>
        </Group>
      )}
    </Paper>
  );
}
