"use client";

import { Paper, Text, Group, Badge, Stack, Divider } from "@mantine/core";

const optionLabels = ["A", "B", "C", "D"];

export function ReviewAnswerItem({
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
          const bg = correctOpt ? "var(--mantine-color-green-0)" : wrongSel ? "var(--mantine-color-red-0)" : "var(--mantine-color-gray-0)";
          const border = correctOpt ? "var(--mantine-color-green-6)" : wrongSel ? "var(--mantine-color-red-6)" : "transparent";
          const lbg = correctOpt ? "var(--mantine-color-green-6)" : wrongSel ? "var(--mantine-color-red-6)" : "var(--mantine-color-gray-2)";
          const lc = correctOpt || wrongSel ? "white" : "var(--mantine-color-gray-6)";
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
      {question.explanation && <Text size="xs" c="dimmed">{question.explanation}</Text>}
    </Paper>
  );
}
