import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SignupInput } from "@/lib/validations/auth";
import { signupSchema } from "@/lib/validations/auth";
import { notifySuccess, notifyError } from "@/lib/notify";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      const msg = "Invalid email or password";
      setError(msg);
      notifyError("Login failed", msg);
      return false;
    }

    notifySuccess("Welcome back!");
    router.push("/");
    router.refresh();
    return true;
  };

  const signup = async (input: SignupInput) => {
    setError(null);
    setLoading(true);

    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setError(msg);
      setLoading(false);
      return false;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const data = await res.json();
      const msg = data.error ?? "Something went wrong";
      setError(msg);
      notifyError("Signup failed", msg);
      setLoading(false);
      return false;
    }

    const result = await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      notifySuccess("Account created!");
      router.push("/");
      router.refresh();
      return true;
    }

    return false;
  };

  const logout = async () => {
    await signOut();
    notifySuccess("Logged out");
    router.refresh();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loading,
    login,
    signup,
    logout,
  };
}
