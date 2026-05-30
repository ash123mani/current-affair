"use client";

import { Component, type ReactNode } from "react";
import { Container, Paper, Title, Text, Button } from "@mantine/core";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Container size="sm" py="xl" ta="center">
          <Paper withBorder p="xl" radius="lg">
            <Title order={3} mb="sm">Something went wrong</Title>
            <Text c="dark.2" size="sm" mb="lg">
              {this.state.error?.message || "An unexpected error occurred"}
            </Text>
            <Button onClick={() => this.setState({ hasError: false, error: null })} variant="light">
              Try again
            </Button>
          </Paper>
        </Container>
      );
    }
    return this.props.children;
  }
}
