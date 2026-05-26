"use client";

import { useState } from "react";
import { Button, Group, Text, Stack, Alert, Box, Select } from "@mantine/core";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { PopulateResult } from "@/types/api";
import type { CategoryModel } from "@/types/models";

export function PopulatePanel({ categories }: { categories: CategoryModel[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PopulateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  async function handlePopulate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.admin.populate(
        undefined,
        selectedCategory ?? undefined
      );
      setResult(data);
      const generated = data.totalGenerated;
      if (generated > 0) {
        notifySuccess("Generation complete", `${generated} questions created`);
      } else {
        notifyError("No questions generated", "Questions may already exist for today");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to populate";
      setError(msg);
      notifyError("Generation failed", msg);
    } finally {
      setLoading(false);
    }
  }

  const totalErrors = result?.errors?.length ?? 0;

  return (
    <Stack>
      <Group>
        <Select
          placeholder="All categories"
          data={categories.map((c) => ({ value: c.slug, label: c.name }))}
          value={selectedCategory}
          onChange={setSelectedCategory}
          clearable
          style={{ minWidth: 200 }}
        />
        <Button onClick={handlePopulate} loading={loading}>
          Generate Questions
        </Button>
      </Group>

      {result && (
        <Box>
          <Text fw={700} mb="sm">
            Generated {result.totalGenerated} questions for {result.category === "all" ? "all categories" : result.category}
          </Text>
          {result.details.map((d) => (
            <Group key={d.category} mb="xs" justify="space-between">
              <Text size="sm">{d.category}</Text>
              <Group gap="xs">
                <Text size="sm" c={d.questions > 0 ? "green" : "dimmed"}>
                  {d.questions} questions
                </Text>
                {d.errors && d.errors.length > 0 && (
                  <Text size="sm" c="red">
                    {d.errors.length} error{d.errors.length === 1 ? "" : "s"}
                  </Text>
                )}
              </Group>
            </Group>
          ))}
          {totalErrors > 0 && (
            <Alert color="red" mt="md">
              {result.errors!.map((e, i) => (
                <Text key={i} size="sm">
                  {e}
                </Text>
              ))}
            </Alert>
          )}
        </Box>
      )}

      {error && (
        <Alert color="red">{error}</Alert>
      )}
    </Stack>
  );
}
