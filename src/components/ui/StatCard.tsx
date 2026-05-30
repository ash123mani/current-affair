import { Paper, Text, Group } from "@mantine/core";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, icon, color = "violet" }: StatCardProps) {
  return (
    <Paper
      withBorder
      p="lg"
      radius="lg"
      className="animate-scale card-hover"
    >
      <Group gap="md">
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `var(--mantine-color-${color}-0)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: `var(--mantine-color-${color}-6)`,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <Text className="stat-label">{label}</Text>
          <Text className="stat-value" style={{ color: `var(--mantine-color-${color}-7)` }}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
