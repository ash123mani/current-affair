"use client";

import { Paper, Text, Group, Badge, Stack } from "@mantine/core";

const optionLabels = ["A", "B", "C", "D"];

export function QuestionCardView({
  question, selectedOption, onSelect, questionNum,
}: {
  question: { text: string; options: string[] };
  selectedOption: number | undefined;
  onSelect: (idx: number) => void;
  questionNum: number;
}) {
  return (
    <Paper withBorder p="lg" radius="lg" bg="var(--mantine-color-body)">
      <Group mb="md">
        <Badge size="sm" variant="filled" color="indigo">Q{questionNum + 1}</Badge>
      </Group>
      <Text fw={500} size="sm" mb="md">{question.text}</Text>
      <Stack gap={8}>
        {question.options.map((opt, optIdx) => {
          const sel = selectedOption === optIdx;
          return (
            <Paper key={optIdx} withBorder p="sm" radius="md" className="card-hover option-card"
              role="radio"
              tabIndex={0}
              aria-checked={sel}
              aria-label={`Option ${optionLabels[optIdx]}: ${opt}`}
              style={{
                borderColor: sel ? "var(--mantine-color-indigo-6)" : undefined,
                borderWidth: sel ? 2 : 1,
                background: sel ? "var(--mantine-color-indigo-0)" : undefined,
              }}
              onClick={() => onSelect(optIdx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(optIdx);
                }
              }}
            >
              <Group gap="sm">
                <div className="opt-circle"
                  style={{
                    background: sel ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-1)",
                    color: sel ? "white" : "var(--mantine-color-gray-6)",
                  }}
                >
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
