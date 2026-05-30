"use client";

import { Title, Text, Paper, Button, Loader, Alert, Box } from "@mantine/core";
import { useQuizBuilder } from "@/hooks/use-quiz-builder";
import { StepIndicator } from "./_components/StepIndicator";
import { DateStep } from "./_components/DateStep";
import { CategoryTabs } from "./_components/CategoryTabs";

export function QuizBuilder() {
  const { state, actions } = useQuizBuilder();
  const slugs = Object.keys(state.groupedData);
  const stepIndex = state.phase === "date" || state.phase === "fetching" ? 0 : 1;

  return (
    <Box>
      <StepIndicator stepIndex={stepIndex} />

      {state.phase === "date" && state.error && (
        <Alert color="red" variant="light" radius="md" mb="lg" withCloseButton onClose={actions.dismissError}>
          {state.error}
        </Alert>
      )}

      {state.phase === "tabs" && state.error && (
        <Alert color="red" variant="light" radius="md" mb="lg" withCloseButton onClose={actions.dismissError}>
          {state.error}
        </Alert>
      )}

      {state.phase === "fetching" && (
        <Paper withBorder p="xl" radius="lg" mb="lg" ta="center" className="animate-fade">
          <Loader size="sm" color="violet" mb="md" />
          <Text size="sm" c="gray.5" fw={500}>Fetching articles from Indian news sources...</Text>
        </Paper>
      )}

      {state.phase === "date" && (
        <DateStep date={state.date} onSetDate={actions.setDate} onFetch={actions.fetchArticles} />
      )}

      {state.phase === "no-articles" && (
        <Paper withBorder p="xl" radius="lg" mb="lg" ta="center" className="animate-up">
          <Title order={3} c="white" mb="sm">No Articles Found</Title>
          <Text c="gray.5" size="sm" mb="lg">Try a different date</Text>
          <Button variant="light" onClick={actions.goBackToDate}>← Back</Button>
        </Paper>
      )}

      {state.phase === "tabs" && slugs.length > 0 && (
        <CategoryTabs
          date={state.date}
          slugs={slugs}
          tabs={state.tabs}
          onSelectAll={actions.selectAll}
          onClearAll={actions.clearAll}
          onToggleArticle={actions.toggleArticle}
          onGenerateQuiz={actions.generateQuiz}
        />
      )}
    </Box>
  );
}
