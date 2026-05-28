import { Paper, Text, Stack, Group } from "@mantine/core";
import type { QuestionResponse } from "@/types/api";

interface QuestionCardProps {
  question: QuestionResponse;
  selected: number | null;
  onSelect: (value: number) => void;
}

const labels = ["A", "B", "C", "D"];

export function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <Paper withBorder p="xl" radius="md" mb="md" bg="white">
      <Text fw={600} size="lg" mb="xl" lh={1.6}>{question.text}</Text>

      <Stack gap="md">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          return (
            <Paper
              key={idx}
              withBorder p="md" radius="md" role="button" tabIndex={0}
              onClick={() => onSelect(idx)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(idx)}
              className="option-card"
              style={{
                borderColor: isSelected ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-3)",
                background: isSelected ? "var(--mantine-color-indigo-0)" : "white",
              }}
            >
              <Group gap="md" wrap="nowrap">
                <div className="opt-circle"
                  style={{
                    background: isSelected ? "var(--mantine-color-indigo-6)" : "var(--mantine-color-gray-1)",
                    color: isSelected ? "white" : "var(--mantine-color-gray-6)",
                  }}
                >
                  {labels[idx]}
                </div>
                <Text size="sm" className="flex-1" fw={isSelected ? 600 : 400}>{option}</Text>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
