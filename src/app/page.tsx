"use client";

import { Container, Title, Text, Badge, Box } from "@mantine/core";
import { QuizBuilder } from "@/components/features/quiz-builder/QuizBuilder";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)",
          paddingTop: 64,
          paddingBottom: 80,
          marginBottom: -40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container size="lg">
          <Box ta="center" maw={640} mx="auto">
            <Badge
              variant="white"
              size="lg"
              mb="md"
              style={{ textTransform: "none", fontWeight: 500 }}
            >
              Current Affairs · Daily Quiz Generator
            </Badge>
            <Title
              order={1}
              c="white"
              mb="sm"
              style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.15, letterSpacing: "-0.03em" }}
            >
              Generate quizzes from live news
            </Title>
            <Text c="white" size="lg" opacity={0.85} mb="lg" style={{ lineHeight: 1.6 }}>
              Pick a country, choose newspapers and a topic — AI generates a quiz from today&apos;s headlines.
            </Text>
          </Box>
        </Container>
        <div style={{ position: "absolute", top: "-60px", right: "-80px", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      </Box>

      <Container size="lg" pb="xl">
        <QuizBuilder />
      </Container>
    </>
  );
}
