"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  ActionIcon,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { CategoryModel } from "@/types/models";

export function CategoriesPanel({ categories: initial }: { categories: CategoryModel[] }) {
  const [categories, setCategories] = useState(initial);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<CategoryModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", slug: "", icon: "", color: "" },
  });

  function openCreate() {
    setEditing(null);
    form.setValues({ name: "", slug: "", icon: "", color: "" });
    setOpened(true);
  }

  function openEdit(cat: CategoryModel) {
    setEditing(cat);
    form.setValues({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon ?? "",
      color: cat.color ?? "",
    });
    setOpened(true);
  }

  async function handleSubmit(values: typeof form.values) {
    setError(null);
    try {
      if (editing) {
        const updated = await api.admin.categories.update(editing.id, values);
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        notifySuccess("Category updated", values.name);
      } else {
        const created = await api.admin.categories.create(values);
        setCategories((prev) => [...prev, created]);
        notifySuccess("Category created", values.name);
      }
      setOpened(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      setError(msg);
      notifyError("Operation failed", msg);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await api.admin.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      notifySuccess("Category deleted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      setError(msg);
      notifyError("Delete failed", msg);
    }
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="sm" c="dimmed">
          {categories.length} categories
        </Text>
        <Button onClick={openCreate}>Add Category</Button>
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
              <Table.Th>Icon</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Color</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories.map((c) => (
              <Table.Tr key={c.id}>
                <Table.Td>{c.icon}</Table.Td>
                <Table.Td>{c.name}</Table.Td>
                <Table.Td>{c.slug}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {c.color && (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: c.color,
                        }}
                      />
                    )}
                    <Text size="sm">{c.color ?? "—"}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" onClick={() => openEdit(c)}>
                      ✏️
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(c.id)}>
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
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Name" required key={form.key("name")} {...form.getInputProps("name")} />
            <TextInput label="Slug" required key={form.key("slug")} {...form.getInputProps("slug")} />
            <TextInput label="Icon" key={form.key("icon")} {...form.getInputProps("icon")} />
            <TextInput label="Color" key={form.key("color")} {...form.getInputProps("color")} />
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
