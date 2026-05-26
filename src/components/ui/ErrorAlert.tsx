import { Alert, Container, Paper } from "@mantine/core";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="lg" radius="lg" bg="white">
        <Alert color="red" variant="light">{message}</Alert>
      </Paper>
    </Container>
  );
}
