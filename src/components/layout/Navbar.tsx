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
  Box,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LogoMark() {
  return (
    <Box
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "-0.02em",
        flexShrink: 0,
      }}
    >
      CA
    </Box>
  );
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="subtle"
      color="gray"
      size="sm"
      aria-label="Toggle color scheme"
      style={{ transition: "all 0.2s ease" }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </ActionIcon>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

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
      shadow="xs"
      radius={0}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--mantine-color-body)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--mantine-color-default-border)",
        opacity: 0.95,
      }}
    >
      <Container size="lg" py={10}>
        <Group justify="space-between" wrap="nowrap">
          {/* Brand */}
          <Anchor component={Link} href="/" underline="never">
            <Group gap={10} wrap="nowrap">
              <LogoMark />
              <Text fw={800} size="md" className="tracking-tight">
                CurrentAffair
              </Text>
            </Group>
          </Anchor>

          {/* Nav links (desktop) */}
          <Group gap={4} visibleFrom="xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant={isActive ? "light" : "subtle"}
                  color={isActive ? "indigo" : "gray"}
                  size="sm"
                  leftSection={<link.icon />}
                  className="nav-link"
                  styles={{
                    root: {
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Group>

          {/* Theme + Auth / Profile */}
          <Group gap={6} wrap="nowrap">
            <ThemeToggle />
            {session?.user ? (
              <>
                <Button
                  component={Link}
                  href="/"
                  variant="light"
                  color="indigo"
                  size="sm"
                  leftSection={<QuizIcon />}
                  visibleFrom="xs"
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
                          radius="xl"
                          size="sm"
                          style={{ border: "2px solid var(--mantine-color-indigo-2)" }}
                        />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      {session.user.name ?? session.user.email}
                    </Menu.Label>
                    <Menu.Item component={Link} href="/dashboard" leftSection={<DashboardIcon />}>
                      Dashboard
                    </Menu.Item>
                    <Menu.Item component={Link} href="/history" leftSection={<HistoryIcon />}>
                      History
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={() => signOut()} color="red">
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Group gap={6}>
                <Button component={Link} href="/auth/login" variant="subtle" size="sm" color="gray">
                  Log in
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  size="sm"
                  variant="gradient"
                  gradient={{ from: "indigo", to: "violet", deg: 45 }}
                  style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}
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
