import { Paper, Text, Center } from "@mantine/core";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Center>
        <Text c="dimmed">{message}</Text>
      </Center>
    </Paper>
  );
}
