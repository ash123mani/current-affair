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

  const bg = isLow ? "var(--mantine-color-red-0)" : isWarning ? "var(--mantine-color-yellow-0)" : "var(--mantine-color-dark-6)";
  const border = isLow ? "var(--mantine-color-red-2)" : isWarning ? "var(--mantine-color-yellow-2)" : "var(--mantine-color-dark-5)";
  const iconColor = isLow ? "var(--mantine-color-red-6)" : isWarning ? "var(--mantine-color-yellow-6)" : "var(--mantine-color-dark-2)";
  const textColor = isLow ? "red.7" : isWarning ? "yellow.7" : "dark.2";

  return (
    <Tooltip label={running ? "Pause timer" : "Resume timer"} withArrow>
      <Paper
        withBorder={false}
        p="xs"
        px="sm"
        radius="xl"
        style={{
          background: bg,
          cursor: "pointer",
          transition: "all 0.2s ease",
          border: `1px solid ${border}`,
        }}
        onClick={() => (running ? pause() : start())}
      >
        <Group gap={6} wrap="nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <Text size="sm" fw={700} c={textColor} style={{ fontVariantNumeric: "tabular-nums" }}>
            {display}
          </Text>
        </Group>
      </Paper>
    </Tooltip>
  );
}
