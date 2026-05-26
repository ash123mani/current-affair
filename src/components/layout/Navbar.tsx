"use client";

import {
  Group,
  Button,
  Text,
  Container,
  Anchor,
  Avatar,
  Menu,
  UnstyledButton,
  Paper,
} from "@mantine/core";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <Paper
      shadow="sm"
      radius={0}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Anchor component={Link} href="/" underline="never">
            <Text
              fw={800}
              size="lg"
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 90 }}
            >
              CurrentAffair
            </Text>
          </Anchor>

          <Group gap={4}>
            {session?.user ? (
              <>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="subtle"
                  size="sm"
                  color="gray"
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  href="/history"
                  variant="subtle"
                  size="sm"
                  color="gray"
                >
                  History
                </Button>
                <Menu shadow="md" width={200} radius="md">
                  <Menu.Target>
                    <UnstyledButton ml="xs">
                      <Avatar
                        src={session.user.image}
                        alt={session.user.name ?? ""}
                        radius="xl"
                        size="sm"
                      />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{session.user.name ?? session.user.email}</Menu.Label>
                    <Menu.Item component={Link} href="/dashboard">
                      Dashboard
                    </Menu.Item>
                    <Menu.Item onClick={() => signOut()} color="red">
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Group gap="xs">
                <Button component={Link} href="/auth/login" variant="subtle" size="sm" color="gray">
                  Log in
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  size="sm"
                  variant="gradient"
                  gradient={{ from: "violet", to: "pink", deg: 45 }}
                >
                  Sign up
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}
