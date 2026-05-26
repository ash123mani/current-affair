import { Alert, Container } from "@mantine/core";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Container size="sm" py="xl">
      <Alert color="red">{message}</Alert>
    </Container>
  );
}
