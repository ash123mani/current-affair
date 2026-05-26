"use client";

import { useRouter } from "next/navigation";
import { Container, Title } from "@mantine/core";
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
      <Title order={1} mb="xl">
        Your Dashboard
      </Title>

      <StatsOverview
        totalQuizzes={stats.totalQuizzes}
        overallAccuracy={stats.overallAccuracy}
        totalQuestions={stats.totalQuestions}
        streak={stats.streak}
      />

      {stats.categoryStats.length > 0 && (
        <AccuracyChart stats={stats.categoryStats} />
      )}

      <Title order={2} mb="md">
        Category Performance
      </Title>

      <CategoryPerformance stats={stats.categoryStats} />
    </Container>
  );
}
