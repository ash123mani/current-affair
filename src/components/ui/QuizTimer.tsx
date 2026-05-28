"use client";

import { useEffect } from "react";
import { Group, Text, Paper, Tooltip } from "@mantine/core";
import { useTimer } from "@/hooks/use-timer";

interface QuizTimerProps {
  totalMinutes?: number;
  onTimeout?: () => void;
  autoStart?: boolean;
}

export function QuizTimer({ totalMinutes = 10, onTimeout, autoStart = true }: QuizTimerProps) {
  const { display, isLow, isWarning, running, start, pause } = useTimer(totalMinutes, onTimeout);

  useEffect(() => {
    if (autoStart && !running) start();
  }, [autoStart, running, start]);

  const timerColor = isLow ? "red" : isWarning ? "yellow" : "gray";

  return (
    <Tooltip label={running ? "Pause timer" : "Resume timer"} withArrow>
      <Paper
        withBorder={false}
        p="xs"
        px="sm"
        radius="xl"
        style={{
          background: isLow ? "var(--mantine-color-red-0)" : isWarning ? "var(--mantine-color-yellow-0)" : "var(--mantine-color-gray-0)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          border: `1px solid var(--mantine-color-${timerColor}-2)`,
        }}
        onClick={() => (running ? pause() : start())}
      >
        <Group gap={6} wrap="nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`var(--mantine-color-${timerColor}-6)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <Text size="sm" fw={700} c={`${timerColor}.7`} style={{ fontVariantNumeric: "tabular-nums" }}>
            {display}
          </Text>
        </Group>
      </Paper>
    </Tooltip>
  );
}
