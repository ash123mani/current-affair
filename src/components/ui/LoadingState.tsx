import { Container, Paper, Box, Stack } from "@mantine/core";

interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton";
}

function SkeletonBlock({ height = 16, width = "100%", mb = 8 }: { height?: number | string; width?: number | string; mb?: number }) {
  return (
    <Box className="skeleton-shimmer" style={{ height, width, marginBottom: mb }} />
  );
}

function SkeletonDashboard() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Paper withBorder p="lg" radius="lg">
          <Stack gap="sm">
            <Box className="skeleton-shimmer skeleton-text" w="40%" />
            <Box className="skeleton-shimmer skeleton-text-sm" />
          </Stack>
        </Paper>
        <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <Paper key={i} withBorder p="lg" radius="lg">
              <Box className="skeleton-shimmer skeleton-circle" mb="sm" />
              <Box className="skeleton-shimmer skeleton-text" w="60%" />
              <Box className="skeleton-shimmer skeleton-text-sm" />
            </Paper>
          ))}
        </Box>
        <Paper withBorder p="lg" radius="lg">
          <Box className="skeleton-shimmer" h={200} />
        </Paper>
      </Stack>
    </Container>
  );
}

function SkeletonHistory() {
  return (
    <Container size="md" py="xl">
      <Paper withBorder p="lg" radius="lg" mb="lg">
        <Stack gap="sm">
          <Box className="skeleton-shimmer skeleton-text" w="30%" />
          <Box className="skeleton-shimmer skeleton-text-sm" w="20%" />
        </Stack>
      </Paper>
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <Paper key={i} withBorder p="lg" radius="lg">
            <Box className="skeleton-shimmer skeleton-text" w="25%" mb={12} />
            <Box className="skeleton-shimmer" h={16} w="70%" mb={8} />
            <Box className="skeleton-shimmer skeleton-text-sm" w="40%" />
          </Paper>
        ))}
      </Box>
    </Container>
  );
}

function SkeletonQuizBuilder() {
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="lg">
        <Stack gap="md">
          <Box className="skeleton-shimmer skeleton-text" w="50%" />
          <Box className="skeleton-shimmer" h={44} />
          <Box className="skeleton-shimmer skeleton-text-sm" w="30%" />
        </Stack>
      </Paper>
    </Container>
  );
}

export function LoadingState({ message, variant = "spinner" }: LoadingStateProps) {
  if (variant === "skeleton") {
    return null;
  }
  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="lg">
        <Stack align="center" gap="md">
          <Box className="skeleton-shimmer skeleton-circle" />
          <Box className="skeleton-shimmer skeleton-text" w="40%" />
          <Box className="skeleton-shimmer skeleton-text-sm" w="60%" />
        </Stack>
      </Paper>
    </Container>
  );
}

function SkeletonQuiz() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Paper withBorder p="lg" radius="lg">
          <Box className="skeleton-shimmer skeleton-text" w="30%" />
          <Box className="skeleton-shimmer skeleton-text-sm" w="20%" mb={16} />
          <Box className="skeleton-shimmer" h={4} mb={8} />
          <Box style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} className="skeleton-shimmer" style={{ width: 8, height: 8, borderRadius: "50%" }} />
            ))}
          </Box>
        </Paper>
        <Paper withBorder p="xl" radius="lg">
          <Box className="skeleton-shimmer skeleton-text" w="50%" mb={16} />
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} className="skeleton-shimmer" h={48} mb={8} style={{ borderRadius: 10 }} />
          ))}
        </Paper>
      </Stack>
    </Container>
  );
}

function SkeletonGeneratedQuiz() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Paper withBorder p="lg" radius="lg">
          <Box className="skeleton-shimmer skeleton-text" w="30%" />
          <Box className="skeleton-shimmer skeleton-text-sm" w="20%" />
        </Paper>
        {[1, 2].map((i) => (
          <Paper key={i} withBorder p="lg" radius="lg">
            <Box className="skeleton-shimmer skeleton-text" w="20%" mb={12} />
            <Box className="skeleton-shimmer" h={16} w="80%" mb={16} />
            {[1, 2, 3, 4].map((j) => (
              <Box key={j} className="skeleton-shimmer" h={44} mb={8} style={{ borderRadius: 10 }} />
            ))}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

export function LoadingSkeleton({ page }: { page: "dashboard" | "history" | "quiz-builder" | "quiz" | "generated-quiz" }) {
  switch (page) {
    case "dashboard": return <SkeletonDashboard />;
    case "history": return <SkeletonHistory />;
    case "quiz-builder": return <SkeletonQuizBuilder />;
    case "quiz": return <SkeletonQuiz />;
    case "generated-quiz": return <SkeletonGeneratedQuiz />;
  }
}
