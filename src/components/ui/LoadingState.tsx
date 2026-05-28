import { Container, Text, Center, Loader, Stack, Paper } from "@mantine/core";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="lg" bg="white">
        <Center>
          <Stack align="center" gap="md">
            <Loader color="indigo" />
            <Text c="dimmed" size="sm">{message}</Text>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
