import { Paper, Text, Stack, Group, ThemeIcon } from "@mantine/core";
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
      <Text fw={600} size="lg" mb="xl" lh={1.6}>
        {question.text}
      </Text>

      <Stack gap="md">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          return (
            <Paper
              key={idx}
              withBorder
              p="md"
              radius="md"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(idx)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(idx)}
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-3)",
                background: isSelected ? "var(--mantine-color-blue-0)" : "white",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--mantine-color-blue-3)";
                  e.currentTarget.style.background = "var(--mantine-color-gray-0)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--mantine-color-gray-3)";
                  e.currentTarget.style.background = "white";
                }
              }}
            >
              <Group gap="md" wrap="nowrap">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isSelected ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-1)",
                    color: isSelected ? "white" : "var(--mantine-color-gray-6)",
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {labels[idx]}
                </div>
                <Text size="sm" style={{ flex: 1 }} fw={isSelected ? 600 : 400}>
                  {option}
                </Text>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
