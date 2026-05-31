"use client";

import { Box, Container, Title, Text, Paper, SimpleGrid, Badge, Group } from "@mantine/core";

const steps = [
  {
    num: 1,
    title: "Pick a Date",
    description: "Choose any day to fetch the latest articles from top Indian news sources like The Hindu, Indian Express, and more.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="15" r="1" />
        <circle cx="16" cy="15" r="1" />
        <circle cx="8" cy="15" r="1" />
      </svg>
    ),
    iconBg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    iconShadow: "rgba(124,58,237,0.35)",
    badgeColor: "violet",
  },
  {
    num: 2,
    title: "Select Articles",
    description: "Browse through curated news across categories — browse headlines, pick the stories you want to study, and skip the rest.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9" />
        <polyline points="13 7 17 11 13 15" />
        <polyline points="9 15 5 11 9 7" />
      </svg>
    ),
    iconBg: "linear-gradient(135deg, #3b82f6, #0891b2)",
    iconShadow: "rgba(59,130,246,0.35)",
    badgeColor: "blue",
  },
  {
    num: 3,
    title: "Generate & Play",
    description: "Let AI craft a personalized quiz from your selected articles. Answer at your own pace, review explanations, and track progress.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    iconBg: "linear-gradient(135deg, #c026d3, #db2777)",
    iconShadow: "rgba(192,38,211,0.35)",
    badgeColor: "grape",
  },
];

export function HowItWorks() {
  return (
    <Box py={60}>
      <Container size="lg">
        <Box ta="center" mb="xl">
          <Badge
            variant="light"
            color="violet"
            size="lg"
            mb="sm"
            style={{ border: "1px solid rgba(139,92,246,0.2)" }}
          >
            How It Works
          </Badge>
          <Title order={2} c="white" fz="clamp(24px, 3.5vw, 36px)" className="tracking-tight">
            Three simple steps
          </Title>
          <Text c="gray.5" size="sm" maw={480} mx="auto" mt={4}>
            Pick a date, choose what matters, and let AI turn news into a quiz.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" verticalSpacing="lg" className="animate-stagger">
          {steps.map((step) => (
            <Paper
              key={step.num}
              withBorder
              p="xl"
              radius="lg"
              className="card-hover"
              style={{
                background: "linear-gradient(135deg, rgba(30,20,64,0.6) 0%, rgba(26,17,51,0.8) 100%)",
                borderColor: "rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <Group mb="md" gap="sm">
                <Box
                  className="icon-box-44"
                  style={{
                    background: step.iconBg,
                    boxShadow: `0 4px 16px ${step.iconShadow}`,
                    color: "white",
                  }}
                >
                  {step.icon}
                </Box>
                <Badge
                  size="sm"
                  variant="light"
                  color={step.badgeColor}
                  radius="xl"
                  style={{
                    background: `${step.iconBg}22`,
                    border: `0.5px solid ${step.iconShadow.replace("0.35", "0.25")}`,
                  }}
                >
                  Step {step.num}
                </Badge>
              </Group>

              <Title order={4} c="white" mb="xs" fz="md" className="tracking-tight">
                {step.title}
              </Title>

              <Text size="sm" c="gray.5" lh={1.7} style={{ textWrap: "pretty" }}>
                {step.description}
              </Text>

              <Box
                mt="md"
                style={{
                  width: 28,
                  height: 2,
                  borderRadius: 1,
                  background: `linear-gradient(90deg, ${step.iconBg.split(",")[0].replace("linear-gradient(135deg, ", "")}, transparent)`,
                }}
              />
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
