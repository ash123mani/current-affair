"use client";

import { useRouter } from "next/navigation";
import { Container, Title, Text, Paper, Group, Badge, Box } from "@mantine/core";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatsOverview } from "@/components/features/dashboard/StatsOverview";
import { CategoryPerformance } from "@/components/features/dashboard/CategoryPerformance";
import { AccuracyChart } from "@/components/features/dashboard/AccuracyChart";

export default function DashboardPage() {
  const router = useRouter();
  const { stats, loading } = useDashboardStats();

  if (loading) return <LoadingState message="Loading dashboard..." />;

  if (!stats) {
    if (typeof window !== "undefined") {
      router.push("/auth/login?callbackUrl=/dashboard");
    }
    return null;
  }

  return (
    <Container size="lg" py="xl">
      <Box mb="xl" className="animate-up">
        <Paper
          withBorder
          p="lg"
          radius="lg"
          bg="white"
          style={{ borderLeft: "4px solid #667eea" }}
        >
          <Group>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <Box style={{ flex: 1 }}>
              <Title order={3}>Your Dashboard</Title>
              <Text c="dimmed" size="sm">Track your quiz performance and progress</Text>
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
    </Container>
  );
}
