"use client";

import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { LogoMark } from "@/components/layout/LogoMark";

export default function SignupPage() {
  const { error, loading, signup } = useAuth();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: {
      name: (v: string) => (v.length < 1 ? "Name is required" : null),
      email: (v: string) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v: string) =>
        v.length < MIN_PASSWORD_LENGTH ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters` : null,
      confirmPassword: (v: string, values: Record<string, string>) =>
        v !== values.password ? "Passwords do not match" : null,
    },
  });

  async function handleSubmit(values: typeof form.values) {
    await signup(values);
  }

  return (
    <Container size={420} my={40}>
      <Center mb="lg"><LogoMark size={40} /></Center>
      <Title ta="center" order={2} style={{ fontFamily: "var(--font-serif)" }}>
        Create an account
      </Title>
      <Text c="dark.2" size="sm" ta="center" mt={4}>
        Already have an account?{" "}
        <Anchor component={Link} href="/auth/login" size="sm" c="violet.5">
          Log in
        </Anchor>
      </Text>

      <Paper withBorder p="xl" mt="lg" radius="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Name" placeholder="Your name" required key={form.key("name")} {...form.getInputProps("name")} />
            <TextInput label="Email" placeholder="you@example.com" required key={form.key("email")} {...form.getInputProps("email")} />
            <PasswordInput label="Password" placeholder="At least 6 characters" required key={form.key("password")} {...form.getInputProps("password")} />
            <PasswordInput label="Confirm password" placeholder="Re-enter your password" required key={form.key("confirmPassword")} {...form.getInputProps("confirmPassword")} />
            {error && <Text c="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth loading={loading} color="violet">
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
