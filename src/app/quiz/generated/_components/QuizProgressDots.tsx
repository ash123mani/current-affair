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
    <Group gap={4} justify="center" mb="md" wrap="wrap">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answered[i] !== undefined;
        const isActive = currentIndex === i;
        return (
          <Tooltip key={i} label={`Question ${i + 1}${isAnswered ? " ✓" : ""}`} withArrow>
            <Box
              component="button"
              onClick={() => onJump(i)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: isActive ? "2px solid var(--mantine-color-violet-5)" : "none",
                padding: 0,
                cursor: "pointer",
                background: isActive
                  ? "var(--mantine-color-violet-5)"
                  : isAnswered
                    ? "var(--mantine-color-violet-2)"
                    : "var(--mantine-color-dark-5)",
                transition: "all 0.2s ease",
                color: isActive ? "white" : isAnswered ? "var(--mantine-color-violet-8)" : "var(--mantine-color-dark-3)",
                fontWeight: 600,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isActive ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
              }}
              aria-label={`Jump to question ${i + 1}${isAnswered ? " (answered)" : ""}`}
            >
              {i + 1}
            </Box>
          </Tooltip>
        );
      })}
    </Group>
  );
}
