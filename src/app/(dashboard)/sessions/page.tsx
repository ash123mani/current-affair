"use client";

import { useEffect, useState } from "react";
import { Container, Title, Text, Button, Stack, Paper, Group, Badge, SimpleGrid } from "@mantine/core";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

interface PausedSession {
  id: string;
  quizType: string;
  categorySlug: string | null;
  date: string | null;
  currentIndex: number;
  questionsCount: number;
  selectedCount: number;
  timeRemaining: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function PausedSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PausedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quizSession.list()
      .then((data) => setSessions(data.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResume = (session: PausedSession) => {
    if (session.quizType === "traditional" && session.categorySlug) {
      const params = new URLSearchParams();
      if (session.date) params.set("date", session.date);
      params.set("sessionId", session.id);
      router.push(`/quiz/${session.categorySlug}?${params.toString()}`);
    } else {
      router.push(`/quiz/generated?sessionId=${session.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.quizSession.remove(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  return (
    <Container size="sm" py="xl">
      <Title order={3} mb="lg">Paused Games</Title>

      {loading && <Text c="dark.2">Loading...</Text>}

      {!loading && sessions.length === 0 && (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dark.2" mb="md">No paused games found.</Text>
          <Button onClick={() => router.push("/")} variant="light">Back to Home</Button>
        </Paper>
      )}

      <Stack gap="md">
        {sessions.map((session) => {
          const answered = session.selectedCount;
          const total = session.questionsCount;

          return (
            <Paper key={session.id} withBorder p="lg" radius="md">
              <Group mb="sm">
                <Badge size="sm" variant="light" color="violet" radius="xl">
                  {session.quizType === "traditional" ? "Category Quiz" : "Generated Quiz"}
                </Badge>
                {session.categorySlug && (
                  <Badge size="sm" variant="outline" color="dark.3" radius="xl">
                    {session.categorySlug}
                  </Badge>
                )}
                <Badge size="sm" variant="light" color="yellow" radius="xl">
                  Paused
                </Badge>
              </Group>

              <Text size="sm" c="dark.2" mb="xs">
                {session.questionsCount} questions &middot; {answered} answered
                {session.date ? ` &middot; ${session.date}` : ""}
              </Text>

              <Text size="xs" c="dark.3" mb="md">
                Last active: {new Date(session.updatedAt).toLocaleString()}
              </Text>

              <Group gap="sm">
                <Button
                  variant="filled"
                  color="violet"
                  size="sm"
                  onClick={() => handleResume(session)}
                >
                  Resume
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleDelete(session.id)}
                >
                  Discard
                </Button>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
