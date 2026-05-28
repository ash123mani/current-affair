"use client";

import { Group, Tooltip, Box } from "@mantine/core";

interface QuizProgressDotsProps {
  total: number;
  currentIndex: number | null;
  answered: Record<number, number>;
  onJump: (idx: number) => void;
}

export function QuizProgressDots({ total, currentIndex, answered, onJump }: QuizProgressDotsProps) {
  return (
    <Group gap={6} justify="center" mb="md">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answered[i] !== undefined;
        const isActive = currentIndex === i;
        return (
          <Tooltip key={i} label={`Question ${i + 1}${isAnswered ? " ✓" : ""}`} withArrow>
            <Box
              component="button"
              onClick={() => onJump(i)}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: isActive
                  ? "var(--mantine-color-terracotta-5)"
                  : isAnswered
                    ? "var(--mantine-color-terracotta-2)"
                    : "var(--mantine-color-gray-3)",
                transition: "all 0.2s ease",
                transform: isActive ? "scale(1.4)" : "scale(1)",
                outline: isActive ? `2px solid var(--mantine-color-terracotta-1)` : "none",
              }}
              aria-label={`Jump to question ${i + 1}${isAnswered ? " (answered)" : ""}`}
            />
          </Tooltip>
        );
      })}
    </Group>
  );
}
