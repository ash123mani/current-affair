"use client";

import { useRouter } from "next/navigation";
import { Container, Title, Text, Paper, Group, Badge, Box } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { LoadingSkeleton } from "@/components/ui/LoadingState";
import { StatsOverview } from "@/components/features/dashboard/StatsOverview";
import { CategoryPerformance } from "@/components/features/dashboard/CategoryPerformance";
import { AccuracyChart } from "@/components/features/dashboard/AccuracyChart";
import { DateWisePerformance } from "@/components/features/dashboard/DateWisePerformance";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { stats, loading } = useDashboardStats();

  if (status === "loading") return <LoadingSkeleton page="dashboard" />;

  if (!session && status === "unauthenticated") {
    router.push("/auth/login?callbackUrl=/dashboard");
    return null;
  }

  if (loading) return <LoadingSkeleton page="dashboard" />;

  if (!stats) {
    return <LoadingSkeleton page="dashboard" />;
  }

  return (
    <Container size="lg" py="xl">
      <Box mb="xl" className="animate-up">
        <Paper
          withBorder p="lg" radius="lg"
          style={{ borderLeft: "4px solid var(--mantine-color-violet-5)" }}
        >
          <Group>
            <Box className="icon-box-44" bg="violet.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </Box>
            <Box className="flex-1">
              <Title order={3}>Your Dashboard</Title>
              <Text c="dark.2" size="sm">Track your quiz performance and progress</Text>
            </Box>
            <Badge variant="light" color="violet" size="lg">
              {stats.totalQuizzes} quiz{stats.totalQuizzes > 1 ? "zes" : ""}
            </Badge>
          </Group>
        </Paper>
      </Box>

      <div className="animate-up">
        <StatsOverview
          totalQuizzes={stats.totalQuizzes}
          overallAccuracy={stats.overallAccuracy}
          totalQuestions={stats.totalQuestions}
          streak={stats.streak}
        />
      </div>

      {stats.categoryStats.length > 0 && (
        <AccuracyChart stats={stats.categoryStats} />
      )}

      <Title order={3} mb="md" className="animate-up">Category Performance</Title>

      <CategoryPerformance stats={stats.categoryStats} />

      <DateWisePerformance attempts={stats.recentAttempts} />
    </Container>
  );
}
