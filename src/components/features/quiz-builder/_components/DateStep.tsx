"use client";

import { Paper, Title, Text, Group, Button, Divider } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { subDays, format } from "date-fns";

export function DateStep({ date, onSetDate, onFetch }: { date: Date; onSetDate: (d: Date) => void; onFetch: () => void }) {
  const quickOptions = [0, 1, 2, 3, 6];
  return (
    <Paper withBorder p="xl" radius="lg" bg="white" mb="lg" className="animate-up">
      <Title order={3} mb={4}>Select Date</Title>
      <Text c="dimmed" size="sm" mb="lg">Choose a date to fetch articles from top Indian English news sources</Text>
      <Divider mb="lg" />
      <Text size="sm" fw={600} mb="sm">Date</Text>
      <Group gap="xs" mb="lg" wrap="wrap">
        {quickOptions.map((d) => {
          const day = subDays(new Date(), d);
          const key = format(day, "yyyy-MM-dd");
          const active = format(date, "yyyy-MM-dd") === key;
          const label = d === 0 ? "Today" : d === 1 ? "Yesterday" : format(day, "MMM dd");
          return (
            <Button key={key} variant={active ? "filled" : "default"} size="sm" radius="xl" onClick={() => onSetDate(day)}>
              {label}
            </Button>
          );
        })}
        <DatePickerInput value={date} onChange={(v) => { if (v) onSetDate(new Date(v)); }} placeholder="Pick date" size="sm" radius="xl" w={140} />
      </Group>
      <Group>
        <Button size="md" variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 45 }} onClick={onFetch} ml="auto"
          rightSection={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          }
        >
          Fetch Articles
        </Button>
      </Group>
    </Paper>
  );
}
