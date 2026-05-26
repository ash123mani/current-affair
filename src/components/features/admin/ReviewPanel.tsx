"use client";

import { useEffect, useState } from "react";
import { Group, Table, Badge, Button, Text, Stack, Card, Code } from "@mantine/core";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import { parseOptions } from "@/lib/parse-options";
import type { AdminQuestionResponse } from "@/types/api";

export function ReviewPanel() {
  const [drafts, setDrafts] = useState<AdminQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadDrafts() {
    setLoading(true);
    try {
      const data = await api.admin.draftQuestions.list();
      setDrafts(data);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.admin.questions.publish(id);
      notifySuccess("Question published");
      loadDrafts();
    } catch (e) {
      notifyError("Publish failed", e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft?")) return;
    try {
      await api.admin.questions.delete(id);
      notifySuccess("Draft deleted");
      loadDrafts();
    } catch (e) {
      notifyError("Delete failed", e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  if (loading) {
    return <Text c="dimmed">Loading drafts...</Text>;
  }

  if (drafts.length === 0) {
    return <Text c="dimmed">No draft questions to review.</Text>;
  }

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        {drafts.length} question{drafts.length === 1 ? "" : "s"} awaiting review
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Question</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {drafts.map((q) => (
            <>
              <Table.Tr
                key={q.id}
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <Table.Td>{q.date}</Table.Td>
                <Table.Td>{q.text.slice(0, 60)}</Table.Td>
                <Table.Td>
                  <Badge>{q.category?.name ?? ""}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" color="green" onClick={(e) => { e.stopPropagation(); handlePublish(q.id); }}>
                      Publish
                    </Button>
                    <Button size="xs" color="red" onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}>
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
              {expandedId === q.id && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Card withBorder p="md">
                      <Text size="sm">{q.text}</Text>
                      {(Array.isArray(q.options) ? q.options : parseOptions(q.options as unknown as string)).map((opt, i) => (
                        <Text
                          key={i}
                          size="sm"
                          c={i === q.correctIndex ? "green" : undefined}
                          fw={i === q.correctIndex ? 700 : 400}
                        >
                          {i + 1}. {opt}
                        </Text>
                      ))}
                      {q.explanation && (
                        <Text size="sm" mt="xs" c="dimmed">
                          {q.explanation}
                        </Text>
                      )}
                      <Group mt="xs">
                        <Code>{q.source ?? "N/A"}</Code>
                      </Group>
                    </Card>
                  </Table.Td>
                </Table.Tr>
              )}
            </>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
