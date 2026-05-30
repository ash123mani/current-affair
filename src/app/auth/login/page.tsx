"use client";

import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack, Divider, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LogoMark } from "@/components/layout/LogoMark";

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
      <Center mb="lg"><LogoMark size={40} /></Center>
      <Title ta="center" order={2} style={{ fontFamily: "var(--font-serif)" }}>
        Welcome back
      </Title>
      <Text c="dark.2" size="sm" ta="center" mt={4}>
        Don&apos;t have an account?{" "}
        <Anchor component={Link} href="/auth/signup" size="sm" c="violet.5">
          Sign up
        </Anchor>
      </Text>

      <Paper withBorder p="xl" mt="lg" radius="lg">
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
              <Text c="red" size="sm">{error}</Text>
            )}
            <Button type="submit" fullWidth loading={loading} color="violet">
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />
        <Button
          variant="outline"
          color="dark.4"
          fullWidth
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </Button>
      </Paper>
    </Container>
  );
}
