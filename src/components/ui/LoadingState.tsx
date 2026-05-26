import { Container, Text, Center, Loader, Stack } from "@mantine/core";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="md">
          <Loader />
          <Text c="dimmed">{message}</Text>
        </Stack>
      </Center>
    </Container>
  );
}
