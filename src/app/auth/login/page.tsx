"use client";

import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { error, loading, login } = useAuth();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
  });

  async function handleSubmit(values: typeof form.values) {
    await login(values.email, values.password);
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2}>
        Welcome back
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don&apos;t have an account?{" "}
        <Anchor component={Link} href="/auth/signup" size="sm">
          Sign up
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              key={form.key("password")}
              {...form.getInputProps("password")}
            />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />
        <Button
          variant="default"
          fullWidth
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Container>
  );
}
