"use client";

import { Paper, Group, Loader, Text, Box, Button, Stack, Badge } from "@mantine/core";
import type { GeneratedQuestion } from "@/lib/services/generator/llm.service";

interface GeneratingViewProps {
  questions: GeneratedQuestion[];
  totalGenerated: number;
  onCancel: () => void;
}

function QuestionPreview({ q, idx }: { q: GeneratedQuestion; idx: number }) {
  return (
    <Paper withBorder p="sm" radius="md" className="animate-slide-right" opacity={0.85}>
      <Group gap="sm" mb={4}>
        <Badge size="xs" variant="filled" color="terracotta" radius="sm">Q{idx + 1}</Badge>
        {q.articleTitle && (
          <Badge size="xs" variant="light" color="gray" styles={{ root: { maxWidth: 200 } }}>
            {q.articleTitle.length > 35 ? q.articleTitle.slice(0, 35) + "…" : q.articleTitle}
          </Badge>
        )}
      </Group>
      <Text size="sm" fw={500}>{q.text}</Text>
      <Group gap={4} mt={6}>
        {q.options.map((_, oi) => (
          <Badge key={oi} size="xs" variant="light" color="gray">{["A", "B", "C", "D"][oi]}</Badge>
        ))}
      </Group>
    </Paper>
  );
}

export function GeneratingView({ questions, totalGenerated, onCancel }: GeneratingViewProps) {
  return (
    <Paper withBorder p="xl" radius="lg" bg="white" className="animate-up">
      <Group mb="md">
        <Loader size="sm" color="terracotta" />
        <Box flex={1}>
          <Text fw={600} size="sm">
            {totalGenerated === 0 ? "Starting generation..." : `Generating questions — ${totalGenerated} ready`}
          </Text>
          <Text size="xs" c="dimmed">
            {totalGenerated > 0
              ? `${totalGenerated} question${totalGenerated !== 1 ? "s" : ""} generated so far, more arriving...`
              : "Processing articles in batches"}
          </Text>
        </Box>
        <Button size="xs" variant="light" color="gray" onClick={onCancel}>Cancel</Button>
      </Group>
      {totalGenerated > 0 && (
        <Box mt="md" mah={360} className="overflow-auto">
          <Stack gap="sm">
            {questions.map((q, idx) => (
              <QuestionPreview key={`q-${idx}`} q={q} idx={idx} />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
