import { SimpleGrid } from "@mantine/core";
import { StatCard } from "@/components/ui/StatCard";

interface StatsOverviewProps {
  totalQuizzes: number;
  overallAccuracy: number;
  totalQuestions: number;
  streak: number;
}

export function StatsOverview({
  totalQuizzes,
  overallAccuracy,
  totalQuestions,
  streak,
}: StatsOverviewProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
      <StatCard label="Total Quizzes" value={totalQuizzes} />
      <StatCard label="Overall Accuracy" value={`${overallAccuracy}%`} />
      <StatCard label="Questions Answered" value={totalQuestions} />
      <StatCard label="Day Streak" value={streak} />
    </SimpleGrid>
  );
}
