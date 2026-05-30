"use client";

import { Paper, Title, Group, Badge } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryStat } from "@/types/api";

interface AccuracyChartProps {
  stats: CategoryStat[];
}

const BAR_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f472b6", "#22d3ee", "#fb923c", "#c084fc", "#4ade80"];

export function AccuracyChart({ stats }: AccuracyChartProps) {
  const data = stats.map((s) => ({
    name: s.name,
    accuracy: s.accuracy,
    attempts: s.attempts,
  }));

  if (data.length === 0) return null;

  return (
    <Paper withBorder p="lg" radius="lg" mb="xl" className="animate-up">
      <Group mb="md">
        <Title order={4}>Accuracy by Category</Title>
        <Badge size="sm" variant="light" color="violet">{data.length} categories</Badge>
      </Group>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 50, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-dark-6)" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 11, fill: "var(--mantine-color-dark-3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--mantine-color-dark-3)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: "var(--mantine-color-dark-6)" }}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--mantine-color-dark-5)", backgroundColor: "var(--mantine-color-dark-7)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
            formatter={(value) => [`${value}%`, "Accuracy"]}
          />
          <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
