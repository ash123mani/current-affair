"use client";

import {
  Group, Button, Text, Container, Anchor, Avatar, Menu, UnstyledButton, Paper, Box, Burger, Drawer, Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./LogoMark";

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);

  const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    ...(session?.user
      ? [
          { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
          { href: "/history", label: "History", icon: HistoryIcon },
        ]
      : []),
  ];

  return (
    <Paper
      radius={0}
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--mantine-color-body)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "0.5px solid var(--mantine-color-default-border)",
        opacity: 0.95,
      }}
    >
      <Container size="lg" py={10}>
        <Group justify="space-between" wrap="nowrap">
          <Anchor component={Link} href="/" underline="never">
            <Group gap={10} wrap="nowrap">
              <LogoMark />
              <Text fw={600} size="md" style={{ fontFamily: "var(--font-serif)" }}>
                CurrentAffair
              </Text>
            </Group>
          </Anchor>

          <Group gap={4} visibleFrom="xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant={isActive ? "light" : "subtle"}
                  color={isActive ? "violet" : "gray"}
                  size="sm"
                  leftSection={<link.icon />}
                >
                  {link.label}
                </Button>
              );
            })}
          </Group>

          <Group gap={4} wrap="nowrap">
            <Burger opened={mobileOpen} onClick={toggleMobile} size="sm" hiddenFrom="xs" aria-label="Toggle navigation" />
            {session?.user ? (
              <>
                <Button
                  component={Link} href="/"
                  variant="light" color="violet" size="sm"
                  leftSection={<QuizIcon />} visibleFrom="xs"
                >
                  New Quiz
                </Button>
                <Menu shadow="md" width={200} radius="md" position="bottom-end">
                  <Menu.Target>
                    <UnstyledButton>
                      <Group gap={8} wrap="nowrap">
                        <Text size="sm" fw={500} visibleFrom="sm" truncate maw={120}>
                          {session.user.name ?? session.user.email}
                        </Text>
                        <Avatar
                          src={session.user.image}
                          alt={session.user.name ?? ""}
                          radius="xl" size="sm"
                        />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{session.user.name ?? session.user.email}</Menu.Label>
                    <Menu.Item component={Link} href="/dashboard" leftSection={<DashboardIcon />}>
                      Dashboard
                    </Menu.Item>
                    <Menu.Item component={Link} href="/history" leftSection={<HistoryIcon />}>
                      History
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={() => signOut()} color="red">Sign out</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Group gap={6}>
                <Button component={Link} href="/auth/login" variant="subtle" size="sm" color="dark.2">
                  Log in
                </Button>
                <Button
                  component={Link} href="/auth/signup" size="sm"
                  variant="filled" color="violet"
                >
                  Sign up
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={mobileOpen}
        onClose={closeMobile}
        size="260px"
        padding="md"
        title={
          <Group gap={10}>
            <LogoMark />
            <Text fw={600} size="sm" style={{ fontFamily: "var(--font-serif)" }}>CurrentAffair</Text>
          </Group>
        }
      >
        <Stack gap={4} mt="md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                variant={isActive ? "light" : "subtle"}
                color={isActive ? "violet" : "gray"}
                size="sm"
                fullWidth
                justify="flex-start"
                leftSection={<link.icon />}
                onClick={closeMobile}
              >
                {link.label}
              </Button>
            );
          })}
          {session?.user && <Button
            component={Link} href="/"
            variant="light" color="violet" size="sm"
            fullWidth justify="flex-start"
            leftSection={<QuizIcon />}
            onClick={closeMobile}
          >
            New Quiz
          </Button>}
        </Stack>
      </Drawer>
    </Paper>
  );
}
