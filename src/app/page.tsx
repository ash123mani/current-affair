import { Container, Title, Text, Badge, Box, SimpleGrid, Paper, Group, Divider } from "@mantine/core";
import { QuizBuilder } from "@/components/features/quiz-builder/QuizBuilder";

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
  },
];

function HeroBackground() {
  return (
    <Box pos="absolute" inset={0} style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div className="hero-blob"
        style={{
          top: "-20%", right: "-10%", width: "40%", height: "80%",
          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.05))",
        }}
      />
      <div className="hero-blob"
        style={{
          bottom: "-30%", left: "-10%", width: "35%", height: "60%",
          background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(124,58,237,0.03))",
        }}
      />
      <div className="hero-particle"
        style={{ top: "15%", right: "22%", width: 4, height: 4, background: "rgba(167,139,250,0.2)" }}
      />
      <div className="hero-particle"
        style={{ top: "60%", left: "18%", width: 3, height: 3, background: "rgba(196,181,253,0.15)" }}
      />
    </Box>
  );
}

export default function HomePage() {
  return (
    <>
      <Box
        style={{
          background: "linear-gradient(160deg, #1a1133 0%, #241850 50%, #1e1440 100%)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <HeroBackground />

        <Box pos="relative" style={{ zIndex: 1 }}>
          <Container size="lg" py={20}>
            <Box ta="center" maw={680} mx="auto">
              <Badge
                variant="light" color="violet" size="lg" mb="md"
                className="badge-hero"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}
              >
                India's Daily Current Affairs Quiz
              </Badge>
              <Title
                order={1} c="white" mb="sm"
                className="lh-1-12 tracking-tighter"
              >
                Current Affairs{" "}
                <Text
                  component="span"
                  variant="gradient"
                  gradient={{ from: "violet.4", to: "grape.3", deg: 90 }}
                  inherit span
                >quiz generator
                </Text>
              </Title>
            </Box>
          </Container>

          <Container size="lg" pb={60}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" verticalSpacing="lg" className="animate-stagger" dir="row">
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
                      background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
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
      </Box>

      <Container size="lg">
        <Divider my="md" label="Start Quizzing" labelPosition="center" color="dark.5" size="xs" mx="auto" maw={400} />
      </Container>

      <Container size="lg" pb="xl">
        <QuizBuilder />
      </Container>
    </>
  );
}
