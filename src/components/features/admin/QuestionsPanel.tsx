"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Select,
  Button,
  Table,
  Badge,
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Textarea,
  ActionIcon,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { CategoryModel } from "@/types/models";
import type { AdminQuestionResponse } from "@/types/api";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function QuestionsPanel({ categories }: { categories: CategoryModel[] }) {
  const [questions, setQuestions] = useState<AdminQuestionResponse[]>([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<AdminQuestionResponse | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      categorySlug: "",
      date: todayStr(),
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctIndex: 0,
      explanation: "",
      source: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset();
    form.setFieldValue("date", todayStr());
    setOpened(true);
  }

  function openEdit(q: AdminQuestionResponse) {
    setEditing(q);
    const opts = q.options as unknown as string[];
    form.setValues({
      categorySlug: q.category?.slug ?? "",
      date: q.date,
      text: q.text,
      optionA: opts[0] ?? "",
      optionB: opts[1] ?? "",
      optionC: opts[2] ?? "",
      optionD: opts[3] ?? "",
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      source: q.source ?? "",
    });
    setOpened(true);
  }

  async function loadQuestions(categorySlug?: string) {
    if (!categorySlug) return;
    const data = await api.admin.questions.list(categorySlug);
    setQuestions(data);
  }

  async function handleSubmit(values: typeof form.values) {
    setError(null);
    try {
      const payload = {
        categorySlug: values.categorySlug,
        date: values.date,
        text: values.text,
        options: [values.optionA, values.optionB, values.optionC, values.optionD],
        correctIndex: values.correctIndex,
        explanation: values.explanation || undefined,
        source: values.source || undefined,
      };

      if (editing) {
        await api.admin.questions.update(editing.id, payload);
        notifySuccess("Question updated");
      } else {
        await api.admin.questions.create(payload);
        notifySuccess("Question created");
      }

      setOpened(false);
      form.reset();
      loadQuestions(values.categorySlug || category);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      setError(msg);
      notifyError("Operation failed", msg);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await api.admin.questions.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      notifySuccess("Question deleted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      setError(msg);
      notifyError("Delete failed", msg);
    }
  }

  useEffect(() => {
    if (categories.length > 0 && !category) {
      const slug = categories[0].slug;
      setCategory(slug);
      loadQuestions(slug);
    }
  }, [categories, category]);

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Select
          placeholder="Filter by category"
          data={categories.map((c) => ({ value: c.slug, label: c.name }))}
          value={category}
          onChange={(v) => {
            setCategory(v ?? "");
            if (v) loadQuestions(v);
          }}
          clearable
        />
        <Button onClick={openCreate}>Add Question</Button>
      </Group>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <div style={{ overflowX: "auto" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Question</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {questions.map((q) => (
              <Table.Tr key={q.id}>
                <Table.Td>{q.date}</Table.Td>
                <Table.Td>{q.text.slice(0, 60)}...</Table.Td>
                <Table.Td>
                  <Badge>{q.category?.name ?? ""}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={q.status === "published" ? "green" : "yellow"}>{q.status}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" onClick={() => openEdit(q)}>
                      ✏️
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(q.id)}>
                      🗑️
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editing ? "Edit Question" : "Add Question"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Select
              label="Category"
              data={categories.map((c) => ({ value: c.slug, label: c.name }))}
              required
              key={form.key("categorySlug")}
              {...form.getInputProps("categorySlug")}
            />
            <TextInput label="Date" type="date" required key={form.key("date")} {...form.getInputProps("date")} />
            <Textarea label="Question" required minRows={2} key={form.key("text")} {...form.getInputProps("text")} />
            <TextInput label="Option A" required key={form.key("optionA")} {...form.getInputProps("optionA")} />
            <TextInput label="Option B" required key={form.key("optionB")} {...form.getInputProps("optionB")} />
            <TextInput label="Option C" required key={form.key("optionC")} {...form.getInputProps("optionC")} />
            <TextInput label="Option D" required key={form.key("optionD")} {...form.getInputProps("optionD")} />
            <NumberInput label="Correct option (0-3)" min={0} max={3} required key={form.key("correctIndex")} {...form.getInputProps("correctIndex")} />
            <Textarea label="Explanation" minRows={2} key={form.key("explanation")} {...form.getInputProps("explanation")} />
            <TextInput label="Source" key={form.key("source")} {...form.getInputProps("source")} />
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
