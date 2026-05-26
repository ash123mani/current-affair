import { Container, Title, Text, SimpleGrid, Card, Group } from "@mantine/core";
import Link from "next/link";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { questionRepository } from "@/lib/repositories/question.repository";
import { today } from "@/lib/date";

export default async function HomePage() {
  const categories = await categoryRepository.findAll();
  const todayStr = today();
  const questionCounts = await questionRepository.groupCountByCategory(todayStr);
  const countMap = new Map(
    questionCounts.map((q) => [q.categoryId, q._count] as const)
  );

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xs">
        Today&apos;s Current Affairs
      </Title>
      <Text c="dimmed" mb="xl" size="lg">
        {todayStr} — Select a category to start the quiz
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {categories.map((cat) => {
          const questionCount = countMap.get(cat.id) ?? 0;
          const hasQuiz = questionCount > 0;

          return (
            <Link
              key={cat.id}
              href={hasQuiz ? `/quiz/${cat.slug}` : "#"}
              style={{
                textDecoration: "none",
                pointerEvents: hasQuiz ? "auto" : "none",
              }}
            >
              <Card
                withBorder
                padding="lg"
                radius="md"
                style={{ opacity: hasQuiz ? 1 : 0.5 }}
              >
                <Group mb="xs">
                  <Text size="xl">{cat.icon}</Text>
                  <div>
                    <Text fw={500}>{cat.name}</Text>
                    <Text size="sm" c="dimmed">
                      {hasQuiz
                        ? `${questionCount} question${questionCount > 1 ? "s" : ""} available`
                        : "No quiz yet today"}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Link>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}
