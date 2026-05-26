"use client";

import { Paper, Title } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategoryStat } from "@/types/api";

interface AccuracyChartProps {
  stats: CategoryStat[];
}

export function AccuracyChart({ stats }: AccuracyChartProps) {
  const data = stats.map((s) => ({
    name: s.name,
    accuracy: s.accuracy,
    attempts: s.attempts,
  }));

  return (
    <Paper withBorder p="md" radius="md" mb="xl">
      <Title order={3} mb="md">
        Accuracy by Category
      </Title>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Accuracy"]}
          />
          <Bar dataKey="accuracy" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
