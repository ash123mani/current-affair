"use client";

import { useEffect, useState } from "react";
import { Container, Title, Tabs, Text, Alert } from "@mantine/core";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api/client";
import type { CategoryModel } from "@/types/models";
import { QuestionsPanel } from "@/components/features/admin/QuestionsPanel";
import { CategoriesPanel } from "@/components/features/admin/CategoriesPanel";
import { ReviewPanel } from "@/components/features/admin/ReviewPanel";
import { PopulatePanel } from "@/components/features/admin/PopulatePanel";

export default function AdminPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== "admin") {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Access Denied">
          <Text>You need an admin account to access this page.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Admin Panel
      </Title>

      <Tabs defaultValue="populate">
        <Tabs.List mb="lg">
          <Tabs.Tab value="populate">Auto Populate</Tabs.Tab>
          <Tabs.Tab value="review">Review Drafts</Tabs.Tab>
          <Tabs.Tab value="questions">Questions</Tabs.Tab>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="populate">
          <PopulatePanel categories={categories} />
        </Tabs.Panel>

        <Tabs.Panel value="review">
          <ReviewPanel />
        </Tabs.Panel>

        <Tabs.Panel value="questions">
          <QuestionsPanel categories={categories} />
        </Tabs.Panel>

        <Tabs.Panel value="categories">
          <CategoriesPanel categories={categories} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
