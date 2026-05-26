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
  Badge,
} from "@mantine/core";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <Container size="lg" py="md">
      <Group justify="space-between">
        <Anchor component={Link} href="/" underline="never">
          <Text fw={700} size="lg">
            CurrentAffair
          </Text>
        </Anchor>

        <Group gap="xs">
          <Button
            component={Link}
            href="/docs"
            variant="subtle"
            size="sm"
          >
            API
          </Button>

          {isAdmin && (
            <Button
              component={Link}
              href="/admin"
              variant="light"
              color="orange"
              size="sm"
              rightSection={<Badge size="xs" color="orange" variant="filled">Admin</Badge>}
            >
              Admin
            </Button>
          )}

          {session?.user ? (
            <>
              <Button
                component={Link}
                href="/dashboard"
                variant="subtle"
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/history"
                variant="subtle"
                size="sm"
              >
                History
              </Button>
              <Menu shadow="md" width={220}>
                <Menu.Target>
                  <UnstyledButton>
                    <Avatar
                      src={session.user.image}
                      alt={session.user.name ?? ""}
                      radius="xl"
                      size="sm"
                    />
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    {session.user.name ?? session.user.email}
                  </Menu.Label>
                  {isAdmin && (
                    <>
                      <Menu.Divider />
                      <Menu.Item
                        component={Link}
                        href="/admin"
                        color="orange"
                      >
                        Admin Panel
                      </Menu.Item>
                    </>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() => signOut()}
                    color="red"
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/auth/login"
                variant="subtle"
                size="sm"
              >
                Log in
              </Button>
              <Button component={Link} href="/auth/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Container>
  );
}
