import { Title, Text, Container } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xs">
        {title}
      </Title>
      {subtitle && (
        <Text c="dark.2" mb="xl" size="lg">
          {subtitle}
        </Text>
      )}
    </Container>
  );
}
