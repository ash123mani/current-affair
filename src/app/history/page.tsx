"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Title, Text, Paper, Table, Badge, Group, Pagination, Select } from "@mantine/core";
import { useQuizHistory } from "@/hooks/use-quiz-history";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACCURACY_THRESHOLD } from "@/constants";
import { api } from "@/lib/api/client";
import type { CategoryModel } from "@/types/models";

export default function HistoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { attempts, total, page, totalPages, loading, setPage } = useQuizHistory(categoryFilter ?? undefined);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  if (loading && !attempts.length) {
    return <LoadingState message="Loading history..." />;
  }

  if (!attempts.length && !loading) {
    return (
      <Container size="md" py="xl">
        <Title order={1} mb="xs">Quiz History</Title>
        <EmptyState message="No quizzes attempted yet. Start playing to see your history!" />
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="xs">
        Quiz History
      </Title>
      <Text c="dimmed" mb="xl">
        {total} attempt{total !== 1 ? "s" : ""} total
      </Text>

      <Group mb="md">
        <Select
          placeholder="Filter by category"
          data={[
            { value: "", label: "All categories" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
          value={categoryFilter}
          onChange={(v) => {
            setCategoryFilter(v ?? "");
            setPage(1);
          }}
          clearable
          style={{ minWidth: 200 }}
        />
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Accuracy</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attempts.map((a) => {
              const accuracy = Math.round((a.score / a.total) * 100);
              return (
                <Table.Tr key={a.id}>
                  <Table.Td>{a.date}</Table.Td>
                  <Table.Td>{a.category.name}</Table.Td>
                  <Table.Td>
                    {a.score}/{a.total}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={accuracy >= ACCURACY_THRESHOLD ? "teal" : "red"}>
                      {accuracy}%
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>

      <Group justify="center" mt="xl">
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Container>
  );
}
