import { Paper, Text, Radio, Stack } from "@mantine/core";
import type { QuestionResponse } from "@/types/api";

interface QuestionCardProps {
  question: QuestionResponse;
  selected: number | null;
  onSelect: (value: number) => void;
}

export function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <Paper withBorder p="xl" radius="md" mb="md">
      <Text fw={500} size="lg" mb="lg">
        {question.text}
      </Text>

      <Radio.Group
        value={selected?.toString() ?? null}
        onChange={(v) => onSelect(parseInt(v))}
      >
        <Stack>
          {question.options.map((option, idx) => (
            <Radio key={idx} value={idx.toString()} label={option} size="md" />
          ))}
        </Stack>
      </Radio.Group>
    </Paper>
  );
}
