import { Container, Title, Text, Badge, Box } from "@mantine/core";
import { QuizBuilder } from "@/components/features/quiz-builder/QuizBuilder";

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
        className="hero-container"
        style={{
          background: "linear-gradient(160deg, #1a1133 0%, #241850 50%, #1e1440 100%)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        }}
      >
        <HeroBackground />
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
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
              fz="clamp(32px, 5vw, 52px)"
              className="lh-1-12 tracking-tighter"
            >
              Your daily{" "}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: "violet.4", to: "grape.3", deg: 90 }}
                inherit span
              >
                news quiz
              </Text>
              {" "}generator
            </Title>
            <Text c="gray.4" size="lg" mb={0} className="lh-1-7 fw-450">
              Pick a date to fetch articles from top Indian news sources, choose what to study, and let AI build a quiz for you.
            </Text>
          </Box>
        </Container>
      </Box>

      <Container size="lg" pt="xl" pb="xl">
        <QuizBuilder />
      </Container>
    </>
  );
}
