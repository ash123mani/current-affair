import { Container, Title, Text, Badge, Box } from "@mantine/core";
import { QuizBuilder } from "@/components/features/quiz-builder/QuizBuilder";

function HeroBackground() {
  return (
    <Box pos="absolute" inset={0} style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div className="hero-blob animate-blob"
        style={{ top: "-20%", right: "-10%", width: "40%", height: "80%", animationDuration: "18s",
          background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.06))" }}
      />
      <div className="hero-blob"
        style={{ bottom: "-30%", left: "-10%", width: "35%", height: "60%", animationDelay: "-4s",
          background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.04))" }}
      />
      <div className="hero-particle animate-float-slow"
        style={{ top: "15%", right: "20%", width: 4, height: 4, background: "rgba(79,70,229,0.2)", animationDuration: "7s" }}
      />
      <div className="hero-particle animate-float"
        style={{ top: "60%", left: "15%", width: 3, height: 3, background: "rgba(245,158,11,0.2)", animationDuration: "6s", animationDelay: "-2s" }}
      />
      <div className="hero-particle animate-float-slow"
        style={{ top: "30%", left: "30%", width: 2, height: 2, background: "rgba(79,70,229,0.15)", animationDuration: "9s", animationDelay: "-5s" }}
      />
    </Box>
  );
}

export default function HomePage() {
  return (
    <>
      <Box className="hero-container"
        style={{
          background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 50%, #fefce8 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <HeroBackground />
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Box ta="center" maw={640} mx="auto">
            <Badge variant="light" color="indigo" size="lg" mb="md"
              className="badge-hero"
              style={{ border: "1px solid rgba(79,70,229,0.1)" }}
            >
              India's Daily Current Affairs Quiz
            </Badge>
            <Title order={1} c="gray.9" mb="sm"
              fz="clamp(32px, 5vw, 52px)"
              className="lh-1-12 tracking-tighter"
            >
              Your daily{" "}
              <Text component="span" variant="gradient" gradient={{ from: "indigo", to: "violet", deg: 90 }} inherit span>
                news quiz
              </Text>
              {" "}generator
            </Title>
            <Text c="gray.6" size="lg" mb="lg" className="lh-1-7 fw-450">
              Pick a date to fetch articles from top Indian news sources, choose what to study, and let AI build a quiz for you.
            </Text>
          </Box>
        </Container>
      </Box>

      <Container size="lg" pb="xl">
        <QuizBuilder />
      </Container>
    </>
  );
}
