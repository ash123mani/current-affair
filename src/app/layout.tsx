import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata } from "next";
import { DM_Sans, Lora, JetBrains_Mono } from "next/font/google";
import { MantineProvider, Box } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/lib/auth.provider";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { theme } from "@/lib/theme";
import "./globals.css";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CurrentAffair — Daily Current Affairs Quiz",
  description: "Generate quizzes from live Indian news. Pick a date, choose topics, and test yourself.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body>
        <MantineProvider theme={theme} forceColorScheme="dark">
          <AuthProvider>
            <Notifications position="top-right" />
            <Navbar />
            <Box component="main" mih="calc(100vh - 64px)">
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </Box>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
