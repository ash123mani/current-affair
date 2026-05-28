"use client";

import { Paper, Group, ThemeIcon, Text, Box } from "@mantine/core";

const STEPS = [
  { key: "date", label: "Select Date" },
  { key: "tabs", label: "Categories & Articles" },
];

export function StepIndicator({ stepIndex }: { stepIndex: number }) {
  return (
    <Paper withBorder p="md" radius="lg" bg="white" mb="lg" className="animate-fade">
      <Group justify="space-between" wrap="nowrap">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <Group key={s.key} gap={6} wrap="nowrap" flex={1}>
              <ThemeIcon size={28} radius="xl" color={done ? "green" : active ? "indigo" : "gray"} variant={done || active ? "filled" : "light"}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <Text size="xs" fw={700}>{i + 1}</Text>
                )}
              </ThemeIcon>
              <Box flex={1} miw={0}>
                <Text size="xs" fw={active ? 600 : 400} c={active ? undefined : "dimmed"} truncate>{s.label}</Text>
              </Box>
              {i < 1 && (
                <Box className="step-line" style={{ background: done ? "var(--mantine-color-green-5)" : "var(--mantine-color-gray-2)" }} />
              )}
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}
