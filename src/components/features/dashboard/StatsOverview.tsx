import { SimpleGrid } from "@mantine/core";
import { StatCard } from "@/components/ui/StatCard";
import { ACCURACY_THRESHOLD } from "@/constants";

interface StatsOverviewProps {
  totalQuizzes: number;
  overallAccuracy: number;
  totalQuestions: number;
  streak: number;
}

const COLORS = ["violet", "teal", "blue", "orange"];

function QuizIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function AccuracyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function QuestionsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function StreakIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function StatsOverview({
  totalQuizzes,
  overallAccuracy,
  totalQuestions,
  streak,
}: StatsOverviewProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
      <StatCard label="Quizzes Taken" value={totalQuizzes} icon={<QuizIcon />} color={COLORS[0]} />
      <StatCard label="Accuracy" value={`${overallAccuracy}%`} icon={<AccuracyIcon />} color={overallAccuracy >= ACCURACY_THRESHOLD ? COLORS[1] : "red"} />
      <StatCard label="Questions" value={totalQuestions} icon={<QuestionsIcon />} color={COLORS[2]} />
      <StatCard label="Day Streak" value={streak} icon={<StreakIcon />} color={COLORS[3]} />
    </SimpleGrid>
  );
}
