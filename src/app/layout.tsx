import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/lib/auth.provider";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CurrentAffair — Daily Current Affairs Quiz",
  description: "Test your knowledge of current affairs with daily quizzes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">
          <AuthProvider>
            <Notifications position="top-right" />
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
