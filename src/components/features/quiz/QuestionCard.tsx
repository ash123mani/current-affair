import { Paper, Text, Stack, Group, Badge, Anchor } from "@mantine/core";
import type { QuestionResponse } from "@/types/api";

interface QuestionCardProps {
  question: QuestionResponse;
  selected: number | null;
  onSelect: (value: number) => void;
}

const labels = ["A", "B", "C", "D"];

export function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <Paper withBorder p="xl" radius="md" mb="md">
      <Group mb="md" gap="xs" wrap="wrap">
        <Badge size="sm" variant="light" color="violet" radius="xl">
          {question.category.name}
        </Badge>
        {question.source && (
          <Badge size="sm" variant="outline" color="dark.3" radius="xl">
            {question.source}
          </Badge>
        )}
      </Group>

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
                borderColor: isSelected ? "var(--mantine-color-violet-6)" : "var(--mantine-color-dark-5)",
                background: isSelected ? "var(--mantine-color-violet-0)" : undefined,
              }}
            >
              <Group gap="md" wrap="nowrap">
                <div className="opt-circle"
                  style={{
                    background: isSelected ? "var(--mantine-color-violet-6)" : "var(--mantine-color-dark-6)",
                    color: isSelected ? "white" : "var(--mantine-color-dark-3)",
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
    </Paper>
  );
}