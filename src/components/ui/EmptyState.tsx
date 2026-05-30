import { Paper, Text, Center, ThemeIcon, Stack } from "@mantine/core";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <Paper withBorder p="xl" radius="lg">
      <Center>
        <Stack align="center" gap="md">
          {icon || (
            <ThemeIcon size="xl" radius="xl" color="dark.4" variant="light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </ThemeIcon>
          )}
          <Text c="dark.2" size="sm">{message}</Text>
        </Stack>
      </Center>
    </Paper>
  );
}
